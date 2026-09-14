import React from 'react';
import { ShieldCheck, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConfidenceInfo } from '../../store/appStore';

export const ConfidenceCard: React.FC<{ confidence: ConfidenceInfo }> = ({ confidence }) => {
  const getBadgeStyle = () => {
    switch (confidence.level) {
      case 'high':
        return {
          label: 'High Confidence',
          className: 'confidence-high',
          icon: <ShieldCheck size={18} className="text-success" />,
          colorClass: 'status-badge success'
        };
      case 'medium':
        return {
          label: 'Moderate / Conditional Confidence',
          className: 'confidence-medium',
          icon: <AlertTriangle size={18} className="text-accent" />,
          colorClass: 'status-badge warning'
        };
      case 'low':
      default:
        return {
          label: 'Preliminary / Low Confidence',
          className: 'confidence-low',
          icon: <Info size={18} className="text-error" />,
          colorClass: 'status-badge error'
        };
    }
  };

  const badge = getBadgeStyle();

  // Extract or synthesize low confidence alerts if sections exist
  const lowAlerts =
    confidence.lowConfidenceAlerts ||
    (confidence.sections
      ? confidence.sections
          .filter((s) => s.level === 'low')
          .map((s) => ({
            section: s.section,
            percentage: s.percentage || 35,
            reason: s.reason || 'Insufficient statutory facts provided to confirm conclusive legal determination.'
          }))
      : []);

  return (
    <div className={`gov-card confidence-card ${badge.className}`} role="region" aria-label="Assessment Confidence">
      <div className="confidence-header">
        <div className="confidence-title-row">
          {badge.icon}
          <div>
            <h4 className="confidence-title">Assessment Confidence</h4>
            <div className={badge.colorClass}>{badge.label}</div>
          </div>
        </div>
      </div>

      {/* Section-Level Confidence Matrix (PRD Section 13) */}
      {confidence.sections && confidence.sections.length > 0 && (
        <div className="confidence-sections-matrix">
          <span className="confidence-subhead">Section-Level Confidence:</span>
          <div className="sections-grid-table">
            {confidence.sections.map((sec, idx) => (
              <div key={idx} className="section-confidence-row">
                <span className="sec-name">{sec.section}</span>
                <span className={`status-badge ${sec.level === 'high' ? 'success' : sec.level === 'medium' ? 'warning' : 'error'}`}>
                  {sec.level.toUpperCase()} {sec.percentage ? `(${sec.percentage}%)` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Prominent Low-Confidence Warning Blocks (PRD Section 13) */}
      {lowAlerts.length > 0 && (
        <div className="low-confidence-alerts-stack">
          {lowAlerts.map((alert, idx) => (
            <div key={idx} className="low-confidence-warning-box" role="alert">
              <div className="warning-title-bar">
                <AlertCircle size={17} className="text-error" />
                <strong>⚠ LOW CONFIDENCE AREA</strong>
              </div>
              <div className="warning-field">
                <span className="field-key">Section:</span>
                <strong>{alert.section}</strong>
              </div>
              <div className="warning-field">
                <span className="field-key">Confidence:</span>
                <span className="text-error font-bold">{alert.percentage}%</span>
              </div>
              <div className="warning-reason-text">
                <strong>Reason:</strong> {alert.reason}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="confidence-reasons">
        <span className="confidence-subhead">Grounding Basis:</span>
        <ul className="confidence-list">
          {confidence.reasons.map((reason, idx) => (
            <li key={idx}>
              <CheckCircle2 size={14} className="icon-check" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {confidence.caveat && (
        <div className="confidence-caveat">
          <Info size={14} />
          <span>{confidence.caveat}</span>
        </div>
      )}

      <div className="confidence-notice">
        <small>
          Notice: This confidence indicator reflects statutory source alignment, not mathematical probability or legal guarantee.
        </small>
      </div>
    </div>
  );
};
