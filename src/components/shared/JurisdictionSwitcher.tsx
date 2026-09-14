import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Check, ChevronDown, Globe } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface JurisdictionSwitcherProps {
  variant?: 'compact' | 'dropdown' | 'pills';
  className?: string;
}

const JURISDICTIONS: Array<{
  id: 'India' | 'International' | 'India + International';
  label: string;
  flag: string;
  desc: string;
}> = [
  {
    id: 'India',
    label: 'India',
    flag: '🇮🇳',
    desc: 'The Patents Act 1970, Trade Marks Act 1999, BD Act 2002, AYUSH Rules'
  },
  {
    id: 'International',
    label: 'International (PCT/WIPO)',
    flag: '🌐',
    desc: 'PCT Patent Cooperation Treaty, Madrid Protocol, US/EU/JP Ayurveda Prior Art'
  },
  {
    id: 'India + International',
    label: 'India + Global',
    flag: '🇮🇳+🌐',
    desc: 'Dual compliance pathway for export-oriented herbal formulations'
  }
];

export const JurisdictionSwitcher: React.FC<JurisdictionSwitcherProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const { jurisdiction, setJurisdiction } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = JURISDICTIONS.find((j) => j.id === jurisdiction) || JURISDICTIONS[0];

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
      <div className={`jurisdiction-select-wrapper ${className}`}>
        <MapPin size={13} className="text-secondary" aria-hidden="true" />
        <label htmlFor="utility-jurisdiction-switch" className="sr-only">
          Legal Jurisdiction
        </label>
        <select
          id="utility-jurisdiction-switch"
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value as any)}
          className="gov-select-compact"
          aria-label="Target Legal Jurisdiction"
        >
          {JURISDICTIONS.map((j) => (
            <option key={j.id} value={j.id}>
              {j.flag} {j.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`jurisdiction-pills ${className}`} role="radiogroup" aria-label="Legal Jurisdiction">
        {JURISDICTIONS.map((j) => {
          const isSelected = jurisdiction === j.id;
          return (
            <button
              key={j.id}
              role="radio"
              aria-checked={isSelected}
              type="button"
              onClick={() => setJurisdiction(j.id)}
              className={`jurisdiction-pill-btn ${isSelected ? 'active' : ''}`}
            >
              <span>{j.flag}</span>
              <span>{j.label}</span>
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
        className="btn btn-outline btn-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <MapPin size={15} className="text-secondary" aria-hidden="true" />
        <span>{currentOption.flag} {currentOption.label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="gov-dropdown-menu jurisdiction-menu show" role="listbox">
          <div className="dropdown-section-title">Select Applicable Jurisdiction</div>
          {JURISDICTIONS.map((j) => {
            const isSelected = jurisdiction === j.id;
            return (
              <button
                key={j.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setJurisdiction(j.id);
                  setIsOpen(false);
                }}
                className={`dropdown-item-detailed ${isSelected ? 'selected' : ''}`}
              >
                <div className="item-flag">{j.flag}</div>
                <div className="item-text">
                  <strong>{j.label}</strong>
                  <span className="item-desc">{j.desc}</span>
                </div>
                {isSelected && <Check size={16} className="text-secondary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
