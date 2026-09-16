import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useAppStore } from '../../store/appStore';

export const ExpertDashboard: React.FC = () => {
  const { cases, user, setUser } = useAppStore();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'in_review' | 'need_info' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const expertCases = cases.filter((c) => c.escalated);

  const filteredCases = expertCases.filter((c) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'open'
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
              <h1 className="expert-banner-title">Empanelled Ayurveda IP & TK Expert Workspace</h1>
              <p className="expert-banner-sub">
                Logged in as <strong>{user?.name || 'Dr. V. Sharma'}</strong> (Senior Traditional Knowledge & Patent Facilitator)
              </p>
            </div>
          </div>

          <div className="expert-banner-right">
            <div className="expert-stat-pill">
              <span>Open Queue:</span>
              <strong>{expertCases.filter((c) => c.status !== 'REVIEW_COMPLETED').length} Cases</strong>
            </div>
          </div>
        </div>

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
              onClick={() => setActiveFilter('open')}
              className={`expert-tab ${activeFilter === 'open' ? 'active' : ''}`}
            >
              Pending Assignment ({expertCases.filter((c) => c.status === 'SUBMITTED' || c.status === 'ASSIGNED').length})
            </button>
            <button
              onClick={() => setActiveFilter('in_review')}
              className={`expert-tab ${activeFilter === 'in_review' ? 'active' : ''}`}
            >
              In Review ({expertCases.filter((c) => c.status === 'IN_REVIEW').length})
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
              placeholder="Search case ID, botanical name..."
              className="expert-search-input"
            />
          </div>
        </div>

        {/* Cases Table View (Structured Government Reference) */}
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
                    No cases in this category currently.
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
                      <Link
                        to={`/expert/cases/${c.id}`}
                        className="btn btn-primary btn-sm"
                        title="Review and provide expert legal opinion"
                      >
                        <span>Review Case</span>
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
