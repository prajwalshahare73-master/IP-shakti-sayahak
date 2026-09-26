import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  FileCheck,
  BookOpen,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Hash
} from 'lucide-react';
import { AIAnswerData, CaseProfile } from '../../store/appStore';
import { TrustValidationResult } from '../../services/trustValidation.service';

interface TrustValidationPanelProps {
  answer: AIAnswerData & { trustValidation?: TrustValidationResult };
  query: string;
  jurisdiction: string;
  onEscalate?: () => void;
}

export const TrustValidationPanel: React.FC<TrustValidationPanelProps> = ({
  answer,
  query,
  jurisdiction,
  onEscalate
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const tv = answer.trustValidation;

  if (!tv) return null;

  const isIndia = jurisdiction.toLowerCase().includes('india') || answer.jurisdiction.toLowerCase().includes('india');
  const isInternational = jurisdiction.toLowerCase().includes('international') || answer.jurisdiction.toLowerCase().includes('international');

  return (
    <div
      className="gov-card trust-validation-panel"
      style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '16px 20px',
        marginTop: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#0d9488" />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f3d5c' }}>
            Trust & Statutory Verification Layer
          </h4>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* 1. Jurisdiction Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: isInternational ? '#eff6ff' : '#f0fdf4',
              color: isInternational ? '#1d4ed8' : '#15803d',
              border: `1px solid ${isInternational ? '#bfdbfe' : '#bbf7d0'}`
            }}
          >
            <MapPin size={12} />
            {isInternational ? '🌐 International (PCT/WIPO)' : '🇮🇳 India (IPO & AYUSH)'}
          </span>

          {/* 2. Detected IP Route Tag */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a'
            }}
          >
            🎯 IP Route: {tv.ipRoute.category}
          </span>
        </div>
      </div>

      {/* Verification Status Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '12px'
        }}
      >
        {/* Citation Status */}
        <div
          style={{
            background: '#ffffff',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Citation Verification Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            {tv.citationSummary.overallStatus === 'VERIFIED' ? (
              <CheckCircle2 size={16} color="#16a34a" />
            ) : (
              <AlertCircle size={16} color="#d97706" />
            )}
            <strong style={{ fontSize: '13px', color: '#1e293b' }}>
              {tv.citationSummary.supportedCount} Supported / {tv.citationSummary.partiallySupportedCount} Partial
            </strong>
          </div>
        </div>

        {/* ABS Compliance Indicator */}
        <div
          style={{
            background: '#ffffff',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            ABS Biological Sourcing
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            {tv.absCompliance.isBiologicalDetected ? (
              <>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>🌿 Form I/III Required</span>
              </>
            ) : (
              <span style={{ fontSize: '13px', color: '#64748b' }}>No Biological Sourcing Alert</span>
            )}
          </div>
        </div>

        {/* Audit ID */}
        <div
          style={{
            background: '#ffffff',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Traceability Audit Hash
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#0f3d5c' }}>
            <Hash size={13} />
            {tv.auditTrail.auditId}
          </div>
        </div>
      </div>

      {/* Expandable Details Panel */}
      {showDetails && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          {/* TKDL Search Pointer Box */}
          {tv.tkdlPointer.isTKRelevant && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#92400e', fontSize: '13px' }}>
                <BookOpen size={16} />
                <span>{tv.tkdlPointer.pointerReference}</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#78350f', lineHeight: 1.4 }}>
                Classical Texts Coverage: {tv.tkdlPointer.classicalTexts.join(', ')}
              </p>
              <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#b45309', fontStyle: 'italic' }}>
                {tv.tkdlPointer.disclaimer}
              </small>
            </div>
          )}

          {/* ABS Compliance Advisory Box */}
          {tv.absCompliance.isBiologicalDetected && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '12px'
              }}
            >
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '13px' }}>
                Biological Diversity Act 2002 Compliance Notice
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#047857' }}>
                {tv.absCompliance.advisoryNote}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                {tv.absCompliance.applicableForms.map((form, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      background: '#ffffff',
                      color: '#047857',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    {form}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Legal Notice Guardrail */}
          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>
            Notice: Information provided is grounded in official statutory indices and AYUSH guidelines. It does not replace formal legal counsel by a registered patent agent or advocate.
          </div>
        </div>
      )}

      {/* Bottom Action Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0f3d5c',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0
          }}
        >
          {showDetails ? (
            <>
              <span>Hide Verification Details</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>View Full Verification Breakdown & TKDL Pointer</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>

        {onEscalate && (
          <button
            onClick={onEscalate}
            className="btn btn-outline btn-sm"
            style={{
              borderColor: '#047857',
              color: '#047857',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 12px'
            }}
          >
            <UserCheck size={14} />
            <span>Request Human Review</span>
          </button>
        )}
      </div>
    </div>
  );
};
