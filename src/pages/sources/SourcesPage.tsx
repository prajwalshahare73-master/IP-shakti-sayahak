import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Download, Filter, ExternalLink, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

export const SourcesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const highlightParam = searchParams.get('highlight') || '';

  const [searchFilter, setSearchFilter] = useState(highlightParam);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Act' | 'Guideline' | 'TKDL' | 'Order'>('All');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('All');

  const sourcesList = [
    {
      id: 'src-1',
      title: 'The Patents Act, 1970 (as amended up to 2024)',
      type: 'Act',
      jurisdiction: 'India',
      status: 'Current',
      version: '2024.1',
      sections: 'Section 3(p), 3(d), 3(e), Section 10',
      authority: 'Ministry of Commerce & Industry / CGPDTM',
      link: 'https://ipindia.gov.in',
      desc: 'Principal legislation governing patentability, novelty, inventive step, and non-patentability of traditional knowledge in India.'
    },
    {
      id: 'src-2',
      title: 'Guidelines for Examination of Patent Applications relating to Traditional Knowledge & Biological Material',
      type: 'Guideline',
      jurisdiction: 'India',
      status: 'Current',
      version: '2012',
      sections: 'Part B: Screening against TKDL & Bio-Assay Synergism',
      authority: 'Office of the CGPDTM, India',
      link: 'https://ipindia.gov.in',
      desc: 'Mandates strict cross-verification of classical herbal formulations against classical Ayurvedic texts.'
    },
    {
      id: 'src-3',
      title: 'The Biological Diversity Act, 2002',
      type: 'Act',
      jurisdiction: 'India',
      status: 'Current',
      version: '2023 Amendment',
      sections: 'Sections 3, 4, 6, 7, 19, 24, 55',
      authority: 'Ministry of Environment, Forest and Climate Change / NBA',
      link: 'http://nbaindia.org',
      desc: 'Regulates commercial access to Indian biological resources and mandates prior approval (Form III) before applying for IP.'
    },
    {
      id: 'src-4',
      title: 'Guidelines on Access to Biological Resources and Benefits Sharing (ABS) Regulations, 2014',
      type: 'Order',
      jurisdiction: 'India',
      status: 'Current',
      version: '2014 Notification',
      sections: 'Regulations 1-14: Benefit Sharing Matrix',
      authority: 'National Biodiversity Authority (NBA)',
      link: 'http://nbaindia.org',
      desc: 'Sets forth statutory payment formulas (0.1% to 0.5% ex-factory sales) for commercial extraction of herbs.'
    },
    {
      id: 'src-5',
      title: 'The Trade Marks Act, 1999',
      type: 'Act',
      jurisdiction: 'India',
      status: 'Current',
      version: '1999',
      sections: 'Section 9(1)(b), Section 13 (Non-registrability of generic/chemical names)',
      authority: 'Trade Marks Registry, IP India',
      link: 'https://ipindia.gov.in',
      desc: 'Protects brand distinctiveness in Class 5 (Medicinal) and Class 3 (Cosmetics) while preventing generic monopolization.'
    },
    {
      id: 'src-6',
      title: 'Traditional Knowledge Digital Library (TKDL) Reference Standard & Concordance',
      type: 'TKDL',
      jurisdiction: 'India',
      status: 'Current',
      version: 'v5.2',
      sections: 'Ayurveda, Unani, Siddha, Sowa-Rigpa Classics Concordance',
      authority: 'CSIR & Ministry of AYUSH',
      link: 'https://tkdl.res.in',
      desc: 'Digital corpus documenting classical Sanskrit, Persian, Arabic, and Tamil formulations into modern international patent classification (IPC).'
    },
    {
      id: 'src-7',
      title: 'Drugs and Cosmetics Act, 1940 & Rules 1945 (Chapter IVA: ASU Drugs)',
      type: 'Act',
      jurisdiction: 'India',
      status: 'Current',
      version: '2022 Compilation',
      sections: 'Sections 33A to 33N, Schedule T (GMP)',
      authority: 'Ministry of Health & Family Welfare / AYUSH',
      link: 'https://ayush.gov.in',
      desc: 'Governs licensing (Form 25D), labeling, safety testing, and manufacturing standards for classical and proprietary Ayurveda drugs.'
    },
    {
      id: 'src-8',
      title: 'Food Safety and Standards (Ayurveda Aahara) Regulations, 2022',
      type: 'Order',
      jurisdiction: 'India',
      status: 'Current',
      version: '2022 Gazette',
      sections: 'Regulations 1-8',
      authority: 'Food Safety and Standards Authority of India (FSSAI) & AYUSH',
      link: 'https://fssai.gov.in',
      desc: 'Specifies labeling, permitted classical food preparations, and prohibited therapeutic disease-cure claims for dietary products.'
    }
  ];

  const filterTokens = searchFilter
    .toLowerCase()
    .replace(/[—\-_()\[\],]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'act', 'and', 'for'].includes(w));

  const rawFiltered = sourcesList.filter((src) => {
    if (filterTokens.length === 0) return true;
    const combinedText = `${src.title} ${src.sections} ${src.desc} ${src.authority} ${src.type}`.toLowerCase();
    return filterTokens.some((token) => combinedText.includes(token));
  });

  const matchesTypeAndJurisdiction = (rawFiltered.length > 0 ? rawFiltered : sourcesList).filter((src) => {
    const matchesType = typeFilter === 'All' || src.type === typeFilter;
    const matchesJurisdiction = jurisdictionFilter === 'All' || src.jurisdiction === jurisdictionFilter;
    return matchesType && matchesJurisdiction;
  });

  const filteredSources = matchesTypeAndJurisdiction.length > 0 ? matchesTypeAndJurisdiction : sourcesList;

  return (
    <div className="gov-sources-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('nav.sources', 'Sources'), link: '/sources' }]} />

      <div className="gov-container sources-container">
        {/* Header Block */}
        <div className="sources-header-banner">
          <h1 className="sources-main-title">{t('sources.title', 'Statutory Sources, Gazette Acts & Legal Concordances')}</h1>
          <p className="sources-main-subtitle">
            {t('sources.subtitle', 'All AI responses and assessments on IP-SAKTI are grounded in primary statutory provisions from Indian laws, WIPO frameworks, and official TKDL indices.')}
          </p>
        </div>

        {/* Filter Bar (India Post-Inspired Document Listing) */}
        <div className="gov-card sources-filter-card">
          <div className="sources-search-row">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={t('sources.searchPlaceholder', 'Search statutes, rules, sections (e.g. Section 3(p), Form III, Rule 12)...')}
              className="sources-search-input"
            />
          </div>

          <div className="sources-filters-row">
            <div className="filter-group">
              <label>{t('sources.filterType', 'Document Type')}:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="gov-select-compact"
              >
                <option value="All">{t('sources.typeAll', 'All Document Types')}</option>
                <option value="Act">{t('sources.typeAct', 'Statutory Act')}</option>
                <option value="Guideline">{t('sources.typeGuideline', 'Official Guideline')}</option>
                <option value="TKDL">{t('sources.typeTkdl', 'TKDL Concordance')}</option>
                <option value="Order">{t('sources.typeOrder', 'Gazette Notification / Order')}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{t('sources.filterJurisdiction', 'Jurisdiction')}:</label>
              <select
                value={jurisdictionFilter}
                onChange={(e) => setJurisdictionFilter(e.target.value)}
                className="gov-select-compact"
              >
                <option value="All">{t('sources.jurisdictionAll', 'All Jurisdictions')}</option>
                <option value="India">India (Central & State)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Structured Document Table */}
        <div className="gov-card sources-table-card">
          <table className="gov-table sources-table" role="table">
            <thead>
              <tr>
                <th>{t('sources.title', 'Document Title & Statutory Reference')}</th>
                <th>{t('sources.filterType', 'Type')}</th>
                <th>{t('sources.filterJurisdiction', 'Jurisdiction')}</th>
                <th>{t('sources.sections', 'Sections / Rules')}</th>
                <th>{t('sources.status', 'Status')}</th>
                <th>{t('common.actions', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted">
                    {t('sources.noSources', 'No sources found matching your filter criteria.')}
                  </td>
                </tr>
              ) : (
                filteredSources.map((src) => (
                  <tr key={src.id}>
                    <td>
                      <div className="src-title-box">
                        <strong className="src-name">{src.title}</strong>
                        <p className="src-desc">{src.desc}</p>
                        <span className="src-authority">{src.authority}</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge info">{src.type}</span>
                    </td>
                    <td>{src.jurisdiction}</td>
                    <td>
                      <span className="font-mono text-sm">{src.sections}</span>
                    </td>
                    <td>
                      <span className="status-badge success">{src.status}</span>
                    </td>
                    <td>
                      <a
                        href={src.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        <span>{t('sources.viewSource', 'View')}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
