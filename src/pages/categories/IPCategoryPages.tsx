import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Award, Building, FileText, Scale, Layers, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

// 1. Patent Page
export const PatentPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="gov-category-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('services.patent.title', 'Patent Guidance'), link: '/patent' }]} />
      <div className="gov-container category-container">
        <div className="category-header">
          <span className="category-badge"><Shield size={16} /> {t('categories.patentBadge', 'Indian Patents Act, 1970')}</span>
          <h1>{t('categories.patentTitle', 'Patent Guidance for Ayurveda & Herbal Inventions')}</h1>
          <p>{t('categories.patentSubtitle', 'Learn how to navigate Section 3(p) Traditional Knowledge exclusions, establish synergistic novelty under Section 3(e), and conduct prior-art clearance.')}</p>
        </div>

        <div className="category-grid">
          <div className="gov-card">
            <h2>{t('categories.criteriaTitle', 'Patentability Criteria for Ayurveda')}</h2>
            <p>{t('categories.criteriaSubtitle', 'Under Indian patent jurisprudence, medicinal formulations based on natural herbs must satisfy three stringent tests:')}</p>
            <ul className="cat-list">
              <li>• <strong>{t('categories.noveltyTitle', 'Novelty (Section 2(1)(j))')}:</strong> {t('categories.noveltyDesc', 'The composition must not have been previously disclosed anywhere in the world.')}</li>
              <li>• <strong>{t('categories.inventiveTitle', 'Inventive Step (Non-Obviousness)')}:</strong> {t('categories.inventiveDesc', 'Must not be obvious to a person skilled in the art of Dravyaguna or pharmacognosy.')}</li>
              <li>• <strong>{t('categories.sec3pTitle', 'Section 3(p) & 3(e) Overcoming')}:</strong> {t('categories.sec3pDesc', 'Must show unexpected therapeutic synergism beyond the mere additive sum of known properties.')}</li>
            </ul>
            <div className="mt-6 flex gap-4">
              <Link to="/ask?q=Is%20my%20Ayurvedic%20herbal%20formulation%20patentable%3F" className="btn btn-primary">
                {t('categories.checkPatentability', 'Check My Formulation Patentability')}
              </Link>
              <Link to="/prior-art" className="btn btn-outline">
                {t('categories.searchPriorArt', 'Search Prior Art & TKDL')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Trademark Page
export const TrademarkPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="gov-category-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('services.trademark.title', 'Trademark Protection'), link: '/trademark' }]} />
      <div className="gov-container category-container">
        <div className="category-header">
          <span className="category-badge"><Award size={16} /> {t('categories.trademarkBadge', 'Trade Marks Act, 1999')}</span>
          <h1>{t('categories.trademarkTitle', 'Ayurveda Trademark & Brand Identity Protection')}</h1>
          <p>{t('categories.trademarkSubtitle', 'Protect your brand names, distinctive packaging, and logos in Class 5 (Medicines), Class 3 (Cosmetics), and Class 30 (Health Teas/Foods).')}</p>
        </div>

        <div className="category-grid">
          <div className="gov-card">
            <h2>{t('categories.trademarkTitle', 'Registrable vs Non-Registrable Brand Names')}</h2>
            <p>{t('categories.trademarkSubtitle', 'Choosing an Ayurveda trademark requires navigating Section 9 and Section 13 descriptive name prohibitions:')}</p>
            <ul className="cat-list">
              <li>• <strong>{t('categories.noveltyTitle', 'Prohibited Generic Names')}:</strong> {t('suggested.q3', 'What is needed to register a trademark for Ayurveda?')}</li>
              <li>• <strong>{t('services.trademark.title', 'Registrable Coined Marks')}:</strong> {t('services.trademark.desc', 'Protect brand names, logo marks and packaging distinctiveness in Ayurveda.')}</li>
            </ul>
            <div className="mt-6">
              <Link to="/ask?q=How%20to%20register%20trademark%20for%20Ayurveda%20brand%3F" className="btn btn-primary">
                {t('nav.ask', 'Ask Trademark Guidance')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Geographical Indications (GI) Page
export const GIPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="gov-category-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('services.gi.title', 'Geographical Indications'), link: '/gi' }]} />
      <div className="gov-container category-container">
        <div className="category-header">
          <span className="category-badge"><Building size={16} /> {t('categories.giBadge', 'GI of Goods Act, 1999')}</span>
          <h1>{t('categories.giTitle', 'Geographical Indications (GI) in Ayurveda')}</h1>
          <p>{t('services.gi.desc', 'Explore community intellectual property rights protecting authentic regional herbs and classical regional formulations (e.g. Navara Rice, Malabar Pepper, Kashmiri Saffron).')}</p>
        </div>

        <div className="category-grid">
          <div className="gov-card">
            <h2>{t('categories.giTitle', 'Community Rights for Indigenous Ayurveda Growers')}</h2>
            <p>{t('services.gi.desc', 'A Geographical Indication (GI) identifies goods as originating in a specific territory where a given quality, reputation or characteristic is essentially attributable to its geographic origin.')}</p>
            <div className="mt-6">
              <Link to="/ask?q=How%20to%20register%20GI%20for%20Ayurvedic%20regional%20herb%3F" className="btn btn-primary">
                {t('services.gi.title', 'Explore GI Registration')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Copyright Page
export const CopyrightPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="gov-category-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('services.copyright.title', 'Copyright'), link: '/copyright' }]} />
      <div className="gov-container category-container">
        <div className="category-header">
          <span className="category-badge"><FileText size={16} /> {t('services.copyright.title', 'Copyright Act, 1957')}</span>
          <h1>{t('categories.copyrightTitle', 'Copyright & Documentation Protection')}</h1>
          <p>{t('services.copyright.desc', 'Safeguard classical texts translations, manufacturing manuals and research.')}</p>
        </div>
        <div className="category-grid">
          <div className="gov-card">
            <h2>{t('categories.copyrightTitle', 'Scope of Copyright in Traditional Medicine')}</h2>
            <p>{t('services.copyright.desc', 'Ancient classical texts are in the public domain. However, modern original translation work, diagrams, and digital training modules qualify for copyright protection under the Copyright Act, 1957.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Design Protection Page
export const DesignPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="gov-category-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('services.design.title', 'Design Protection'), link: '/design' }]} />
      <div className="gov-container category-container">
        <div className="category-header">
          <span className="category-badge"><Layers size={16} /> {t('services.design.title', 'Designs Act, 2000')}</span>
          <h1>{t('categories.designTitle', 'Industrial Design Protection for Ayurveda Products')}</h1>
          <p>{t('services.design.desc', 'Protect unique product shapes, packaging aesthetics and dispenser designs.')}</p>
        </div>
        <div className="category-grid">
          <div className="gov-card">
            <h2>{t('categories.designTitle', 'Aesthetic & Bottle Shape Exclusivity')}</h2>
            <p>{t('services.design.desc', 'Registration under the Designs Act 2000 grants exclusive rights to visual design features applied to an article for up to 15 years.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Regulatory & AYUSH Guidance Page
export const RegulatoryPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="gov-category-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('services.regulatory.title', 'Regulatory Guidance'), link: '/regulatory' }]} />
      <div className="gov-container category-container">
        <div className="category-header">
          <span className="category-badge"><Scale size={16} /> {t('services.regulatory.title', 'Drugs & Cosmetics Act 1940 & AYUSH')}</span>
          <h1>{t('categories.regulatoryTitle', 'Regulatory Classification & AYUSH Licensing')}</h1>
          <p>{t('services.regulatory.desc', 'Classify formulations under Drugs & Cosmetics Act and Ayurveda Aahara standards.')}</p>
        </div>

        <div className="category-grid">
          <div className="gov-card">
            <h2>{t('categories.regulatoryTitle', 'Ayurveda Drug Categories & Compliance Matrix')}</h2>
            <div className="regulatory-cards-grid">
              <div className="gov-card">
                <h3>{t('caseBuilder.typeClassical', 'Classical Ayurvedic Medicine (AFI/API)')}</h3>
                <p>{t('caseBuilder.section1Desc', 'Manufactured strictly according to texts listed in the First Schedule of the Drugs & Cosmetics Act. Requires State AYUSH License.')}</p>
              </div>
              <div className="gov-card">
                <h3>{t('caseBuilder.typeAahara', 'Ayurveda Aahara (FSSAI Regulations 2022)')}</h3>
                <p>{t('caseBuilder.typeAahara', 'Food supplements prepared in accordance with classical recipes. No therapeutic cure claims permitted on packaging.')}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Link to="/classifier" className="btn btn-primary">
                {t('classifier.cta', 'Start Product Classification Wizard')}
              </Link>
              <Link to="/ask" className="btn btn-outline">
                {t('nav.ask', 'Ask Regulatory Question')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
