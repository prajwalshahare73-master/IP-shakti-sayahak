# IP-SAKTI Sahayak — Frontend Implementation Plan

A complete, production-quality React + Vite frontend built from the Combined Master PRD (Parts A, B, C).

## Background

IP-SAKTI Sahayak is a multilingual, government-style public-service portal for Ayurveda IP and regulatory guidance. It combines a public-facing portal (Part A), a user multilingual dashboard (Part B), and a protected expert review portal (Part C) — all integrated with an n8n/FastAPI RAG backend and Supabase persistence.

---

## User Review Required

> [!IMPORTANT]
> **Backend Integration:** The PRD references an n8n webhook and FastAPI RAG backend. Since no live backend URL has been provided, the frontend will be built with a **mock service layer** that mirrors the exact JSON contract specified in the PRD. You can swap in real endpoints by updating a single `api.config.ts` file.

> [!IMPORTANT]
> **Logo Asset:** The PRD requires a user-supplied IP-SAKTI logo. If you have a logo file, please share it. Otherwise, I will generate a placeholder logo image using the brand identity specified in the PRD that can be replaced later.

> [!IMPORTANT]
> **Supabase Credentials:** Part B and C require Supabase for user/case/expert data. If you have a Supabase project URL and anon key, please share them. Otherwise, I'll build with a mock Supabase client that can be activated by adding credentials to `.env`.

> [!WARNING]
> **Scope:** This is a large, multi-part frontend. I will build in priority order (MVP Core → Dashboard → Expert Portal) and the build will be done incrementally with review checkpoints.

---

## Open Questions

> [!NOTE]
> 1. Do you have a Supabase project already set up, or should I include the schema SQL as part of the deliverables?
> 2. Do you have an n8n webhook URL to connect to, or should I use mock responses for now?
> 3. Do you have the IP-SAKTI logo file to use?
> 4. Should this be deployable to Vercel/Netlify (static hosting) or is a Node server expected?

---

## Proposed Changes

### Phase 1 — Project Foundation

#### [NEW] Project scaffold (`c:/Users/HP/Downloads/IP SAHKTI SAHAYAK 1.0/`)

Using `create-vite` with React + TypeScript template. Project directory structure:

```
ip-sakti-sahayak/
├── public/
│   ├── logo.png          ← user-supplied or generated
│   └── favicon.ico
├── src/
│   ├── i18n/             ← translation files
│   │   ├── en.json
│   │   ├── hi.json
│   │   ├── sa.json
│   │   ├── gu.json
│   │   ├── te.json
│   │   ├── kn.json
│   │   ├── mr.json
│   │   └── bn.json
│   ├── design/
│   │   └── tokens.css    ← all CSS design tokens
│   ├── components/
│   │   ├── layout/       ← Header, UtilityBar, Footer, Breadcrumbs
│   │   ├── shared/       ← LanguageSwitcher, VoiceInput, ConfidenceCard, CitationCard
│   │   └── ui/           ← Button, Card, Badge, StatusBadge, Input, Select
│   ├── pages/
│   │   ├── home/
│   │   ├── ask/
│   │   ├── answer/
│   │   ├── classification/
│   │   ├── prior-art/
│   │   ├── abs/
│   │   ├── tk/
│   │   ├── patent/
│   │   ├── trademark/
│   │   ├── gi/
│   │   ├── copyright/
│   │   ├── design-protection/
│   │   ├── regulatory/
│   │   ├── sources/
│   │   ├── help/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── dashboard/    ← Part B (user dashboard)
│   │   └── expert/       ← Part C (expert portal)
│   ├── store/            ← Zustand state (language, jurisdiction, query, caseProfile, answer)
│   ├── services/         ← API layer (mockable, real endpoints via config)
│   │   ├── api.config.ts
│   │   ├── ask.service.ts
│   │   ├── cases.service.ts
│   │   └── expert.service.ts
│   ├── hooks/            ← useLanguage, useJurisdiction, useVoiceInput
│   └── App.tsx
├── .env.example
├── index.html
├── vite.config.ts
└── package.json
```

---

### Phase 2 — Design System

#### [NEW] `src/design/tokens.css`

Implements all PRD-specified design tokens:
- Colors: Primary Blue `#1d5f9f`, Secondary Green `#2e7d32`, Accent Amber `#f59e0b`, and all state/semantic tokens
- Typography: Noto Sans (via Google Fonts), Devanagari-aware sizing (16px min body, 1.6 line-height)
- Spacing: 4px grid system (4–80px)
- Radii: Buttons/Inputs 6px, Cards 8px, Modals 8px, Pills 999px, Chat panels 12px
- Minimum tap target: 48px

#### [NEW] `src/i18n/` — Translation files (8 languages + Hinglish mode)

All static UI strings for:
- Navigation, headings, buttons, placeholders, help text, status labels, errors, form labels, footer, notifications

Implemented via **i18next** with React binding.

---

### Phase 3 — Global Layout Components

#### [NEW] `src/components/layout/UtilityBar.tsx`
Top bar: Accessibility skip link, Language, Help.

#### [NEW] `src/components/layout/Header.tsx`
- Desktop: Logo + brand name (IP शक्ति सहायक / IP-SAKTI Sahayak) + main nav + Language dropdown + Search
- Mobile: Logo + Search icon + Hamburger menu
- India Post-inspired government-style header pattern

#### [NEW] `src/components/layout/Footer.tsx`
Brand name, utility links (About, Accessibility, Privacy, Terms, Sources, Help, Contact), language switch row, AI disclaimer.

#### [NEW] `src/components/layout/Breadcrumbs.tsx`
Contextual breadcrumb trail on all inner pages.

#### [NEW] `src/components/shared/LanguageSwitcher.tsx`
Dropdown for 8 languages + Hinglish. Instant UI language switch via i18next, persisted to localStorage + Supabase profile.

#### [NEW] `src/components/shared/JurisdictionSwitcher.tsx`
Compact switcher: India / International / India + International. Visible on answer screens.

#### [NEW] `src/components/shared/VoiceInputField.tsx`
Reusable mic input component (Web Speech API): Idle → Listening → Processing → Text Inserted. Attached to all natural-language input fields.

---

### Phase 4 — Core Pages (Part A MVP)

#### [NEW] `src/pages/home/` — Homepage

Sections in order:
1. **Hero** — "Protect Your Ayurveda Innovation" heading + main AskBox + mic icon
2. **Suggested Questions** — 3–5 clickable example queries (multilingual)
3. **Explore IP & Regulatory Services** — 8-card grid (Patent, TM, GI, Copyright, Design, TK, ABS, Regulatory)
4. **Not Sure Where to Start?** — CTA → Classify My Product
5. **Important IP & Regulatory Updates** — tabbed (All / Patent / Regulatory / AYUSH / Biodiversity / TK)
6. **Trusted Official Sources** — source logos/names with "View Source" links
7. **How IP-SAKTI Works** — 6-step explainer
8. **Need Human Help?** — escalation CTA

#### [NEW] `src/pages/ask/` — `/ask` route

- Question text area + mic
- Suggested questions
- Recent questions list
- Jurisdiction selector visible
- Submits to API service → transitions to Answer page

#### [NEW] `src/pages/answer/` — AI Answer View

Two-column desktop layout (Answer | Sources panel):
- **AnswerSummary** — Direct answer card
- **WhySection** — Expandable "Why am I getting this answer?"
- **PracticalMeaning** — "What this means for you" checklist
- **SourcesPanel** — Citation cards with source hierarchy (Primary → Guidance → Evidence → Research)
- **ConfidenceCard** — Medium/High/Low label with reasons (no fake percentages)
- **WarningCard** — Limitations / disclaimer
- **NextStepCard** — Primary CTA button
- **CaseContext** — Compact profile sidebar (Product / Purpose / Jurisdiction / Route)
- **SafeAbstentionView** — When `abstained=true`: "We couldn't answer this confidently" with missing info list
- **ClarificationFlow** — When `needs_clarification=true`: radio-button follow-up questions
- **LoadingState** — Step-by-step progress: "Understanding your question ✓ → Finding route ✓ → Checking sources... → Preparing guidance..."

#### [NEW] `src/pages/classification/` — Product Classification Wizard

5-step guided flow (Product → Purpose → Ingredients → Jurisdiction → Result). Step indicators, back/continue buttons, mobile-optimized single-question-per-step.

#### [NEW] `src/pages/prior-art/` — `/prior-art`
Search box + filters (jurisdiction, date, tech, source). Result cards with relevance explanation.

#### [NEW] `src/pages/abs/` — `/abs`
"Check ABS Requirement" guided path (6 steps). Guidance + sources + next step output.

#### [NEW] `src/pages/tk/` — `/tk`
TK explainer + TK guidance + prior-art context + Ask a TK question.

#### [NEW] IP Category Pages — `/patent`, `/trademark`, `/gi`, `/copyright`, `/design`
Each with hero, primary action buttons, brief explainer, relevant sources, and Ask a Question CTA.

#### [NEW] `src/pages/regulatory/` — `/regulatory`
Guided classification → Compliance Guidance → ABS Check → Sources. Primary CTA: "Start Classification."

#### [NEW] `src/pages/sources/` — `/sources`
Structured document table (Source | Type | Jurisdiction | Status | Version | Action). Filters: source type, jurisdiction, IP domain, current/archived, language, date.

#### [NEW] `src/pages/help/` — `/help`
Categorized FAQ: Getting Started, IP (Patent/TM/GI/Copyright/Design), Ayurveda (Classification/TK/ABS), AI & Trust, Support.

---

### Phase 5 — User Dashboard (Part B)

#### [NEW] `src/pages/dashboard/` — `/dashboard`

Protected route (requires user login).

Components:
- **DashboardOverview** — 4 summary cards: My Questions / Active Cases / Human Reviews / Pending Actions
- **WelcomeBar** — "Namaste, [Name]. Here is the current status…"
- **QuestionList** — Searchable list of previous questions with filters (language, domain, jurisdiction, status, date)
- **CaseList** — Filtered view (All / Active / In Review / Need Info / Completed / Closed)
- **CaseCard** — Case ID, title, domain, jurisdiction, status, confidence indicator, last updated, Next Action CTA
- **HumanReviewSection** — Dedicated area for escalated cases
- **HumanReviewCard** — Why escalated, expert category, status progress (● Submitted ● Expert Assigned ● In Review ○ Completed)
- **CaseTimeline** — Vertical timeline with timestamps
- **InformationSharedPanel** — Transparency view of what was sent to expert
- **AIvsHumanGuidance** — Visually separated blocks (labeled "AI-generated guidance" vs "Reviewed by authorized human expert")
- **AdditionalInfoForm** — When expert requests info: question + mic + submit
- **NotificationCenter** — Bell icon with notification list, all localized
- **SavedSources** — Saved source references from previous answers
- **ProfileSettings** — Display name, preferred UI lang, preferred response mode, notification prefs

#### [NEW] User Auth flow (`/login`, `/register`)
Simple email/password auth via Supabase Auth. Session management with React state + Supabase listener.

---

### Phase 6 — Expert Portal (Part C)

#### [NEW] `src/pages/expert/` — Protected expert routes

- **`/expert/login`** — Separate login page (role-aware)
- **`/expert/dashboard`** — Expert case dashboard: Open / Pending / In Review / Returned / Completed sections with priority/confidence/aging indicators
- **`/expert/cases/:caseId`** — Expert Case Detail:
  - Original question (exact user text)
  - System Understanding (language, jurisdiction, intent, IP type, product context)
  - Case Builder Context (user answers)
  - AI Guidance (clearly labeled "AI-generated")
  - Evidence (retrieved sources, citations, passages)
  - Claim Verification (Supported / Unsupported / Unverified)
  - Why Human Review (escalation trigger explanation)
  - **Expert Actions:** Accept AI Guidance / Modify / Request More Information / Reject / Escalate to Senior
  - **Expert Review Form:** Summary, Observations, Recommended Action, Additional Reference, Risk Notes, Internal-only notes (never shown to user)
  - Submission confirmation modal

#### [NEW] `src/services/expert.service.ts`
All expert API endpoints: assign, review, request-info, submit review, get dashboard.

---

### Phase 7 — State Management & Services

#### [NEW] `src/store/appStore.ts` — Zustand store

```
language / responseLanguage / jurisdiction /
query / conversationId / caseProfile / intent / ipType /
clarificationQuestions / answer / summary / why /
citations / confidence / warnings / nextSteps /
loading / error / abstained
```

#### [NEW] `src/services/api.config.ts`
Central config: `VITE_API_BASE_URL`, `VITE_N8N_WEBHOOK_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
Mock mode flag: when no URL provided, returns fixture responses matching PRD JSON schema.

#### [NEW] `src/services/ask.service.ts`
- `POST /ask` → structured response: `{ answer, summary, why, jurisdiction, ip_type, confidence, citations, warnings, next_steps, needs_clarification, abstained }`

#### [NEW] `src/services/cases.service.ts`
- `POST /v1/cases`, `GET /v1/cases/:caseId`, `POST /v1/cases/:caseId/escalate`, `GET /v1/cases/:caseId/timeline`, `POST /v1/cases/:caseId/additional-info`

---

### Phase 8 — Internationalization

#### [NEW] i18next setup
- Language detection (localStorage → browser)
- 8 language JSON files with all translation keys for: nav, pages, buttons, forms, status labels, errors, empty states, notifications
- Hinglish handled as response-language mode, not full UI translation
- No hardcoded UI strings in components

---

### Phase 9 — Responsive & Accessibility

- **WCAG 2.1 AA**: 4.5:1 text contrast, 3:1 large text, visible focus ring (yellow `#ffdd00`), keyboard navigation, semantic HTML, aria-labels on icon buttons, 16px minimum body, 48px tap targets, no color-only status
- **Breakpoints:** Desktop ≥1024px (full nav, side-by-side answer+sources, 3–4 card columns), Tablet 768–1023px (hamburger, 2 columns), Mobile ≤767px (single column, bottom sheets, full-width buttons)
- Devanagari/Hindi/Sanskrit rendering validated (Noto Sans, 16px min, 1.6 line-height)

---

### Phase 10 — Visual Polish

- Noto Sans loaded from Google Fonts
- Subtle entrance animations (fade/slide) — functional only, no excessive animation
- Hover/focus states on all interactive elements
- India Post-style government identity in header without copying India Post branding
- No decorative seals, fake partner logos, or government affiliation claims

---

## Verification Plan

### Automated
- `npm run build` — TypeScript compilation, no errors
- `npm run lint` — ESLint clean
- Vite dev server starts: `npm run dev`

### Manual Verification
1. **Homepage flow:** Load → hero visible → suggested question clicked → Ask page opened → mock response rendered
2. **Language switch:** Switch to Hindi → all nav/labels/buttons update → navigate to another page → language persists
3. **Answer screen:** View answer + why section + source cards + confidence card + next step CTA
4. **Classification wizard:** Complete 5 steps → guidance path shown
5. **Safe abstention:** Trigger abstention state → "We couldn't answer" screen shown
6. **Dashboard:** Login → overview cards → case card → timeline → AI vs human guidance panels
7. **Expert portal:** Expert login → dashboard → open case → submit review → user dashboard status updates
8. **Mobile:** All above flows on mobile viewport (375px)
9. **Accessibility:** Tab navigation through all pages; focus ring visible; screen reader labels present

---

## Build Order

```
1.  Project scaffold (Vite + React + TS)
2.  Design tokens CSS
3.  i18n setup (i18next + 8 language files)
4.  Zustand store
5.  API service layer (mock mode)
6.  Global Layout (UtilityBar, Header, Footer, Breadcrumbs)
7.  Shared components (LanguageSwitcher, JurisdictionSwitcher, VoiceInput, ConfidenceCard, CitationCard, StatusBadge)
8.  Homepage (all sections)
9.  Ask Page + Loading State
10. Answer View (full answer structure)
11. Clarification Flow
12. Safe Abstention State
13. Product Classification Wizard
14. IP Category Pages (Patent, TM, GI, Copyright, Design)
15. ABS, TK, Prior Art, Regulatory pages
16. Sources Page
17. Help Page
18. User Auth (Supabase login/register)
19. User Dashboard (all sections)
20. Expert Portal (login, dashboard, case detail, review form)
21. Notifications + Audit trail display
22. Responsive polish
23. Accessibility audit
24. Final visual polish
```

---

## Tech Stack (confirmed from PRD)

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Vanilla CSS with CSS custom properties (design tokens) |
| Routing | React Router v6 |
| Internationalization | i18next + react-i18next |
| State | Zustand |
| Backend/API | REST (Fetch) with mock service layer |
| Auth + DB | Supabase (Auth + PostgreSQL) |
| Voice Input | Web Speech API (`SpeechRecognition`) |
| Accessibility | Semantic HTML + ARIA |

> [!NOTE]
> The PRD suggests "Tailwind CSS or CSS Modules" but per your workspace standards, **Vanilla CSS with design tokens** will be used. This gives full control over the government-style aesthetic without utility-class overhead and avoids Tailwind version decisions. If you prefer Tailwind, please let me know.
