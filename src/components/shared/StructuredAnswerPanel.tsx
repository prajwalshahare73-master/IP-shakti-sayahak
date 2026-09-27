/**
 * IP-SAKTI Sahayak — Structured Answer Panel
 *
 * Renders a full RAG-generated answer in the 11-section structured format:
 * 01 Case Understanding  06 Biodiversity / ABS
 * 02 Classification      07 Evidence & Sources
 * 03 IP Pathway          08 Confidence & Limitations
 * 04 Regulatory Pathway  09 Information Still Required
 * 05 TK / Prior Art      10 Recommended Next Actions
 *                         11 Expert Review
 *
 * The panel works in two modes:
 *  - "structured" (default): the backend LLM returned section-tagged output
 *    which is parsed into distinct visual cards.
 *  - "prose" (fallback): the backend returned unstructured markdown prose
 *    which is rendered in a single card with a parsed heading structure.
 *
 * IMPORTANT: This component never injects hard-coded domain knowledge.
 * Every piece of text shown here originates from AIAnswerData, which
 * itself comes from the RAG pipeline. If a section is absent, it is
 * simply not rendered.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, BookOpen,
  Shield, Layers, Globe, Leaf, FileText, Target, UserCheck, Info,
  ExternalLink, ChevronRight, Zap, Scale, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { AIAnswerData, Citation } from '../../store/appStore';
import { ExpertRoutingWorkflow } from '../expert/ExpertRoutingWorkflow';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface StructuredSection {
  id: string;
  label: string;
  number: string;
  content: string;
  present: boolean;
}

interface Props {
  answer: AIAnswerData;
  query: string;
  jurisdiction: string;
  caseProfile?: any;
  onEscalate?: () => void;
}

// ────────────────────────────────────────────────
// Section marker definitions
// ────────────────────────────────────────────────

const SECTION_MARKERS = [
  { id: 'case_understanding',  number: '01', label: 'Case Understanding',       patterns: ['01', 'CASE UNDERSTANDING', 'CASE PROFILE', 'WHAT THE SYSTEM UNDERSTOOD'] },
  { id: 'classification',      number: '02', label: 'Product Classification',   patterns: ['02', 'CLASSIFICATION', 'PRODUCT TYPE', 'PRODUCT CLASSIFICATION'] },
  { id: 'ip_pathway',          number: '03', label: 'Relevant IP Pathway',      patterns: ['03', 'IP PATHWAY', 'INTELLECTUAL PROPERTY', 'PATENT', 'TRADEMARK', 'IP TYPE'] },
  { id: 'regulatory',          number: '04', label: 'Regulatory Pathway',       patterns: ['04', 'REGULATORY', 'LICENSING', 'AYUSH', 'FSSAI', 'DRUGS AND COSMETICS'] },
  { id: 'tk_prior_art',        number: '05', label: 'Traditional Knowledge / Prior Art', patterns: ['05', 'TRADITIONAL KNOWLEDGE', 'TKDL', 'PRIOR ART', 'CLASSICAL'] },
  { id: 'abs_biodiversity',    number: '06', label: 'Biodiversity / ABS',       patterns: ['06', 'ABS', 'BIODIVERSITY', 'NBA', 'NATIONAL BIODIVERSITY', 'SBB'] },
  { id: 'evidence',            number: '07', label: 'Evidence & Sources',       patterns: ['07', 'EVIDENCE', 'SOURCES', 'CITATIONS', 'STATUTORY'] },
  { id: 'confidence',          number: '08', label: 'Confidence & Limitations', patterns: ['08', 'CONFIDENCE', 'LIMITATIONS', 'CERTAINTY'] },
  { id: 'missing_info',        number: '09', label: 'Information Still Required', patterns: ['09', 'MISSING', 'INFORMATION REQUIRED', 'ADDITIONAL INFORMATION', 'GAPS'] },
  { id: 'next_actions',        number: '10', label: 'Recommended Next Actions', patterns: ['10', 'NEXT ACTIONS', 'NEXT STEPS', 'RECOMMENDED STEPS', 'ACTIONABLE'] },
  { id: 'expert_review',       number: '11', label: 'Expert Review',            patterns: ['11', 'EXPERT REVIEW', 'SPECIALIST', 'PROFESSIONAL', 'HUMAN REVIEW'] },
];

// ────────────────────────────────────────────────
// Section Parser
// ────────────────────────────────────────────────

function parseStructuredSections(answerText: string): Map<string, string> {
  const result = new Map<string, string>();

  // Try to split on heading patterns like "### 01 —", "## 01.", "**01 — CASE UNDERSTANDING**"
  const headingRegex = /#{1,4}\s*(?:\*{0,2})(\d{1,2})[.)\s—–-]+([A-Z][A-Z &/]+)(?:\*{0,2})\s*/gi;

  const splitPoints: Array<{ pos: number; id: string }> = [];

  let match;
  while ((match = headingRegex.exec(answerText)) !== null) {
    const num = match[1].padStart(2, '0');
    const label = match[2].trim().toUpperCase();
    const marker = SECTION_MARKERS.find(
      m => m.number === num || m.patterns.some(p => label.includes(p))
    );
    if (marker) {
      splitPoints.push({ pos: match.index, id: marker.id });
    }
  }

  if (splitPoints.length >= 2) {
    // Extract content between split points
    for (let i = 0; i < splitPoints.length; i++) {
      const start = splitPoints[i].pos;
      const end = splitPoints[i + 1]?.pos ?? answerText.length;
      const raw = answerText.slice(start, end).replace(/^#{1,4}\s*\*{0,2}[^*\n]+\*{0,2}\n?/, '').trim();
      result.set(splitPoints[i].id, raw);
    }
  }

  return result;
}

// ────────────────────────────────────────────────
// Section Config (icon + colour accent)
// ────────────────────────────────────────────────

const SECTION_CONFIG: Record<string, { Icon: React.ElementType; accent: string; bg: string }> = {
  case_understanding: { Icon: Eye,       accent: 'var(--color-primary)',   bg: 'var(--color-primary-light)' },
  classification:     { Icon: Layers,    accent: '#7c3aed',                bg: '#f5f3ff' },
  ip_pathway:         { Icon: Scale,     accent: 'var(--color-primary)',   bg: 'var(--color-ai-bg)' },
  regulatory:         { Icon: Shield,    accent: '#0f766e',                bg: '#f0fdfa' },
  tk_prior_art:       { Icon: BookOpen,  accent: '#b45309',                bg: '#fffbeb' },
  abs_biodiversity:   { Icon: Leaf,      accent: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  evidence:           { Icon: FileText,  accent: 'var(--color-primary)',   bg: 'var(--color-info-bg)' },
  confidence:         { Icon: Target,    accent: '#6d28d9',                bg: '#faf5ff' },
  missing_info:       { Icon: AlertCircle, accent: 'var(--color-accent)',  bg: 'var(--color-abstain-bg)' },
  next_actions:       { Icon: Zap,       accent: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  expert_review:      { Icon: UserCheck, accent: '#dc2626',                bg: '#fef2f2' },
};

// ────────────────────────────────────────────────
// Markdown-lite renderer (no external deps)
// ────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={`ul-${listKey++}`} className="sap-md-list">
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (/^#{1,4}\s/.test(trimmed)) {
      flushList();
      const level = (trimmed.match(/^#+/) || [''])[0].length;
      const content = trimmed.replace(/^#+\s*/, '');
      const Tag = `h${Math.min(level + 3, 6)}` as keyof JSX.IntrinsicElements;
      nodes.push(
        <Tag key={idx} className={`sap-md-h${level}`} dangerouslySetInnerHTML={{ __html: inlineHtml(content) }} />
      );
    } else if (/^[-*•]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*•\d.):]+\s*/, ''));
      inList = true;
    } else {
      flushList();
      nodes.push(
        <p key={idx} className="sap-md-p" dangerouslySetInnerHTML={{ __html: inlineHtml(trimmed) }} />
      );
    }
  });
  flushList();
  return <>{nodes}</>;
}

function inlineHtml(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="sap-inline-code">$1</code>');
}

// ────────────────────────────────────────────────
// Collapsible Section Card
// ────────────────────────────────────────────────

interface SectionCardProps {
  id: string;
  number: string;
  label: string;
  content: string;
  defaultOpen?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({ id, number, label, content, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const config = SECTION_CONFIG[id] || { Icon: Info, accent: 'var(--color-primary)', bg: 'var(--color-ai-bg)' };
  const { Icon } = config;

  return (
    <div className="sap-section-card" id={`sap-section-${id}`}>
      <button
        type="button"
        className="sap-section-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ '--sap-accent': config.accent, '--sap-bg': config.bg } as React.CSSProperties}
      >
        <div className="sap-section-header-left">
          <span className="sap-section-number" style={{ backgroundColor: config.accent }}>
            {number}
          </span>
          <Icon size={16} style={{ color: config.accent, flexShrink: 0 }} />
          <span className="sap-section-label">{label}</span>
        </div>
        <div className="sap-section-toggle">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {open && (
        <div className="sap-section-body">
          <div className="sap-section-content">
            {renderMarkdown(content)}
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// Citation Card (inline, compact)
// ────────────────────────────────────────────────

const InlineCitationCard: React.FC<{ citation: Citation; index: number }> = ({ citation, index }) => {
  const [expanded, setExpanded] = useState(false);
  const authLabel = citation.authorityLevel === 1 ? 'Primary Statute' :
                    citation.authorityLevel === 2 ? 'Official Guideline' :
                    citation.authorityLevel === 3 ? 'Precedent / Registry' : 'Research';
  const authClass = citation.authorityLevel === 1 ? 'success' :
                    citation.authorityLevel === 2 ? 'info' :
                    citation.authorityLevel === 3 ? 'warning' : 'neutral';

  return (
    <div className={`sap-citation-card auth-${authClass}`}>
      <div className="sap-citation-row">
        <span className="sap-citation-index">[{index + 1}]</span>
        <div className="sap-citation-body">
          <div className="sap-citation-title">{citation.title}</div>
          {citation.section && (
            <code className="sap-citation-section">{citation.section}</code>
          )}
          <span className={`status-badge ${authClass} sap-auth-badge`}>{authLabel}</span>
        </div>
        <div className="sap-citation-actions">
          {citation.url && (
            <a href={citation.url} target="_blank" rel="noopener noreferrer" className="sap-ext-link" title="Open source">
              <ExternalLink size={13} />
            </a>
          )}
          {citation.excerpt && (
            <button type="button" className="sap-expand-btn" onClick={() => setExpanded(!expanded)} title="Show excerpt">
              {expanded ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          )}
        </div>
      </div>
      {expanded && citation.excerpt && (
        <blockquote className="sap-citation-excerpt">
          "{citation.excerpt}"
        </blockquote>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// Confidence Visual Indicator
// ────────────────────────────────────────────────

const ConfidenceBar: React.FC<{ level: 'high' | 'medium' | 'low'; reasons: string[] }> = ({ level, reasons }) => {
  const pct = level === 'high' ? 85 : level === 'medium' ? 55 : 25;
  const color = level === 'high' ? 'var(--color-success)' :
                level === 'medium' ? 'var(--color-accent)' : 'var(--color-error)';
  return (
    <div className="sap-conf-widget">
      <div className="sap-conf-label-row">
        <span className="sap-conf-level" style={{ color }}>{level.toUpperCase()}</span>
        <span className="sap-conf-pct">{pct}%</span>
      </div>
      <div className="sap-conf-bar">
        <div className="sap-conf-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      {reasons.length > 0 && (
        <ul className="sap-conf-reasons">
          {reasons.slice(0, 3).map((r, i) => (
            <li key={i}><Info size={11} className="sap-conf-reason-icon" />{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

export const StructuredAnswerPanel: React.FC<Props> = ({
  answer,
  query,
  jurisdiction,
  caseProfile,
  onEscalate
}) => {
  const [showAllCitations, setShowAllCitations] = useState(false);
  const parsed = parseStructuredSections(answer.answer);
  const isStructured = parsed.size >= 3;

  // ──────────────────────────────
  // STRUCTURED MODE
  // ──────────────────────────────
  if (isStructured) {
    return (
      <div className="sap-root" id="structured-answer-panel">
        {/* Section navigation pills */}
        <nav className="sap-nav" aria-label="Answer sections">
          {SECTION_MARKERS.map(m => {
            if (!parsed.has(m.id)) return null;
            const cfg = SECTION_CONFIG[m.id];
            return (
              <a
                key={m.id}
                href={`#sap-section-${m.id}`}
                className="sap-nav-pill"
                style={{ '--sap-accent': cfg?.accent } as React.CSSProperties}
              >
                <span className="sap-nav-num">{m.number}</span>
                <span className="sap-nav-label">{m.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Query Understanding Card (Original vs Reformulated Query) */}
        {(answer.reformulatedQuery || answer.originalQuery) && (
          <div className="sap-query-understanding-card" style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#166534', fontWeight: 600, fontSize: '0.88rem' }}>
              <Zap size={15} />
              <span>Query Understanding & Reformulation</span>
            </div>
            <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <span style={{ color: '#4b5563', fontWeight: 600 }}>Original Query: </span>
                <span style={{ color: '#1f2937' }}>{answer.originalQuery || query}</span>
              </div>
              {answer.reformulatedQuery && (
                <div>
                  <span style={{ color: '#15803d', fontWeight: 600 }}>Reformulated Retrieval Query: </span>
                  <span style={{ color: '#14532d', fontStyle: 'italic' }}>{answer.reformulatedQuery}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render each present section */}
        <div className="sap-sections-stack">
          {SECTION_MARKERS.map(m => {
            const content = parsed.get(m.id);
            if (!content) return null;
            return (
              <SectionCard
                key={m.id}
                id={m.id}
                number={m.number}
                label={m.label}
                content={content}
                defaultOpen={['case_understanding', 'classification', 'ip_pathway', 'next_actions'].includes(m.id)}
              />
            );
          })}

          {/* Citations section always shown from AIAnswerData.citations */}
          {answer.citations.length > 0 && !parsed.has('evidence') && (
            <div className="sap-section-card" id="sap-section-citations">
              <div className="sap-section-header sap-static-header">
                <div className="sap-section-header-left">
                  <span className="sap-section-number" style={{ backgroundColor: 'var(--color-primary)' }}>07</span>
                  <FileText size={16} style={{ color: 'var(--color-primary)' }} />
                  <span className="sap-section-label">Statutory Citations & Evidence</span>
                </div>
                <span className="sap-cite-count">{answer.citations.length} source{answer.citations.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="sap-section-body">
                <CitationsList citations={answer.citations} />
              </div>
            </div>
          )}

          {/* Section 11: Actionable Empanelled Expert Routing */}
          <div className="sap-section-card" id="sap-section-expert-routing">
            <div className="sap-section-header sap-static-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div className="sap-section-header-left">
                <span className="sap-section-number" style={{ backgroundColor: '#0f3d5c' }}>11</span>
                <UserCheck size={16} style={{ color: '#0f3d5c' }} />
                <span className="sap-section-label">Empanelled Legal Expert Routing</span>
              </div>
            </div>
            <div className="sap-section-body" style={{ padding: '4px' }}>
              <ExpertRoutingWorkflow
                caseId={`IPS-${Math.abs(query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000 + 1000)}`}
                caseTitle={query.slice(0, 60)}
                caseQuery={query}
                domain={answer.ipType || caseProfile?.productType || 'Ayurveda Intellectual Property'}
                jurisdiction={jurisdiction || 'India'}
                productType={caseProfile?.productType}
                isTraditional={caseProfile?.isTraditional}
                biologicalMaterial={caseProfile?.biological_material}
                tkInvolved={caseProfile?.tk_involved}
                exportPlanned={caseProfile?.export_planned}
                ingredients={caseProfile?.ingredients}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────
  // PROSE MODE (fallback)
  // ──────────────────────────────
  return (
    <div className="sap-root sap-prose-mode" id="structured-answer-panel">
      {/* Query Understanding Card (Original vs Reformulated Query) */}
      {(answer.reformulatedQuery || answer.originalQuery) && (
        <div className="sap-query-understanding-card" style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#166534', fontWeight: 600, fontSize: '0.88rem' }}>
            <Zap size={15} />
            <span>Query Understanding & Reformulation</span>
          </div>
          <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              <span style={{ color: '#4b5563', fontWeight: 600 }}>Original Query: </span>
              <span style={{ color: '#1f2937' }}>{answer.originalQuery || query}</span>
            </div>
            {answer.reformulatedQuery && (
              <div>
                <span style={{ color: '#15803d', fontWeight: 600 }}>Reformulated Retrieval Query: </span>
                <span style={{ color: '#14532d', fontStyle: 'italic' }}>{answer.reformulatedQuery}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case context summary */}
      {caseProfile && Object.keys(caseProfile).some(k => (caseProfile as any)[k]) && (
        <div className="sap-case-context-banner">
          <div className="sap-cctx-label">
            <Eye size={13} />
            <span>Case context used for this answer</span>
          </div>
          <div className="sap-cctx-pills">
            {caseProfile.productType && <span className="sap-cctx-pill">{caseProfile.productType}</span>}
            {caseProfile.purpose && <span className="sap-cctx-pill">{caseProfile.purpose}</span>}
            {caseProfile.isTraditional && <span className="sap-cctx-pill">TK: {caseProfile.isTraditional}</span>}
            {caseProfile.ingredients?.length > 0 && (
              <span className="sap-cctx-pill">{caseProfile.ingredients.length} ingredients</span>
            )}
            {caseProfile.biological_material && <span className="sap-cctx-pill sap-pill-warning">Bio resource</span>}
            {caseProfile.tk_involved && <span className="sap-cctx-pill sap-pill-warning">TK involved</span>}
          </div>
        </div>
      )}

      {/* Prose answer block */}
      <div className="sap-prose-block">
        <div className="sap-prose-header">
          <Scale size={15} className="sap-prose-icon" />
          <span>AI-Generated Guidance — source-grounded</span>
          <span className="status-badge info">{answer.ipType || 'IP Assessment'}</span>
        </div>
        <div className="sap-prose-content">
          {renderMarkdown(answer.answer)}
        </div>
      </div>

      {/* Why section */}
      {answer.why.length > 0 && (
        <div className="sap-mini-card sap-why-card">
          <h4 className="sap-mini-heading">
            <CheckCircle2 size={14} />
            Why this guidance was generated
          </h4>
          <ul className="sap-mini-list">
            {answer.why.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Confidence */}
      <div className="sap-mini-card">
        <h4 className="sap-mini-heading">
          <Target size={14} />
          Confidence Assessment
        </h4>
        <ConfidenceBar
          level={answer.confidence.level}
          reasons={answer.confidence.reasons}
        />
        {answer.confidence.caveat && (
          <p className="sap-conf-caveat">{answer.confidence.caveat}</p>
        )}
      </div>

      {/* Warnings */}
      {answer.warnings.length > 0 && (
        <div className="sap-mini-card sap-warning-card">
          <h4 className="sap-mini-heading">
            <AlertTriangle size={14} />
            Statutory Notices
          </h4>
          <ul className="sap-mini-list">
            {answer.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Next steps */}
      {answer.nextSteps.length > 0 && (
        <div className="sap-mini-card sap-next-card">
          <h4 className="sap-mini-heading">
            <Zap size={14} />
            Recommended Next Actions
          </h4>
          <div className="sap-next-btn-row">
            {answer.nextSteps.map((step, i) => (
              <Link
                key={i}
                to={step.link || '/dashboard'}
                className={`btn ${step.primary ? 'btn-primary' : 'btn-outline'} btn-sm`}
              >
                {step.title}
                <ChevronRight size={13} />
              </Link>
            ))}
            {onEscalate && (
              <button onClick={onEscalate} className="btn btn-secondary btn-sm">
                <UserCheck size={14} />
                Request Expert Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Citations */}
      {answer.citations.length > 0 && (
        <div className="sap-mini-card">
          <h4 className="sap-mini-heading">
            <FileText size={14} />
            Statutory Citations &amp; Evidence ({answer.citations.length})
          </h4>
          <CitationsList citations={answer.citations} />
        </div>
      )}

      {/* Actionable Empanelled Expert Routing */}
      <div style={{ marginTop: '16px' }}>
        <ExpertRoutingWorkflow
          caseId={`IPS-${Math.abs(query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000 + 1000)}`}
          caseTitle={query.slice(0, 60)}
          caseQuery={query}
          domain={answer.ipType || caseProfile?.productType || 'Ayurveda Intellectual Property'}
          jurisdiction={jurisdiction || 'India'}
          productType={caseProfile?.productType}
          isTraditional={caseProfile?.isTraditional}
          biologicalMaterial={caseProfile?.biological_material}
          tkInvolved={caseProfile?.tk_involved}
          exportPlanned={caseProfile?.export_planned}
          ingredients={caseProfile?.ingredients}
        />
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// Citations List subcomponent
// ────────────────────────────────────────────────

const CitationsList: React.FC<{ citations: Citation[] }> = ({ citations }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? citations : citations.slice(0, 4);

  return (
    <div className="sap-citations-list">
      {visible.map((cit, i) => (
        <InlineCitationCard key={cit.id || i} citation={cit} index={i} />
      ))}
      {citations.length > 4 && (
        <button
          type="button"
          className="sap-show-more-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show fewer sources' : `Show ${citations.length - 4} more source${citations.length - 4 !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};
