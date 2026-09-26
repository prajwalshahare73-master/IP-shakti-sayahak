import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Send,
  Eye,
  Lock,
  FileText,
  AlertCircle,
  HelpCircle,
  Scale,
  Sparkles,
  Check
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAppStore } from '../../store/appStore';
import { expertService } from '../../services/expert.service';

export const ExpertCaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { cases, updateCase } = useAppStore();

  const currentCase = cases.find((c) => c.id === caseId) || cases[0];

  // Section 9: Expert Guidance Fields
  const [expertSummary, setExpertSummary] = useState(
    currentCase?.expertReview?.summary ||
      'Section 3(p) analysis confirms that the proposed polyherbal formulation qualifies as an aggregation of known classical properties unless in-vitro synergistic efficacy data is presented.'
  );

  const [recommendedAction, setRecommendedAction] = useState(
    currentCase?.expertReview?.recommendedAction ||
      'File trademark application in Class 5 for brand name. Conduct comparative synergistic bioassay prior to filing complete patent specification.'
  );

  const [additionalInfoRequired, setAdditionalInfoRequired] = useState(
    '1. Standardized extraction solvent ratio for Adhatoda vasica.\n2. In-vitro comparative bio-assay data for Section 3(e) synergism proof.\n3. SBB Form I submission copy if herbs were harvested from wild forest zones.'
  );

  const [supportingSources, setSupportingSources] = useState(
    'The Patents Act 1970 (Section 3p & 3e)\nBiological Diversity Act 2002 (Section 6 & 7)\nTKDL Formulation Index Standard Vol. 4'
  );

  const [riskNotes, setRiskNotes] = useState(
    currentCase?.expertReview?.riskNotes ||
      'Do not disclose formulation on public social channels before filing a provisional specification.'
  );

  const [internalNotes, setInternalNotes] = useState(
    'Assigned under Fast-Track AYUSH IP Facilitation Scheme. Verified against TKDL index vol 4.'
  );

  const [submitted, setSubmitted] = useState(false);
  const [viewingGuidanceModal, setViewingGuidanceModal] = useState(false);

  if (!currentCase) {
    return (
      <div className="gov-container py-12">
        <h2>Case Not Found</h2>
        <Link to="/expert/dashboard" className="btn btn-primary mt-4">
          Back to Expert Queue
        </Link>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sourcesArray = supportingSources
      .split('\n')
      .map((s) => s.trim().replace(/^•\s*/, ''))
      .filter(Boolean);

    const obsArray = additionalInfoRequired
      .split('\n')
      .map((s) => s.trim().replace(/^•\s*/, ''))
      .filter(Boolean);

    await expertService.submitReview(currentCase.id, {
      expertName: 'Dr. Vandana Sharma',
      expertRole: 'Senior Traditional Knowledge & Patent Facilitator (Empanelled)',
      summary: expertSummary,
      recommendedAction: recommendedAction,
      observations: obsArray,
      references: sourcesArray,
      riskNotes: riskNotes,
      internalNotes: internalNotes
    });

    setSubmitted(true);
  };

  return (
    <div className="gov-expert-detail-page" id="main-content">
      <Breadcrumbs
        customTrail={[
          { title: 'Expert Portal', link: '/expert/dashboard' },
          { title: `Case ${currentCase.id}`, link: `/expert/cases/${currentCase.id}` }
        ]}
      />

      <div className="gov-container expert-detail-container">
        {/* Top Case Bar */}
        <div className="expert-case-top-bar">
          <Link to="/expert/dashboard" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} />
            <span>Back to Expert Queue</span>
          </Link>

          <div className="case-status-lock-row">
            <span className="case-id-large-pill">{currentCase.id}</span>
            <StatusBadge status={currentCase.status} />
          </div>
        </div>

        {/* Success Alert on Submission (Section 9) */}
        {submitted && (
          <div className="gov-card escalation-success-banner mb-6" role="alert" style={{ background: '#ecfdf5', border: '2px solid #10b981', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <CheckCircle2 size={32} className="text-success shrink-0" />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#065f46' }}>
                  ✓ Expert Review Completed
                </h3>
                <p style={{ margin: '4px 0 12px 0', fontSize: '13.5px', color: '#047857' }}>
                  Your formal legal guidance has been registered and synced with the applicant's case dashboard.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setViewingGuidanceModal(true)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px', fontWeight: 700 }}
                  >
                    <Eye size={14} />
                    <span>VIEW EXPERT GUIDANCE</span>
                  </button>
                  <Link to="/expert/dashboard" className="btn btn-outline btn-sm">
                    Back to Queue
                  </Link>
                  <Link to="/dashboard" className="btn btn-outline btn-sm">
                    View Citizen Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Expert Layout */}
        <div className="expert-detail-grid">
          {/* Left Column: Case Summary, Identified Issue, Relevant Evidence, User Query, Validation Results */}
          <div className="expert-left-col">
            {/* 1. Original User Query */}
            <div className="gov-card expert-card-block">
              <span className="expert-subheading-tag">1. User Query &amp; Core Request</span>
              <h3 className="case-inquiry-text">"{currentCase.query}"</h3>
              <div className="case-profile-mini-tags">
                <span>Domain: <strong>{currentCase.domain}</strong></span>
                <span>Jurisdiction: <strong>{currentCase.jurisdiction}</strong></span>
                <span>Submitted: <strong>{new Date(currentCase.createdAt).toLocaleDateString('en-IN')}</strong></span>
              </div>
            </div>

            {/* 2. Case Summary & Formulation Context */}
            <div className="gov-card expert-card-block">
              <span className="expert-subheading-tag">2. Case Summary &amp; Botanical Profile</span>
              <div className="factsheet-rows">
                <div className="fact-item">
                  <span className="fact-lbl">Product Name:</span>
                  <strong>{currentCase.title}</strong>
                </div>
                <div className="fact-item">
                  <span className="fact-lbl">Entity Type:</span>
                  <strong>{currentCase.caseProfile?.entityType || 'Indian MSME / Startup'}</strong>
                </div>
                <div className="fact-item">
                  <span className="fact-lbl">Formulation Actives:</span>
                  <strong>{currentCase.caseProfile?.ingredients?.join(', ') || 'Vasaka, Kantakari, Yashtimadhu'}</strong>
                </div>
                <div className="fact-item">
                  <span className="fact-lbl">TK Concordance:</span>
                  <strong>{currentCase.caseProfile?.isTraditional || 'Modified Traditional Composition'}</strong>
                </div>
              </div>
            </div>

            {/* 3. Identified Issue */}
            <div className="gov-card expert-card-block" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
              <span className="expert-subheading-tag" style={{ color: '#166534' }}>3. Identified Legal &amp; Statutory Issue</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                <Sparkles size={16} className="text-secondary" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f3d5c' }}>
                  Section 3(p) Traditional Knowledge Screening &amp; SBB Biodiversity Clearance
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#14532d', lineHeight: 1.5 }}>
                Statutory concordances confirm botanical constituents belong to classical Ayurvedic Samhita formularies. Exemption requires synergistic comparative assay under Section 3(e) of the Patents Act, 1970.
              </p>
            </div>

            {/* 4. Relevant Evidence & Statutory Sources */}
            <div className="gov-card expert-card-block">
              <span className="expert-subheading-tag">4. Relevant Evidence &amp; Authorities</span>
              <div className="claim-verification-pill-row">
                <span className="claim-pill supported">✓ Section 3(p) Patents Act Cited</span>
                <span className="claim-pill supported">✓ Section 6/7 Biological Diversity Act Matched</span>
                <span className="claim-pill pending">? Section 3(e) Synergism Assay Required</span>
              </div>

              <div className="expert-citations-stack mt-3">
                <div className="citation-mini-item">
                  <strong>The Patents Act, 1970 — Section 3(p)</strong>
                  <p>Inventions relating to traditional knowledge are non-patentable unless non-obvious synergistic novelty is established.</p>
                </div>
                <div className="citation-mini-item">
                  <strong>The Biological Diversity Act, 2002 — Section 6 &amp; 7</strong>
                  <p>Commercial utilization of biological resources requires prior SBB intimation and NBA Form III IP permission.</p>
                </div>
              </div>
            </div>

            {/* 5. Validation Results */}
            <div className="gov-card expert-card-block bg-surface">
              <span className="expert-subheading-tag">5. Validation Results &amp; Statutory Screen</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                  <Check size={16} />
                  <span>Dossier completeness verified (Readiness Score: 85%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                  <Check size={16} />
                  <span>Botanical ingredients validated against classical Samhita formularies</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
                  <AlertTriangle size={16} />
                  <span>Bioassay proof pending for synergistic Section 3(e) claim exemption</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Expert Review Submission Form (Section 9) */}
          <div className="expert-right-col">
            <form onSubmit={handleReviewSubmit} className="gov-card expert-form-card" style={{ border: '2px solid #0f3d5c' }}>
              <div className="form-header-row" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
                <div style={{ background: '#0f3d5c', padding: '8px', borderRadius: '8px', color: '#fff' }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 className="form-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0f3d5c', margin: 0 }}>
                    EXPERT REVIEW
                  </h3>
                  <span className="form-sub" style={{ fontSize: '12px', color: '#64748b' }}>
                    Authoritative Statutory Guidance for Case {currentCase.id}
                  </span>
                </div>
              </div>

              {/* 1. Review / Guidance */}
              <div className="form-field-group mb-4">
                <label htmlFor="expert-review-guidance" className="gov-input-label" style={{ fontWeight: 700 }}>
                  Review / Guidance (Formal Legal Evaluation):
                </label>
                <textarea
                  id="expert-review-guidance"
                  value={expertSummary}
                  onChange={(e) => setExpertSummary(e.target.value)}
                  rows={4}
                  className="gov-textarea"
                  required
                />
              </div>

              {/* 2. Recommended Next Step */}
              <div className="form-field-group mb-4">
                <label htmlFor="expert-next-step" className="gov-input-label" style={{ fontWeight: 700 }}>
                  Recommended Next Step (Actionable Direction for Applicant):
                </label>
                <textarea
                  id="expert-next-step"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  rows={2}
                  className="gov-textarea"
                  required
                />
              </div>

              {/* 3. Additional Information Required */}
              <div className="form-field-group mb-4">
                <label htmlFor="expert-add-info" className="gov-input-label" style={{ fontWeight: 700 }}>
                  Additional Information Required:
                </label>
                <textarea
                  id="expert-add-info"
                  value={additionalInfoRequired}
                  onChange={(e) => setAdditionalInfoRequired(e.target.value)}
                  rows={3}
                  className="gov-textarea font-mono"
                  style={{ fontSize: '12px' }}
                />
              </div>

              {/* 4. Supporting Source / Reference */}
              <div className="form-field-group mb-4">
                <label htmlFor="expert-sources" className="gov-input-label" style={{ fontWeight: 700 }}>
                  Supporting Source / Reference (Acts, Treatises &amp; Precedents):
                </label>
                <textarea
                  id="expert-sources"
                  value={supportingSources}
                  onChange={(e) => setSupportingSources(e.target.value)}
                  rows={3}
                  className="gov-textarea font-mono"
                  style={{ fontSize: '12px' }}
                />
              </div>

              {/* 5. Statutory Risks & Caveats */}
              <div className="form-field-group mb-4">
                <label htmlFor="expert-risks" className="gov-input-label" style={{ fontWeight: 700 }}>
                  Statutory Risks &amp; Caveats:
                </label>
                <input
                  type="text"
                  id="expert-risks"
                  value={riskNotes}
                  onChange={(e) => setRiskNotes(e.target.value)}
                  className="gov-input"
                />
              </div>

              {/* Internal Confidential Notes */}
              <div className="form-field-group internal-notes-box mb-5">
                <div className="internal-notes-tag">
                  <Lock size={13} />
                  <span>Confidential Internal Notes (Empanelled Facilitators Only)</span>
                </div>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={2}
                  className="gov-textarea internal-textarea"
                  placeholder="Notes for examiner, department audit, or case file..."
                />
                <small className="text-muted">
                  Protected under National Data Minimization Guidelines: These notes are strictly filtered from citizen views.
                </small>
              </div>

              {/* Primary Action Button: [SUBMIT EXPERT REVIEW] */}
              <div className="expert-form-footer">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  style={{ fontWeight: 800, fontSize: '15px', gap: '8px', padding: '12px 20px', boxShadow: '0 4px 14px rgba(15, 61, 92, 0.25)' }}
                >
                  <CheckCircle2 size={18} />
                  <span>SUBMIT EXPERT REVIEW</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Guidance View Modal */}
      {viewingGuidanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} className="text-success" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f3d5c' }}>
                  ✓ Expert Review Completed
                </h3>
              </div>
              <button type="button" onClick={() => setViewingGuidanceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Delivered Legal Guidance:</span>
              <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#0f3d5c', lineHeight: 1.6 }}>
                {expertSummary}
              </p>
            </div>

            <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
              <strong style={{ fontSize: '12px', color: '#065f46', display: 'block', marginBottom: '4px' }}>
                Recommended Next Step:
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                {recommendedAction}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setViewingGuidanceModal(false)} className="btn btn-primary btn-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
