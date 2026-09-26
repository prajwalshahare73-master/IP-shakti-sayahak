import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Award,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Briefcase,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { EmpanelledExpert } from './ExpertDirectorySelector';

interface ExpertCardProps {
  expert: EmpanelledExpert;
  onSendCase: (expert: EmpanelledExpert) => void;
  onViewExpert: (expert: EmpanelledExpert) => void;
  isSent?: boolean;
  activeStatus?: string;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({
  expert,
  onSendCase,
  onViewExpert,
  isSent = false,
  activeStatus
}) => {
  const { t } = useTranslation();

  const isAvailable = expert.status === 'Available';
  const isBusy = expert.status === 'Busy';

  return (
    <div
      className={`gov-card expert-recommendation-card transition-all ${
        isSent ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : 'hover:shadow-md'
      }`}
      style={{
        background: '#ffffff',
        border: isSent ? '2px solid #10b981' : '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: isSent ? '0 4px 14px rgba(16, 185, 129, 0.15)' : '0 2px 8px rgba(15, 61, 92, 0.06)'
      }}
    >
      {/* Top Header: Avatar, Name, Status & Match Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar with Gradient */}
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: expert.avatarGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.8)'
            }}
          >
            <UserCheck size={26} strokeWidth={2.4} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f3d5c' }}>
                {expert.name}
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>{expert.verificationStatus}</span>
              </span>
            </div>

            <p style={{ margin: '3px 0 0 0', fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>
              {expert.roleTitle}
            </p>
          </div>
        </div>

        {/* Match Relevance Badge & Status Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '14px',
              background: expert.matchScore && expert.matchScore >= 90 ? '#ecfdf5' : '#eff6ff',
              color: expert.matchScore && expert.matchScore >= 90 ? '#047857' : '#1d4ed8',
              border: expert.matchScore && expert.matchScore >= 90 ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={13} />
            <span>{expert.matchBadge || (expert.matchScore ? `${expert.matchScore}% Case Relevance` : 'Strong Domain Match')}</span>
          </span>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: isAvailable ? '#059669' : isBusy ? '#d97706' : '#64748b'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isAvailable ? '#10b981' : isBusy ? '#f59e0b' : '#94a3b8'
              }}
            />
            <span>Status: <strong>{expert.status}</strong></span>
          </span>
        </div>
      </div>

      {/* Grid: Specialization, Experience, Expertise, Jurisdiction */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          background: '#f8fafc',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          fontSize: '12px'
        }}
      >
        <div>
          <span style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            SPECIALIZATION:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {expert.specialization?.map((spec, i) => (
              <span
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontWeight: 600,
                  color: '#334155',
                  fontSize: '11.5px'
                }}
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            EXPERIENCE:
          </span>
          <strong style={{ color: '#0f3d5c', fontSize: '13px' }}>
            {expert.experienceYears}+ years ({expert.casesResolved}+ AYUSH cases resolved)
          </strong>
        </div>

        <div>
          <span style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            EXPERTISE:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {expert.expertise?.map((expItem, i) => (
              <span
                key={i}
                style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                {expItem}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            JURISDICTION:
          </span>
          <strong style={{ color: '#0f3d5c', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} className="text-secondary" />
            <span>{expert.jurisdiction}</span>
          </strong>
        </div>
      </div>

      {/* Section 12: Routing Explanation ("Why this expert?") */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px dashed #86efac',
          borderRadius: '8px',
          padding: '10px 14px'
        }}
      >
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
          Why this expert?
        </span>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#14532d', lineHeight: 1.6 }}>
          {expert.matchReasons && expert.matchReasons.length > 0 ? (
            expert.matchReasons.map((r, i) => <li key={i}>{r}</li>)
          ) : (
            <>
              <li>✓ Matches case statutory domain</li>
              <li>✓ Relevant to Indian &amp; international jurisdiction</li>
              <li>✓ Suitable for prior-art related case screening</li>
            </>
          )}
        </ul>
      </div>

      {/* Section 3: Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '4px' }}>
        {isSent ? (
          <div
            style={{
              flex: 1,
              background: '#ecfdf5',
              border: '1.5px solid #10b981',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#065f46',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={18} className="text-success" />
            <span>✓ CASE SENT TO EXPERT</span>
            {activeStatus && (
              <span style={{ fontSize: '12px', fontWeight: 600, background: '#d1fae5', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px' }}>
                ({activeStatus})
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSendCase(expert)}
            className="btn btn-primary btn-md flex-1"
            style={{
              fontWeight: 700,
              fontSize: '14px',
              gap: '8px',
              padding: '11px 18px',
              boxShadow: '0 3px 10px rgba(15, 61, 92, 0.2)'
            }}
          >
            <Send size={15} />
            <span>SEND CASE TO EXPERT</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewExpert(expert)}
          className="btn btn-outline btn-md"
          style={{
            fontWeight: 600,
            fontSize: '13px',
            gap: '6px',
            padding: '11px 16px',
            borderColor: '#cbd5e1'
          }}
        >
          <Eye size={15} />
          <span>VIEW EXPERT</span>
        </button>
      </div>
    </div>
  );
};
