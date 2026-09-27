import { CaseRecord, useAppStore } from '../store/appStore';
import { casesService } from './cases.service';
import { EMPANELLED_EXPERTS, EmpanelledExpert } from '../components/expert/ExpertDirectorySelector';
import { API_CONFIG } from './api.config';

export interface ExpertReviewSubmission {
  expertName: string;
  expertRole: string;
  summary: string;
  observations: string[];
  recommendedAction: string;
  references: string[];
  riskNotes?: string;
  internalNotes?: string;
  completedAt?: string;
}

export interface ExpertCaseRequest {
  id: string;
  caseId: string;
  expertId: string;
  userId?: string;
  caseTitle: string;
  domain: string;
  jurisdiction: string;
  priority: 'Normal' | 'Urgent' | 'High';
  status: 'Pending Expert Review' | 'Accepted' | 'Under Review' | 'Response Available' | 'Closed' | 'Declined';
  submittedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  reviewResponse?: {
    summary: string;
    observations: string[];
    recommendedAction: string;
    references?: string[];
  };
  additionalInformation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseMatchingContext {
  caseId?: string;
  title?: string;
  query?: string;
  domain?: string;
  jurisdiction?: string;
  productType?: string;
  isTraditional?: string;
  biologicalMaterial?: boolean;
  tkInvolved?: boolean;
  exportPlanned?: boolean;
  ingredients?: string[];
}

const API_BASE = `${(API_CONFIG.FASTAPI_BASE_URL || 'http://localhost:8000/api/v1')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/v1\/?$/, '')}/v1/expert`;

const getStoredRequests = (): Record<string, ExpertCaseRequest> => {
  try {
    const raw = localStorage.getItem('ipsakti_expert_requests');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading stored expert requests:', e);
  }
  return {};
};

const saveStoredRequests = (map: Record<string, ExpertCaseRequest>) => {
  try {
    localStorage.setItem('ipsakti_expert_requests', JSON.stringify(map));
  } catch (e) {
    console.warn('Error saving expert requests:', e);
  }
};

export const expertService = {
  /**
   * Section 1: Identifies primary statutory domain and legal issue from case facts.
   */
  identifyDomainAndIssue(ctx: CaseMatchingContext): {
    domain: 'tkdl' | 'patent' | 'abs' | 'regulatory' | 'food_aahara' | 'intl_ip' | 'trademark' | 'prior_art';
    domainLabel: string;
    issue: string;
    jurisdiction: 'India' | 'International' | 'India / International';
  } {
    const title = (ctx.title || '').toLowerCase();
    const query = (ctx.query || '').toLowerCase();
    const prod = (ctx.productType || '').toLowerCase();
    const dom = (ctx.domain || '').toLowerCase();

    const isWild = Boolean(ctx.biologicalMaterial) || query.includes('wild') || title.includes('wild');
    const isTk = Boolean(ctx.tkInvolved) || query.includes('samhita') || query.includes('traditional') || ctx.isTraditional !== 'new';
    const isExport = Boolean(ctx.exportPlanned) || (ctx.jurisdiction || '').includes('International') || (ctx.jurisdiction || '').includes('Global');

    if (dom.includes('food') || dom.includes('aahara') || prod.includes('aahara') || title.includes('aahara') || query.includes('nutraceutical')) {
      return {
        domain: 'food_aahara',
        domainLabel: 'Food / Ayurveda Aahara',
        issue: 'FSSAI Ayurveda Aahara 2022 Statutory Classification & Labeling',
        jurisdiction: isExport ? 'India / International' : 'India'
      };
    }

    if (isWild || dom.includes('abs') || dom.includes('bio') || query.includes('nba') || query.includes('sbb')) {
      return {
        domain: 'abs',
        domainLabel: 'Biodiversity / ABS / NBA',
        issue: 'Mandatory SBB Form I Intimation & NBA Benefit Sharing Clearance',
        jurisdiction: isExport ? 'India / International' : 'India'
      };
    }

    if (isTk || dom.includes('tk') || dom.includes('traditional')) {
      return {
        domain: 'tkdl',
        domainLabel: 'Traditional Knowledge / TKDL',
        issue: 'Section 3(p) TKDL Non-Patentability Screening & Prior Art Concordance',
        jurisdiction: isExport ? 'India / International' : 'India'
      };
    }

    if (dom.includes('prior') || query.includes('prior art') || query.includes('novelty')) {
      return {
        domain: 'prior_art',
        domainLabel: 'Prior Art / Patent Research',
        issue: 'Phytopharmaceutical Prior Art Benchmarking & Freedom-to-Operate',
        jurisdiction: isExport ? 'India / International' : 'India'
      };
    }

    if (isExport || dom.includes('intl') || dom.includes('pct')) {
      return {
        domain: 'intl_ip',
        domainLabel: 'International IP / Regulatory',
        issue: 'PCT Chapter I International Route & Sec 39 Foreign Filing Clearance',
        jurisdiction: 'India / International'
      };
    }

    if (dom.includes('trademark') || dom.includes('brand') || dom.includes('gi') || query.includes('trademark')) {
      return {
        domain: 'trademark',
        domainLabel: 'Trademark / GI / Design',
        issue: 'Nice Class 5 Brand Defense & Formulation Mark Registration',
        jurisdiction: 'India'
      };
    }

    if (dom.includes('regulatory') || query.includes('gmp') || query.includes('license') || query.includes('sla')) {
      return {
        domain: 'regulatory',
        domainLabel: 'AYUSH Regulatory',
        issue: 'Ayush State Licensing Authority (SLA) Manufacturing License & GMP Schedule T',
        jurisdiction: 'India'
      };
    }

    return {
      domain: 'patent',
      domainLabel: 'Intellectual Property / Patent',
      issue: 'Section 3(e) Synergistic Assay Proof & Patentability Clearance',
      jurisdiction: isExport ? 'India / International' : 'India'
    };
  },

  /**
   * Section 1 & 2: Matches suitable experts based on domain, issue, jurisdiction, experience.
   * Generates genuine "Why this expert?" explanations.
   */
  async getRecommendedExperts(ctx: CaseMatchingContext): Promise<EmpanelledExpert[]> {
    const identified = this.identifyDomainAndIssue(ctx);

    // Try backend matching first
    try {
      const resp = await fetch(`${API_BASE}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: ctx.caseId,
          title: ctx.title,
          query: ctx.query,
          domain: identified.domainLabel,
          jurisdiction: identified.jurisdiction,
          biological_material: ctx.biologicalMaterial,
          tk_involved: ctx.tkInvolved,
          export_planned: ctx.exportPlanned
        })
      });

      if (resp.ok) {
        const backendData = await resp.json();
        if (Array.isArray(backendData) && backendData.length > 0) {
          return backendData.map((b: any) => {
            const localExp = EMPANELLED_EXPERTS.find((e) => e.id === b.id) || EMPANELLED_EXPERTS[0];
            return {
              ...localExp,
              matchScore: b.match_score || 90,
              matchBadge: b.match_badge || `${b.match_score || 90}% Case Relevance`,
              matchReasons: b.match_reasons || [
                `Matches ${localExp.domainLabelKey} issue`,
                `Relevant to ${localExp.jurisdiction} jurisdiction`,
                `${localExp.experienceYears}+ years verified practice`
              ]
            };
          });
        }
      }
    } catch (e) {
      // Fallback to client algorithm
    }

    // Client-side deterministic ranking
    return EMPANELLED_EXPERTS.map((exp) => {
      let score = 55;
      const reasons: string[] = [];

      // 1. Domain match
      if (exp.domain === identified.domain) {
        score += 26;
        reasons.push(`Direct match for ${identified.domainLabel} case issue`);
      } else if (
        (identified.domain === 'tkdl' && (exp.domain === 'patent' || exp.domain === 'prior_art')) ||
        (identified.domain === 'patent' && (exp.domain === 'tkdl' || exp.domain === 'prior_art')) ||
        (identified.domain === 'abs' && exp.domain === 'regulatory')
      ) {
        score += 15;
        reasons.push(`Inter-disciplinary crossover in ${exp.roleTitle}`);
      }

      // 2. Issue specialization
      if (exp.specialization && exp.specialization.length > 0) {
        score += 8;
        reasons.push(`Specialized in ${exp.specialization[0]}`);
      }

      // 3. Jurisdiction
      if (identified.jurisdiction.includes('International') && exp.jurisdiction.includes('International')) {
        score += 6;
        reasons.push('Empanelled for Cross-Border & International filings');
      } else if (exp.jurisdiction.includes('India')) {
        score += 4;
        reasons.push('Relevant to Indian statutory jurisdiction');
      }

      // 4. Experience
      if (exp.experienceYears >= 15) {
        score += 4;
        reasons.push(`${exp.experienceYears}+ years empanelled AYUSH track record`);
      }

      const finalScore = Math.min(Math.max(score, 60), 96);

      return {
        ...exp,
        matchScore: finalScore,
        matchBadge: `${finalScore}% Case Relevance`,
        matchReasons: reasons.slice(0, 3)
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  },

  /**
   * Section 3, 4, 5: Primary Action - SEND CASE TO EXPERT.
   */
  async sendCaseToExpert(params: {
    caseId: string;
    expertId: string;
    expertName: string;
    caseTitle?: string;
    domain?: string;
    jurisdiction?: string;
    notes?: string;
  }): Promise<{ success: boolean; request: ExpertCaseRequest }> {
    const now = new Date().toISOString();
    const reqId = `req-${Date.now().toString(36)}`;

    const newRequest: ExpertCaseRequest = {
      id: reqId,
      caseId: params.caseId,
      expertId: params.expertId,
      caseTitle: params.caseTitle || `Case ${params.caseId}`,
      domain: params.domain || 'Ayurveda Intellectual Property',
      jurisdiction: params.jurisdiction || 'India',
      priority: 'Normal',
      status: 'Pending Expert Review',
      submittedAt: now,
      additionalInformation: params.notes,
      createdAt: now,
      updatedAt: now
    };

    // Save in local storage
    const all = getStoredRequests();
    all[params.caseId] = newRequest;
    saveStoredRequests(all);

    // Update case in store & add event
    await casesService.updateCase(params.caseId, {
      status: 'ASSIGNED',
      escalated: true,
      assignedExpertName: params.expertName,
      assignedExpertCategory: params.domain || 'Empanelled Specialist'
    });

    await casesService.addEvent(params.caseId, {
      title: 'Case Sent to Empanelled Expert',
      description: `Citizen submitted dossier for formal legal review to ${params.expertName}.`,
      actor: 'user',
      status: 'ASSIGNED'
    });

    // Try notifying backend
    try {
      await fetch(`${API_BASE}/cases/${params.caseId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: params.caseId,
          expert_id: params.expertId,
          case_title: params.caseTitle,
          domain: params.domain,
          jurisdiction: params.jurisdiction,
          shared_notes: params.notes
        })
      });
    } catch (e) {
      // Backend optional
    }

    return { success: true, request: newRequest };
  },

  /**
   * Section 6 & 7: Get real-time case review status.
   */
  async getCaseReviewStatus(caseId: string): Promise<{
    status: 'Pending Expert Review' | 'Accepted' | 'Under Review' | 'Response Available' | 'Closed' | 'Declined';
    request?: ExpertCaseRequest;
  }> {
    const all = getStoredRequests();
    if (all[caseId]) {
      return { status: all[caseId].status, request: all[caseId] };
    }

    // Try backend
    try {
      const resp = await fetch(`${API_BASE}/cases/${caseId}/review-status`);
      if (resp.ok) {
        const data = await resp.json();
        return { status: data.status, request: data.request_record };
      }
    } catch (e) {
      // Ignore
    }

    const currentCase = await casesService.getCaseById(caseId);
    if (!currentCase) return { status: 'Pending Expert Review' };

    if (currentCase.status === 'REVIEW_COMPLETED') return { status: 'Response Available' };
    if (currentCase.status === 'IN_REVIEW') return { status: 'Under Review' };
    if (currentCase.status === 'ASSIGNED') return { status: 'Accepted' };

    return { status: 'Pending Expert Review' };
  },

  /**
   * Section 8: Expert accepts case -> transitions to "Under Review".
   */
  async acceptCase(caseId: string, expertId: string, expertName: string): Promise<void> {
    const now = new Date().toISOString();
    const all = getStoredRequests();
    if (all[caseId]) {
      all[caseId].status = 'Under Review';
      all[caseId].acceptedAt = now;
      all[caseId].updatedAt = now;
      saveStoredRequests(all);
    }

    await casesService.updateCase(caseId, {
      status: 'IN_REVIEW',
      assignedExpertName: expertName
    });

    await casesService.addEvent(caseId, {
      title: 'Expert Accepted Case',
      description: `${expertName} accepted the dossier. Case status updated to Under Review.`,
      actor: 'expert',
      status: 'IN_REVIEW'
    });

    try {
      await fetch(`${API_BASE}/cases/${caseId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Accepted from Expert Portal' })
      });
    } catch (e) {}
  },

  /**
   * Section 8: Expert declines case.
   */
  async declineCase(caseId: string, expertId: string, reason: string): Promise<void> {
    const now = new Date().toISOString();
    const all = getStoredRequests();
    if (all[caseId]) {
      all[caseId].status = 'Declined';
      all[caseId].additionalInformation = `Declined: ${reason}`;
      all[caseId].updatedAt = now;
      saveStoredRequests(all);
    }

    await casesService.addEvent(caseId, {
      title: 'Specialist Re-allocation Requested',
      description: `Assigned specialist requested case re-allocation: "${reason}".`,
      actor: 'expert',
      status: 'SUBMITTED'
    });

    try {
      await fetch(`${API_BASE}/cases/${caseId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } catch (e) {}
  },

  /**
   * Section 9: Expert submits review guidance.
   */
  async submitReview(caseId: string, review: ExpertReviewSubmission): Promise<void> {
    const completedAt = review.completedAt || new Date().toISOString();

    const all = getStoredRequests();
    if (all[caseId]) {
      all[caseId].status = 'Response Available';
      all[caseId].completedAt = completedAt;
      all[caseId].reviewResponse = {
        summary: review.summary,
        observations: review.observations,
        recommendedAction: review.recommendedAction,
        references: review.references
      };
      all[caseId].updatedAt = completedAt;
      saveStoredRequests(all);
    }

    await casesService.updateCase(caseId, {
      status: 'REVIEW_COMPLETED',
      expertReview: {
        ...review,
        completedAt
      }
    });

    await casesService.addEvent(caseId, {
      title: 'Expert Legal Opinion Delivered',
      description: `${review.expertName} completed formal examination and published findings.`,
      actor: 'expert',
      status: 'REVIEW_COMPLETED'
    });

    try {
      await fetch(`${API_BASE}/cases/${caseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MODIFY_OPINION',
          expert_opinion: review.summary,
          recommended_actions: [review.recommendedAction, ...review.observations],
          legal_basis: review.references.join(', ')
        })
      });
    } catch (e) {}
  },

  /**
   * Section 8: Get incoming case requests for Expert Portal.
   */
  async getIncomingCaseRequests(expertId?: string): Promise<ExpertCaseRequest[]> {
    const all = getStoredRequests();
    const list = Object.values(all);
    if (!expertId) return list;
    return list.filter((r) => r.expertId === expertId);
  },

  async getAssignedCases(): Promise<CaseRecord[]> {
    const allCases = await casesService.getCases();
    return allCases.filter((c) => c.escalated || c.status !== 'CLOSED');
  }
};
