import React, { useState } from 'react';
import {
  Send,
  X,
  Lock,
  UserCheck,
  FileText,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EmpanelledExpert } from './ExpertDirectorySelector';

interface SendCaseConfirmationModalProps {
  caseId: string;
  caseTitle: string;
  domain: string;
  jurisdiction: string;
  selectedExpert: EmpanelledExpert;
  onConfirm: (notes?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const SendCaseConfirmationModal: React.FC<SendCaseConfirmationModalProps> = ({
  caseId,
  caseTitle,
  domain,
  jurisdiction,
  selectedExpert,
  onConfirm,
  onCancel,
  loading = false
}) => {
  const [sharedNotes, setSharedNotes] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 20px 40px rgba(15, 61, 92, 0.25)',
          background: '#ffffff'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '10px', color: '#059669' }}>
              <UserCheck size={22} />
            </div>
            <h2 id="confirm-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f3d5c' }}>
              Send Case for Expert Review?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
            title="Cancel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Case & Expert Details Summary */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>CASE ID:</span>
            <strong style={{ fontSize: '13px', fontWeight: 800, color: '#0f3d5c', fontFamily: 'monospace', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px' }}>
              {caseId}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Case Title:</span>
            <strong style={{ fontSize: '13px', color: '#1e293b', textAlign: 'right', maxWidth: '280px' }}>
              {caseTitle}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Issue / Domain:</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>
              {domain}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Jurisdiction:</span>
            <strong style={{ fontSize: '12px', color: '#334155' }}>
              {jurisdiction}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Selected Expert:</span>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '13px', color: '#047857', display: 'block' }}>
                {selectedExpert.name}
              </strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {selectedExpert.roleTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Context/Question for Specialist */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="shared-case-notes" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Specific questions or notes for the specialist (Optional):
          </label>
          <textarea
            id="shared-case-notes"
            value={sharedNotes}
            onChange={(e) => setSharedNotes(e.target.value)}
            placeholder="e.g. Please specifically review Section 3(p) TKDL citations and advise on SBB Form I intimation timeline..."
            rows={2}
            className="gov-textarea"
            style={{ fontSize: '12.5px', padding: '8px 12px' }}
          />
        </div>

        {/* Privacy Message */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Lock size={16} className="text-emerald-700 shrink-0" />
          <p style={{ margin: 0, fontSize: '11.5px', color: '#166534', lineHeight: 1.4 }}>
            "Only the information required for this case will be shared with the selected expert."
          </p>
        </div>

        {/* Actions: Cancel vs SEND CASE (Primary CTA) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-outline btn-md"
            style={{ fontWeight: 600, minWidth: '95px' }}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={() => onConfirm(sharedNotes)}
            disabled={loading}
            className="btn btn-primary btn-md"
            style={{
              fontWeight: 800,
              fontSize: '14px',
              padding: '10px 22px',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 61, 92, 0.25)'
            }}
          >
            <Send size={15} />
            <span>{loading ? 'SENDING CASE...' : 'SEND CASE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
