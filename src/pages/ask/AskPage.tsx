import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  UserCheck,
  RotateCcw,
  Edit3,
  Download,
  Share2,
  ChevronRight,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import { VoiceInputField } from '../../components/shared/VoiceInputField';
import { ConfidenceCard } from '../../components/shared/ConfidenceCard';
import { CitationCard } from '../../components/shared/CitationCard';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { useAppStore, CaseRecord } from '../../store/appStore';
import { askIPQuestion } from '../../services/ask.service';
import { ExpertDirectorySelector, EmpanelledExpert, EMPANELLED_EXPERTS } from '../../components/expert/ExpertDirectorySelector';

export const AskPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    query,
    setQuery,
    jurisdiction,
    language,
    responseLanguage,
    caseProfile,
    setCaseProfile,
    currentAnswer,
    setCurrentAnswer,
    loading,
    loadingStep,
    setLoading,
    error,
    setError,
    addCase
  } = useAppStore();

  const [inputQuestion, setInputQuestion] = useState(query || searchParams.get('q') || '');
  const [escalatedSuccess, setEscalatedSuccess] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState<string>('');
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<EmpanelledExpert>(EMPANELLED_EXPERTS[0]);

  // Auto-run if query param or store query is present and no answer yet
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam && qParam !== query) {
      setQuery(qParam);
      setInputQuestion(qParam);
      handleExecuteQuery(qParam);
    } else if (query && !currentAnswer && !loading) {
      handleExecuteQuery(query);
    }
  }, [searchParams]);

  const handleExecuteQuery = async (queryText: string, profileOverride?: any) => {
    if (!queryText.trim()) return;

    setError(null);
    setLoading(true, 1);
    await new Promise((r) => setTimeout(r, 550));
    setLoading(true, 2);
    await new Promise((r) => setTimeout(r, 650));
    setLoading(true, 3);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(true, 4);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const activeProfile = { ...caseProfile, ...profileOverride };
      const res = await askIPQuestion({
        query: queryText,
        jurisdiction,
        response_language: responseLanguage || language,
        conversation_id: 'session-' + Date.now(),
        case_profile: activeProfile
      });

      setCurrentAnswer(res);
    } catch (err: any) {
      setError('Unable to retrieve guidance at this moment. Please retry.');
    } finally {
      setLoading(false, 0);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuestion.trim()) {
      setQuery(inputQuestion.trim());
      handleExecuteQuery(inputQuestion.trim());
    }
  };

  const handleClarificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClarification) {
      setCaseProfile({ isTraditional: selectedClarification as any });
      handleExecuteQuery(query, { isTraditional: selectedClarification });
    }
  };

  // Handle Human Escalation Request with chosen expert
  const handleConfirmEscalation = (expertToAssign?: EmpanelledExpert) => {
    const expert = expertToAssign || selectedExpert || EMPANELLED_EXPERTS[0];
    const newCaseId = `IPS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: CaseRecord = {
      id: newCaseId,
      title: query.slice(0, 60) + (query.length > 60 ? '...' : ''),
      query: query,
      domain: currentAnswer?.ipType || 'Ayurveda Intellectual Property',
      jurisdiction: jurisdiction,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confidenceLevel: currentAnswer?.confidence.level || 'medium',
      escalated: true,
      escalationReason:
        currentAnswer?.confidence.caveat ||
        'User requested human review for complex polyherbal formulation assessment.',
      assignedExpertCategory: expert.roleTitle,
      assignedExpertName: `${expert.name} (${expert.degrees})`,
      caseProfile: caseProfile,
      aiAnswer: currentAnswer || undefined,
      events: [
        {
          id: 'ev-new-1',
          timestamp: new Date().toISOString(),
          title: 'Case Escalated to Empanelled Specialist',
          description: `User assigned case ${newCaseId} to ${expert.name} (${expert.degrees}, ${expert.experienceYears}+ Yrs Exp).`,
          actor: 'user',
          status: 'SUBMITTED'
        }
      ]
    };

    addCase(newCase);
    setSelectedExpert(expert);
    setShowExpertModal(false);
    setEscalatedSuccess(true);
  };

  return (
    <div className="gov-ask-page" id="main-content">
      <Breadcrumbs />

      <div className="gov-container ask-page-container">
        {/* Top Query Input Banner */}
        <section className="gov-card ask-input-card">
          <h1 className="ask-heading">{t('nav.ask')}</h1>
          <p className="ask-subtext">
            Receive source-backed guidance regarding Patents, Trademarks, Traditional Knowledge (TKDL), and Biodiversity (ABS) compliance in India.
          </p>

          <form onSubmit={handleFormSubmit} className="ask-form">
            <VoiceInputField
              value={inputQuestion}
              onChange={setInputQuestion}
              placeholder="Describe your Ayurvedic product, formulation, or legal query..."
              multiline={true}
              rows={3}
              id="ask-query-input"
            />

            <div className="ask-form-bottom">
              <div className="jurisdiction-indicator">
                <span className="text-secondary">Jurisdiction:</span>
                <strong>{jurisdiction}</strong>
              </div>

              <div className="ask-form-btn-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !inputQuestion.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Guidance</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Loading Progress State (PRD Section 65) */}
        {loading && (
          <div className="gov-card loading-progress-card" role="status" aria-live="polite">
            <h3 className="loading-title">Analyzing Your Ayurveda Question</h3>
            <div className="loading-steps-list">
              <div className={`step-item ${loadingStep >= 1 ? 'done' : 'active'}`}>
                {loadingStep > 1 ? <CheckCircle2 size={16} className="text-success" /> : <Loader2 size={16} className="spin-icon" />}
                <span>1. Understanding formulation intent & botanical components</span>
              </div>
              <div className={`step-item ${loadingStep >= 2 ? (loadingStep > 2 ? 'done' : 'active') : 'pending'}`}>
                {loadingStep > 2 ? <CheckCircle2 size={16} className="text-success" /> : loadingStep === 2 ? <Loader2 size={16} className="spin-icon" /> : <Clock size={16} />}
                <span>2. Identifying statutory route (Patents Act / Section 3(p) / ABS / AYUSH)</span>
              </div>
              <div className={`step-item ${loadingStep >= 3 ? (loadingStep > 3 ? 'done' : 'active') : 'pending'}`}>
                {loadingStep > 3 ? <CheckCircle2 size={16} className="text-success" /> : loadingStep === 3 ? <Loader2 size={16} className="spin-icon" /> : <Clock size={16} />}
                <span>3. Cross-referencing TKDL database and authoritative statutes</span>
              </div>
              <div className={`step-item ${loadingStep >= 4 ? 'active' : 'pending'}`}>
                {loadingStep >= 4 ? <Loader2 size={16} className="spin-icon" /> : <Clock size={16} />}
                <span>4. Formulating actionable guidance, confidence, and source citations</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="gov-card error-card" role="alert">
            <AlertTriangle size={24} className="text-error" />
            <div>
              <h3>Could not process query</h3>
              <p>{error}</p>
              <button
                onClick={() => handleExecuteQuery(inputQuestion)}
                className="btn btn-outline btn-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Escalation Success Alert */}
        {escalatedSuccess && (
          <div className="gov-card escalation-success-banner" role="alert">
            <CheckCircle2 size={24} className="text-success" />
            <div>
              <h4>Specialist Assigned Successfully</h4>
              <p>Your case has been logged and assigned directly to <strong>{selectedExpert.name}</strong> ({selectedExpert.degrees} — {selectedExpert.experienceYears}+ Yrs Exp).</p>
              <Link to="/dashboard" className="btn btn-primary btn-sm mt-2">
                <span>Go to My Dashboard & Track Status</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Result Area (Two-Column Desktop, Stacked Mobile) */}
        {currentAnswer && !loading && (
          <div className="answer-view-grid">
            {/* Left Column: Direct Answer, Why, Meaning For You, Actions */}
            <div className="answer-main-col">
              {/* Safe Abstention Display if triggered */}
              {currentAnswer.abstained ? (
                <div className="gov-card abstention-card">
                  <div className="abstention-header">
                    <ShieldAlert size={28} className="text-accent" />
                    <div>
                      <h2 className="abstention-title">{t('abstention.title')}</h2>
                      <p className="abstention-desc">{currentAnswer.abstentionDetails?.reason}</p>
                    </div>
                  </div>

                  {currentAnswer.abstentionDetails?.missingInfo && (
                    <div className="missing-info-box">
                      <strong>{t('abstention.missingInfo')}</strong>
                      <ul>
                        {currentAnswer.abstentionDetails.missingInfo.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="abstention-actions">
                    <Link to="/classifier" className="btn btn-primary">
                      <span>Use Guided Product Classifier</span>
                      <ArrowRight size={16} />
                    </Link>
                    <button onClick={() => setShowExpertModal(true)} className="btn btn-outline">
                      <UserCheck size={16} />
                      <span>{t('answer.humanReviewCta')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Smart Clarification Box if needed */}
                  {currentAnswer.needsClarification && currentAnswer.clarificationPrompt && (
                    <div className="gov-card clarification-card">
                      <div className="clarification-header">
                        <HelpCircle size={22} className="text-primary" />
                        <h3>Clarification Required for Accurate Assessment</h3>
                      </div>
                      <p className="clarification-question">
                        {currentAnswer.clarificationPrompt.question}
                      </p>
                      <form onSubmit={handleClarificationSubmit} className="clarification-form">
                        <div className="clarification-options">
                          {currentAnswer.clarificationPrompt.options.map((opt) => (
                            <label
                              key={opt.id}
                              className={`clarification-option-label ${
                                selectedClarification === opt.value ? 'selected' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name="clarification"
                                value={opt.value}
                                checked={selectedClarification === opt.value}
                                onChange={(e) => setSelectedClarification(e.target.value)}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={!selectedClarification}
                        >
                          Continue Guidance Assessment
                        </button>
                      </form>
                    </div>
                  )}

                  {/* 1. Direct Guidance Card */}
                  <div className="gov-card direct-answer-card">
                    <div className="answer-header-row">
                      <span className="status-badge info">{currentAnswer.ipType}</span>
                      <span className="answer-jurisdiction-tag">🇮🇳 {currentAnswer.jurisdiction}</span>
                    </div>

                    <h2 className="direct-answer-heading">{t('answer.directAnswer')}</h2>
                    <p className="direct-answer-text">{currentAnswer.answer}</p>

                    <div className="answer-summary-box">
                      <strong>Executive Summary:</strong>
                      <p>{currentAnswer.summary}</p>
                    </div>
                  </div>

                  {/* 2. "Why am I receiving this guidance?" Section */}
                  <div className="gov-card why-section-card">
                    <h3 className="section-subheading">{t('answer.whySection')}</h3>
                    <ul className="why-bullet-list">
                      {currentAnswer.why.map((reason, idx) => (
                        <li key={idx}>
                          <CheckCircle2 size={16} className="text-primary icon-align" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. "What This Means For You" Actionable Checklist */}
                  <div className="gov-card meaning-section-card">
                    <h3 className="section-subheading">{t('answer.meaningSection')}</h3>
                    <ul className="meaning-checklist">
                      {currentAnswer.meaningForYou.map((item, idx) => (
                        <li key={idx}>
                          <FileCheck size={16} className="text-secondary icon-align" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. Important Statutory Warning / Notice */}
                  {currentAnswer.warnings && currentAnswer.warnings.length > 0 && (
                    <div className="gov-card warning-notice-card">
                      <div className="warning-header">
                        <AlertTriangle size={18} className="text-accent" />
                        <h4>{t('answer.limitationsTitle')}</h4>
                      </div>
                      <ul className="warning-list">
                        {currentAnswer.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 5. Recommended Next Action */}
                  <div className="gov-card next-steps-card">
                    <h3 className="section-subheading">{t('answer.nextActionTitle')}</h3>
                    <div className="next-steps-buttons">
                      {currentAnswer.nextSteps.map((step, idx) => (
                        <Link
                          key={idx}
                          to={step.link || '/dashboard'}
                          className={`btn ${step.primary ? 'btn-primary' : 'btn-outline'}`}
                        >
                          <span>{step.title}</span>
                          <ChevronRight size={16} />
                        </Link>
                      ))}

                      <button onClick={() => setShowExpertModal(true)} className="btn btn-secondary">
                        <UserCheck size={16} />
                        <span>{t('answer.humanReviewCta')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Case Context, Confidence, Verified Sources */}
            <div className="answer-sidebar-col">
              {/* Compact Case Context Card */}
              <div className="gov-card case-context-card">
                <div className="case-context-header">
                  <h4>{t('answer.caseContext')}</h4>
                  <Link to="/classifier" className="edit-link">
                    <Edit3 size={13} />
                    <span>{t('answer.editDetails')}</span>
                  </Link>
                </div>
                <div className="context-rows">
                  <div className="context-row">
                    <span className="context-label">Domain:</span>
                    <strong className="context-val">{currentAnswer.ipType}</strong>
                  </div>
                  <div className="context-row">
                    <span className="context-label">Jurisdiction:</span>
                    <strong className="context-val">{currentAnswer.jurisdiction}</strong>
                  </div>
                  {caseProfile.productType && (
                    <div className="context-row">
                      <span className="context-label">Product Type:</span>
                      <strong className="context-val">{caseProfile.productType}</strong>
                    </div>
                  )}
                  {caseProfile.purpose && (
                    <div className="context-row">
                      <span className="context-label">Purpose:</span>
                      <strong className="context-val">{caseProfile.purpose}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence Card */}
              <ConfidenceCard confidence={currentAnswer.confidence} />

              {/* Verified Sources Panel with Hierarchy */}
              <div className="gov-card sources-panel-card">
                <div className="sources-panel-header">
                  <h4>{t('answer.sourcesTitle')} ({currentAnswer.citations.length})</h4>
                </div>

                <div className="sources-list-stack">
                  {currentAnswer.citations.map((citation, idx) => (
                    <CitationCard key={citation.id || idx} citation={citation} index={idx} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expert Selection Modal */}
        {showExpertModal && (
          <ExpertDirectorySelector
            modalMode={true}
            selectedExpertId={selectedExpert?.id}
            onClose={() => setShowExpertModal(false)}
            onSelectExpert={(exp) => handleConfirmEscalation(exp)}
          />
        )}
      </div>
    </div>
  );
};
