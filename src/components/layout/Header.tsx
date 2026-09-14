import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Globe,
  Menu,
  X,
  ChevronDown,
  Shield,
  HelpCircle,
  LayoutDashboard,
  UserCheck,
  FileText,
  Sparkles,
  BookOpen,
  LogOut
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';
import { NotificationCenter } from '../shared/NotificationCenter';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, user, setUser, setSession, notifications } = useAppStore();

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    setUser(null);
    setSession(null);
    navigate('/login');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLanguageSwitch = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ask?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="gov-header" role="banner">
      {/* Main Branding Bar */}
      <div className="gov-brand-bar">
        <div className="gov-container gov-brand-inner">
          <Link to="/" className="gov-logo-block" aria-label="IP-SAKTI Sahayak — Your Ayurveda IPR Assistant">
            <img
              src="/logo-symbol.png"
              onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; }}
              alt="IP-SAKTI Sahayak Official Logo"
              className="gov-brand-logo-img"
            />
            <div className="gov-brand-titles">
              <span className="gov-brand-name-hi">{t('brand.nameHindi', 'IP शक्ति सहायक')}</span>
              <span className="gov-brand-name-en">{t('brand.nameEnglish', 'IP-SAKTI Sahayak')}</span>
              <span className="gov-brand-tagline">{t('brand.tagline', 'Your Ayurveda IPR Assistant')}</span>
            </div>
          </Link>

          {/* Right utility links & quick CTA */}
          <div className="gov-header-actions">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn-icon"
              aria-label="Search IP guidance and sources"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Language Selector Dropdown */}
            <div className="gov-dropdown-wrapper header-lang-dropdown">
              <button
                className="btn btn-outline btn-sm gov-lang-btn"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <Globe size={16} />
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}</span>
                <ChevronDown size={14} />
              </button>
              <div className="gov-dropdown-menu lang-menu">
                <div className="lang-menu-header">Select Interface Language</div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSwitch(lang.code)}
                    className={`lang-option ${language === lang.code ? 'selected' : ''}`}
                  >
                    <span className="lang-native font-devanagari">{lang.nativeName}</span>
                    <span className="lang-sub">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth / Dashboard CTA */}
            {user ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Link to="/dashboard" className="btn btn-outline btn-sm dashboard-btn">
                  <LayoutDashboard size={16} />
                  <span className="hide-sm">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm logout-header-btn"
                  title={t('auth.signOut', 'Sign Out')}
                  aria-label="Sign Out"
                  style={{ padding: '0 8px', borderColor: '#cbd5e1', color: '#64748b' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                <span>{t('nav.signIn', 'Sign In')}</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-icon mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="gov-nav-bar" role="navigation" aria-label="Main Navigation">
        <div className="gov-container gov-nav-inner">
          <ul className="gov-nav-list">
            <li className="gov-nav-item">
              <Link to="/" className={`gov-nav-link ${isActive('/') ? 'active' : ''}`}>
                {t('nav.home')}
              </Link>
            </li>

            <li className="gov-nav-item">
              <Link
                to="/ask"
                className={`gov-nav-link highlight-link ${isActive('/ask') ? 'active' : ''}`}
              >
                <Sparkles size={16} className="icon-gold" />
                <span>{t('nav.ask', 'Ask IP-SAKTI')}</span>
              </Link>
            </li>

            <li className="gov-nav-item">
              <Link
                to="/case-builder"
                className={`gov-nav-link ${isActive('/case-builder') ? 'active' : ''}`}
              >
                <FileText size={16} className="text-secondary" />
                <span>{t('nav.caseBuilder', 'Case Builder')}</span>
              </Link>
            </li>

            <li className="gov-nav-item">
              <Link
                to="/dashboard"
                className={`gov-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>{t('nav.myCases', 'My Cases')}</span>
              </Link>
            </li>

            <li className="gov-nav-item">
              <Link
                to="/help"
                className={`gov-nav-link ${isActive('/help') ? 'active' : ''}`}
              >
                <HelpCircle size={16} />
                <span>{t('nav.help', 'Help & FAQ')}</span>
              </Link>
            </li>

            {/* Categories Dropdown */}
            <li
              className="gov-nav-item has-dropdown"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className={`gov-nav-link dropdown-toggle ${
                  location.pathname.startsWith('/patent') ||
                  location.pathname.startsWith('/trademark') ||
                  location.pathname.startsWith('/gi') ||
                  location.pathname.startsWith('/copyright') ||
                  location.pathname.startsWith('/design')
                    ? 'active'
                    : ''
                }`}
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                <span>{t('nav.categories')}</span>
                <ChevronDown size={14} />
              </button>

              {categoriesOpen && (
                <div className="gov-mega-menu" role="menu">
                  <div className="mega-menu-grid">
                    <Link to="/patent" className="mega-item" role="menuitem">
                      <Shield size={18} className="text-primary" />
                      <div>
                        <strong>{t('services.patent.title')}</strong>
                        <p>{t('services.patent.desc')}</p>
                      </div>
                    </Link>

                    <Link to="/trademark" className="mega-item" role="menuitem">
                      <FileText size={18} className="text-secondary" />
                      <div>
                        <strong>{t('services.trademark.title')}</strong>
                        <p>{t('services.trademark.desc')}</p>
                      </div>
                    </Link>

                    <Link to="/tk" className="mega-item" role="menuitem">
                      <BookOpen size={18} className="text-accent" />
                      <div>
                        <strong>{t('services.tk.title')}</strong>
                        <p>{t('services.tk.desc')}</p>
                      </div>
                    </Link>

                    <Link to="/abs" className="mega-item" role="menuitem">
                      <Shield size={18} className="text-secondary" />
                      <div>
                        <strong>{t('services.abs.title')}</strong>
                        <p>{t('services.abs.desc')}</p>
                      </div>
                    </Link>

                    <Link to="/gi" className="mega-item" role="menuitem">
                      <FileText size={18} className="text-primary" />
                      <div>
                        <strong>{t('services.gi.title')}</strong>
                        <p>{t('services.gi.desc')}</p>
                      </div>
                    </Link>

                    <Link to="/classifier" className="mega-item highlight-card" role="menuitem">
                      <Sparkles size={18} className="text-primary" />
                      <div>
                        <strong>{t('classifier.badge', 'Guided Product Classifier')}</strong>
                        <p>{t('classifier.title', 'Not sure? Find your exact legal route in 4 steps.')}</p>
                      </div>
                    </Link>
                    <Link to="/regulatory" className="mega-item" role="menuitem">
                      <Shield size={18} className="text-secondary" />
                      <div>
                        <strong>{t('services.regulatory.title', 'Regulatory & AYUSH')}</strong>
                        <p>{t('services.regulatory.desc', 'Licensing, standards, and safety norms')}</p>
                      </div>
                    </Link>

                    <Link to="/prior-art" className="mega-item" role="menuitem">
                      <BookOpen size={18} className="text-primary" />
                      <div>
                        <strong>{t('nav.priorArt', 'Prior Art Search')}</strong>
                        <p>{t('categories.searchPriorArt', 'Search patents & traditional formulations')}</p>
                      </div>
                    </Link>

                    <Link to="/sources" className="mega-item" role="menuitem">
                      <FileText size={18} className="text-secondary" />
                      <div>
                        <strong>{t('sources.title', 'Statutory Sources & Rules')}</strong>
                        <p>{t('sources.subtitle', 'Authoritative Acts, Gazette rules & circulars')}</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* Expert Portal Access Link */}
            <li className="gov-nav-item expert-nav-item">
              <Link
                to="/expert/dashboard"
                className={`gov-nav-link expert-link ${
                  location.pathname.startsWith('/expert') ? 'active' : ''
                }`}
                title="Authorized Human Experts & Patent Facilitators"
              >
                <UserCheck size={15} />
                <span>{t('nav.expertPortal')}</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Global Search Bar Drawer */}
      {searchOpen && (
        <div className="gov-search-bar-drawer">
          <div className="gov-container">
            <form onSubmit={handleSearchSubmit} className="search-drawer-form">
              <Search size={22} className="search-input-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Ayurveda patent rules, Section 3(p), ABS guidelines, or ask any question..."
                className="search-drawer-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="btn-icon"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="gov-mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer-header">
            <div className="gov-brand-name-hi">{t('brand.nameHindi')}</div>
            <button onClick={() => setMobileMenuOpen(false)} className="btn-icon">
              <X size={24} />
            </button>
          </div>

          <div className="mobile-drawer-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('nav.home')}
            </Link>
            <Link
              to="/ask"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-link highlight"
            >
              <Sparkles size={18} />
              <span>{t('nav.ask')}</span>
            </Link>
            <Link
              to="/case-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-link"
            >
              <FileText size={18} className="text-secondary" />
              <span>{t('nav.caseBuilder', 'Case Builder')}</span>
            </Link>
            <Link
              to="/classifier"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-link"
            >
              {t('classifier.badge', 'Guided Product Classifier')}
            </Link>
            <Link to="/patent" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('services.patent.title', 'Patent Guidance')}
            </Link>
            <Link to="/trademark" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('services.trademark.title', 'Trademark Protection')}
            </Link>
            <Link to="/tk" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('services.tk.title', 'Traditional Knowledge (TK)')}
            </Link>
            <Link to="/abs" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('services.abs.title', 'ABS / Biodiversity')}
            </Link>
            <Link
              to="/regulatory"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-link"
            >
              {t('services.regulatory.title', 'Regulatory & AYUSH')}
            </Link>
            <Link to="/prior-art" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('nav.priorArt', 'Prior Art Search')}
            </Link>
            <Link to="/sources" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('nav.sources', 'Sources')}
            </Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              <LayoutDashboard size={18} />
              <span>{t('nav.dashboard', 'My Dashboard')}</span>
            </Link>
            <Link
              to="/expert/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-link expert-mobile-link"
            >
              <UserCheck size={18} />
              <span>{t('nav.expertPortal')}</span>
            </Link>
            <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              {t('nav.help')}
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mobile-link text-error"
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={18} />
                <span>{t('auth.signOut', 'Sign Out')} ({user.name.split(' ')[0]})</span>
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                <span>{t('nav.signIn', 'Sign In')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
