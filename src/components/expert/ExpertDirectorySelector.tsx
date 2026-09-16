import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Award,
  BookOpen,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  User,
  Scale
} from 'lucide-react';

export interface EmpanelledExpert {
  id: string;
  name: string;
  roleTitle: string;
  domain: 'tkdl' | 'patent' | 'abs' | 'regulatory' | 'trademark';
  domainLabelKey: string;
  degrees: string;
  experienceYears: number;
  casesResolved: number;
  rating: number;
  badgeKey: string;
  bioKey: string;
  available: boolean;
  avatarGradient: string;
}

export const EMPANELLED_EXPERTS: EmpanelledExpert[] = [
  // 1. Traditional Knowledge & TKDL Specialists
  {
    id: 'exp-tkdl-1',
    name: 'Dr. Vandana Sharma',
    roleTitle: 'Senior Traditional Knowledge & Patent Facilitator',
    domain: 'tkdl',
    domainLabelKey: 'expertDirectory.domainTkdl',
    degrees: 'BAMS, LL.M. (IPR), Registered Patent Agent (IN/PA/2418)',
    experienceYears: 18,
    casesResolved: 142,
    rating: 4.9,
    badgeKey: 'expertDirectory.badgeSenior',
    bioKey: 'expertDirectory.bioVandana',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #0f3d5c 0%, #0d9488 100%)'
  },
  {
    id: 'exp-tkdl-2',
    name: 'Dr. Ananya Bhattacharya',
    roleTitle: 'Ayurvedic Dravyaguna & TKDL Prior Art Consultant',
    domain: 'tkdl',
    domainLabelKey: 'expertDirectory.domainTkdl',
    degrees: 'M.D. (Ayurveda - Dravyaguna), Ph.D., PGD-IPR',
    experienceYears: 15,
    casesResolved: 118,
    rating: 4.8,
    badgeKey: 'expertDirectory.badgeTkdlSpecialist',
    bioKey: 'expertDirectory.bioAnanya',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)'
  },
  {
    id: 'exp-tkdl-3',
    name: 'Vaidya Harishankar Joshi',
    roleTitle: 'Classical Formulary & Manuscript Documentation Fellow',
    domain: 'tkdl',
    domainLabelKey: 'expertDirectory.domainTkdl',
    degrees: 'BAMS, M.A. (Sanskrit - Ayurveda Samhitas), TKDL Legal Fellow',
    experienceYears: 22,
    casesResolved: 165,
    rating: 5.0,
    badgeKey: 'expertDirectory.badgePrincipalCounsel',
    bioKey: 'expertDirectory.bioHarishankar',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)'
  },

  // 2. Patents & Section 3(p) Synergy Specialists
  {
    id: 'exp-pat-1',
    name: 'Adv. Rajeshwar Kulkarni',
    roleTitle: 'Principal AYUSH Patent Attorney & Section 3(p) Litigator',
    domain: 'patent',
    domainLabelKey: 'expertDirectory.domainPatent',
    degrees: 'B.Pharm, LL.B., Advocate (High Court & IPO), Regd. Patent Agent',
    experienceYears: 20,
    casesResolved: 210,
    rating: 4.9,
    badgeKey: 'expertDirectory.badgePrincipalCounsel',
    bioKey: 'expertDirectory.bioRajeshwar',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
  },
  {
    id: 'exp-pat-2',
    name: 'Dr. Hemant Joshi',
    roleTitle: 'Polyherbal Formulation & Synergism Claim Specialist',
    domain: 'patent',
    domainLabelKey: 'expertDirectory.domainPatent',
    degrees: 'M.Pharm (Pharmacognosy), Ph.D. (Phytochemistry), Patent Analyst',
    experienceYears: 14,
    casesResolved: 95,
    rating: 4.8,
    badgeKey: 'expertDirectory.badgePatentSpecialist',
    bioKey: 'expertDirectory.bioHemant',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)'
  },

  // 3. Biodiversity Act & NBA Access and Benefit Sharing (ABS) Specialists
  {
    id: 'exp-abs-1',
    name: 'Adv. Meenakshi Sundaram',
    roleTitle: 'National Biodiversity Authority (NBA) Regulatory Counsel',
    domain: 'abs',
    domainLabelKey: 'expertDirectory.domainAbs',
    degrees: 'M.Sc. (Ecology), LL.M. (Environmental & Bio-Law), Advocate',
    experienceYears: 16,
    casesResolved: 124,
    rating: 4.9,
    badgeKey: 'expertDirectory.badgeNbaCounsel',
    bioKey: 'expertDirectory.bioMeenakshi',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)'
  },
  {
    id: 'exp-abs-2',
    name: 'Dr. Pradeep Narayanan',
    roleTitle: 'State Biodiversity Board (SBB) Form I & III Compliance Advisor',
    domain: 'abs',
    domainLabelKey: 'expertDirectory.domainAbs',
    degrees: 'Ph.D. (Ethnobotany), Post-Doc (ABS Nagoya Protocol), SBB Advisor',
    experienceYears: 13,
    casesResolved: 88,
    rating: 4.7,
    badgeKey: 'expertDirectory.badgeAbsAdvisor',
    bioKey: 'expertDirectory.bioPradeep',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)'
  },

  // 4. Regulatory & AYUSH Licensing Specialists
  {
    id: 'exp-reg-1',
    name: 'Dr. Suniti Deshmukh',
    roleTitle: 'AYUSH Drugs & Cosmetics Act Licensing Specialist',
    domain: 'regulatory',
    domainLabelKey: 'expertDirectory.domainRegulatory',
    degrees: 'BAMS, M.D. (Rasashastra & Bhaishajya Kalpana), Former Drug Inspector',
    experienceYears: 19,
    casesResolved: 178,
    rating: 4.9,
    badgeKey: 'expertDirectory.badgeAyushLicensing',
    bioKey: 'expertDirectory.bioSuniti',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #831843 0%, #db2777 100%)'
  }
];

interface ExpertDirectorySelectorProps {
  selectedExpertId?: string;
  onSelectExpert: (expert: EmpanelledExpert) => void;
  defaultDomain?: 'all' | 'tkdl' | 'patent' | 'abs' | 'regulatory' | 'trademark';
  modalMode?: boolean;
  onClose?: () => void;
}

export const ExpertDirectorySelector: React.FC<ExpertDirectorySelectorProps> = ({
  selectedExpertId,
  onSelectExpert,
  defaultDomain = 'all',
  modalMode = false,
  onClose
}) => {
  const { t } = useTranslation();
  const [activeDomain, setActiveDomain] = useState<string>(defaultDomain);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperts = EMPANELLED_EXPERTS.filter((exp) => {
    const matchesDomain = activeDomain === 'all' || exp.domain === activeDomain;
    const matchesSearch =
      searchQuery === '' ||
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.degrees.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const content = (
    <div className="expert-directory-component">
      <div className="expert-dir-header mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Scale size={18} className="text-primary" />
          <h3 className="text-lg font-bold text-navy">
            {t('expertDirectory.title', 'Select Empanelled AYUSH IP & TK Specialist')}
          </h3>
        </div>
        <p className="text-xs text-muted">
          {t('expertDirectory.subtitle', 'Choose a certified legal facilitator with specialized expertise in your formulation domain. Inspect verified degrees, resolved case counts, and domain credentials.')}
        </p>
      </div>

      {/* Domain Filter Tabs */}
      <div className="expert-domain-tabs flex flex-wrap gap-2 mb-4 pb-2 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setActiveDomain('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'all'
              ? 'bg-navy text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('expertDirectory.allDomains', 'All Specialists')} ({EMPANELLED_EXPERTS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('tkdl')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'tkdl'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📚 {t('expertDirectory.domainTkdl', 'Traditional Knowledge & TKDL')} (3)
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('patent')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'patent'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⚖️ {t('expertDirectory.domainPatent', 'Patents & Section 3(p)')} (2)
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('abs')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'abs'
              ? 'bg-secondary text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🌿 {t('expertDirectory.domainAbs', 'Biodiversity & NBA ABS')} (2)
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('regulatory')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'regulatory'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏛️ {t('expertDirectory.domainRegulatory', 'AYUSH Licensing')} (1)
        </button>
      </div>

      {/* Experts Grid */}
      <div className="expert-cards-grid grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
        {filteredExperts.map((exp) => {
          const isSelected = selectedExpertId === exp.id;
          return (
            <div
              key={exp.id}
              className={`expert-item-card p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-primary bg-blue-50/50 shadow-md ring-2 ring-primary/20'
                  : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5 mb-3">
                {/* Avatar with Initials */}
                <div
                  style={{
                    background: exp.avatarGradient,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}
                >
                  <User size={24} color="#ffffff" strokeWidth={2.4} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-navy truncate">{exp.name}</h4>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                      <Star size={11} className="fill-amber-500 text-amber-500" />
                      {exp.rating}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-primary mt-0.5 leading-tight">
                    {t(exp.domainLabelKey, exp.roleTitle)}
                  </p>

                  <div className="mt-1">
                    <span className="inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t(exp.badgeKey, 'Certified Facilitator')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Degrees & Qualifications */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-3 space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5">
                  <Award size={13} className="text-secondary shrink-0 mt-0.5" />
                  <div className="text-gray-700 text-[11px] leading-snug">
                    <strong className="text-navy">{t('expertDirectory.degreesLabel', 'Degrees & Bar/Patent Reg')}:</strong> {exp.degrees}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-gray-600">
                    ⏳ <strong>{exp.experienceYears}+ {t('expertDirectory.yearsExp', 'Years Experience')}</strong>
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    ✓ <strong>{exp.casesResolved}+ {t('expertDirectory.casesResolved', 'Cases Resolved')}</strong>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('expertDirectory.availableNow', 'Available for Review')}
                </span>

                <button
                  type="button"
                  onClick={() => onSelectExpert(exp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-navy text-white hover:bg-primary shadow-sm'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>{t('expertDirectory.selected', 'Selected Expert')}</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={13} />
                      <span>{t('expertDirectory.assignToExpert', 'Assign My Case')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!modalMode) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {content}
        </div>
        {onClose && (
          <div className="pt-4 mt-3 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm"
            >
              {t('common.close', 'Close & Return')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
