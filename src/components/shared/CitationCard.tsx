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
          href={citation.url || `/sources?highlight=${encodeURIComponent(citation.title)}`}
          className="btn btn-outline btn-sm citation-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpen size={14} />
          <span>View Source Document</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
