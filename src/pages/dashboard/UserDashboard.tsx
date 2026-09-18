import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  FileText,
  Shield,
  MessageSquare,
  Scale,
  ChevronRight,
  ExternalLink,
  Layers,
  Send,
  Bell,
  Eye,
  Search,
  User,
  Lock
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CaseTimeline } from '../../components/shared/CaseTimeline';
import { VoiceInputField } from '../../components/shared/VoiceInputField';
import { useAppStore, CaseRecord } from '../../store/appStore';

export const UserDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { cases, updateCase, user, notifications, markNotificationRead } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'in_review' | 'completed'>('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [userResponseText, setUserResponseText] = useState('');
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  // Passcode Security Lock State
  const [unlockedCases, setUnlockedCases] = useState<Record<string, boolean>>({});
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Localization helper functions for dynamic data
  const getLocalizedDomain = (domain: string) => {
    return t(`domains.${domain}`, domain);
  };

  const getLocalizedJurisdiction = (jur: string) => {
    return t(`jurisdictions.${jur}`, jur);
  };

  const getLocalizedCaseTitle = (title: string) => {
    if (title.toLowerCase().includes('respiratory') || title.toLowerCase().includes('polyherbal')) {
      return t('mockCases.c1Title', title);
    }
    return title;
  };

  const getLocalizedCaseQuery = (query: string) => {
    if (query.includes('Ayurvedic herbal') || query.includes('patent bhi lena hai')) {
      return t('mockCases.c1Query', query);
    }
    return query;
  };

  const getLocalizedExpertName = (name?: string) => {
    if (!name) return t('common.automated', 'System Automated');
    if (name.includes('Dr. V. Sharma') || name.includes('Sharma')) {
      return t('mockCases.expertDrSharma', name);
    }
    return name;
  };

  const getLocalizedExpertSummary = (summary: string) => {
    if (summary.includes('synergy') || summary.includes('Section 3(e)')) {
      return t('mockCases.c1Summary', summary);
    }
    return summary;
  };

  const getLocalizedObservation = (obs: string) => {
    if (obs.includes('Biological Diversity') || obs.includes('Form III')) {
      return t('mockCases.c1Obs1', obs);
    }
    if (obs.includes('Section 3(p)') || obs.includes('dissolution')) {
      return t('mockCases.c1Obs2', obs);
    }
    return obs;
  };

  const getLocalizedRecommendedAction = (action: string) => {
    if (action.includes('provisional patent') || action.includes('bioassay')) {
      return t('mockCases.c1NextSteps', action);
    }
    return action;
  };

  const getLocalizedRiskNotes = (risk?: string) => {
    if (!risk) return '';
    if (risk.includes('Section 55') || risk.includes('Biological Diversity')) {
      return t('mockCases.c1Risk', risk);
    }
    return risk;
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const totalQuestions = cases.length;
  const activeCasesCount = cases.filter((c) => c.status !== 'CLOSED' && c.status !== 'REVIEW_COMPLETED').length;
  const humanReviewsCount = cases.filter((c) => c.escalated).length;
  const completedCount = cases.filter((c) => c.status === 'REVIEW_COMPLETED').length;

  const filteredCases = cases.filter((c) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'active'
        ? c.status === 'SUBMITTED' || c.status === 'ASSIGNED'
        : activeTab === 'in_review'
        ? c.status === 'IN_REVIEW' || c.status === 'NEED_MORE_INFORMATION'
        : c.status === 'REVIEW_COMPLETED' || c.status === 'CLOSED';

    const matchesSearch =
      filterSearch === '' ||
      c.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(filterSearch.toLowerCase()) ||
      c.domain.toLowerCase().includes(filterSearch.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleSendAdditionalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userResponseText.trim() || !selectedCase) return;

    const updatedEvents = [
      ...selectedCase.events,
      {
        id: `ev-resp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: 'Additional Information Submitted by User',
        description: `User response: "${userResponseText}"`,
        actor: 'user' as const,
        status: 'IN_REVIEW'
      }
    ];

    updateCase(selectedCase.id, {
      status: 'IN_REVIEW',
      events: updatedEvents,
      updatedAt: new Date().toISOString(),
      requestedInfo: {
        prompt: selectedCase.requestedInfo?.prompt || 'Clarification on botanical extraction ratio',
        askedAt: selectedCase.requestedInfo?.askedAt || new Date().toISOString(),
        userResponse: userResponseText,
        respondedAt: new Date().toISOString()
      }
    });

    setUserResponseText('');
    setResponseSubmitted(true);
  };

  return (
    <div className="gov-dashboard-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('nav.dashboard', 'My Dashboard'), link: '/dashboard' }]} />

      <div className="gov-container dashboard-container">
        {/* Welcome & Overview Strip */}
        <div className="dashboard-welcome-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div
              className="user-profile-avatar-badge"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f3d5c 0%, #0d9488 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(15, 61, 92, 0.28)',
                border: '3px solid rgba(255, 255, 255, 0.7)',
                flexShrink: 0
              }}
            >
              <User size={32} strokeWidth={2.4} color="#ffffff" />
            </div>

            <div className="welcome-text-col">
              <div className="welcome-tag">
                <Scale size={14} className="text-secondary" />
                <span>{t('brand.subheading', 'National Ayurveda IP Workspace')}</span>
              </div>
              <h1 className="welcome-name">{t('common.greeting', 'Welcome')}, {user?.name || t('common.innovator', 'Ayurveda Innovator')}</h1>
              <p className="welcome-sub">
                {t('dashboard.subtitle', 'Track your active IP inquiries, formulation dossiers, and empanelled specialist reviews.')}
              </p>
            </div>
          </div>

          <div className="welcome-cta-col flex gap-3">
            <Link to="/case-builder" className="btn btn-secondary">
              <FileText size={16} />
              <span>{t('nav.caseBuilder', 'Launch Case Builder')}</span>
            </Link>
            <Link to="/ask" className="btn btn-primary">
              <Scale size={16} />
              <span>{t('nav.ask', 'Ask IP Question')}</span>
            </Link>
          </div>
        </div>

        {/* Top Summary Metric Cards (PRD Part B Section 13) */}
        <div className="dashboard-metrics-grid">
          <div className="gov-card metric-card">
            <div className="metric-icon-box bg-blue-tint">
              <MessageSquare size={22} className="text-primary" />
            </div>
            <div className="metric-content">
              <span className="metric-number">{totalQuestions}</span>
              <span className="metric-label">{t('dashboard.totalQueries', 'Total IP Queries')}</span>
            </div>
          </div>

          <div className="gov-card metric-card">
            <div className="metric-icon-box bg-amber-tint">
              <Clock size={22} className="text-accent" />
            </div>
            <div className="metric-content">
              <span className="metric-number">{activeCasesCount}</span>
              <span className="metric-label">{t('dashboard.activeDossiers', 'Active Cases')}</span>
            </div>
          </div>

          <div className="gov-card metric-card">
            <div className="metric-icon-box bg-green-tint">
              <UserCheck size={22} className="text-secondary" />
            </div>
            <div className="metric-content">
              <span className="metric-number">{humanReviewsCount}</span>
              <span className="metric-label">{t('dashboard.humanReviews', 'Human Reviews')}</span>
            </div>
          </div>

          <div className="gov-card metric-card">
            <div className="metric-icon-box bg-blue-tint">
              <CheckCircle2 size={22} className="text-success" />
            </div>
            <div className="metric-content">
              <span className="metric-number">{completedCount}</span>
              <span className="metric-label">{t('dashboard.resolved', 'Completed Opinions')}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Main Workspace (Sidebar List + Detail Panel) */}
        <div className="dashboard-workspace-grid">
          {/* Left Column: Filterable Cases List */}
          <div className="dashboard-cases-sidebar">
            <div className="gov-card cases-list-card">
              <div className="cases-list-header">
                <h3 className="cases-list-title">{t('dashboard.title', 'My Cases & Inquiries')}</h3>
                <div className="cases-search-box">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder={t('dashboard.searchPlaceholder', 'Search cases by name, domain, or ID...')}
                    className="cases-search-input"
                  />
                </div>
              </div>

              {/* Status Filters */}
              <div className="cases-filter-tabs">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`tab-filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                >
                  {t('dashboard.all', 'All')} ({cases.length})
                </button>
                <button
                  onClick={() => setActiveTab('in_review')}
                  className={`tab-filter-btn ${activeTab === 'in_review' ? 'active' : ''}`}
                >
                  {t('dashboard.inReview', 'In Review')} ({humanReviewsCount})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`tab-filter-btn ${activeTab === 'completed' ? 'active' : ''}`}
                >
                  {t('dashboard.completed', 'Completed')} ({completedCount})
                </button>
              </div>

              {/* Case Items List */}
              <div className="cases-scroll-list">
                {filteredCases.length === 0 ? (
                  <div className="empty-cases-state">
                    <p>{t('dashboard.noCases', 'No cases found matching your filter.')}</p>
                  </div>
                ) : (
                  filteredCases.map((c) => {
                    const isSelected = selectedCase?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCaseId(c.id)}
                        className={`case-summary-card ${isSelected ? 'selected' : ''}`}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="case-card-top-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="case-id-badge">{c.id}</span>
                          {c.casePasscode && (
                            <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fde68a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Lock size={10} />
                              <span>{unlockedCases[c.id] ? 'Unlocked' : 'Protected'}</span>
                            </span>
                          )}
                          <StatusBadge status={c.status} size="sm" />
                        </div>
                        <h4 className="case-card-title">{getLocalizedCaseTitle(c.title)}</h4>
                        <div className="case-card-meta">
                          <span>{getLocalizedDomain(c.domain)}</span>
                          <span>•</span>
                          <span>{getLocalizedJurisdiction(c.jurisdiction)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Localized Notifications Box */}
            <div className="gov-card notif-card">
              <div className="notif-header">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  <h4 className="notif-title">{t('common.notifications', 'Notifications')}</h4>
                </div>
              </div>
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                    <div className="notif-msg-title">{n.title}</div>
                    <div className="notif-msg-body">{n.message}</div>
                    <div className="notif-time">{n.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Case Details, AI vs Human Guidance, Timeline */}
          {selectedCase ? (
            <div className="dashboard-case-detail-col">
              {selectedCase.casePasscode && !unlockedCases[selectedCase.id] ? (
                <div className="gov-card" style={{ background: '#ffffff', border: '2px solid #f59e0b', borderRadius: '12px', padding: '36px 24px', textAlign: 'center', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)' }}>
                  <div style={{ background: '#fef3c7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#d97706', border: '2px solid #fcd34d' }}>
                    <Lock size={32} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Data Security Lock Enforced
                  </span>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f3d5c', margin: '12px 0 8px 0' }}>
                    Passcode Protected Formulation Dossier ({selectedCase.id})
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                    This case dossier contains confidential botanical composition and proprietary AYUSH IP claims. To view details, enter the secret <strong>dossier passcode</strong> set by the creator during Case Building.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (passcodeInput.trim() === selectedCase.casePasscode) {
                        setUnlockedCases({ ...unlockedCases, [selectedCase.id]: true });
                        setPasscodeInput('');
                        setPasscodeError(false);
                      } else {
                        setPasscodeError(true);
                      }
                    }}
                    style={{ maxWidth: '340px', margin: '0 auto' }}
                  >
                    <div style={{ marginBottom: '14px' }}>
                      <input
                        type="password"
                        value={passcodeInput}
                        onChange={(e) => {
                          setPasscodeInput(e.target.value);
                          setPasscodeError(false);
                        }}
                        placeholder="Enter secret passcode..."
                        className="gov-input text-center font-mono text-xl"
                        style={{ letterSpacing: '6px', borderColor: passcodeError ? '#ef4444' : '#cbd5e1', padding: '12px' }}
                        autoFocus
                      />
                      {passcodeError && (
                        <p style={{ color: '#dc2626', fontSize: '12.5px', marginTop: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <AlertCircle size={14} />
                          <span>Incorrect passcode. Access restricted for privacy.</span>
                        </p>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary w-full justify-center" style={{ gap: '8px', padding: '12px 20px', fontSize: '15px' }}>
                      <Lock size={18} />
                      <span>Unlock Dossier Details</span>
                    </button>
                  </form>

                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8' }}>
                    ℹ Empanelled Experts assigned to this case bypass passcode restrictions in the Expert Portal.
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Case Identity Card */}
                  <div className="gov-card case-detail-header-card">
                <div className="case-detail-top">
                  <div className="case-id-title-block">
                    <span className="case-large-id">{selectedCase.id}</span>
                    <h2 className="case-detail-main-title">{getLocalizedCaseTitle(selectedCase.title)}</h2>
                  </div>
                  <StatusBadge status={selectedCase.status} />
                </div>

                <div className="case-detail-meta-grid">
                  <div className="meta-block">
                    <span className="meta-label">{t('dashboard.domain', 'Legal Domain')}:</span>
                    <strong>{getLocalizedDomain(selectedCase.domain)}</strong>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">{t('utility.jurisdiction', 'Jurisdiction')}:</span>
                    <strong>{getLocalizedJurisdiction(selectedCase.jurisdiction)}</strong>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">{t('dashboard.escalatedTo', 'Assigned Expert')}:</span>
                    <strong>{getLocalizedExpertName(selectedCase.assignedExpertName)}</strong>
                  </div>
                  <div className="meta-block">
                    <span className="meta-label">{t('dashboard.submittedOn', 'Submitted')}:</span>
                    <strong>
                      {new Date(selectedCase.updatedAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </strong>
                  </div>
                </div>

                {/* Original Question Quoted */}
                <div className="original-query-quote">
                  <span className="quote-label">{t('hero.askButton', 'Original Inquiry')}:</span>
                  <p>"{getLocalizedCaseQuery(selectedCase.query)}"</p>
                </div>
              </div>

              {/* Action Required / Expert Information Request Box (PRD Part B Section 23) */}
              {selectedCase.status === 'NEED_MORE_INFORMATION' ||
                (selectedCase.escalated && !selectedCase.expertReview && (
                  <div className="gov-card action-required-card">
                    <div className="action-header">
                      <AlertCircle size={20} className="text-accent" />
                      <div>
                        <h3>{t('dashboard.additionalInfoReq', 'Additional Formulation Information Requested')}</h3>
                        <p>
                          {t('dashboard.additionalInfoDesc', 'Your assigned expert requires details on the formulation or classical reference.')}
                        </p>
                      </div>
                    </div>

                    {responseSubmitted ? (
                      <div className="response-success-box">
                        <CheckCircle2 size={18} className="text-success" />
                        <span>{t('dashboard.replySuccess', 'Response submitted and attached to case timeline.')}</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSendAdditionalInfo} className="additional-info-form">
                        <VoiceInputField
                          value={userResponseText}
                          onChange={setUserResponseText}
                          placeholder={t('dashboard.replyPlaceholder', 'Add information or clarification for the specialist...')}
                          multiline={true}
                          rows={2}
                          id="additional-info-input"
                          label={t('dashboard.sendReply', 'Send Clarification to Specialist')}
                        />
                        <div className="additional-form-actions">
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={!userResponseText.trim()}
                          >
                            <Send size={14} />
                            <span>{t('dashboard.sendReply', 'Send Clarification to Specialist')}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}

              {/* VISUAL SEPARATION: Human Expert Guidance (When Available) */}
              {selectedCase.expertReview && (
                <div className="gov-card expert-guidance-card">
                  <div className="expert-guidance-badge">
                    <UserCheck size={18} className="text-success" />
                    <span>{t('dashboard.expertOpinion', 'Empanelled Specialist Opinion')}</span>
                  </div>

                  <div className="expert-profile-row">
                    <div>
                      <h3 className="expert-name">{getLocalizedExpertName(selectedCase.expertReview.expertName)}</h3>
                      <span className="expert-role">{selectedCase.expertReview.expertRole}</span>
                    </div>
                    <span className="expert-date">
                      {t('dashboard.deliveredOn', 'Delivered on')}{' '}
                      {new Date(selectedCase.expertReview.completedAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="expert-summary-box">
                    <strong>{t('humanReview.expertGuidance', 'Expert Summary')}:</strong>
                    <p>{getLocalizedExpertSummary(selectedCase.expertReview.summary)}</p>
                  </div>

                  <div className="expert-observations-box">
                    <strong>{t('humanReview.observations', 'Key Observations')}:</strong>
                    <ul>
                      {selectedCase.expertReview.observations.map((obs, idx) => (
                        <li key={idx}>• {getLocalizedObservation(obs)}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="expert-action-box">
                    <strong>{t('humanReview.nextSteps', 'Recommended Next Steps')}:</strong>
                    <p>{getLocalizedRecommendedAction(selectedCase.expertReview.recommendedAction)}</p>
                  </div>

                  {selectedCase.expertReview.riskNotes && (
                    <div className="expert-risk-box">
                      <Shield size={16} className="text-error" />
                      <span>{getLocalizedRiskNotes(selectedCase.expertReview.riskNotes)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* VISUAL SEPARATION: AI Guidance & Retrieved Sources */}
              <div className="gov-card ai-guidance-history-card">
                <div className="ai-guidance-badge">
                  <Scale size={16} className="text-primary" />
                  <span>{t('dashboard.aiGuidance', 'AI Statutory Guidance')}</span>
                </div>

                <div className="ai-guidance-body">
                  <p className="ai-answer-p">
                    {selectedCase.aiAnswer?.answer ||
                      t('dashboard.defaultAiAnalysis', 'Initial analysis suggests evaluating Section 3(p) patent exclusions and State Biodiversity Board Form I prior intimation.')}
                  </p>

                  {selectedCase.aiAnswer?.citations && selectedCase.aiAnswer.citations.length > 0 && (
                    <div className="retrieved-sources-summary">
                      <strong>{t('answer.citationsHeader', 'Statutory Citations & Authorities')}:</strong>
                      <ul>
                        {selectedCase.aiAnswer.citations.map((c) => (
                          <li key={c.id}>
                            • <strong>{c.title}</strong> — {c.section || 'General Provisions'} ({c.jurisdiction})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Transparency View: Information Shared With Expert (PRD Part B Section 21) */}
              <div className="gov-card info-shared-card">
                <div className="info-shared-header">
                  <Eye size={16} className="text-primary" />
                  <h4>{t('humanReview.infoShared', 'Information Shared With Expert')}</h4>
                </div>
                <div className="info-shared-items">
                  <span className="shared-pill">✓ {t('hero.askIpQuestion', 'Original Question')}</span>
                  <span className="shared-pill">✓ {t('caseBuilder.productType', 'Product Classification')}</span>
                  <span className="shared-pill">✓ {t('dashboard.aiGuidance', 'AI Statutory Mapping')}</span>
                  <span className="shared-pill">✓ {t('caseBuilder.section3Title', 'Cited TKDL References')}</span>
                  <span className="shared-pill">✓ {t('confidence.why', 'Confidence Assessment')}</span>
                </div>
                <p className="info-shared-note">
                  {t('dashboard.dataMinimizationNotice', 'Protected under National Data Minimization Guidelines. Internal notes and unshared user data are strictly excluded.')}
                </p>
              </div>

              {/* Case Event Timeline */}
              <div className="gov-card timeline-card-wrapper">
                <CaseTimeline events={selectedCase.events} currentStatus={selectedCase.status} />
              </div>
            </>
          )}
        </div>
          ) : (
            <div className="empty-selection-card gov-card">
              <p>{t('dashboard.noCases', 'Select a case from the left to view timeline, AI guidance, and expert review.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
