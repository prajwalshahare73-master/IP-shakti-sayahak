import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Globe, Eye, Volume2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';

export const UtilityBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');

  const handleTextSize = (size: 'normal' | 'large' | 'larger') => {
    setFontSize(size);
    if (size === 'normal') document.documentElement.style.fontSize = '16px';
    if (size === 'large') document.documentElement.style.fontSize = '18px';
    if (size === 'larger') document.documentElement.style.fontSize = '20px';
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="gov-utility-bar" role="region" aria-label="Accessibility & Region controls">
      <a href="#main-content" className="skip-to-content">
        {t('utility.skipToContent')}
      </a>

      <div className="gov-container gov-utility-inner">
        <div className="gov-utility-left">
          <span className="gov-emblem-tag">
            <ShieldCheck size={14} className="icon-gold flex-shrink-0" />
            <span className="gov-emblem-full">National Ayurveda Intellectual Property Guidance Initiative</span>
            <span className="gov-emblem-short">Ayurveda IPR Guidance Initiative</span>
          </span>
        </div>

        <div className="gov-utility-right">
          {/* Text Size / Accessibility */}
          <div className="accessibility-controls" aria-label="Text size adjustment">
            <Eye size={13} aria-hidden="true" />
            <button
              onClick={() => handleTextSize('normal')}
              className={`size-btn ${fontSize === 'normal' ? 'active' : ''}`}
              title="Standard text size"
            >
              A-
            </button>
            <button
              onClick={() => handleTextSize('large')}
              className={`size-btn ${fontSize === 'large' ? 'active' : ''}`}
              title="Large text size"
            >
              A
            </button>
            <button
              onClick={() => handleTextSize('larger')}
              className={`size-btn ${fontSize === 'larger' ? 'active' : ''}`}
              title="Larger text size"
            >
              A+
            </button>
          </div>


          {/* Fast Language Selector */}
          <div className="language-select-wrapper">
            <Globe size={13} className="text-primary" />
            <label htmlFor="utility-language" className="sr-only">
              {t('utility.language')}
            </label>
            <select
              id="utility-language"
              value={language}
              onChange={handleLangChange}
              className="gov-select-compact font-devanagari"
              aria-label="Language selection"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
