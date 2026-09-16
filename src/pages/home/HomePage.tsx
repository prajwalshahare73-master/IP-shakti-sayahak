import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Shield,
  FileText,
  BookOpen,
  Award,
  Layers,
  Scale,
  FileSearch,
  CheckCircle2,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building,
  AlertCircle
} from 'lucide-react';
import { VoiceInputField } from '../../components/shared/VoiceInputField';
import { useAppStore } from '../../store/appStore';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setQuery } = useAppStore();

  const [inputQuery, setInputQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'patent' | 'regulatory' | 'ayush' | 'abs' | 'tk'>('all');

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setQuery(inputQuery.trim());
      navigate('/ask');
    }
  };

  const handleSuggestionClick = (qText: string) => {
    setInputQuery(qText);
    setQuery(qText);
    navigate('/ask');
  };

  const updatesData = [
    {
      id: 'up-1',
      date: '04 Sep 2026',
      category: 'patent',
      categoryLabel: 'Patent & Section 3(p)',
      title: 'CGPDTM Updates TKDL Cross-Verification Protocol for Polyherbal Formulations',
      desc: 'Patent examiners mandated to apply unified non-patentability search for classical polyherbal kadhas and tailas.'
    },
    {
      id: 'up-2',
      date: '28 Aug 2026',
      category: 'abs',
      categoryLabel: 'Biodiversity / ABS',
      title: 'NBA Issues Revised Standard Operating Procedure for Form III Prior Approvals',
      desc: 'Digital portal integration expedites Intellectual Property right applications based on Indian biological resources.'
    },
    {
      id: 'up-3',
      date: '15 Aug 2026',
      category: 'ayush',
      categoryLabel: 'AYUSH / Regulatory',
      title: 'Ministry of AYUSH Notifies Standardized Quality Norms for Ayurveda Aahara',
      desc: 'Clear distinction between proprietary wellness food supplements and therapeutic classical medicines.'
    },
    {
      id: 'up-4',
      date: '02 Aug 2026',
      category: 'tk',
      categoryLabel: 'Traditional Knowledge',
      title: 'TKDL Expands Digitized Sanskrit Manuscript Corpus with 25,000 New Formulations',
      desc: 'International patent offices equipped with defensive prior art repository preventing biopiracy.'
    }
  ];

  const filteredUpdates =
    activeTab === 'all' ? updatesData : updatesData.filter((u) => u.category === activeTab);

  return (
    <div className="gov-home-page" id="main-content">
      {/* 1. Hero Section */}
      <section className="gov-hero-section">
        <div className="gov-container hero-container text-center">
          {/* Big Iconic Symbol (PRD Section 7) */}
          <div className="hero-iconic-symbol-wrapper">
            <img
              src="/logo-symbol.png"
              onError={(e) => { (e.target as HTMLImageElement).src = '/logo-brand.png'; }}
              alt="IP-SAKTI Sahayak Iconic Emblem"
              className="hero-iconic-symbol"
              width="120"
              height="120"
            />
          </div>

          <h1 className="hero-title">{t('hero.title', 'IP & Ayurveda Guidance Made Simple')}</h1>
          <p className="hero-subtitle">
            {t('hero.subtitle', 'Ask a question or build a detailed case report.')}
          </p>

          {/* Main Natural Language Search / Query Box */}
          <div className="hero-ask-card text-left">
            <form onSubmit={handleAskSubmit} className="hero-ask-form">
              <div className="hero-input-area">
                <VoiceInputField
                  value={inputQuery}
                  onChange={setInputQuery}
                  placeholder={t('hero.inputPlaceholder', 'Ask your IP question (e.g. Can I patent a polyherbal kadha, or do I need ABS clearance?)...')}
                  multiline={true}
                  rows={2}
                  id="hero-main-query"
                />
              </div>

              <div className="hero-form-actions">
                <button type="submit" className="btn btn-primary btn-lg hero-submit-btn">
                  <span>{t('hero.askButton', 'Ask IP-SAKTI')}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>

            {/* Popular Questions */}
            <div className="suggested-queries-block">
              <div className="flex justify-between items-center mb-2">
                <span className="suggested-label">{t('hero.popularQuestions', 'Popular Questions:')}</span>
                <Link to="/case-builder" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  <FileText size={13} />
                  <span>{t('hero.buildCaseReport', 'Build Case Report')} →</span>
                </Link>
              </div>
              <div className="suggested-chips">
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('What is a Patent for Ayurvedic medicine?')}
                  className="suggested-chip"
                >
                  {t('hero.qPatent', 'What is a Patent?')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('What is a Trademark for an Ayurveda brand?')}
                  className="suggested-chip"
                >
                  {t('hero.qTrademark', 'What is a Trademark?')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('What is Geographical Indication (GI) in Ayurveda?')}
                  className="suggested-chip"
                >
                  {t('hero.qGi', 'What is GI?')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('What is TKDL and Section 3(p) protection?')}
                  className="suggested-chip"
                >
                  {t('hero.qTkdl', 'What is TKDL?')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick('What are NBA Access and Benefit Sharing (ABS) rules?')}
                  className="suggested-chip"
                >
                  {t('hero.qAbs', 'What is ABS?')}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions (PRD Section 7) */}
          <div className="hero-quick-actions-row">
            <Link to="/ask" className="hero-quick-action-btn primary">
              <Scale size={16} />
              <span>{t('hero.askIpQuestion', 'Ask an IP Question')}</span>
            </Link>
            <Link to="/case-builder" className="hero-quick-action-btn">
              <FileText size={16} className="text-secondary" />
              <span>{t('hero.buildCaseReport', 'Build Case Report')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. "Not Sure Where to Start?" Classification Highlight */}
      <section className="gov-section section-classifier-cta">
        <div className="gov-container">
          <div className="classifier-banner-card">
            <div className="classifier-banner-content">
              <div className="classifier-badge">
                <FileSearch size={16} className="text-secondary" />
                <span>{t('classifier.badge')}</span>
              </div>
              <h2 className="classifier-banner-title">{t('classifier.title')}</h2>
              <p className="classifier-banner-desc">{t('classifier.desc')}</p>
            </div>
            <div className="classifier-banner-action">
              <Link to="/classifier" className="btn btn-secondary btn-lg">
                <span>{t('classifier.cta')}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Explore IP & Regulatory Services (8-Card Grid) */}
      <section className="gov-section section-services">
        <div className="gov-container">
          <div className="section-header-center">
            <h2 className="section-title">{t('services.title')}</h2>
            <p className="section-subtitle">{t('services.subtitle')}</p>
          </div>

          <div className="services-grid">
            {/* Case Builder Dossier */}
            <div className="gov-card service-card highlight-card">
              <div className="service-icon-box bg-green-tint">
                <FileText size={24} className="text-secondary" />
              </div>
              <h3 className="service-card-title">Interactive Case Builder</h3>
              <p className="service-card-desc">
                Assemble a structured legal factsheet for your formulation, composition matrix, bioassay data, and Section 3(p) clearance.
              </p>
              <Link to="/case-builder" className="service-card-link">
                <span>Launch Case Builder</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Patent */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-blue-tint">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="service-card-title">{t('services.patent.title')}</h3>
              <p className="service-card-desc">{t('services.patent.desc')}</p>
              <Link to="/patent" className="service-card-link">
                <span>Explore Patentability</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Trademark */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-green-tint">
                <Award size={24} className="text-secondary" />
              </div>
              <h3 className="service-card-title">{t('services.trademark.title')}</h3>
              <p className="service-card-desc">{t('services.trademark.desc')}</p>
              <Link to="/trademark" className="service-card-link">
                <span>Protect Brand & Name</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Traditional Knowledge */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-amber-tint">
                <BookOpen size={24} className="text-accent" />
              </div>
              <h3 className="service-card-title">{t('services.tk.title')}</h3>
              <p className="service-card-desc">{t('services.tk.desc')}</p>
              <Link to="/tk" className="service-card-link">
                <span>TK & Defensive Rights</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* ABS / Biodiversity */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-green-tint">
                <Layers size={24} className="text-secondary" />
              </div>
              <h3 className="service-card-title">{t('services.abs.title')}</h3>
              <p className="service-card-desc">{t('services.abs.desc')}</p>
              <Link to="/abs" className="service-card-link">
                <span>Check ABS Approval</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Geographical Indications */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-blue-tint">
                <Building size={24} className="text-primary" />
              </div>
              <h3 className="service-card-title">{t('services.gi.title')}</h3>
              <p className="service-card-desc">{t('services.gi.desc')}</p>
              <Link to="/gi" className="service-card-link">
                <span>Explore GI Protection</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Regulatory & AYUSH */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-blue-tint">
                <Scale size={24} className="text-primary" />
              </div>
              <h3 className="service-card-title">{t('services.regulatory.title')}</h3>
              <p className="service-card-desc">{t('services.regulatory.desc')}</p>
              <Link to="/regulatory" className="service-card-link">
                <span>Classify & Comply</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Copyright */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-amber-tint">
                <FileText size={24} className="text-accent" />
              </div>
              <h3 className="service-card-title">{t('services.copyright.title')}</h3>
              <p className="service-card-desc">{t('services.copyright.desc')}</p>
              <Link to="/copyright" className="service-card-link">
                <span>Copyright Guidelines</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Prior Art Search */}
            <div className="gov-card service-card">
              <div className="service-icon-box bg-blue-tint">
                <FileSearch size={24} className="text-primary" />
              </div>
              <h3 className="service-card-title">Prior Art & TKDL Search</h3>
              <p className="service-card-desc">
                Search verified Indian patent registries, classical text references and prior disclosures.
              </p>
              <Link to="/prior-art" className="service-card-link">
                <span>Search Prior Art</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Important Updates Section (India Post-Inspired) */}
      <section className="gov-section section-updates">
        <div className="gov-container">
          <div className="updates-header-row">
            <div>
              <h2 className="section-title">Important IP & Regulatory Updates</h2>
              <p className="section-subtitle">Official notifications, guidelines, and statutory circulars</p>
            </div>
            <div className="updates-tab-row">
              <button
                onClick={() => setActiveTab('all')}
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('patent')}
                className={`tab-btn ${activeTab === 'patent' ? 'active' : ''}`}
              >
                Patent
              </button>
              <button
                onClick={() => setActiveTab('abs')}
                className={`tab-btn ${activeTab === 'abs' ? 'active' : ''}`}
              >
                Biodiversity
              </button>
              <button
                onClick={() => setActiveTab('ayush')}
                className={`tab-btn ${activeTab === 'ayush' ? 'active' : ''}`}
              >
                AYUSH
              </button>
              <button
                onClick={() => setActiveTab('tk')}
                className={`tab-btn ${activeTab === 'tk' ? 'active' : ''}`}
              >
                TKDL
              </button>
            </div>
          </div>

          <div className="updates-list">
            {filteredUpdates.map((item) => (
              <div key={item.id} className="gov-card update-item-card">
                <div className="update-date-col">
                  <Clock size={16} className="text-secondary" />
                  <span className="update-date">{item.date}</span>
                </div>
                <div className="update-content-col">
                  <span className="status-badge info">{item.categoryLabel}</span>
                  <h3 className="update-title">{item.title}</h3>
                  <p className="update-desc">{item.desc}</p>
                </div>
                <div className="update-action-col">
                  <Link to="/sources" className="btn btn-outline btn-sm">
                    <span>Read Circular</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How IP-SAKTI Works (6-Step Evidence Workflow) */}
      <section className="gov-section section-how-it-works">
        <div className="gov-container">
          <div className="section-header-center">
            <h2 className="section-title">How IP-SAKTI Sahayak Works</h2>
            <p className="section-subtitle">A transparent, source-grounded journey from query to legal action</p>
          </div>

          <div className="how-steps-grid">
            <div className="how-step-card">
              <div className="step-num">1</div>
              <h3 className="step-title">Ask in Plain Language</h3>
              <p className="step-desc">Type or speak your formulation query in Hindi, English, or 6 Indian languages.</p>
            </div>

            <div className="how-step-card">
              <div className="step-num">2</div>
              <h3 className="step-title">Smart Route Identification</h3>
              <p className="step-desc">System maps your product to Patent, Trademark, TK, ABS, or AYUSH regulations.</p>
            </div>

            <div className="how-step-card">
              <div className="step-num">3</div>
              <h3 className="step-title">Statute & TKDL Grounding</h3>
              <p className="step-desc">Retrieves verifiable provisions from the Patents Act 1970, NBA, and classical literature.</p>
            </div>

            <div className="how-step-card">
              <div className="step-num">4</div>
              <h3 className="step-title">Simple Clear Explanation</h3>
              <p className="step-desc">Translates legal clauses into actionable "What this means for you" points.</p>
            </div>

            <div className="how-step-card">
              <div className="step-num">5</div>
              <h3 className="step-title">Verified Citations</h3>
              <p className="step-desc">Every material claim shows exact section numbers, pages, and official sources.</p>
            </div>

            <div className="how-step-card">
              <div className="step-num">6</div>
              <h3 className="step-title">Clear Next Action</h3>
              <p className="step-desc">Receive step-by-step instructions or request human expert review for complex cases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Human Review / Escalation Notice */}
      <section className="gov-section section-human-escalation">
        <div className="gov-container">
          <div className="escalation-callout-card">
            <div className="escalation-icon-col">
              <UserCheck size={36} className="text-primary" />
            </div>
            <div className="escalation-text-col">
              <h3 className="escalation-title">Need Empanelled Human Expert Guidance?</h3>
              <p className="escalation-desc">
                When formulations involve multi-herb synergistic novelty, Section 3(p) challenges, or cross-border ABS compliance,
                IP-SAKTI connects you to authorized Patent Facilitators and Traditional Knowledge experts.
              </p>
            </div>
            <div className="escalation-action-col">
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <span>View My Cases</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
