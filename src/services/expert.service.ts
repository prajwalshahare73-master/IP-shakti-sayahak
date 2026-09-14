import { CaseRecord, useAppStore } from '../store/appStore';
import { casesService } from './cases.service';

export interface ExpertReviewSubmission {
  expertName: string;
  expertRole: string;
  summary: string;
  observations: string[];
  recommendedAction: string;
  references: string[];
  riskNotes?: string;
  internalNotes?: string;
}

export const expertService = {
  async getAssignedCases(): Promise<CaseRecord[]> {
    const allCases = await casesService.getCases();
    // Return all cases requiring or undergoing expert attention
    return allCases.filter((c) => c.escalated || c.status !== 'CLOSED');
  },

  async claimCase(caseId: string, expertName: string, expertCategory?: string): Promise<void> {
    await casesService.updateCase(caseId, {
      status: 'IN_REVIEW',
      assignedExpertName: expertName,
      assignedExpertCategory: expertCategory || 'Empanelled Specialist'
    });

    await casesService.addEvent(caseId, {
      title: 'Expert Claimed Case',
      description: `${expertName} initiated review on this dossier.`,
      actor: 'expert',
      status: 'IN_REVIEW'
    });
  },

  async requestMoreInfo(caseId: string, prompt: string, expertName: string): Promise<void> {
    await casesService.updateCase(caseId, {
      status: 'NEED_MORE_INFORMATION',
      requestedInfo: {
        prompt,
        askedAt: new Date().toISOString()
      }
    });

    await casesService.addEvent(caseId, {
      title: 'Clarification Requested from Citizen',
      description: `${expertName} requested further documentation: "${prompt.slice(0, 80)}..."`,
      actor: 'expert',
      status: 'NEED_MORE_INFORMATION'
    });
  },

  async submitReview(caseId: string, review: ExpertReviewSubmission): Promise<void> {
    const completedAt = new Date().toISOString();

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
  }
};
