import { create } from 'zustand';
import i18n from '../i18n/config';

export interface Citation {
  id: string;
  title: string;
  sourceType: 'Act' | 'Guideline' | 'Evidence' | 'Research' | 'TKDL' | 'Registry';
  section?: string;
  page?: string;
  jurisdiction: string;
  status: 'Current' | 'Amended' | 'Historical';
  version?: string;
  url?: string;
  excerpt?: string;
  authorityLevel: 1 | 2 | 3 | 4; // 1 = Primary Statute, 2 = Official Guideline, 3 = Registry Evidence, 4 = Supporting Research
}

export interface SectionConfidence {
  section: string;
  level: 'high' | 'medium' | 'low';
  percentage?: number;
  reason?: string;
}

export interface LowConfidenceAlert {
  section: string;
  percentage: number;
  reason: string;
}

export interface ConfidenceInfo {
  level: 'high' | 'medium' | 'low';
  reasons: string[];
  caveat?: string;
  sections?: SectionConfidence[];
  lowConfidenceAlerts?: LowConfidenceAlert[];
}

export interface CaseProfile {
  productType?: string;
  productName?: string;
  entityType?: string;
  purpose?: string;
  ingredients?: string[];
  biologicalResources?: string;
  biological_material?: boolean;
  tk_involved?: boolean;
  export_planned?: boolean;
  formulation_details?: string;
  process_description?: string;
  target_countries?: string[];
  jurisdiction?: string;
  isTraditional?: 'new' | 'traditional' | 'modified_traditional' | 'unsure';
  notes?: string;
}

export interface AIAnswerData {
  answer: string;
  summary: string;
  why: string[];
  meaningForYou: string[];
  jurisdiction: string;
  ipType: string;
  confidence: ConfidenceInfo;
  citations: Citation[];
  warnings: string[];
  nextSteps: Array<{ title: string; action: string; link?: string; primary?: boolean }>;
  needsClarification?: boolean;
  clarificationPrompt?: {
    question: string;
    options: Array<{ id: string; label: string; value: string }>;
  };
  abstained?: boolean;
  abstentionDetails?: {
    reason: string;
    missingInfo: string[];
  };
}

export interface CaseEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: 'user' | 'system' | 'expert';
  status: string;
}

export interface CaseRecord {
  id: string;
  title: string;
  query: string;
  domain: string;
  jurisdiction: string;
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_REVIEW' | 'NEED_MORE_INFORMATION' | 'REVIEW_COMPLETED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  escalated: boolean;
  escalationReason?: string;
  assignedExpertCategory?: string;
  assignedExpertName?: string;
  aiAnswer?: AIAnswerData;
  caseProfile?: CaseProfile;
  events: CaseEvent[];
  expertReview?: {
    expertName: string;
    expertRole: string;
    completedAt: string;
    summary: string;
    observations: string[];
    recommendedAction: string;
    references: string[];
    riskNotes?: string;
    internalNotes?: string;
  };
  requestedInfo?: {
    prompt: string;
    askedAt: string;
    userResponse?: string;
    respondedAt?: string;
  };
}

export interface AppNotification {
  id: string;
  caseId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'review';
}

interface AppState {
  // Localization & Region
  language: string;
  responseLanguage: string;
  jurisdiction: 'India' | 'International' | 'India + International';
  setLanguage: (lang: string) => void;
  setResponseLanguage: (lang: string) => void;
  setJurisdiction: (j: 'India' | 'International' | 'India + International') => void;

  // Active Query & Session
  query: string;
  conversationId: string;
  caseProfile: CaseProfile;
  setQuery: (q: string) => void;
  setCaseProfile: (profile: Partial<CaseProfile>) => void;
  resetCaseProfile: () => void;

  // AI Response state
  loading: boolean;
  loadingStep: number;
  error: string | null;
  currentAnswer: AIAnswerData | null;
  setLoading: (l: boolean, step?: number) => void;
  setError: (e: string | null) => void;
  setCurrentAnswer: (ans: AIAnswerData | null) => void;

  // User Auth & Dashboard Cases
  user: { id?: string; name: string; email: string; role: 'user' | 'expert' | 'admin' } | null;
  session: any | null;
  authInitialized: boolean;
  setUser: (u: { id?: string; name: string; email: string; role: 'user' | 'expert' | 'admin' } | null) => void;
  setSession: (s: any | null) => void;
  setAuthInitialized: (init: boolean) => void;
  cases: CaseRecord[];
  addCase: (newCase: CaseRecord) => void;
  updateCase: (caseId: string, updates: Partial<CaseRecord>) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
}

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('ipsakti_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[appStore] Error loading stored user:', e);
  }
  return null;
};

const initialStoredUser = getStoredUser();

export const useAppStore = create<AppState>((set) => ({
  language: localStorage.getItem('ipsakti_lang') || 'en',
  responseLanguage: localStorage.getItem('ipsakti_lang') || 'en',
  jurisdiction: 'India',
  setLanguage: (lang: string) => {
    localStorage.setItem('ipsakti_lang', lang);
    i18n.changeLanguage(lang);
    set({ language: lang, responseLanguage: lang });
  },
  setResponseLanguage: (lang: string) => set({ responseLanguage: lang }),
  setJurisdiction: (jurisdiction) => set({ jurisdiction }),

  query: '',
  conversationId: 'session-' + Date.now(),
  caseProfile: { jurisdiction: 'India' },
  setQuery: (query) => set({ query }),
  setCaseProfile: (profile) =>
    set((state) => ({ caseProfile: { ...state.caseProfile, ...profile } })),
  resetCaseProfile: () => set({ caseProfile: { jurisdiction: 'India' } }),

  loading: false,
  loadingStep: 0,
  error: null,
  currentAnswer: null,
  setLoading: (loading, loadingStep = 0) => set({ loading, loadingStep }),
  setError: (error) => set({ error }),
  setCurrentAnswer: (currentAnswer) => set({ currentAnswer }),

  user: initialStoredUser,
  session: null,
  authInitialized: Boolean(initialStoredUser),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('ipsakti_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ipsakti_user');
    }
    set({ user, authInitialized: true });
  },
  setSession: (session) => set({ session }),
  setAuthInitialized: (authInitialized) => set({ authInitialized }),

  cases: [
    {
      id: 'IPS-1024',
      title: 'Ayurvedic herbal polyherbal respiratory formulation patentability',
      query: 'Meri Ayurvedic herbal formulation ko market karna hai, patent bhi lena hai. Mujhe kya karna chahiye?',
      domain: 'Patent + Traditional Knowledge',
      jurisdiction: 'India',
      status: 'IN_REVIEW',
      createdAt: '2026-09-06T10:30:00Z',
      updatedAt: '2026-09-08T14:15:00Z',
      confidenceLevel: 'medium',
      escalated: true,
      escalationReason: 'Complex interaction between Section 3(p) Traditional Knowledge exclusion and synergistic therapeutic effect claims.',
      assignedExpertCategory: 'Traditional Knowledge / Patent Specialist',
      assignedExpertName: 'Dr. V. Sharma (Senior IP Facilitator)',
      caseProfile: {
        productType: 'Ayurvedic Medicine / Polyherbal Kadha Extract',
        purpose: 'Respiratory Care & Bronchodilation',
        ingredients: ['Vasaka (Adhatoda vasica)', 'Kantakari (Solanum surattense)', 'Yashtimadhu (Glycyrrhiza glabra)'],
        isTraditional: 'modified_traditional',
        jurisdiction: 'India'
      },
      events: [
        {
          id: 'ev-1',
          timestamp: '2026-09-06T10:30:00Z',
          title: 'Query Submitted & Case Created',
          description: 'User initiated AI inquiry regarding polyherbal formulation patentability.',
          actor: 'user',
          status: 'SUBMITTED'
        },
        {
          id: 'ev-2',
          timestamp: '2026-09-06T10:31:00Z',
          title: 'Source Grounding & AI Guidance Prepared',
          description: 'Retrieved Section 3(p) Patents Act 1970 and TKDL cross-references.',
          actor: 'system',
          status: 'SUBMITTED'
        },
        {
          id: 'ev-3',
          timestamp: '2026-09-06T11:00:00Z',
          title: 'Human Review Requested by User',
          description: 'Escalation triggered due to moderate confidence on synergistic novelty claims.',
          actor: 'user',
          status: 'ASSIGNED'
        },
        {
          id: 'ev-4',
          timestamp: '2026-09-07T09:20:00Z',
          title: 'Expert Review In Progress',
          description: 'Assigned to Traditional Knowledge / Patent Specialist Dr. V. Sharma.',
          actor: 'expert',
          status: 'IN_REVIEW'
        }
      ]
    },
    {
      id: 'IPS-1018',
      title: 'Biodiversity Act ABS clearance for Himalayan Kutki export',
      query: 'Do I need NBA / State Biodiversity Board approval for commercial herbal extraction?',
      domain: 'ABS / Biological Resources',
      jurisdiction: 'India',
      status: 'REVIEW_COMPLETED',
      createdAt: '2026-08-28T09:00:00Z',
      updatedAt: '2026-09-02T16:00:00Z',
      confidenceLevel: 'high',
      escalated: true,
      assignedExpertCategory: 'ABS & Biodiversity Regulatory Expert',
      assignedExpertName: 'Adv. M. Sundaram',
      expertReview: {
        expertName: 'Adv. M. Sundaram',
        expertRole: 'National Biodiversity Authority Legal Counsel (Empanelled)',
        completedAt: '2026-09-02T16:00:00Z',
        summary: 'Commercial utilization of wild-sourced Picrorhiza kurrooa from Himachal Pradesh requires prior intimation to State Biodiversity Board under Section 7 of the Biological Diversity Act, 2002.',
        observations: [
          'The formulation uses biological resources sourced within India for commercial production.',
          'Indian entities are required to submit Form I intimation to Himachal Pradesh State Biodiversity Board (SBB).',
          'Benefit sharing fee ranges from 0.1% to 0.5% of annual gross ex-factory sales value.'
        ],
        recommendedAction: 'File Form I with HP State Biodiversity Board prior to initiating commercial batch manufacturing. Retain raw material procurement invoices.',
        references: ['Biological Diversity Act, 2002 (Sections 3, 7, 24)', 'NBA Access & Benefit Sharing Guidelines (Gazette Notification 2014)'],
        riskNotes: 'Failing to give prior intimation before commercial scale-up constitutes a cognizable offense under Section 55.'
      },
      events: [
        { id: 'ev-b1', timestamp: '2026-08-28T09:00:00Z', title: 'Case Created', description: 'ABS inquiry logged', actor: 'user', status: 'SUBMITTED' },
        { id: 'ev-b2', timestamp: '2026-08-28T14:00:00Z', title: 'Assigned to ABS Expert', description: 'Assigned to Adv. M. Sundaram', actor: 'system', status: 'ASSIGNED' },
        { id: 'ev-b3', timestamp: '2026-09-02T16:00:00Z', title: 'Expert Guidance Delivered', description: 'Final legal opinion provided to user', actor: 'expert', status: 'REVIEW_COMPLETED' }
      ]
    },
    {
      id: 'IPS-1009',
      title: 'Trademark distinctiveness for classical Ayurvedic Taila formulation',
      query: 'Can I trademark "Maha Narayan Taila" for my brand?',
      domain: 'Trademark',
      jurisdiction: 'India',
      status: 'CLOSED',
      createdAt: '2026-08-15T11:20:00Z',
      updatedAt: '2026-08-16T15:00:00Z',
      confidenceLevel: 'high',
      escalated: false,
      events: [
        { id: 'ev-c1', timestamp: '2026-08-15T11:20:00Z', title: 'Guidance Generated', description: 'Section 9 Trademark Act descriptive check provided', actor: 'system', status: 'CLOSED' }
      ]
    }
  ],
  addCase: (newCase) => set((state) => ({ cases: [newCase, ...state.cases] })),
  updateCase: (caseId, updates) =>
    set((state) => ({
      cases: state.cases.map((c) => (c.id === caseId ? { ...c, ...updates } : c))
    })),

  notifications: [
    {
      id: 'notif-1',
      caseId: 'IPS-1024',
      title: 'Human Review in Progress',
      message: 'Your case IPS-1024 has been assigned to Dr. V. Sharma (Senior IP Facilitator).',
      timestamp: '2 hours ago',
      read: false,
      type: 'review'
    },
    {
      id: 'notif-2',
      caseId: 'IPS-1018',
      title: 'Expert Guidance Complete',
      message: 'Adv. M. Sundaram completed the ABS regulatory review for your case.',
      timestamp: 'Yesterday',
      read: true,
      type: 'success'
    }
  ],
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    }))
}));
