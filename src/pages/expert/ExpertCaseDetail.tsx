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
  Scale
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CitationCard } from '../../components/shared/CitationCard';
import { useAppStore } from '../../store/appStore';

export const ExpertCaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { cases, updateCase } = useAppStore();

  const currentCase = cases.find((c) => c.id === caseId) || cases[0];

  const [expertSummary, setExpertSummary] = useState(
    currentCase?.expertReview?.summary ||
      'Section 3(p) analysis confirms that the proposed polyherbal kadha formulation qualifies as an aggregation of known classical properties unless in-vitro synergistic efficacy data is presented.'
  );

  const [expertObservations, setExpertObservations] = useState(
    currentCase?.expertReview?.observations?.join('\n') ||
      '• Botanical active ingredients are referenced in classical text Charaka Samhita (Sutra Sthana Ch. 4).\n• Formulation requires Form III prior permission from NBA before filing patent claims.\n• Recommends trademarking coined house mark under Nice Class 5 for immediate market protection.'
  );

  const [recommendedAction, setRecommendedAction] = useState(
    currentCase?.expertReview?.recommendedAction ||
      'File trademark application in Class 5 for brand name. Conduct comparative synergistic bioassay prior to filing complete patent specification.'
  );

  const [riskNotes, setRiskNotes] = useState(
    currentCase?.expertReview?.riskNotes ||
      'Do not disclose formulation on public social channels before filing a provisional specification.'
  );

  const [internalNotes, setInternalNotes] = useState(
    'Assigned under Fast-Track AYUSH IP Facilitation Scheme. Verified against TKDL index vol 4.'
  );

  const [submitted, setSubmitted] = useState(false);
  const [activeReviewAction, setActiveReviewAction] = useState<'ACCEPT' | 'MODIFY' | 'REQUEST_INFO' | 'REJECT'>('MODIFY');

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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const observationsArray = expertObservations
      .split('\n')
      .map((s) => s.trim().replace(/^•\s*/, ''))
      .filter(Boolean);

    const newStatus = activeReviewAction === 'REQUEST_INFO' ? 'NEED_MORE_INFORMATION' : 'REVIEW_COMPLETED';

    const newEvents = [
      ...currentCase.events,
      {
        id: `ev-exp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title:
          activeReviewAction === 'REQUEST_INFO'
            ? 'Expert Requested Additional Formulation Facts'
            : 'Human Expert Review Completed & Guidance Delivered',
        description: `Dr. V. Sharma submitted formal legal assessment for case ${currentCase.id}.`,
        actor: 'expert' as const,
        status: newStatus
      }
    ];

    updateCase(currentCase.id, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      events: newEvents,
      expertReview: {
        expertName: 'Dr. V. Sharma',
        expertRole: 'Senior Traditional Knowledge & Patent Facilitator (Empanelled)',
        completedAt: new Date().toISOString(),
        summary: expertSummary,
        observations: observationsArray,
        recommendedAction: recommendedAction,
        references: ['The Patents Act 1970 (Section 3p)', 'Biological Diversity Act 2002', 'TKDL Index Standard'],
        riskNotes: riskNotes,
        internalNotes: internalNotes // Stored in case record, but strictly filtered from user view
      }
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

        {/* Success Alert on Submission */}
        {submitted && (
          <div className="gov-card escalation-success-banner mb-6" role="alert">
            <CheckCircle2 size={24} className="text-success" />
            <div>
              <h3>Expert Opinion Successfully Registered</h3>
              <p>
                Your structured guidance has been submitted. Case status is updated to{' '}
                <strong>{currentCase.status}</strong> and the user's dashboard is now live with your opinion.
              </p>
              <div className="mt-3 flex gap-3">
                <Link to="/expert/dashboard" className="btn btn-outline btn-sm">
                  Back to Queue
                </Link>
                <Link to="/dashboard" className="btn btn-primary btn-sm">
                  View User Perspective
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Expert Layout */}
        <div className="expert-detail-grid">
          {/* Left Column: User Context, AI Initial Analysis, Citations */}
          <div className="expert-left-col">
            {/* A. Exact User Question */}
            <div className="gov-card expert-card-block">
              <span className="expert-subheading-tag">A. Original User Inquiry</span>
              <h3 className="case-inquiry-text">"{currentCase.query}"</h3>
              <div className="case-profile-mini-tags">
                <span>Domain: <strong>{currentCase.domain}</strong></span>
                <span>Jurisdiction: <strong>{currentCase.jurisdiction}</strong></span>
                <span>Submitted: <strong>{new Date(currentCase.createdAt).toLocaleDateString('en-IN')}</strong></span>
              </div>
            </div>

            {/* B & C. Case Builder & Formulation Context */}
            {currentCase.caseProfile && (
              <div className="gov-card expert-card-block">
                <span className="expert-subheading-tag">B & C. Formulation & Ingredients Factsheet</span>
                <div className="factsheet-rows">
                  <div className="fact-item">
                    <span className="fact-lbl">Product Type:</span>
                    <strong>{currentCase.caseProfile.productType || 'Polyherbal Formulation'}</strong>
                  </div>
                  <div className="fact-item">
                    <span className="fact-lbl">Claimed Purpose:</span>
                    <strong>{currentCase.caseProfile.purpose || 'Therapeutic / Immunity'}</strong>
                  </div>
                  <div className="fact-item">
                    <span className="fact-lbl">Ingredients List:</span>
                    <strong>{currentCase.caseProfile.ingredients?.join(', ') || 'Vasaka, Kantakari, Yashtimadhu'}</strong>
                  </div>
                  <div className="fact-item">
                    <span className="fact-lbl">Novelty / TK Status:</span>
                    <strong>{currentCase.caseProfile.isTraditional || 'Modified Traditional'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* D. Initial AI Guidance (Clearly Labeled) */}
            <div className="gov-card expert-card-block bg-surface">
              <div className="ai-guidance-tag">
                <FileText size={14} className="text-primary" />
                <span>D. AI-Generated Initial Guidance (Under Review)</span>
              </div>
              <p className="ai-initial-text">
                {currentCase.aiAnswer?.answer ||
                  'Initial statutory evaluation identifies Section 3(p) non-patentability risk under Patents Act 1970 due to classical text disclosure, and requirement of Form I intimation to State Biodiversity Board.'}
              </p>
              {currentCase.aiAnswer?.why && (
                <ul className="ai-why-list">
                  {currentCase.aiAnswer.why.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* E & F. Retrieved Sources & Claim Verification */}
            <div className="gov-card expert-card-block">
              <span className="expert-subheading-tag">E & F. Retrieved Statutory Citations & TKDL Grounds</span>
              <div className="claim-verification-pill-row">
                <span className="claim-pill supported">✓ Section 3(p) Patents Act Matched</span>
                <span className="claim-pill supported">✓ Section 7 Biological Diversity Act Matched</span>
                <span className="claim-pill pending">? Synergistic Assay Data Needed</span>
              </div>

              <div className="expert-citations-stack">
                <div className="citation-mini-item">
                  <strong>The Patents Act, 1970 — Section 3(p)</strong>
                  <p>Inventions relating to traditional knowledge are non-patentable unless non-obvious synergistic novelty is established.</p>
                </div>
                <div className="citation-mini-item">
                  <strong>The Biological Diversity Act, 2002 — Section 6 & 7</strong>
                  <p>Commercial utilization of biological resources requires prior SBB intimation and NBA Form III IP permission.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Expert Review Submission Form */}
          <div className="expert-right-col">
            <form onSubmit={handleReviewSubmit} className="gov-card expert-form-card">
              <div className="form-header-row">
                <UserCheck size={22} className="text-secondary" />
                <div>
                  <h3 className="form-title">Empanelled Expert Opinion Submission</h3>
                  <span className="form-sub">Authoritative Guidance for Case {currentCase.id}</span>
                </div>
              </div>

              {/* Review Action Radios */}
              <div className="review-action-selector">
                <label className="gov-input-label">Action Decision:</label>
                <div className="action-buttons-group">
                  <button
                    type="button"
                    onClick={() => setActiveReviewAction('ACCEPT')}
                    className={`action-btn ${activeReviewAction === 'ACCEPT' ? 'active' : ''}`}
                  >
                    Accept & Endorse AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveReviewAction('MODIFY')}
                    className={`action-btn ${activeReviewAction === 'MODIFY' ? 'active' : ''}`}
                  >
                    Modify & Provide Opinion
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveReviewAction('REQUEST_INFO')}
                    className={`action-btn ${activeReviewAction === 'REQUEST_INFO' ? 'active' : ''}`}
                  >
                    Request More Info
                  </button>
                </div>
              </div>

              {/* Section 1: User-Facing Expert Summary */}
              <div className="form-field-group">
                <label htmlFor="expert-summary" className="gov-input-label">
                  User-Facing Expert Summary (Visible in User Dashboard):
                </label>
                <textarea
                  id="expert-summary"
                  value={expertSummary}
                  onChange={(e) => setExpertSummary(e.target.value)}
                  rows={3}
                  className="gov-textarea"
                  required
                />
              </div>

              {/* Section 2: Key Observations */}
              <div className="form-field-group">
                <label htmlFor="expert-observations" className="gov-input-label">
                  Key Technical & Legal Observations (One bullet per line):
                </label>
                <textarea
                  id="expert-observations"
                  value={expertObservations}
                  onChange={(e) => setExpertObservations(e.target.value)}
                  rows={4}
                  className="gov-textarea font-mono"
                  required
                />
              </div>

              {/* Section 3: Recommended Action */}
              <div className="form-field-group">
                <label htmlFor="expert-action" className="gov-input-label">
                  Specific Next Action for the User:
                </label>
                <textarea
                  id="expert-action"
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  rows={2}
                  className="gov-textarea"
                  required
                />
              </div>

              {/* Section 4: Statutory Risk & Caveats */}
              <div className="form-field-group">
                <label htmlFor="expert-risks" className="gov-input-label">
                  Statutory Risks & Deadlines:
                </label>
                <input
                  type="text"
                  id="expert-risks"
                  value={riskNotes}
                  onChange={(e) => setRiskNotes(e.target.value)}
                  className="gov-input"
                />
              </div>

              {/* Section 5: INTERNAL ONLY NOTES (Never shown to user) */}
              <div className="form-field-group internal-notes-box">
                <div className="internal-notes-tag">
                  <Lock size={13} />
                  <span>Confidential Internal Notes (Empanelled Facilitators Only)</span>
                </div>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={2}
                  className="gov-textarea internal-textarea"
                  placeholder="Notes for examiner, legal reference tags, or department audit..."
                />
                <small className="text-muted">
                  Protected: These notes will NEVER be displayed to the user or outside this portal.
                </small>
              </div>

              {/* Submit CTA */}
              <div className="expert-form-footer">
                <button type="submit" className="btn btn-secondary btn-lg w-full">
                  <CheckCircle2 size={18} />
                  <span>
                    {activeReviewAction === 'REQUEST_INFO'
                      ? 'Send Information Request to User'
                      : 'Deliver Final Expert Guidance'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
