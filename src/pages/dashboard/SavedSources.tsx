import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  ExternalLink,
  Search,
  Filter,
  Download,
  BookOpen,
  Shield,
  FileText,
  ChevronLeft,
  Trash2
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

interface SavedSourceItem {
  id: string;
  title: string;
  category: 'Patent' | 'ABS' | 'Trademark' | 'TKDL' | 'AYUSH';
  citation: string;
  excerpt: string;
  savedDate: string;
  url?: string;
}

const INITIAL_SAVED_SOURCES: SavedSourceItem[] = [
  {
    id: 'src-1',
    title: 'The Patents Act, 1970 — Section 3(p)',
    category: 'Patent',
    citation: 'Act No. 39 of 1970, Section 3(p)',
    excerpt: 'An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention.',
    savedDate: '2026-09-07',
    url: 'https://ipindia.gov.in'
  },
  {
    id: 'src-2',
    title: 'Guidelines for Examination of Patent Applications relating to Traditional Knowledge',
    category: 'Patent',
    citation: 'Office of the CGPDTM (2012 Gazette Notification)',
    excerpt: 'Examiners must establish whether the combination of botanical drugs produces synergism under Section 3(e) prior to grant.',
    savedDate: '2026-09-06'
  },
  {
    id: 'src-3',
    title: 'The Biological Diversity Act, 2002 — Section 6',
    category: 'ABS',
    citation: 'Act No. 18 of 2003, Section 6(1)',
    excerpt: 'Prior approval of the National Biodiversity Authority is mandatory before filing any intellectual property application inside or outside India based on Indian biological resources.',
    savedDate: '2026-09-02',
    url: 'http://nbaindia.org'
  },
  {
    id: 'src-4',
    title: 'The Trade Marks Act, 1999 — Section 13',
    category: 'Trademark',
    citation: 'Act No. 47 of 1999, Section 13',
    excerpt: 'Prohibition of registration of names of chemical elements or international non-proprietary names / classical herbal generics.',
    savedDate: '2026-08-20'
  }
];

export const SavedSources: React.FC = () => {
  const [sources, setSources] = useState<SavedSourceItem[]>(INITIAL_SAVED_SOURCES);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleDelete = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  const filtered = sources.filter((s) => {
    const matchCat = filterCat === 'all' || s.category === filterCat;
    const matchSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.citation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="gov-sources-page" id="main-content">
      <Breadcrumbs
        customTrail={[
          { title: 'Citizen Dashboard', link: '/dashboard' },
          { title: 'Saved Legal Sources', link: '/dashboard/saved-sources' }
        ]}
      />

      <div className="gov-container">
        <div className="settings-header-row mb-4">
          <div>
            <Link to="/dashboard" className="gov-back-link">
              <ChevronLeft size={16} />
              <span>Back to Cases Dashboard</span>
            </Link>
            <h1 className="settings-page-title">My Bookmarked Statutes & Sources</h1>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-outline btn-sm"
          >
            <Download size={15} />
            <span>Export Citation List</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="gov-card p-3 mb-4 flex-wrap flex-between gap-3">
          <div className="search-box-wrap" style={{ minWidth: '280px', flex: 1 }}>
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search in bookmarked citations or provisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gov-input gov-input-clean"
            />
          </div>

          <div className="filter-pill-group">
            {['all', 'Patent', 'ABS', 'Trademark', 'TKDL'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCat(cat)}
                className={`btn btn-sm ${filterCat === cat ? 'btn-primary' : 'btn-ghost'}`}
              >
                {cat === 'all' ? 'All Authorities' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sources Cards Stack */}
        <div className="saved-sources-stack">
          {filtered.length === 0 ? (
            <div className="gov-card text-center p-5">
              <BookOpen size={36} className="text-muted mb-2 mx-auto" />
              <h3>No matching saved sources found</h3>
              <p className="text-muted">You can bookmark citations when viewing any guidance dossier or search result.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="gov-card source-item-card">
                <div className="source-item-header">
                  <div className="title-group">
                    <span className="status-badge info">{item.category}</span>
                    <h3 className="source-title">{item.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="btn-icon text-muted hover-danger"
                    title="Remove from saved sources"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="source-meta-row">
                  <span className="source-citation font-mono">{item.citation}</span>
                  <span className="source-date text-muted">Saved on {item.savedDate}</span>
                </div>

                <blockquote className="source-excerpt">
                  "{item.excerpt}"
                </blockquote>

                {item.url && (
                  <div className="source-footer">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gov-link-inline"
                    >
                      <span>View Official Gazette / Registry Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
