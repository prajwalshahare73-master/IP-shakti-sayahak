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
import { useAppStore, CaseRecord } from '../../store/appStore';
import { EmpanelledExpert, EMPANELLED_EXPERTS } from '../../components/expert/ExpertDirectorySelector';
import { ExpertProfileModal } from '../../components/expert/ExpertProfileModal';

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

  // Section 7 Expert Review Modals
  const [viewingExpert, setViewingExpert] = useState<EmpanelledExpert | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);

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

              {/* Section 7: EXPERT REVIEW BLOCK */}
              <div
                className="gov-card expert-review-user-card mb-6"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #0f3d5c',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(15, 61, 92, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#ecfdf5', color: '#047857', padding: '8px', borderRadius: '8px' }}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#047857' }}>
                        Empanelled Legal Supervision
                      </span>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f3d5c' }}>
                        EXPERT REVIEW
                      </h3>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f3d5c' }}>
                    Status:{' '}
                    <strong style={{ color: selectedCase.status === 'REVIEW_COMPLETED' ? '#047857' : '#0284c7' }}>
                      {selectedCase.status === 'REVIEW_COMPLETED'
                        ? 'Response Available'
                        : selectedCase.status === 'IN_REVIEW'
                        ? 'Under Review'
                        : selectedCase.status === 'ASSIGNED'
                        ? 'Pending Expert Review'
                        : selectedCase.status === 'CLOSED'
                        ? 'Closed'
                        : 'Pending Expert Review'}
                    </strong>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Expert:</span>
                    <strong style={{ color: '#0f3d5c', fontSize: '14px' }}>
                      {getLocalizedExpertName(selectedCase.assignedExpertName) || 'Dr. Vandana Sharma (Senior Facilitator)'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Domain:</span>
                    <strong style={{ color: '#0284c7', fontSize: '14px' }}>
                      {selectedCase.assignedExpertCategory || selectedCase.domain}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Review Status:</span>
                    <strong style={{ color: selectedCase.status === 'REVIEW_COMPLETED' ? '#047857' : '#d97706', fontSize: '14px' }}>
                      {selectedCase.status === 'REVIEW_COMPLETED'
                        ? '✓ Response Available'
                        : selectedCase.status === 'IN_REVIEW'
                        ? '⏳ Under Review'
                        : '📩 Pending Expert Review'}
                    </strong>
                  </div>
                </div>

                {/* Section 7 Action Buttons: [VIEW EXPERT], [VIEW REVIEW STATUS], [VIEW EXPERT GUIDANCE] */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const found = EMPANELLED_EXPERTS.find((e) => selectedCase.assignedExpertName?.includes(e.name)) || EMPANELLED_EXPERTS[0];
                      setViewingExpert(found);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <Eye size={14} />
                    <span>VIEW EXPERT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStatusModal(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <Clock size={14} />
                    <span>VIEW REVIEW STATUS</span>
                  </button>

                  {(selectedCase.expertReview || selectedCase.status === 'REVIEW_COMPLETED') && (
                    <button
                      type="button"
                      onClick={() => setShowGuidanceModal(true)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={14} />
                      <span>VIEW EXPERT GUIDANCE</span>
                    </button>
                  )}
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
                        <div className="form-field-group mb-2">
                          <label htmlFor="additional-info-input" className="gov-input-label">
                            {t('dashboard.sendReply', 'Send Clarification to Specialist')}
                          </label>
                          <textarea
                            id="additional-info-input"
                            value={userResponseText}
                            onChange={(e) => setUserResponseText(e.target.value)}
                            placeholder={t('dashboard.replyPlaceholder', 'Add information or clarification for the specialist...')}
                            rows={2}
                            className="gov-textarea"
                          />
                        </div>
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

      {/* Expert Profile Credentials Modal */}
      {viewingExpert && (
        <ExpertProfileModal
          expert={viewingExpert}
          onClose={() => setViewingExpert(null)}
        />
      )}

      {/* Review Status Tracking Modal */}
      {showStatusModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} className="text-secondary" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f3d5c' }}>
                  Case Review Status Tracking
                </h3>
              </div>
              <button type="button" onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>Case ID:</strong> {selectedCase.id}</div>
              <div><strong>Assigned Expert:</strong> {selectedCase.assignedExpertName || 'Empanelled Specialist'}</div>
              <div><strong>Current Stage:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>{selectedCase.status}</span></div>
            </div>

            {/* Stage Progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'REQUEST SENT', desc: 'Case dossier transmitted to specialist', done: true },
                { label: 'EXPERT REVIEW', desc: 'Specialist examination in progress', done: selectedCase.status === 'IN_REVIEW' || selectedCase.status === 'REVIEW_COMPLETED' },
                { label: 'RESPONSE / GUIDANCE', desc: 'Authoritative legal guidance delivered', done: selectedCase.status === 'REVIEW_COMPLETED' },
                { label: 'CASE CLOSED', desc: 'Examination completed and filed', done: selectedCase.status === 'CLOSED' }
              ].map((st, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: st.done ? '#10b981' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                    {st.done ? '✓' : i + 1}
                  </div>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f3d5c' }}>{st.label}</strong>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowStatusModal(false)} className="btn btn-primary btn-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expert Guidance Modal */}
      {showGuidanceModal && selectedCase && selectedCase.expertReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={22} className="text-success" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f3d5c' }}>
                  Empanelled Expert Legal Guidance
                </h3>
              </div>
              <button type="button" onClick={() => setShowGuidanceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#0f3d5c' }}>{selectedCase.expertReview.expertName}</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(selectedCase.expertReview.completedAt).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                {selectedCase.expertReview.summary}
              </p>
            </div>

            {selectedCase.expertReview.observations && selectedCase.expertReview.observations.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Statutory Observations:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  {selectedCase.expertReview.observations.map((obs, i) => (
                    <li key={i}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCase.expertReview.recommendedAction && (
              <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                <strong style={{ fontSize: '12px', color: '#065f46', display: 'block', marginBottom: '4px' }}>
                  Recommended Next Step:
                </strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                  {selectedCase.expertReview.recommendedAction}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowGuidanceModal(false)} className="btn btn-primary btn-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
