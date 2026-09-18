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
        </div>

        {index !== undefined && <span className="citation-num">[{index + 1}]</span>}
      </div>

      <h4 className="citation-title">{citation.title}</h4>

      <div className="citation-meta-row">
        {citation.section && <span className="citation-section">{citation.section}</span>}
        {citation.page && <span className="citation-page">Page {citation.page}</span>}
        {citation.version && <span className="citation-version">v{citation.version}</span>}
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
