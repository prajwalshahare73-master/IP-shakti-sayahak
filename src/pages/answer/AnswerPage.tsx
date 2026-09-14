import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  UserCheck,
  Printer,
  Share2,
  Check,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  BookOpen,
  Edit3,
  Loader2,
  FileText,
  Clock,
  ExternalLink,
  Download
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { ConfidenceCard } from '../../components/shared/ConfidenceCard';
import { CitationCard } from '../../components/shared/CitationCard';
import { useAppStore, CaseRecord, AIAnswerData } from '../../store/appStore';
import { askIPQuestion } from '../../services/ask.service';

export const AnswerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    query,
    setQuery,
    jurisdiction,
    language,
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

  const [whyExpanded, setWhyExpanded] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [escalatedSuccess, setEscalatedSuccess] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState<string>('');

  const qParam = searchParams.get('q');

  useEffect(() => {
    // If URL has query param and it differs or no current answer exists
    if (qParam && (!currentAnswer || qParam !== query)) {
      setQuery(qParam);
      executeSearch(qParam);
    } else if (!currentAnswer && !qParam && !query) {
      // Redirect to ask if nothing is asked
      navigate('/ask', { replace: true });
    }
  }, [qParam]);

  const executeSearch = async (queryText: string, profileOverride?: any) => {
    if (!queryText.trim()) return;

    setError(null);
    setLoading(true, 1);
    await new Promise((r) => setTimeout(r, 150));
    setLoading(true, 2);
    await new Promise((r) => setTimeout(r, 150));
    setLoading(true, 3);
    await new Promise((r) => setTimeout(r, 150));
    setLoading(true, 4);

    try {
      const activeProfile = { ...caseProfile, ...profileOverride };
      const res = await askIPQuestion({
        mode: 'quick_query',
        question: queryText,
        query: queryText,
        response_language: language,
        jurisdiction,
        session_id: 'session-' + Date.now(),
        conversation_id: 'session-' + Date.now(),
        case_profile: activeProfile
      });

      setCurrentAnswer(res);
    } catch (err: any) {
      setError('Unable to retrieve guidance. Please retry or check your network.');
    } finally {
      setLoading(false, 0);
    }
  };

  const handleClarificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClarification) {
      setCaseProfile({ isTraditional: selectedClarification as any });
      executeSearch(query || qParam || '', { isTraditional: selectedClarification });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleSpeechToggle = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      if (!currentAnswer) return;
      const textToRead = `${currentAnswer.answer}. Summary: ${currentAnswer.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const handleEscalateToHuman = () => {
    const newCaseId = `IPS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: CaseRecord = {
      id: newCaseId,
      title: (query || qParam || 'Inquiry').slice(0, 60),
      query: query || qParam || '',
      domain: currentAnswer?.ipType || 'Ayurveda Intellectual Property',
      jurisdiction: jurisdiction,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confidenceLevel: currentAnswer?.confidence.level || 'medium',
      escalated: true,
      escalationReason:
        currentAnswer?.confidence.caveat ||
        'User requested human review from Answer Dossier view.',
      assignedExpertCategory: 'Traditional Knowledge / Patent Specialist',
      assignedExpertName: 'Dr. V. Sharma (Empanelled)',
      caseProfile: caseProfile,
      aiAnswer: currentAnswer || undefined,
      events: [
        {
          id: 'ev-new-1',
          timestamp: new Date().toISOString(),
          title: 'Case Escalated for Human Review',
          description: `User submitted inquiry ${newCaseId} from Answer Page for human review.`,
          actor: 'user',
          status: 'SUBMITTED'
        }
      ]
    };

    addCase(newCase);
    setEscalatedSuccess(true);
  };

  return (
    <div className="gov-answer-page" id="main-content">
      <Breadcrumbs />

      <div className="gov-container answer-page-container">
        {/* Top Control Bar with Actions */}
        <div className="answer-top-toolbar">
          <div className="toolbar-left">
            <Link to="/ask" className="btn btn-outline btn-sm">
              <span>{t('answer.newQuery', '← New Query')}</span>
            </Link>
            <div className="query-pill-tag">
              <span className="text-muted">Query:</span>
              <strong className="query-text-truncate">
                {query || qParam || 'Ayurveda Innovation Assessment'}
              </strong>
            </div>
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              onClick={handleSpeechToggle}
              className={`btn btn-outline btn-sm ${speaking ? 'active' : ''}`}
              title={speaking ? 'Stop speech' : 'Listen to guidance'}
            >
              {speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{speaking ? t('answer.stopVoice', 'Stop') : t('answer.listenVoice', 'Listen')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-outline btn-sm"
              title="Copy shareable link"
            >
              {copiedLink ? <Check size={15} className="text-success" /> : <Share2 size={15} />}
              <span>{copiedLink ? t('answer.copied', 'Copied!') : t('answer.share', 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              title="Export official answer dossier as PDF"
            >
              <Download size={15} />
              <span>{t('common.exportPdf', 'Export PDF')}</span>
            </button>
          </div>
        </div>

        {/* Printable Official Header (PRD Section 9: Visible on Print/Export) */}
        {currentAnswer && (
          <div className="printable-report-header">
            <div className="print-brand-row">
              <img src="/logo-brand.png" alt="IP-SAKTI Sahayak Official Brand Logo" className="print-logo" />
              <div className="print-titles">
                <h2>IP-SAKTI SAHAYAK — GENERAL IP GUIDANCE DOSSIER</h2>
                <p>National Ayurveda Intellectual Property Guidance Initiative</p>
              </div>
            </div>
            <div className="print-meta-grid">
              <div><strong>Question Date:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div><strong>Jurisdiction:</strong> {jurisdiction}</div>
              <div><strong>IP Field:</strong> {currentAnswer.ipType}</div>
              <div><strong>Confidence:</strong> {currentAnswer.confidence.level.toUpperCase()}</div>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {loading && (
          <div className="gov-card loading-progress-card" role="status" aria-live="polite">
            <h3 className="loading-title">Analyzing Your Ayurveda IP Question</h3>
            <div className="loading-steps-list">
              <div className={`step-item ${loadingStep >= 1 ? 'done' : 'active'}`}>
                {loadingStep > 1 ? <CheckCircle2 size={16} className="text-success" /> : <Loader2 size={16} className="spin-icon" />}
                <span>1. Analyzing formulation context and active biological resources</span>
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
              <h3>Could not complete guidance</h3>
              <p>{error}</p>
              <button
                onClick={() => executeSearch(query || qParam || '')}
                className="btn btn-outline btn-sm mt-2"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Human Escalation Success Alert */}
        {escalatedSuccess && (
          <div className="gov-card escalation-success-banner" role="alert">
            <CheckCircle2 size={24} className="text-success" />
            <div>
              <h4>Case Successfully Logged for Human Review</h4>
              <p>Your inquiry has been scheduled for priority examination by Dr. V. Sharma (Senior IP Facilitator).</p>
              <Link to="/dashboard" className="btn btn-primary btn-sm mt-2">
                <span>Go to Citizen Dashboard</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Main Answer Layout (Two-Column Desktop, Stacked Mobile) */}
        {currentAnswer && !loading && (
          <div className="answer-view-grid">
            {/* Left Column: Direct Guidance & Actionable Steps */}
            <div className="answer-main-col">
              {/* Safe Abstention Flow */}
              {currentAnswer.abstained ? (
                <div className="gov-card abstention-card">
                  <div className="abstention-header">
                    <ShieldAlert size={32} className="text-accent" />
                    <div>
                      <h2 className="abstention-title">Notice of Safe Abstention</h2>
                      <p className="abstention-desc">{currentAnswer.abstentionDetails?.reason}</p>
                    </div>
                  </div>

                  {currentAnswer.abstentionDetails?.missingInfo && (
                    <div className="missing-info-box">
                      <strong>Information Required for Conclusive Assessment:</strong>
                      <ul>
                        {currentAnswer.abstentionDetails.missingInfo.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="abstention-actions">
                    <Link to="/classifier" className="btn btn-primary">
                      <span>Use 4-Step Product Classifier</span>
                      <ArrowRight size={16} />
                    </Link>
                    <button onClick={handleEscalateToHuman} className="btn btn-outline">
                      <UserCheck size={16} />
                      <span>Request Human Case Review</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Smart Clarification Box */}
                  {currentAnswer.needsClarification && currentAnswer.clarificationPrompt && (
                    <div className="gov-card clarification-card">
                      <div className="clarification-header">
                        <HelpCircle size={22} className="text-primary" />
                        <h3>{t('answer.clarificationTitle', 'Clarification Required for Accurate Assessment')}</h3>
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
                          {t('answer.refineAssessment', 'Refine Assessment')}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* AI-Generated Guidance Block */}
                  <div className="gov-card ai-guidance-card">
                    <div className="ai-badge-header">
                      <div className="ai-origin-pill">
                        <Sparkles size={14} className="text-primary" />
                        <span>{t('answer.aiGuidancePill', 'AI-generated guidance — source-grounded')}</span>
                      </div>
                      <span className="status-badge info">{currentAnswer.ipType}</span>
                    </div>

                    <h2 className="direct-answer-heading">{t('answer.directAnswer', 'Guidance Opinion')}</h2>
                    <p className="direct-answer-text">{currentAnswer.answer}</p>

                    <div className="answer-summary-box">
                      <strong>{t('answer.executiveSummary', 'Executive Summary:')}</strong>
                      <p>{currentAnswer.summary}</p>
                    </div>
                  </div>

                  {/* Collapsible Why Section */}
                  <div className="gov-card why-section-card">
                    <button
                      type="button"
                      className="section-toggle-header"
                      onClick={() => setWhyExpanded(!whyExpanded)}
                      aria-expanded={whyExpanded}
                    >
                      <h3 className="section-subheading">
                        {t('answer.whySection', 'Why are you receiving this guidance?')}
                      </h3>
                      {whyExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {whyExpanded && (
                      <ul className="why-bullet-list">
                        {currentAnswer.why.map((reason, idx) => (
                          <li key={idx}>
                            <CheckCircle2 size={16} className="text-primary icon-align" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* "What This Means For You" Checklist */}
                  <div className="gov-card meaning-section-card">
                    <h3 className="section-subheading">{t('answer.meaningSection', 'What This Means For You')}</h3>
                    <ul className="meaning-checklist">
                      {currentAnswer.meaningForYou.map((item, idx) => (
                        <li key={idx}>
                          <FileCheck size={16} className="text-secondary icon-align" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Statutory Warnings */}
                  {currentAnswer.warnings && currentAnswer.warnings.length > 0 && (
                    <div className="gov-card warning-notice-card">
                      <div className="warning-header">
                        <AlertTriangle size={18} className="text-accent" />
                        <h4>{t('answer.statutoryNotice', 'Statutory Notice & Procedural Boundaries')}</h4>
                      </div>
                      <ul className="warning-list">
                        {currentAnswer.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Next Actions */}
                  <div className="gov-card next-steps-card">
                    <h3 className="section-subheading">{t('answer.nextActionTitle', 'Recommended Next Actions')}</h3>
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

                      <button onClick={handleEscalateToHuman} className="btn btn-secondary">
                        <UserCheck size={16} />
                        <span>{t('answer.escalateHuman', 'Escalate to Human Expert Review')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Case Context, Confidence, Verified Sources */}
            <div className="answer-sidebar-col">
              {/* Case Context Card */}
              <div className="gov-card case-context-card">
                <div className="case-context-header">
                  <h4>{t('answer.caseFactsheet', 'Case Factsheet')}</h4>
                  <Link to="/classifier" className="edit-link">
                    <Edit3 size={13} />
                    <span>{t('answer.editFacts', 'Edit Facts')}</span>
                  </Link>
                </div>
                <div className="context-rows">
                  <div className="context-row">
                    <span className="context-label">Primary IP Field:</span>
                    <strong className="context-val">{currentAnswer.ipType}</strong>
                  </div>
                  <div className="context-row">
                    <span className="context-label">Applicable Territory:</span>
                    <strong className="context-val">🇮🇳 {currentAnswer.jurisdiction}</strong>
                  </div>
                  {caseProfile.productType && (
                    <div className="context-row">
                      <span className="context-label">Formulation Type:</span>
                      <strong className="context-val">{caseProfile.productType}</strong>
                    </div>
                  )}
                  {caseProfile.purpose && (
                    <div className="context-row">
                      <span className="context-label">Intended Purpose:</span>
                      <strong className="context-val">{caseProfile.purpose}</strong>
                    </div>
                  )}
                  {caseProfile.ingredients && caseProfile.ingredients.length > 0 && (
                    <div className="context-row">
                      <span className="context-label">Botanical Ingr.:</span>
                      <strong className="context-val">{caseProfile.ingredients.join(', ')}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence Card */}
              <ConfidenceCard confidence={currentAnswer.confidence} />

              {/* Sources Panel with Authority Hierarchy */}
              <div className="gov-card sources-panel-card">
                <div className="sources-panel-header">
                  <h4>{t('answer.citationsHeader', 'Statutory Citations & Authorities')} ({currentAnswer.citations.length})</h4>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Primary Statutes & Guidelines</span>
                </div>

                <div className="sources-list-stack">
                  {currentAnswer.citations.map((citation, idx) => (
                    <CitationCard key={citation.id || idx} citation={citation} index={idx} />
                  ))}
                </div>
              </div>

              {/* Human Escalation Sidebar Box */}
              <div className="gov-card expert-sidebar-prompt">
                <div className="expert-prompt-header">
                  <UserCheck size={20} className="text-primary" />
                  <h4>{t('answer.needLegalOpinion', 'Need Formal Legal Opinion?')}</h4>
                </div>
                <p className="expert-prompt-text">
                  Connect with empanelled Traditional Knowledge examiners and patent agents for formal filing reviews.
                </p>
                <button
                  type="button"
                  onClick={handleEscalateToHuman}
                  className="btn btn-secondary btn-sm btn-block"
                >
                  {t('answer.requestEmpanelled', 'Request Empanelled Review')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Official Disclaimer (PRD Section 9: Visible on Print/Export) */}
        {currentAnswer && (
          <div className="printable-report-footer">
            <p>
              <strong>Official Disclaimer:</strong> This dossier is compiled from authoritative public statutes including The Patents Act 1970, The Trade Marks Act 1999, The Biological Diversity Act 2002, and AYUSH Examination Guidelines. It is intended for preliminary guidance and compliance assessment and does not constitute a formal patent examination order or legal representation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
