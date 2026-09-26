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
  domain: 'tkdl' | 'patent' | 'abs' | 'regulatory' | 'food_aahara' | 'intl_ip' | 'trademark' | 'prior_art';
  domainLabelKey: string;
  degrees: string;
  experienceYears: number;
  casesResolved: number;
  rating: number;
  badgeKey: string;
  bioKey: string;
  available: boolean;
  avatarGradient: string;
  // Enhanced Section 2 & 11 verified credential fields
  specialization: string[];
  expertise: string[];
  jurisdiction: 'India' | 'International' | 'India / International';
  status: 'Available' | 'Busy' | 'Offline';
  organization: string;
  verificationStatus: 'Verified Expert' | 'Verified Senior Specialist';
  matchScore?: number;
  matchBadge?: string;
  matchReasons?: string[];
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
    avatarGradient: 'linear-gradient(135deg, #0f3d5c 0%, #0d9488 100%)',
    specialization: ['Traditional Knowledge', 'TKDL', 'Prior Art'],
    expertise: ['Patent Research', 'Traditional Knowledge', 'Prior Art', 'AYUSH IP'],
    jurisdiction: 'India / International',
    status: 'Available',
    organization: 'AYUSH IP Facilitation Cell / Regd. IPO Agent',
    verificationStatus: 'Verified Senior Specialist'
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
    avatarGradient: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
    specialization: ['Classical Treatises', 'Dravyaguna Herbology', 'TKDL Indexing'],
    expertise: ['Samhita Concordance', 'Prior Art Invalidation', 'Ayurveda Botanical Evidence'],
    jurisdiction: 'India',
    status: 'Available',
    organization: 'National Ayurveda Research Institute',
    verificationStatus: 'Verified Expert'
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
    avatarGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    specialization: ['Section 3(p) Screening', 'Synergism Claims', 'Patent Drafting'],
    expertise: ['Patent Litigation', 'Section 3(e) Synergistic Assay', 'Drafting & Prosecution'],
    jurisdiction: 'India',
    status: 'Available',
    organization: 'National AYUSH Patent Attorneys Guild',
    verificationStatus: 'Verified Senior Specialist'
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
    avatarGradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    specialization: ['National Biodiversity Authority', 'SBB Form I & III', 'Nagoya Protocol'],
    expertise: ['ABS Approvals', 'Biological Diversity Act 2002', 'Access Agreements'],
    jurisdiction: 'India / International',
    status: 'Available',
    organization: 'Centre for Bio-Legal Studies & NBA Statutory Advisory',
    verificationStatus: 'Verified Expert'
  },
  {
    id: 'exp-abs-2',
    name: 'Dr. Pradeep Narayanan',
    roleTitle: 'State Biodiversity Board (SBB) Compliance Advisor',
    domain: 'abs',
    domainLabelKey: 'expertDirectory.domainAbs',
    degrees: 'Ph.D. (Ethnobotany), Post-Doc (ABS Nagoya Protocol), SBB Advisor',
    experienceYears: 13,
    casesResolved: 88,
    rating: 4.7,
    badgeKey: 'expertDirectory.badgeAbsAdvisor',
    bioKey: 'expertDirectory.bioPradeep',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    specialization: ['Wild Herb Sourcing', 'Form I SBB Intimation', 'Commercial Benefit Sharing'],
    expertise: ['Ethnobotanical Documentation', 'State Biodiversity Boards', 'ABS Clearance'],
    jurisdiction: 'India',
    status: 'Available',
    organization: 'Ethnobotany Conservation & Bio-Trade Advisory',
    verificationStatus: 'Verified Expert'
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
    avatarGradient: 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
    specialization: ['Drugs & Cosmetics Act 1940', 'GMP Schedule T', 'Manufacturing Licensing'],
    expertise: ['Drug Licensing', 'Schedule T GMP', 'State Licensing Authority (SLA)'],
    jurisdiction: 'India',
    status: 'Available',
    organization: 'AYUSH Regulatory Compliance Bureau',
    verificationStatus: 'Verified Expert'
  },

  // 5. Food / Ayurveda Aahara Specialists
  {
    id: 'exp-food-1',
    name: 'Dr. Arvind R. Namboodiri',
    roleTitle: 'Ayurveda Aahara & FSSAI Nutraceutical Specialist',
    domain: 'food_aahara',
    domainLabelKey: 'expertDirectory.domainFoodAahara',
    degrees: 'BAMS, M.Sc. (Food Science & Nutrition), FSSAI Certified Technical Advisor',
    experienceYears: 15,
    casesResolved: 86,
    rating: 4.8,
    badgeKey: 'expertDirectory.badgeFoodSpecialist',
    bioKey: 'expertDirectory.bioArvind',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    specialization: ['FSSAI Ayurveda Aahara 2022', 'Nutraceutical Labeling', 'Dietary Safety Dossiers'],
    expertise: ['Ayurveda Aahara Formulations', 'Food Safety Standards', 'Label Claims'],
    jurisdiction: 'India',
    status: 'Available',
    organization: 'Ayurveda Aahara Technical Advisory Group',
    verificationStatus: 'Verified Expert'
  },

  // 6. International IP / Regulatory Specialists
  {
    id: 'exp-intl-1',
    name: 'Adv. Priya Venkataraman',
    roleTitle: 'International IP & Global Regulatory Counsel (WIPO / PCT / US FDA)',
    domain: 'intl_ip',
    domainLabelKey: 'expertDirectory.domainIntlIp',
    degrees: 'B.Sc. (Chemistry), LL.M. (International IP - London), Regd. Patent Agent',
    experienceYears: 17,
    casesResolved: 135,
    rating: 4.9,
    badgeKey: 'expertDirectory.badgeIntlCounsel',
    bioKey: 'expertDirectory.bioPriya',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    specialization: ['PCT International Applications', 'US FDA Botanical Guidance', 'EU Herbal Monographs'],
    expertise: ['PCT Chapter I & II', 'Cross-Border IP', 'Foreign Filing Licenses (Sec 39)'],
    jurisdiction: 'India / International',
    status: 'Available',
    organization: 'Global Life Sciences IP Practice',
    verificationStatus: 'Verified Expert'
  },

  // 7. Trademark / GI / Design Specialists
  {
    id: 'exp-tm-1',
    name: 'Adv. Vikramaditya Sen',
    roleTitle: 'Trademark, Geographical Indications & Design Law Specialist',
    domain: 'trademark',
    domainLabelKey: 'expertDirectory.domainTrademark',
    degrees: 'B.A. LL.B. (Hons), Advocate (IPAB & High Court)',
    experienceYears: 14,
    casesResolved: 112,
    rating: 4.8,
    badgeKey: 'expertDirectory.badgeTrademarkSpecialist',
    bioKey: 'expertDirectory.bioVikramaditya',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    specialization: ['Nice Class 5 & 30', 'Geographical Indications of Goods', 'Shape of Goods / Design'],
    expertise: ['AYUSH Brand Protection', 'GI Registry Chennai', 'Opposition & Infringement'],
    jurisdiction: 'India',
    status: 'Available',
    organization: 'Intellectual Property Litigation Chambers',
    verificationStatus: 'Verified Expert'
  },

  // 8. Prior Art / Patent Research Specialists
  {
    id: 'exp-pa-1',
    name: 'Dr. Hemant Joshi',
    roleTitle: 'Prior Art, Patent Landscaping & TKDL Search Specialist',
    domain: 'prior_art',
    domainLabelKey: 'expertDirectory.domainPriorArt',
    degrees: 'M.Pharm (Pharmacognosy), Ph.D. (Phytochemistry), Certified Patent Analyst',
    experienceYears: 14,
    casesResolved: 95,
    rating: 4.8,
    badgeKey: 'expertDirectory.badgePatentSpecialist',
    bioKey: 'expertDirectory.bioHemant',
    available: true,
    avatarGradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    specialization: ['TKDL Database Search', 'Freedom to Operate (FTO)', 'Patentability Assessment'],
    expertise: ['Prior Art Search', 'Invalidity Contention', 'Polyherbal Formularies'],
    jurisdiction: 'India / International',
    status: 'Available',
    organization: 'Phytopharmaceutical Patent Research Centre',
    verificationStatus: 'Verified Expert'
  }
];

interface ExpertDirectorySelectorProps {
  selectedExpertId?: string;
  onSelectExpert: (expert: EmpanelledExpert) => void;
  defaultDomain?: 'all' | 'tkdl' | 'patent' | 'abs' | 'regulatory' | 'food_aahara' | 'intl_ip' | 'trademark' | 'prior_art';
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
      exp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.organization.toLowerCase().includes(searchQuery.toLowerCase());
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

      {/* Domain Filter Tabs Covering all 8 Domains */}
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
          📚 Traditional Knowledge / TKDL
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
          ⚖️ Patent / Section 3(p)
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
          🌿 Biodiversity / ABS / NBA
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
          🏛️ AYUSH Regulatory
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('food_aahara')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'food_aahara'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🥗 Ayurveda Aahara / Food
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('intl_ip')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'intl_ip'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🌐 International IP / PCT
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('trademark')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'trademark'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏷️ Trademark / GI / Design
        </button>
        <button
          type="button"
          onClick={() => setActiveDomain('prior_art')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeDomain === 'prior_art'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔍 Prior Art / Patent Search
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
                    {exp.roleTitle}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {exp.verificationStatus}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {exp.jurisdiction}
                    </span>
                  </div>
                </div>
              </div>

              {/* Degrees & Qualifications */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-3 space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5">
                  <Award size={13} className="text-secondary shrink-0 mt-0.5" />
                  <div className="text-gray-700 text-[11px] leading-snug">
                    <strong className="text-navy">{t('expertDirectory.degreesLabel', 'Degrees')}:</strong> {exp.degrees}
                  </div>
                </div>

                <div className="text-[11px] text-gray-600">
                  <strong>Organization:</strong> {exp.organization}
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
                  {exp.status} for Review
                </span>

                <button
                  type="button"
                  onClick={() => onSelectExpert(exp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{isSelected ? t('common.selected', 'Selected') : t('expertDirectory.chooseSpecialist', 'Select Expert')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (modalMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Empanelled Expert Directory
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">{content}</div>
        </div>
      </div>
    );
  }

  return content;
};
