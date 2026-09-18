import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Search,
  Download,
  Filter,
  ExternalLink,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Scale,
  Layers,
  X,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

interface StatutorySource {
  id: string;
  title: string;
  type: 'Act' | 'Guideline' | 'TKDL' | 'Order';
  category: 'Patent' | 'Biodiversity' | 'TK' | 'Trademark' | 'Regulatory';
  jurisdiction: string;
  status: string;
  version: string;
  sections: string;
  authority: string;
  link: string;
  desc: string;
  keyClauses: {
    sectionNum: string;
    heading: string;
    verbatimText: string;
    practicalMeaning: string;
  }[];
}

export const SourcesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const highlightParam = searchParams.get('highlight') || '';

  const [searchFilter, setSearchFilter] = useState(highlightParam);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Patent' | 'Biodiversity' | 'TK' | 'Trademark' | 'Regulatory'>('All');
  const [selectedSourceModal, setSelectedSourceModal] = useState<StatutorySource | null>(null);

  const sourcesList: StatutorySource[] = [
    {
      id: 'src-1',
      title: 'The Patents Act, 1970 (as amended up to 2024)',
      type: 'Act',
      category: 'Patent',
      jurisdiction: 'India',
      status: 'Current',
      version: '2024.1 Statutory Edition',
      sections: 'Section 3(p), Section 3(e), Section 3(d), Section 10',
      authority: 'Ministry of Commerce & Industry / Office of CGPDTM',
      link: 'https://ipindia.gov.in/patents.htm',
      desc: 'Principal national statute governing patentability, inventive step, non-obviousness, and statutory exclusions for traditional knowledge and mere admixtures.',
      keyClauses: [
        {
          sectionNum: 'Section 3(p)',
          heading: 'Exclusion of Traditional Knowledge',
          verbatimText: 'An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention within the meaning of this Act.',
          practicalMeaning: 'Classical Ayurvedic combinations documented in AFI/API/Charaka Samhita cannot be patented directly. Must demonstrate novel isolation, structural modification, or unexpected synergistic biological effect.'
        },
        {
          sectionNum: 'Section 3(e)',
          heading: 'Mere Admixtures & Synergistic Bio-Assay Mandate',
          verbatimText: 'A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable.',
          practicalMeaning: 'Polyherbal formulations must submit comparative bio-assay data proving the combined combination index (CI < 1.0) achieves non-additive, enhanced therapeutic efficacy compared to individual single herbs.'
        },
        {
          sectionNum: 'Section 3(d)',
          heading: 'Enhancement of Known Efficacy',
          verbatimText: 'The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance is not patentable.',
          practicalMeaning: 'Formulation extracts or novel delivery systems (nano-phytosomes, liposomal emulsions) must demonstrate statistically significant increased bioavailability or therapeutic potency.'
        }
      ]
    },
    {
      id: 'src-2',
      title: 'Guidelines for Examination of Patent Applications relating to Traditional Knowledge & Biological Material',
      type: 'Guideline',
      category: 'Patent',
      jurisdiction: 'India',
      status: 'Current',
      version: 'Office Guideline 2012 / 2023 Revision',
      sections: 'Part B: Screening against TKDL & Synergistic Bio-Assays',
      authority: 'Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM)',
      link: 'https://ipindia.gov.in',
      desc: 'Official Patent Office examination manual outlining criteria for examiners assessing Section 3(p) objections and TKDL concordance.',
      keyClauses: [
        {
          sectionNum: 'Rule 3.4',
          heading: 'Mandatory TKDL Screening Requirement',
          verbatimText: 'Every patent specification referencing plant extracts or botanical nomenclature must be searched against the TKDL database across Sanskrit, Persian, Arabic, and Siddha canonical references.',
          practicalMeaning: 'Patent claims will receive early First Examination Report (FER) objections if the formulation ingredients match any classical therapeutic compound indexed in the TKDL.'
        },
        {
          sectionNum: 'Rule 4.1',
          heading: 'Proof of Non-Obvious Synergy (Combination Index)',
          verbatimText: 'Where synergistic effect is claimed for a herbal combination, experimental comparative data against individual constituents must be provided in the complete specification as originally filed.',
          practicalMeaning: 'Post-filing generation of synergy data is strictly scrutinized. In-vitro/in-vivo assays must be incorporated before complete specification filing.'
        }
      ]
    },
    {
      id: 'src-3',
      title: 'The Biological Diversity Act, 2002 (with 2023 Amendments)',
      type: 'Act',
      category: 'Biodiversity',
      jurisdiction: 'India',
      status: 'Current',
      version: '2023 Gazette Notification',
      sections: 'Sections 3, 4, 6, 7, 19, 24, 55',
      authority: 'National Biodiversity Authority (NBA) & State Biodiversity Boards (SBB)',
      link: 'http://nbaindia.org',
      desc: 'Mandatory legislation governing conservation, commercial utilization, and access & benefit sharing (ABS) for Indian biological resources.',
      keyClauses: [
        {
          sectionNum: 'Section 6(1)',
          heading: 'Mandatory Prior NBA Approval for IPR (Form III)',
          verbatimText: 'No person shall apply for any intellectual property right, by whatever name called, in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining the previous approval of the National Biodiversity Authority.',
          practicalMeaning: 'Before filing international PCT applications or commercializing patents based on Indian herbs, Form III approval from the National Biodiversity Authority (NBA) is mandatory.'
        },
        {
          sectionNum: 'Section 7',
          heading: 'Prior Intimation to State Biodiversity Boards (SBB)',
          verbatimText: 'Indian entities utilizing biological resources for commercial utilization must give prior intimation to the concerned State Biodiversity Board under Form I.',
          practicalMeaning: 'Manufacturers extracting wild-harvested herbs (e.g. from Uttarakhand, Kerala, Himachal Pradesh) must pay ABS fees (0.1% - 0.5% ex-factory price) to local SBBs.'
        }
      ]
    },
    {
      id: 'src-4',
      title: 'Guidelines on Access to Biological Resources and Benefits Sharing (ABS) Regulations, 2014',
      type: 'Order',
      category: 'Biodiversity',
      jurisdiction: 'India',
      status: 'Current',
      version: '2014 Gazette Regulations',
      sections: 'Regulations 1-14: Benefit Sharing Matrix & Fee Schedules',
      authority: 'National Biodiversity Authority (NBA)',
      link: 'http://nbaindia.org',
      desc: 'Formulas and percentage schedules for revenue sharing between commercial herbal manufacturers and local tribal/farming cultivators.',
      keyClauses: [
        {
          sectionNum: 'Regulation 2',
          heading: 'Benefit Sharing Percentage on Ex-Factory Sale Price',
          verbatimText: 'Manufacturers with annual turnover up to ₹1 Crore pay 0.1%; ₹1 Crore to ₹3 Crores pay 0.2%; above ₹3 Crores pay 0.5% of annual gross ex-factory sale price.',
          practicalMeaning: 'Startup and MSME innovators can structure ABS agreements with minimal upfront burden under tiered statutory thresholds.'
        }
      ]
    },
    {
      id: 'src-5',
      title: 'Traditional Knowledge Digital Library (TKDL) Reference Standard & Concordance',
      type: 'TKDL',
      category: 'TK',
      jurisdiction: 'India',
      status: 'Current',
      version: 'v5.4 Global Concordance',
      sections: 'Ayurveda, Unani, Siddha, Sowa-Rigpa Classics Concordance Matrix',
      authority: 'Council of Scientific & Industrial Research (CSIR) & Ministry of AYUSH',
      link: 'https://tkdl.res.in',
      desc: 'Digital knowledge repository of 400,000+ classical formulations translated and mapped into International Patent Classification (IPC) to prevent bio-piracy.',
      keyClauses: [
        {
          sectionNum: 'TKDL Index',
          heading: 'Prior Art Bar Against Generic Herbal Formulations',
          verbatimText: 'Concordance establishes public domain prior art status for all classical decoctions (Kwatha, Vati, Asava-Arishta, Taila) listed in the Ayurvedic Pharmacopoeia of India (API).',
          practicalMeaning: 'Guarantees that generic traditional formulations remain open to all practitioners while providing clear boundary benchmarks for genuinely patentable innovations.'
        }
      ]
    },
    {
      id: 'src-6',
      title: 'The Trade Marks Act, 1999',
      type: 'Act',
      category: 'Trademark',
      jurisdiction: 'India',
      status: 'Current',
      version: '1999 Statute',
      sections: 'Section 9(1)(b), Section 11, Section 13 (Class 5 / Class 3)',
      authority: 'Trade Marks Registry, Office of the CGPDTM',
      link: 'https://ipindia.gov.in/trade-marks.htm',
      desc: 'Statute for securing proprietary brand names, distinctive coined Ayurvedic marks, and preventing generic description rejections in Nice Class 5 (Medicinal) and Class 3 (Cosmetics).',
      keyClauses: [
        {
          sectionNum: 'Section 9(1)(b)',
          heading: 'Absolute Ground for Refusal: Descriptive & Generic Names',
          verbatimText: 'Trade marks which consist exclusively of marks or indications which may serve in trade to designate the kind, quality, intended purpose, values or geographical origin shall not be registered.',
          practicalMeaning: 'Coined distinctive names (e.g. "Swastha-Respiro Kadha") are easily registered, while purely descriptive terms (e.g. "Herbal Cough Syrup") face statutory refusal.'
        }
      ]
    },
    {
      id: 'src-7',
      title: 'Drugs and Cosmetics Act, 1940 & Rules 1945 (Chapter IVA: ASU Drugs)',
      type: 'Act',
      category: 'Regulatory',
      jurisdiction: 'India',
      status: 'Current',
      version: '2024 Compilation',
      sections: 'Sections 33A to 33N, Schedule T (Good Manufacturing Practice - GMP)',
      authority: 'Ministry of Ayush & Central Drugs Standard Control Organization (CDSCO)',
      link: 'https://ayush.gov.in',
      desc: 'Governs manufacturing licenses (Form 25D), Schedule T GMP quality compliance, labeling rules, and heavy metal limit clearances for Ayurvedic drugs.',
      keyClauses: [
        {
          sectionNum: 'Schedule T',
          heading: 'Good Manufacturing Practices for ASU Drugs',
          verbatimText: 'Mandates raw material authentication, microbial limits, absence of pesticide residues, and heavy metal testing (Lead, Cadmium, Mercury, Arsenic).',
          practicalMeaning: 'Proof of Schedule T compliance provides critical supportive evidence for regulatory clearance and international export dossiers.'
        }
      ]
    },
    {
      id: 'src-8',
      title: 'Food Safety and Standards (Ayurveda Aahara) Regulations, 2022',
      type: 'Order',
      category: 'Regulatory',
      jurisdiction: 'India',
      status: 'Current',
      version: '2022 Gazette Notification',
      sections: 'Regulations 1-8: Permitted Classical Preparations & Labeling Standards',
      authority: 'Food Safety and Standards Authority of India (FSSAI) & Ministry of AYUSH',
      link: 'https://fssai.gov.in',
      desc: 'Defines regulatory pathway for dietary supplements, nutritional foods, and herbal wellness drinks without requiring pharmaceutical drug licensing.',
      keyClauses: [
        {
          sectionNum: 'Regulation 3',
          heading: 'Permitted Ayurveda Aahara Formulations & Labeling',
          verbatimText: 'Food products prepared in accordance with classical Ayurvedic texts specified in Schedule A are permitted with distinctive Ayurveda Aahara logo.',
          practicalMeaning: 'Enables quick commercialization for herbal wellness foods and beverages with statutory FSSAI compliance.'
        }
      ]
    }
  ];

  // Smart keyword tokenizer for flawless filtering
  const filterTokens = searchFilter
    .toLowerCase()
    .replace(/[—\-_()\[\],.]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'act', 'and', 'for', 'with', 'from'].includes(w));

  const filteredSources = sourcesList.filter((src) => {
    const matchesCategory = categoryFilter === 'All' || src.category === categoryFilter;
    if (filterTokens.length === 0) return matchesCategory;

    const combinedText = `${src.title} ${src.sections} ${src.desc} ${src.authority} ${src.type} ${src.keyClauses.map(k => k.heading + ' ' + k.sectionNum).join(' ')}`.toLowerCase();
    const matchesKeyword = filterTokens.some((token) => combinedText.includes(token));

    return matchesCategory && matchesKeyword;
  });

  const displayList = filteredSources.length > 0 ? filteredSources : sourcesList;

  return (
    <div className="gov-sources-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('nav.sources', 'Sources & Statutory Library'), link: '/sources' }]} />

      <div className="gov-container sources-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header Block */}
        <div className="sources-header-banner" style={{ background: 'linear-gradient(135deg, #0f3d5c 0%, #1e293b 100%)', color: '#ffffff', padding: '32px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(15, 61, 92, 0.3)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,255,255,0.12)', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#93c5fd', marginBottom: '12px' }}>
            <BookOpen size={16} />
            <span>National Statutory Legal Corpus & Gazette Library</span>
          </div>
          <h1 className="sources-main-title" style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Primary Legal Statutes, Gazette Acts & TKDL Concordances
          </h1>
          <p className="sources-main-subtitle" style={{ fontSize: '14.5px', color: '#cbd5e1', margin: 0, maxWidth: '850px', lineHeight: 1.6 }}>
            Every legal assessment, Patent Readiness calculation, and statutory citation on IP-SAKTI Sahayak is grounded in primary provisions from Indian Acts, official patent manuals, and the Traditional Knowledge Digital Library (TKDL).
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="gov-card sources-filter-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by statute or section (e.g. Section 3(p), Section 3(e), Form III, TKDL, Schedule T)..."
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', marginRight: '4px' }}>Filter by Domain:</span>
            {[
              { key: 'All', label: 'All Sources (8)' },
              { key: 'Patent', label: 'Patents & Sec 3(e)/3(p)' },
              { key: 'Biodiversity', label: 'Biodiversity & NBA' },
              { key: 'TK', label: 'TKDL & Classical Classics' },
              { key: 'Trademark', label: 'Trade Marks (Class 5)' },
              { key: 'Regulatory', label: 'AYUSH & FSSAI' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategoryFilter(tab.key as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: categoryFilter === tab.key ? '#0f3d5c' : '#f8fafc',
                  color: categoryFilter === tab.key ? '#ffffff' : '#334155',
                  borderColor: categoryFilter === tab.key ? '#0f3d5c' : '#cbd5e1'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Statutory Sources */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {displayList.map((src) => (
            <div
              key={src.id}
              className="gov-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                    {src.type} • {src.category}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' }}>
                    ✓ {src.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f3d5c', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                  {src.title}
                </h3>

                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  {src.desc}
                </p>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong style={{ color: '#0f3d5c' }}>Key Sections: </strong>
                    <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{src.sections}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#0f3d5c' }}>Authority: </strong>
                    <span style={{ color: '#64748b' }}>{src.authority}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSourceModal(src)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, gap: '6px', justifyContent: 'center' }}
                >
                  <BookOpen size={14} />
                  <span>Read Key Clauses ({src.keyClauses.length})</span>
                </button>
                <a
                  href={src.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ gap: '4px', padding: '6px 12px' }}
                  title="Open Official Website"
                >
                  <span>Official Portal</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Full Statutory Text & Clauses Viewer */}
        {selectedSourceModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '850px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div style={{ background: '#0f3d5c', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {selectedSourceModal.type} • {selectedSourceModal.authority}
                  </div>
                  <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>
                    {selectedSourceModal.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSourceModal(null)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#0f3d5c' }}>Legislative Intent & Scope:</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                    {selectedSourceModal.desc}
                  </p>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f3d5c', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={18} className="text-secondary" />
                  <span>Important Legal Clauses & Practitioner Implications</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedSourceModal.keyClauses.map((clause, idx) => (
                    <div key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ background: '#0f3d5c', color: '#fff', fontWeight: 800, fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}>
                          {clause.sectionNum}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f3d5c' }}>
                          {clause.heading}
                        </h4>
                      </div>

                      {/* Verbatim Statute Quote */}
                      <div style={{ background: '#f1f5f9', borderLeft: '3px solid #0284c7', padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: '10px', fontStyle: 'italic', fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                        "{clause.verbatimText}"
                      </div>

                      {/* Practical Meaning for Innovators */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px', color: '#047857', background: '#ecfdf5', padding: '10px 14px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Practical Rule for Innovators: </strong>
                          <span>{clause.practicalMeaning}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href={selectedSourceModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ gap: '6px' }}
                >
                  <span>Open Official {selectedSourceModal.authority}</span>
                  <ExternalLink size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedSourceModal(null)}
                  className="btn btn-primary btn-sm"
                >
                  Close Document Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
