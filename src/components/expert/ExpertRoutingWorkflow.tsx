import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Scale,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileText,
  Lock,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { EmpanelledExpert, EMPANELLED_EXPERTS } from './ExpertDirectorySelector';
import { ExpertCard } from './ExpertCard';
import { SendCaseConfirmationModal } from './SendCaseConfirmationModal';
import { ExpertProfileModal } from './ExpertProfileModal';
import { expertService, CaseMatchingContext, ExpertCaseRequest } from '../../services/expert.service';
import { useAppStore, CaseRecord } from '../../store/appStore';

interface ExpertRoutingWorkflowProps {
  caseId: string;
  caseTitle?: string;
  caseQuery?: string;
  domain?: string;
  jurisdiction?: string;
  productType?: string;
  isTraditional?: string;
  biologicalMaterial?: boolean;
  tkInvolved?: boolean;
  exportPlanned?: boolean;
  ingredients?: string[];
  onCaseSent?: (request: ExpertCaseRequest) => void;
}

export const ExpertRoutingWorkflow: React.FC<ExpertRoutingWorkflowProps> = ({
  caseId,
  caseTitle = 'Ayurvedic Formulation Dossier',
  caseQuery = '',
  domain = 'Ayurveda Intellectual Property',
  jurisdiction = 'India',
  productType = 'Proprietary Ayurvedic Medicine',
  isTraditional = 'modified_traditional',
  biologicalMaterial = false,
  tkInvolved = true,
  exportPlanned = false,
  ingredients = [],
  onCaseSent
}) => {
  const { t } = useTranslation();
  const { cases } = useAppStore();

  const [recommendedExperts, setRecommendedExperts] = useState<EmpanelledExpert[]>([]);
  const [identifiedContext, setIdentifiedContext] = useState<{
    domain: string;
    domainLabel: string;
    issue: string;
    jurisdiction: string;
  }>({
    domain: 'patent',
    domainLabel: 'Intellectual Property / Patent',
    issue: 'Section 3(e) Synergistic Assay Proof & Patentability Clearance',
    jurisdiction: 'India'
  });

  const [selectedExpertForModal, setSelectedExpertForModal] = useState<EmpanelledExpert | null>(null);
  const [viewingExpertProfile, setViewingExpertProfile] = useState<EmpanelledExpert | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentCaseRequest, setSentCaseRequest] = useState<ExpertCaseRequest | null>(null);
  const [activeStatus, setActiveStatus] = useState<
    'Pending Expert Review' | 'Accepted' | 'Under Review' | 'Response Available' | 'Closed'
  >('Pending Expert Review');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false);

  // Look up case in store to see if it was already escalated or completed
  const currentCase = cases.find((c) => c.id === caseId);

  // 1. Identification & Recommendation Logic
  useEffect(() => {
    const matchingContext: CaseMatchingContext = {
      caseId,
      title: caseTitle,
      query: caseQuery,
      domain,
      jurisdiction,
      productType,
      isTraditional,
      biologicalMaterial,
      tkInvolved,
      exportPlanned,
      ingredients
    };

    const identified = expertService.identifyDomainAndIssue(matchingContext);
    setIdentifiedContext(identified);

    expertService.getRecommendedExperts(matchingContext).then((matched) => {
      setRecommendedExperts(matched.slice(0, 3)); // Top 3 recommended
    });

    // Check if case is already sent or has status
    expertService.getCaseReviewStatus(caseId).then((res) => {
      if (res.request) {
        setSentCaseRequest(res.request);
        setActiveStatus(res.status as any);
      } else if (currentCase?.escalated) {
        if (currentCase.status === 'REVIEW_COMPLETED') {
          setActiveStatus('Response Available');
        } else if (currentCase.status === 'IN_REVIEW') {
          setActiveStatus('Under Review');
        } else {
          setActiveStatus('Pending Expert Review');
        }
      }
    });
  }, [caseId, caseTitle, caseQuery, domain, jurisdiction, productType, biologicalMaterial, tkInvolved]);

  // Handle Send Case Confirmation
  const handleConfirmSendCase = async (notes?: string) => {
    if (!selectedExpertForModal) return;

    setSubmitting(true);
    try {
      const res = await expertService.sendCaseToExpert({
        caseId,
        expertId: selectedExpertForModal.id,
        expertName: selectedExpertForModal.name,
        caseTitle,
        domain: identifiedContext.domainLabel,
        jurisdiction: identifiedContext.jurisdiction,
        notes
      });

      if (res.success) {
        setSentCaseRequest(res.request);
        setActiveStatus('Pending Expert Review');
        setSelectedExpertForModal(null);
        if (onCaseSent) onCaseSent(res.request);
      }
    } catch (e) {
      alert('Unable to transmit case to expert. Please check network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCaseSent = Boolean(sentCaseRequest || currentCase?.escalated);
  const expertGuidance = currentCase?.expertReview || sentCaseRequest?.reviewResponse;

  return (
    <div
      className="gov-card expert-routing-workflow-container"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        border: '2px solid #0f3d5c',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '20px',
        boxShadow: '0 8px 24px rgba(15, 61, 92, 0.08)'
      }}
    >
      {/* Workflow Phase Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0f3d5c', padding: '10px', borderRadius: '12px', color: '#ffffff' }}>
            <Scale size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                EXPERT MATCHING &amp; ROUTING
              </span>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Case ID: <strong style={{ color: '#0f3d5c' }}>{caseId}</strong>
              </span>
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#0f3d5c' }}>
              Empanelled Legal Expert Routing
            </h2>
          </div>
        </div>

        {/* Identified Issue & Domain Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Identified Regulatory Domain:</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '14px', border: '1px solid #bae6fd' }}>
            {identifiedContext.domainLabel}
          </span>
        </div>
      </div>

      {/* Identified Issue Banner (Section 1) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={18} className="text-secondary" />
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Analyzed Case Issue:
            </span>
            <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f3d5c' }}>
              {identifiedContext.issue}
            </p>
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#475569' }}>
          Jurisdiction: <strong>{identifiedContext.jurisdiction}</strong>
        </div>
      </div>

      {/* Section 6: Status Tracker After Sending (Active Workflow Stepper) */}
      {isCaseSent && (
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #10b981',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={24} className="text-success" />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#065f46' }}>
                  ✓ CASE SENT TO EXPERT
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#047857' }}>
                  Assigned Expert: <strong>{currentCase?.assignedExpertName || sentCaseRequest?.expertId || 'Empanelled Specialist'}</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f3d5c', background: '#ecfdf5', padding: '4px 12px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                Current Status: {activeStatus}
              </span>
              {activeStatus === 'Response Available' && (
                <button
                  type="button"
                  onClick={() => setGuidanceModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px', fontWeight: 700 }}
                >
                  <Eye size={14} />
                  <span>VIEW EXPERT GUIDANCE</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper: REQUEST SENT -> EXPERT REVIEW -> RESPONSE / GUIDANCE -> CASE CLOSED */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {[
              { key: 'REQUEST_SENT', label: 'REQUEST SENT', active: true, done: activeStatus !== 'Pending Expert Review' },
              { key: 'EXPERT_REVIEW', label: 'EXPERT REVIEW', active: activeStatus === 'Accepted' || activeStatus === 'Under Review' || activeStatus === 'Response Available' || activeStatus === 'Closed', done: activeStatus === 'Response Available' || activeStatus === 'Closed' },
              { key: 'RESPONSE_GUIDANCE', label: 'RESPONSE / GUIDANCE', active: activeStatus === 'Response Available' || activeStatus === 'Closed', done: activeStatus === 'Response Available' || activeStatus === 'Closed' },
              { key: 'CASE_CLOSED', label: 'CASE CLOSED', active: activeStatus === 'Closed', done: activeStatus === 'Closed' }
            ].map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '140px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: step.done ? '#10b981' : step.active ? '#0f3d5c' : '#cbd5e1',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: step.active ? '#0f3d5c' : '#94a3b8' }}>
                    {step.label}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>
                    {idx === 0 ? 'Submitted' : idx === 1 ? 'Under Review' : idx === 2 ? 'Delivered' : 'Resolved'}
                  </span>
                </div>
                {idx < 3 && <div style={{ height: '2px', background: step.done ? '#10b981' : '#e2e8f0', flex: 1, margin: '0 4px' }} />}
              </div>
            ))}
          </div>

          {/* Quick link to Expert Portal for Testing/Demo */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Link
              to={`/expert/cases/${caseId}`}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '12px', gap: '6px' }}
            >
              <span>Review Case in Empanelled Expert Portal</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Recommended Experts Section (Section 1) */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f3d5c' }}>
              Recommended Experts for This Case
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Matched using verified domain specialization, jurisdiction concordance, and Section 3(p) / ABS experience.
            </p>
          </div>

          <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>
            {recommendedExperts.length} Verified Specialists Matched
          </span>
        </div>

        {/* Section 16 Error / Empty State */}
        {recommendedExperts.length === 0 ? (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <AlertTriangle size={32} className="text-error mx-auto mb-2" />
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#991b1b' }}>
              No matching expert is currently available.
            </h4>
            <p style={{ margin: '6px 0 16px 0', fontSize: '13px', color: '#b91c1c' }}>
              Our empanelled specialists for this specific sub-domain are currently offline or at capacity.
            </p>
            <button
              type="button"
              onClick={() => alert('Assistance request registered with AYUSH IP Facilitation Cell.')}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              REQUEST EXPERT ASSISTANCE
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendedExperts.map((exp) => (
              <ExpertCard
                key={exp.id}
                expert={exp}
                onSendCase={(expert) => setSelectedExpertForModal(expert)}
                onViewExpert={(expert) => setViewingExpertProfile(expert)}
                isSent={isCaseSent && (currentCase?.assignedExpertName?.includes(exp.name) || sentCaseRequest?.expertId === exp.id)}
                activeStatus={activeStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal (Section 4) */}
      {selectedExpertForModal && (
        <SendCaseConfirmationModal
          caseId={caseId}
          caseTitle={caseTitle}
          domain={identifiedContext.domainLabel}
          jurisdiction={identifiedContext.jurisdiction}
          selectedExpert={selectedExpertForModal}
          onConfirm={handleConfirmSendCase}
          onCancel={() => setSelectedExpertForModal(null)}
          loading={submitting}
        />
      )}

      {/* Expert Profile & Credentials Modal (Section 11) */}
      {viewingExpertProfile && (
        <ExpertProfileModal
          expert={viewingExpertProfile}
          onClose={() => setViewingExpertProfile(null)}
          onSelectAndSend={(expert) => setSelectedExpertForModal(expert)}
        />
      )}

      {/* Expert Guidance Modal (When Review Completed) */}
      {guidanceModalOpen && expertGuidance && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={22} className="text-success" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f3d5c' }}>
                  Empanelled Expert Guidance Delivered
                </h3>
              </div>
              <button type="button" onClick={() => setGuidanceModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Expert Summary:</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#0f3d5c', lineHeight: 1.6 }}>
                {expertGuidance.summary || (expertGuidance as any).expert_opinion}
              </p>
            </div>

            {expertGuidance.observations && expertGuidance.observations.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Statutory Observations:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  {expertGuidance.observations.map((obs: string, i: number) => (
                    <li key={i}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {expertGuidance.recommendedAction && (
              <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                <strong style={{ fontSize: '12px', color: '#065f46', display: 'block', marginBottom: '4px' }}>
                  Recommended Next Statutory Step:
                </strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                  {expertGuidance.recommendedAction}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setGuidanceModalOpen(false)} className="btn btn-primary btn-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
