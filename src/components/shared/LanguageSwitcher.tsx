import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'dropdown' | 'inline' | 'pills';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showLabel = true,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'compact') {
    return (
      <div className={`language-select-wrapper ${className}`}>
        <Globe size={13} className="text-primary" aria-hidden="true" />
        <label htmlFor="language-switcher-compact" className="sr-only">
          Select Language
        </label>
        <select
          id="language-switcher-compact"
          value={language}
          onChange={(e) => handleSelect(e.target.value)}
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
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`lang-pills-row ${className}`} role="radiogroup" aria-label="Language Selection">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(lang.code)}
              className={`lang-pill-btn ${isSelected ? 'selected' : ''}`}
            >
              <span className="font-devanagari">{lang.nativeName}</span>
              <span className="lang-pill-en">({lang.name})</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`gov-dropdown-wrapper ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline btn-sm gov-lang-btn"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLang.nativeName}. Click to change language.`}
      >
        <Globe size={16} aria-hidden="true" />
        {showLabel && <span className="font-devanagari">{currentLang.nativeName}</span>}
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="gov-dropdown-menu lang-menu show" role="listbox">
          <div className="lang-menu-header">
            <span>Select Interface Language</span>
            <span className="text-muted" style={{ fontSize: '11px', display: 'block' }}>
              8 Official Indian Languages + Hinglish
            </span>
          </div>
          <div className="lang-options-grid">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={`lang-option ${isSelected ? 'selected' : ''}`}
                >
                  <div className="lang-text-group">
                    <span className="lang-native font-devanagari">{lang.nativeName}</span>
                    <span className="lang-sub">{lang.name}</span>
                  </div>
                  {isSelected && <Check size={16} className="text-secondary" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
