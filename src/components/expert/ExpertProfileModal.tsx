import React from 'react';
import {
  X,
  UserCheck,
  Award,
  Building2,
  ShieldCheck,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { EmpanelledExpert } from './ExpertDirectorySelector';

interface ExpertProfileModalProps {
  expert: EmpanelledExpert;
  onClose: () => void;
  onSelectAndSend?: (expert: EmpanelledExpert) => void;
}

export const ExpertProfileModal: React.FC<ExpertProfileModalProps> = ({
  expert,
  onClose,
  onSelectAndSend
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expert-profile-title"
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
        style={{ background: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: expert.avatarGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                flexShrink: 0
              }}
            >
              <UserCheck size={30} strokeWidth={2.4} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 id="expert-profile-title" style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0f3d5c' }}>
                  {expert.name}
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  {expert.verificationStatus}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>
                {expert.roleTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section 11: EXPERT CREDENTIALS */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <ShieldCheck size={16} className="text-primary" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f3d5c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              EXPERT CREDENTIALS
            </h3>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '13px'
            }}
          >
            {/* Domain */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>• Domain:</span>
              <strong style={{ color: '#0f3d5c', textAlign: 'right' }}>
                {expert.roleTitle}
              </strong>
            </div>

            {/* Qualification */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>• Qualification:</span>
              <strong style={{ color: '#0f3d5c', textAlign: 'right', maxWidth: '300px' }}>
                {expert.degrees}
              </strong>
            </div>

            {/* Experience */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>• Experience:</span>
              <strong style={{ color: '#0f3d5c' }}>
                {expert.experienceYears}+ years ({expert.casesResolved}+ resolved cases)
              </strong>
            </div>

            {/* Organization */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>• Organization:</span>
              <strong style={{ color: '#0f3d5c', textAlign: 'right', maxWidth: '300px' }}>
                {expert.organization}
              </strong>
            </div>

            {/* Certification / Verification status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>• Certification / Verification Status:</span>
              <span style={{ color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>Empanelled AYUSH IP Facilitator (Govt. of India Scheme)</span>
              </span>
            </div>

            {/* Jurisdiction */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>• Practice Jurisdiction:</span>
              <strong style={{ color: '#0f3d5c' }}>
                {expert.jurisdiction}
              </strong>
            </div>
          </div>
        </div>

        {/* Areas of Practice & Specializations */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            Empanelled Technical Specializations:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {expert.specialization?.map((s, i) => (
              <span
                key={i}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-md">
            Close
          </button>
          {onSelectAndSend && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectAndSend(expert);
              }}
              className="btn btn-primary btn-md"
              style={{ gap: '8px', fontWeight: 700 }}
            >
              <UserCheck size={16} />
              <span>Select &amp; Send Case</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
