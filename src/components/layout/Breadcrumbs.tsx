import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Breadcrumbs: React.FC<{ customTrail?: Array<{ title: string; link?: string }> }> = ({
  customTrail
}) => {
  const location = useLocation();
  const { t } = useTranslation();

  if (location.pathname === '/') return null;

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getSegmentName = (seg: string) => {
    switch (seg) {
      case 'ask':
        return t('nav.ask', 'Ask IP-SAKTI');
      case 'case-builder':
        return t('nav.caseBuilder', 'Case Builder');
      case 'patent':
        return t('services.patent.title', 'Patent Guidance');
      case 'trademark':
        return t('services.trademark.title', 'Trademark Protection');
      case 'gi':
        return t('services.gi.title', 'Geographical Indications');
      case 'copyright':
        return t('services.copyright.title', 'Copyright & Documentation');
      case 'design':
        return t('services.design.title', 'Design Protection');
      case 'regulatory':
        return t('nav.regulatory', 'Regulatory Guidance');
      case 'prior-art':
        return t('nav.priorArt', 'Prior Art');
      case 'abs':
        return t('nav.abs', 'ABS / Biodiversity');
      case 'tk':
        return t('nav.tk', 'Traditional Knowledge');
      case 'sources':
        return t('nav.sources', 'Sources');
      case 'dashboard':
        return t('nav.dashboard', 'My Dashboard');
      case 'classifier':
        return t('classifier.badge', 'Product Classification');
      case 'help':
        return t('nav.help', 'Help & FAQ');
      case 'about':
        return t('nav.about', 'About');
      case 'contact':
        return t('nav.contact', 'Contact & Support');
      case 'expert':
        return t('nav.expertPortal', 'Expert Portal');
      default:
        return seg.charAt(0).toUpperCase() + seg.slice(1);
    }
  };

  return (
    <nav className="gov-breadcrumbs" aria-label="Breadcrumb navigation">
      <div className="gov-container breadcrumb-inner">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link" title="Home">
              <Home size={14} />
              <span className="sr-only">Home</span>
            </Link>
          </li>

          {customTrail ? (
            customTrail.map((crumb, idx) => (
              <li key={idx} className="breadcrumb-item">
                <ChevronRight size={14} className="breadcrumb-separator" />
                {crumb.link ? (
                  <Link to={crumb.link} className="breadcrumb-link">
                    {crumb.title}
                  </Link>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {crumb.title}
                  </span>
                )}
              </li>
            ))
          ) : (
            pathSegments.map((segment, idx) => {
              const to = `/${pathSegments.slice(0, idx + 1).join('/')}`;
              const isLast = idx === pathSegments.length - 1;

              return (
                <li key={to} className="breadcrumb-item">
                  <ChevronRight size={14} className="breadcrumb-separator" />
                  {isLast ? (
                    <span className="breadcrumb-current" aria-current="page">
                      {getSegmentName(segment)}
                    </span>
                  ) : (
                    <Link to={to} className="breadcrumb-link">
                      {getSegmentName(segment)}
                    </Link>
                  )}
                </li>
              );
            })
          )}
        </ol>
      </div>
    </nav>
  );
};
