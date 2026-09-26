import React, { useState } from 'react';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, FileCheck, Layers } from 'lucide-react';
import { Citation } from '../../store/appStore';

export const CitationCard: React.FC<{ citation: Citation; index?: number }> = ({ citation, index }) => {
  const [expanded, setExpanded] = useState(false);

  const getAuthorityBadge = (level: number) => {
    switch (level) {
      case 1:
        return { label: 'Primary Statute / Act', color: 'badge-primary-statute' };
      case 2:
        return { label: 'Official Guideline', color: 'badge-guideline' };
      case 3:
        return { label: 'Registry / TKDL Record', color: 'badge-registry' };
      default:
        return { label: 'Supporting Research', color: 'badge-research' };
    }
  };

  const badge = getAuthorityBadge(citation.authorityLevel);

  return (
    <div className="gov-card citation-card" role="article">
      <div className="citation-top">
        <div className="citation-badge-row">
          <span className={`authority-badge ${badge.color}`}>
            <FileCheck size={12} />
            {badge.label}
          </span>
          <span className="citation-jurisdiction">{citation.jurisdiction}</span>
          <span className="citation-status">{citation.status}</span>
          {(citation as any).verificationStatus && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                background:
                  (citation as any).verificationStatus === 'SUPPORTED'
                    ? '#f0fdf4'
                    : (citation as any).verificationStatus === 'PARTIALLY_SUPPORTED'
                    ? '#fffbeb'
                    : '#fef2f2',
                color:
                  (citation as any).verificationStatus === 'SUPPORTED'
                    ? '#16a34a'
                    : (citation as any).verificationStatus === 'PARTIALLY_SUPPORTED'
                    ? '#d97706'
                    : '#dc2626',
                border: `1px solid ${
                  (citation as any).verificationStatus === 'SUPPORTED'
                    ? '#bbf7d0'
                    : (citation as any).verificationStatus === 'PARTIALLY_SUPPORTED'
                    ? '#fde68a'
                    : '#fecaca'
                }`
              }}
            >
              {(citation as any).verificationStatus === 'SUPPORTED'
                ? '✓ Supported'
                : (citation as any).verificationStatus === 'PARTIALLY_SUPPORTED'
                ? '⚠ Partially Supported'
                : '✕ Unsupported'}
            </span>
          )}
        </div>

        {index !== undefined && <span className="citation-num">[{index + 1}]</span>}
      </div>

      <h4 className="citation-title">{citation.title}</h4>

      <div className="citation-meta-row">
        {citation.section && <span className="citation-section">{citation.section}</span>}
        {citation.page && <span className="citation-page">Page {citation.page}</span>}
        {citation.version && <span className="citation-version">v{citation.version}</span>}
        {(citation as any).effectiveDate && (
          <span style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '2px 7px', borderRadius: '10px', border: '1px solid #a7f3d0', fontWeight: 600 }}>
            In force: {(citation as any).effectiveDate}
          </span>
        )}
        {(citation as any).lastAmendedDate && (
          <span style={{ fontSize: '11px', color: '#b45309', background: '#fffbeb', padding: '2px 7px', borderRadius: '10px', border: '1px solid #fde68a', fontWeight: 600 }}>
            Amended: {(citation as any).lastAmendedDate}
          </span>
        )}
      </div>

      {citation.excerpt && (
        <div className="citation-excerpt-wrapper">
          <p className={`citation-excerpt ${expanded ? 'expanded' : 'clamped'}`}>
            "{citation.excerpt}"
          </p>
          {citation.excerpt.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="citation-toggle-btn"
              aria-label={expanded ? 'Show less excerpt' : 'Show full excerpt'}
            >
              {expanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp size={12} />
                </>
              ) : (
                <>
                  <span>Read excerpt</span>
                  <ChevronDown size={12} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Verification Note: only shown when trust validation data is attached */}
      {(citation as any).verificationNote && (
        <div style={{
          fontSize: '11px',
          marginTop: '6px',
          padding: '6px 10px',
          borderRadius: '6px',
          background: (citation as any).verificationStatus === 'NOT_SUPPORTED' ? '#fef2f2' : (citation as any).verificationStatus === 'PARTIALLY_SUPPORTED' ? '#fffbeb' : '#f0fdf4',
          color: (citation as any).verificationStatus === 'NOT_SUPPORTED' ? '#dc2626' : (citation as any).verificationStatus === 'PARTIALLY_SUPPORTED' ? '#d97706' : '#15803d',
          border: `1px solid ${(citation as any).verificationStatus === 'NOT_SUPPORTED' ? '#fecaca' : (citation as any).verificationStatus === 'PARTIALLY_SUPPORTED' ? '#fde68a' : '#bbf7d0'}`,
          lineHeight: 1.4
        }}>
          {(citation as any).verificationStatus === 'NOT_SUPPORTED' && <strong>⚠ Warning: </strong>}
          {(citation as any).verificationNote}
        </div>
      )}

      <div className="citation-action-row">
        <a
          href={
            citation.url ||
            (citation.title.toLowerCase().includes('biodiversity') || citation.title.toLowerCase().includes('nba')
              ? 'http://nbaindia.org'
              : citation.title.toLowerCase().includes('tkdl')
              ? 'https://tkdl.res.in'
              : citation.title.toLowerCase().includes('ayurveda aahara') || citation.title.toLowerCase().includes('fssai')
              ? 'https://fssai.gov.in'
              : citation.title.toLowerCase().includes('trademark')
              ? 'https://ipindia.gov.in/trade-marks.htm'
              : 'https://ipindia.gov.in/patents.htm')
          }
          className="btn btn-outline btn-sm citation-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpen size={14} />
          <span>View Statutory Source</span>
          <ExternalLink size={12} />
        </a>
        <a
          href={`/sources?highlight=${encodeURIComponent(citation.section || citation.title.split('—')[0].trim())}`}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '11.5px', padding: '4px 10px' }}
        >
          <span>Browse in Portal Sources</span>
        </a>
      </div>
    </div>
  );
};
