import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ExternalLink, HelpCircle, PhoneCall, Mail } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const handleLangChange = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  return (
    <footer className="gov-footer" role="contentinfo">
      {/* Top Footer Assistance Strip */}
      <div className="footer-top-strip">
        <div className="gov-container footer-strip-inner">
          <div className="strip-item">
            <ShieldCheck size={20} className="icon-gold" />
            <div>
              <strong>Trusted Source Grounding</strong>
              <p>Backed by Indian Patents Act 1970, TKDL, and Biological Diversity Act 2002.</p>
            </div>
          </div>
          <div className="strip-item">
            <PhoneCall size={20} className="text-secondary" />
            <div>
              <strong>Ayurveda Innovator Support</strong>
              <p>Guidance for Vaidyas, Startups, AYUSH Researchers & Practitioners.</p>
            </div>
          </div>
          <div className="strip-item">
            <Mail size={20} className="text-primary" />
            <div>
              <strong>Human Expert Review</strong>
              <p>Escalate complex polyherbal and ABS queries to empanelled specialists.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="gov-container footer-main">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-logo-row">
              <img src="/logo.svg" alt="IP-SAKTI Logo" width="44" height="44" />
              <div>
                <h2 className="footer-brand-title">{t('brand.nameHindi')}</h2>
                <span className="footer-brand-sub">{t('brand.nameEnglish')}</span>
              </div>
            </div>
            <p className="footer-desc">
              National Public Service Portal designed to simplify intellectual property, Traditional Knowledge
              safeguards, ABS compliance, and regulatory classification for Ayurveda.
            </p>
          </div>

          {/* Core Services */}
          <div className="footer-col">
            <h3 className="footer-heading">Services & Pathways</h3>
            <ul className="footer-links">
              <li><Link to="/ask">Ask an IP Question</Link></li>
              <li><Link to="/classifier">Guided Product Classifier</Link></li>
              <li><Link to="/patent">Patent & Section 3(p) Guidance</Link></li>
              <li><Link to="/trademark">Trademark & Brand Protection</Link></li>
              <li><Link to="/abs">ABS & Biodiversity Approvals</Link></li>
              <li><Link to="/prior-art">Prior Art & TKDL Search</Link></li>
            </ul>
          </div>

          {/* Portals & Management */}
          <div className="footer-col">
            <h3 className="footer-heading">User & Expert Portals</h3>
            <ul className="footer-links">
              <li><Link to="/dashboard">My User Dashboard</Link></li>
              <li><Link to="/dashboard">Track Case Status</Link></li>
              <li><Link to="/sources">Official Source Repository</Link></li>
              <li><Link to="/expert/dashboard">Human Expert Portal (Empanelled)</Link></li>
              <li><Link to="/help">Frequently Asked Questions</Link></li>
              <li><Link to="/contact">Contact & Grievance</Link></li>
            </ul>
          </div>

          {/* Official Resources & External */}
          <div className="footer-col">
            <h3 className="footer-heading">Authoritative Sources</h3>
            <ul className="footer-links">
              <li>
                <a href="https://ipindia.gov.in" target="_blank" rel="noopener noreferrer">
                  IP India (CGPDTM) <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://tkdl.res.in" target="_blank" rel="noopener noreferrer">
                  TKDL (CSIR - Ministry of AYUSH) <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="http://nbaindia.org" target="_blank" rel="noopener noreferrer">
                  National Biodiversity Authority (NBA) <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://ayush.gov.in" target="_blank" rel="noopener noreferrer">
                  Ministry of AYUSH <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Multilingual Switcher Footer Row */}
        <div className="footer-lang-row">
          <span className="footer-lang-label">Available in Official Indian Languages:</span>
          <div className="footer-lang-buttons">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`footer-lang-pill ${language === lang.code ? 'active' : ''}`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="footer-bottom">
          <p className="footer-disclaimer">{t('footer.disclaimer')}</p>
          <div className="footer-copy-row">
            <span>{t('footer.copyright')}</span>
            <div className="footer-policy-links">
              <Link to="/about">About IP-SAKTI</Link>
              <span>•</span>
              <Link to="/help">Accessibility Statement</Link>
              <span>•</span>
              <Link to="/contact">Privacy Policy</Link>
              <span>•</span>
              <Link to="/contact">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
