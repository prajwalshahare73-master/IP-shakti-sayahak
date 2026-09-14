import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles, BookOpen, AlertCircle, FileText, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { VoiceInputField } from '../../components/shared/VoiceInputField';

export const PriorArtPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('India (TKDL & IP India)');

  const mockPriorArtResults = [
    {
      id: 'pa-1',
      title: 'TKDL Classical Reference: Polyherbal Formulation for Shwasa Roga (Bronchial Asthma)',
      source: 'Charaka Samhita (Chikitsa Sthana, Chapter 18, Shloka 45-48)',
      ipcCode: 'A61K 36/185',
      jurisdiction: 'India / Classical Ayurveda',
      relevanceScore: 'High Relevance to Polyherbal Respiratory Kadha',
      relevanceWhy:
        'Discloses identical synergistic combination of Adhatoda vasica (Vasaka), Solanum surattense (Kantakari), and Glycyrrhiza glabra (Yashtimadhu) for therapeutic respiratory clearance.',
      excerpt: '...एतानि क्वाथयित्वा पिबेत् श्वासार्चितः नरः...'
    },
    {
      id: 'pa-2',
      title: 'Indian Patent Application 201811045231: Standardized Aqueous Extract of Vasaka with Enhanced Vasicine Stability',
      source: 'Indian Patent Journal, Issue 14/2020',
      ipcCode: 'A61K 31/517',
      jurisdiction: 'India (IP India)',
      relevanceScore: 'Moderate Relevance (Extraction Carrier Novelty)',
      relevanceWhy:
        'Focuses on pharmaceutical micro-encapsulation of quinazoline alkaloids rather than classical crude decoction.',
      excerpt: 'A sustained-release formulation of standardized Adhatoda vasica extract having 2% to 4% total alkaloid content.'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div className="gov-prior-art-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: 'Prior Art Search', link: '/prior-art' }]} />

      <div className="gov-container prior-art-container">
        <div className="prior-art-header">
          <h1 className="prior-art-title">Prior Art & Traditional Knowledge Search</h1>
          <p className="prior-art-subtitle">
            Screen your herbal formulation against classical Sanskrit literature, the Traditional Knowledge Digital Library (TKDL) concordances, and published patent registry documents.
          </p>
        </div>

        {/* Search Box */}
        <div className="gov-card prior-art-search-card">
          <form onSubmit={handleSearch} className="prior-art-form">
            <VoiceInputField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Describe formulation ingredients, botanical names (e.g. Vasaka, Ashwagandha), or therapeutic application..."
              multiline={true}
              rows={2}
              id="prior-art-input"
              label="Invention Description or Ingredients for Prior Art Search"
            />

            <div className="search-controls-row">
              <div className="jurisdiction-select-box">
                <label className="gov-input-label">Corpus Target:</label>
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="gov-select-compact"
                >
                  <option value="India (TKDL & IP India)">India (TKDL & IP India Databases)</option>
                  <option value="WIPO / Global">WIPO / PCT Traditional Medicine Registries</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                <Search size={16} />
                <span>Search Prior Art</span>
              </button>
            </div>
          </form>
        </div>

        {/* Search Results Area */}
        {hasSearched && (
          <div className="prior-art-results-block">
            <div className="results-header-row">
              <h3>Search Findings ({mockPriorArtResults.length} Relevant Records Found)</h3>
              <span className="safe-notice-tag">
                Note: No prior-art search can guarantee complete absence of historical citations.
              </span>
            </div>

            <div className="prior-art-results-stack">
              {mockPriorArtResults.map((res) => (
                <div key={res.id} className="gov-card prior-art-result-card">
                  <div className="result-top-bar">
                    <span className="status-badge info">{res.ipcCode}</span>
                    <span className="result-jurisdiction">{res.jurisdiction}</span>
                  </div>

                  <h4 className="result-doc-title">{res.title}</h4>
                  <div className="result-source-meta">
                    <strong>Source:</strong> {res.source}
                  </div>

                  <div className="result-relevance-box">
                    <strong>Why this is relevant to your invention:</strong>
                    <p>{res.relevanceWhy}</p>
                  </div>

                  <div className="result-excerpt-box">
                    <span className="excerpt-label">Cited Passage:</span>
                    <p className="excerpt-text">"{res.excerpt}"</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Step Action */}
            <div className="gov-card prior-art-cta-card">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-primary" />
                <div>
                  <h4>Want a comprehensive Section 3(p) clearance opinion?</h4>
                  <p>Request an empanelled patent facilitator to conduct a formal clearance search.</p>
                </div>
              </div>
              <Link to="/ask" className="btn btn-primary btn-sm">
                <span>Ask Complete Patent Guidance</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
