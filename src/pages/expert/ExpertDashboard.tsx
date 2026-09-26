import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  FileText,
  Lock,
  LogOut,
  Layers,
  Inbox,
  Check,
  XCircle,
  Eye,
  Building,
  Calendar
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAppStore } from '../../store/appStore';
import { ExpertDirectorySelector, EmpanelledExpert } from '../../components/expert/ExpertDirectorySelector';
import { expertService, ExpertCaseRequest } from '../../services/expert.service';

export const ExpertDashboard: React.FC = () => {
  const { cases, user, setUser } = useAppStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<'cases' | 'directory'>('cases');
  const [activeFilter, setActiveFilter] = useState<'all' | 'requests' | 'in_review' | 'need_info' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [incomingRequests, setIncomingRequests] = useState<ExpertCaseRequest[]>([]);

  useEffect(() => {
    expertService.getIncomingCaseRequests().then((reqs) => {
      setIncomingRequests(reqs);
    });
  }, [cases]);

  const expertCases = cases.filter((c) => c.escalated || c.status !== 'CLOSED');

  // Pending incoming requests are cases with SUBMITTED or ASSIGNED status
  const pendingRequests = expertCases.filter((c) => c.status === 'SUBMITTED' || c.status === 'ASSIGNED');

  const filteredCases = expertCases.filter((c) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'requests'
        ? c.status === 'SUBMITTED' || c.status === 'ASSIGNED'
        : activeFilter === 'in_review'
        ? c.status === 'IN_REVIEW'
        : activeFilter === 'need_info'
        ? c.status === 'NEED_MORE_INFORMATION'
        : c.status === 'REVIEW_COMPLETED' || c.status === 'CLOSED';

    const matchesSearch =
      searchTerm === '' ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleAcceptCase = async (caseId: string) => {
    const expertName = user?.name || 'Dr. Vandana Sharma';
    await expertService.acceptCase(caseId, 'exp-tkdl-1', expertName);
  };

  const handleDeclineCase = async (caseId: string) => {
    const reason = window.prompt('Please provide the re-allocation reason (e.g. domain divergence, statutory capacity):', 'Capacity constraint — re-allocate to empanelled pool');
    if (reason) {
      await expertService.declineCase(caseId, 'exp-tkdl-1', reason);
    }
  };

  return (
    <div className="gov-expert-portal-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: 'Empanelled Expert Portal', link: '/expert/dashboard' }]} />

      <div className="gov-container expert-container">
        {/* Expert Header Banner */}
        <div className="expert-header-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #047857 0%, #0d9488 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.28)',
                border: '3px solid rgba(255, 255, 255, 0.7)',
                flexShrink: 0
              }}
            >
              <UserCheck size={32} strokeWidth={2.4} color="#ffffff" />
            </div>

            <div className="expert-banner-left">
              <div className="expert-auth-badge">
                <Lock size={13} className="text-secondary" />
                <span>Restricted Empanelled Facilitator Environment</span>
              </div>
              <h1 className="expert-banner-title">Empanelled Ayurveda IP &amp; TK Expert Workspace</h1>
              <p className="expert-banner-sub">
                Logged in as <strong>{user?.name || 'Dr. Vandana Sharma'}</strong> (Senior Traditional Knowledge &amp; Patent Facilitator)
              </p>
            </div>
          </div>

          <div className="expert-banner-right flex items-center gap-3">
            <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-xl border border-white/30">
              <button
                type="button"
                onClick={() => setActiveView('cases')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'cases'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                📋 Assigned Queue ({expertCases.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveView('directory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeView === 'directory'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                👥 Empanelled Directory (8)
              </button>
            </div>
            <div className="expert-stat-pill">
              <span>Incoming Requests:</span>
              <strong>{pendingRequests.length} Cases</strong>
            </div>
          </div>
        </div>

        {activeView === 'directory' ? (
          <div className="gov-card p-6 bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <ExpertDirectorySelector
              onSelectExpert={(exp) => {
                alert(`Selected ${exp.name} (${exp.degrees}) for specialized AYUSH consultation.`);
              }}
            />
          </div>
        ) : (
          <>
            {/* Section 8: CASE REQUESTS Section */}
            {pendingRequests.length > 0 && (
              <div
                className="gov-card case-requests-block mb-6"
                style={{
                  background: '#ffffff',
                  border: '2px solid #0284c7',
                  borderRadius: '14px',
                  padding: '20px',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '10px' }}>
                      <Inbox size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#0284c7' }}>
                        NEW INCOMING ACTION ITEMS
                      </span>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f3d5c' }}>
                        CASE REQUESTS ({pendingRequests.length})
                      </h2>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', background: '#eff6ff', padding: '4px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    Awaiting Facilitator Acceptance
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                  {pendingRequests.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', color: '#0f3d5c', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px' }}>
                            {c.id}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#fef3c7', color: '#b45309' }}>
                            Priority: Normal
                          </span>
                        </div>

                        <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: '#0f3d5c' }}>
                          {c.title}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Domain:</span> <strong>{c.domain}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Jurisdiction:</span> <strong>{c.jurisdiction}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} className="text-secondary" />
                            <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={12} className="text-secondary" />
                            <span>{c.caseProfile?.entityType || 'Indian MSME / Startup'}</span>
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '12px', color: '#334155', background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          "{c.query.slice(0, 95)}..."
                        </p>
                      </div>

                      {/* Actions: [VIEW CASE], [ACCEPT CASE], [DECLINE] */}
                      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                        <Link
                          to={`/expert/cases/${c.id}`}
                          className="btn btn-outline btn-sm flex-1"
                          style={{ fontSize: '12px', gap: '4px', justifyContent: 'center' }}
                        >
                          <Eye size={13} />
                          <span>VIEW CASE</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleAcceptCase(c.id)}
                          className="btn btn-primary btn-sm flex-1"
                          style={{ fontSize: '12px', gap: '4px', justifyContent: 'center', fontWeight: 700 }}
                        >
                          <Check size={14} />
                          <span>ACCEPT CASE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeclineCase(c.id)}
                          className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 hover:border-red-300"
                          style={{ fontSize: '12px', padding: '6px 10px' }}
                          title="Decline and re-allocate case"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Filter Strip */}
            <div className="expert-controls-card gov-card">
              <div className="expert-filter-tabs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`expert-tab ${activeFilter === 'all' ? 'active' : ''}`}
                >
                  All Assigned ({expertCases.length})
                </button>
                <button
                  onClick={() => setActiveFilter('requests')}
                  className={`expert-tab ${activeFilter === 'requests' ? 'active' : ''}`}
                >
                  Case Requests ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setActiveFilter('in_review')}
                  className={`expert-tab ${activeFilter === 'in_review' ? 'active' : ''}`}
                >
                  Under Review ({expertCases.filter((c) => c.status === 'IN_REVIEW').length})
                </button>
                <button
                  onClick={() => setActiveFilter('need_info')}
                  className={`expert-tab ${activeFilter === 'need_info' ? 'active' : ''}`}
                >
                  Awaiting Info ({expertCases.filter((c) => c.status === 'NEED_MORE_INFORMATION').length})
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`expert-tab ${activeFilter === 'completed' ? 'active' : ''}`}
                >
                  Completed ({expertCases.filter((c) => c.status === 'REVIEW_COMPLETED').length})
                </button>
              </div>

              <div className="expert-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search case ID, title, botanical name..."
                  className="expert-search-input"
                />
              </div>
            </div>

            {/* Cases Table View */}
            <div className="gov-card expert-table-card">
              <table className="gov-table expert-cases-table" role="table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Domain / Specialization</th>
                    <th>Inquiry Summary</th>
                    <th>Confidence Flag</th>
                    <th>Jurisdiction</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-muted">
                        No cases matching this criteria currently.
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong className="case-table-id">{c.id}</strong>
                        </td>
                        <td>
                          <span className="status-badge info">{c.domain}</span>
                        </td>
                        <td>
                          <div className="case-table-title-box">
                            <strong>{c.title}</strong>
                            <p className="case-table-query">"{c.query}"</p>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`confidence-tag ${
                              c.confidenceLevel === 'high'
                                ? 'text-success'
                                : c.confidenceLevel === 'medium'
                                ? 'text-accent'
                                : 'text-error'
                            }`}
                          >
                            {c.confidenceLevel.toUpperCase()}
                          </span>
                        </td>
                        <td>{c.jurisdiction}</td>
                        <td>
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                        <td>
                          {c.status === 'SUBMITTED' || c.status === 'ASSIGNED' ? (
                            <button
                              type="button"
                              onClick={() => handleAcceptCase(c.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontWeight: 700 }}
                            >
                              <span>Accept &amp; Review</span>
                              <ChevronRight size={14} />
                            </button>
                          ) : (
                            <Link
                              to={`/expert/cases/${c.id}`}
                              className="btn btn-primary btn-sm"
                              title="Review and provide expert legal opinion"
                            >
                              <span>{c.status === 'REVIEW_COMPLETED' ? 'View Opinion' : 'Examine Case'}</span>
                              <ChevronRight size={14} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
