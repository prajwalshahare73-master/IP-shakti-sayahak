# IP-SAKTI Sahayak — Combined Frontend PRD Master Document
## (Frontend PRD + User Multilingual Dashboard PRD + Human Expert Review & Case Escalation Add-on PRD)

**Combined Document Version:** 1.0 (Merged, No Content Changes)
**Product:** IP-SAKTI Sahayak
**Document Type:** Combined Frontend Product Requirements Document (Master)
**Included Source Documents (in order, content unchanged):**
1. IP-SAKTI Sahayak — Frontend PRD (v1.0)
2. IP-SAKTI Sahayak — User Multilingual Dashboard PRD (v1.0)
3. IP-SAKTI Sahayak — Human Expert Review & Case Escalation Add-on PRD (v1.0)

> This is a structural merge only. No wording, requirement, specification, color token, flow, or section content from any of the three source PRDs has been altered, summarized, or removed. Each original document is preserved in full under its own Part below, exactly as authored.

---

## Master Table of Contents

- **PART A — Frontend PRD**
  (Product vision, design system, site structure, header/navigation, language system, core user flows, MVP screens, implementation order, Antigravity build instructions)

- **PART B — User Multilingual Dashboard PRD**
  (User dashboard objective, question/case/status tracking, expert review linkage, multilingual dashboard UX)

- **PART C — Human Expert Review & Case Escalation Add-on PRD**
  (Human-in-the-loop escalation flow, domain-based expert routing, case creation, final expert guidance delivery)

---



================================================================================

# PART A — IP-SAKTI SAHAYAK: FRONTEND PRD

---

# IP-SAKTI Sahayak — Frontend PRD
## Government-Style, User-Centric, Multilingual Ayurveda IP & Regulatory Portal

**Document Version:** 1.0  
**Product:** IP-SAKTI Sahayak  
**Document Type:** Frontend Product Requirements Document (PRD)  
**Primary Reference:** India Post website  
**Primary Brand:** IP-SAKTI Sahayak / IP शक्ति सहायक  
**Primary Languages:** English, Hindi, Sanskrit  
**Additional Response Style:** Hinglish  
**Frontend Goal:** Make complex Ayurveda IP, Traditional Knowledge, ABS, prior-art and regulatory guidance easy to discover, understand and act on.

---

# 1. Product Vision

IP-SAKTI Sahayak is a public-service-style web portal that helps Ayurveda innovators, practitioners, startups, researchers and other users navigate Intellectual Property and related regulatory questions.

The frontend must feel like a **trusted government information/service portal**, inspired by the information architecture and usability patterns of India Post, but it must remain a distinct IP-SAKTI brand.

The product should not look like a generic AI chatbot.

The desired experience is:

> **User has a problem → describes it in simple language → system guides the user → relevant evidence is retrieved → answer is explained simply → sources are shown → confidence/limitations are communicated → user receives a clear next action.**

---

# 2. Primary Product Problem

Users working with Ayurveda often do not know which route is relevant to their problem.

A single question such as:

> “Meri Ayurvedic herbal formulation ko market karna hai, patent bhi lena hai. Mujhe kya karna chahiye?”

may involve several areas:

- Patent
- Prior Art
- Traditional Knowledge
- TKDL references
- ABS / Biodiversity
- Trademark
- Regulatory classification
- Product-specific compliance

The frontend must therefore help users **find the right path without requiring prior knowledge of legal terminology**.

---

# 3. Frontend Product Principle

The interface follows:

> **TASK FIRST, FEATURE SECOND.**

Do not force users to think:

> “Which legal category should I choose?”

Instead let them think:

> “My problem is this. What should I do?”

Core principle:

```text
USER PROBLEM
     ↓
SIMPLE INPUT
     ↓
GUIDED PATH
     ↓
EVIDENCE-BACKED RESULT
     ↓
CLEAR NEXT ACTION
```

---

# 4. Reference Design Direction — India Post

The India Post website is used as the primary **government/public-service UX reference**, not as a visual copy.

The reference patterns to adopt are:

- government-style identity/header;
- prominent language selection;
- prominent search;
- service-first homepage;
- clear service categories;
- announcement/update area;
- structured content sections;
- breadcrumbs;
- document/source listing;
- help/grievance style contact area;
- performance/information blocks;
- footer with official-style utility links;
- clear separation of services and information.

India Post currently combines government identity, accessibility links, a prominent search prompt, updates, helpline/grievance information, service/scheme discovery and a performance dashboard on its homepage. citeturn156345view0

Its sitemap also groups content into Ministry, Online Services, Offerings, Schemes & Services, Resources and other government-oriented information areas, which is a useful information-architecture reference for IP-SAKTI. citeturn156345view1

The India Post official-language area also demonstrates a structured document table with title, category, date, format and action/version controls, which should inform the IP-SAKTI Sources/Knowledge Base UI. citeturn156345search0

### Important

Do **not** copy:

- India Post logo;
- India Post exact branding;
- Government of India emblem without authorization;
- exact layouts pixel-for-pixel;
- proprietary illustrations or imagery;
- wording that implies official government ownership/endorsement.

Use the **design pattern**, not the identity.

---

# 5. Brand Identity

## Product Name

### English
**IP-SAKTI Sahayak**

### Hindi
**IP शक्ति सहायक**

Suggested supporting line:

> Ayurveda IP & Regulatory Guidance Made Simple

The user's supplied logo asset will be used in the header, favicon/brand area and selected brand surfaces.

### Logo handling

Frontend implementation must allow:

- user-provided logo image;
- SVG/PNG support;
- responsive logo sizing;
- light/dark background variants if supplied;
- accessible alt text;
- favicon.

Do not hardcode a substitute logo when the real project logo is available.

---

# 6. Visual Design System

## 6.1 Primary Colors

Use the previously approved IP-SAKTI palette.

| Token | Hex | Primary Usage |
|---|---|---|
| Primary Blue | `#1d5f9f` | Header, primary CTA, active navigation, links |
| Secondary Green | `#2e7d32` | Ayurveda identity, positive states, supportive actions |
| Accent Amber | `#f59e0b` | Warnings, attention, important notices |
| Background | `#ffffff` | Main page background |
| Surface | `#f8f9fa` | Cards, panels, light sections |
| Text Primary | `#0b0c0c` | Main text |
| Text Secondary | `#505a5f` | Supporting text |
| Border | `#cecece` | Form/card borders |
| Hover Blue | `#164a7a` | Hover state |
| Active Blue | `#0f3d5c` | Active/pressed state |
| Focus | `#ffdd00` | Keyboard focus |
| Success | `#0f7a52` | Positive/verified state |
| Error | `#ca3535` | Error |
| Info | `#1d5f9f` | Information |

### Color usage rule

The visual hierarchy should feel:

> **Government professional + Ayurveda-aware + modern digital service**

Avoid making it look:

- overly green;
- overly decorative;
- overly colorful;
- like a wellness/ayurvedic ecommerce site;
- like a generic AI SaaS dashboard.

---

# 7. Typography

Primary typeface:

**Noto Sans**

Fallback:

`system-ui, sans-serif`

Hierarchy:

| Type | Size | Weight |
|---|---:|---:|
| Display | 40px | 700 |
| H1 | 32px | 700 |
| H2 | 24px | 600 |
| H3 | 20px | 600 |
| Body | 16px | 400 |
| Small | 14px | 400 |
| Labels | 14px | 500 |
| Buttons | 16px | 500 |
| Navigation | 16px | 500 |
| Citations | 14px | 400 |

Hindi/Devanagari must remain legible at a minimum 16px body size with approximately 1.6 line height. fileciteturn3file2L154-L171

---

# 8. Shape & Spacing System

Use the approved design system:

### Radius

- Buttons: 6px
- Inputs: 6px
- Cards: 8px
- Modals: 8px
- Search: 8px
- Chat bubbles/panels: 12px
- Pills/badges: 999px

### Spacing

Use a 4px grid:

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80px`

Desktop page padding:

`32px`

Mobile page padding:

`16px`

Minimum primary interaction height:

`48px`

---

# 9. Design Language

The interface should visually communicate:

- trust;
- clarity;
- official/public-service quality;
- simplicity;
- evidence;
- accessibility;
- Indian context;
- Ayurveda relevance.

Avoid excessive:

- gradients;
- glassmorphism;
- floating neon effects;
- animation-heavy cards;
- oversized AI robot graphics;
- decorative 3D visuals;
- SaaS-style dashboard clutter.

Animations should be subtle and functional.

---

# 10. Global Site Structure

```text
HOME
│
├── ASK IP QUESTION
│
├── IP CATEGORIES
│   ├── Patent
│   ├── Trademark
│   ├── GI
│   ├── Copyright
│   ├── Design
│   ├── Traditional Knowledge
│   └── ABS / Biodiversity
│
├── REGULATORY GUIDANCE
│   ├── Product Classification
│   ├── Compliance Guidance
│   └── ABS Check
│
├── PRIOR ART
│
├── SOURCES
│
├── HELP
│
├── ABOUT
│
└── CONTACT / ESCALATION
```

---

# 11. Header Requirements

## Desktop Header

### Utility strip

Small top utility bar:

```text
Accessibility
Skip to Content
Language
Help
```

### Main brand header

```text
[LOGO]  IP शक्ति सहायक
        IP-SAKTI Sahayak
```

### Main navigation

```text
Home
Ask IP Question
IP Categories
Regulatory Guidance
Prior Art
Sources
Help
```

### Right-side actions

```text
[Language ▼]
[Search]
```

The India Post reference uses prominent government identity, accessibility links and a prominent search entry point, which should be adapted for IP-SAKTI. citeturn156345view0L5-L11

---

# 12. Mobile Header

```text
[LOGO]                         [🔍] [☰]
```

Under header:

- compact search;
- language access;
- menu drawer.

Mobile navigation must preserve the same information hierarchy.

---

# 13. Language System

## Supported UI Languages

MVP:

1. English
2. Hindi
3. Sanskrit

Optional conversational response mode:

4. Hinglish

### Important distinction

**UI Language** = complete interface language.

**Response Language** = language in which AI explains the answer.

MVP can link them together, but architecture should keep them separable for future expansion.

---

# 14. Language Switching Behaviour

Language selector:

```text
🌐 Language

English
हिंदी
संस्कृत
```

When user selects Hindi:

- navigation changes;
- headings change;
- button labels change;
- placeholders change;
- help text changes;
- error messages change;
- form labels change;
- source interface labels change;
- footer labels change.

The page should not require a full manual refresh.

Use frontend internationalization architecture such as:

```text
i18n
├── en.json
├── hi.json
└── sa.json
```

All static UI strings must use translation keys.

Do not hardcode interface text directly inside components.

---

# 15. Language Persistence

Store the selected language in:

- current application state;
- local storage/cookie as appropriate.

When user navigates:

```text
Home → Patent → Sources → Help
```

the language preference should remain active.

---

# 16. Homepage Objective

The homepage must answer three questions immediately:

### 1.
What is this website?

### 2.
What can it help me with?

### 3.
What should I do next?

---

# 17. Homepage Structure

```text
UTILITY BAR
↓
HEADER
↓
HERO + MAIN SEARCH
↓
SUGGESTED QUESTIONS
↓
EXPLORE IP SERVICES
↓
CLASSIFY YOUR PRODUCT
↓
IMPORTANT UPDATES
↓
TRUSTED SOURCES
↓
HOW IT WORKS
↓
NEED HUMAN HELP?
↓
FOOTER
```

---

# 18. Hero Section

## Heading

**Protect Your Ayurveda Innovation**

## Supporting line

> Get clear, source-backed guidance on Intellectual Property, Traditional Knowledge, biodiversity and regulatory requirements.

### Primary input

```text
Namaste! What can I help you with?

[ Ask about patents, trademarks, ABS, TK, regulation... ]

[ 🎤 ] [ ASK ]
```

India Post currently uses a prominent natural-language search prompt on the homepage; IP-SAKTI should use the same discoverability principle but with an IP/Ayurveda-specific query experience. citeturn156345view0L5-L11

---

# 19. Suggested Questions

Show 3–5 examples.

Examples:

- क्या मेरी Ayurvedic formulation patentable है?
- Do I need ABS compliance for my herbal product?
- Trademark register करने के लिए क्या चाहिए?
- How do I search prior art?
- Is this a traditional knowledge issue?

Clicking a suggestion should populate and submit the query.

---

# 20. "What Can I Help You With?" Service Section

Use India Post-style service discoverability.

Title:

**Explore IP & Regulatory Services**

Cards:

### Patent
Protect and assess your invention.

### Trademark
Understand brand protection.

### GI
Explore geographical indication guidance.

### Copyright
Understand creative-work protection.

### Design
Understand protection for product appearance.

### Traditional Knowledge
Explore TK-related guidance.

### ABS / Biodiversity
Understand potential biodiversity/benefit-sharing requirements.

### Regulatory Guidance
Classify your product and explore applicable requirements.

Each card has:

- icon;
- title;
- 1–2 line description;
- `Explore →`.

---

# 21. “Not Sure Where to Start?” Block

This is one of the highest-value areas.

Title:

**Not sure which IP or regulatory route applies?**

Description:

> Tell us about your Ayurveda product and we will guide you through the relevant path.

CTA:

**Classify My Product**

This is an important differentiator versus a normal information portal.

---

# 22. Product Classification Flow

## Step 1 — Product

```text
What are you developing?

[ Ayurvedic medicine ]
[ Herbal cosmetic ]
[ Food / Ayurveda Aahara ]
[ Wellness product ]
[ Traditional formulation ]
[ Other ]
```

## Step 2 — Purpose

```text
What is the primary purpose?

[ Treatment ]
[ Prevention ]
[ Wellness ]
[ Cosmetic ]
[ Food ]
[ Other ]
```

## Step 3 — Ingredient/resource context

```text
What does it contain?

[ Plant ]
[ Animal ]
[ Microbial ]
[ Mineral ]
[ Traditional ingredient ]
[ Unsure ]
```

## Step 4 — Jurisdiction

```text
Where will you operate?

[ India ]
[ International ]
[ Both ]
```

## Step 5 — Result

```text
YOUR GUIDANCE PATH

Likely areas to review:
• Regulatory classification
• IP protection
• ABS review

[ View Guidance ]
[ Ask a Question ]
```

Do not present the result as a definitive legal determination.

---

# 23. Ask IP Question Screen

Route:

`/ask`

## Layout

```text
← Back

Ask an IP Question

[ Write your question...                    ]
[ 🎤 ]                         [ ASK ]

Suggested questions
Recent questions
```

---

# 24. Question Input Requirements

Support:

- text;
- pasted text;
- Hindi;
- English;
- Hinglish;
- future speech input.

The user should not be required to choose an IP category before typing a question.

---

# 25. Smart Clarification Screen

If more information is needed:

```text
To guide you correctly, we need a little more information.

Is your formulation:

○ New
○ Traditional
○ Modified traditional
○ Not sure

[ Continue ]
```

Only ask questions necessary to improve the route.

Do not present a large multi-field legal form.

---

# 26. Jurisdiction Component

Global selector:

```text
Jurisdiction
[ 🇮🇳 India ▼ ]
```

Options:

- India
- International
- India + International

The chosen jurisdiction must be visible in the answer context.

Example:

```text
Guidance context: India
```

The underlying RAG pipeline requires jurisdiction-aware retrieval and validation. fileciteturn3file8L634-L660

---

# 27. Case Context

Show a compact case summary when enough information is known.

```text
CASE CONTEXT

Product
Ayurvedic Herbal Formulation

Purpose
Treatment

Jurisdiction
India

Current route
Patentability
```

Action:

`Edit details`

---

# 28. AI Result Screen

The result screen is the main trust-critical interface.

## Recommended desktop structure

```text
┌───────────────────────────────┬────────────────────────────┐
│                               │                            │
│        ANSWER                 │       SOURCES              │
│                               │                            │
│        WHY                    │       Source 1             │
│                               │       Source 2             │
│        WHAT IT MEANS          │       Source 3             │
│                               │                            │
│        NEXT STEP              │                            │
└───────────────────────────────┴────────────────────────────┘
```

On mobile the sections stack vertically.

---

# 29. Answer Structure

Every answer should try to render:

```text
1. Direct Answer
2. Why
3. What This Means for You
4. Sources
5. Confidence
6. Limitations / Warning
7. Next Step
```

---

# 30. Direct Answer Card

Example:

> Your formulation may require further patentability assessment. The outcome depends on the facts of the formulation and the applicable legal requirements.

The text should be easy to scan.

Use short paragraphs.

Avoid long legal blocks unless the user expands details.

---

# 31. Why Section

Expandable/collapsible:

```text
Why am I getting this answer?

• Reason 1
• Reason 2
• Reason 3
```

Purpose:

- transparency;
- explainability;
- user understanding.

---

# 32. What This Means for You

Convert complex evidence into practical user-facing interpretation.

Example:

```text
For your case:

✓ Review whether the formulation has already been disclosed.
✓ Check relevant prior art.
✓ Verify the exact formulation details.
```

Do not fabricate action items if backend evidence does not support them.

---

# 33. Source / Citation UX

Every material answer claim should be traceable to retrieved evidence.

Example in answer:

```text
The relevant patentability requirement is based on applicable provisions.[1]
```

Source card:

```text
PRIMARY SOURCE

Patents Act, 1970
Section XX
Page XX

Jurisdiction: India
Status: Current

[ Open Original Source ]
```

The RAG specification requires material claims to be traceable and source metadata to be available. fileciteturn3file8L646-L655

---

# 34. Source Hierarchy

Display evidence in this order:

## Primary Sources

- Acts
- Rules
- Regulations
- official notifications

## Official Guidance

- government guidelines;
- official procedures;
- official publications

## Official Records / Evidence

- registry records;
- examiner evidence;
- prior-art records

## Supporting Research

- academic research;
- background materials

Do not visually give a blog the same authority level as a statute.

---

# 35. Sources Page

Route:

`/sources`

The design can adapt India Post's structured document listing pattern.

Suggested columns:

| Source | Type | Jurisdiction | Status | Version | Action |
|---|---|---|---|---|---|
| Patents Act, 1970 | Act | India | Current | v— | View |
| Biodiversity Act | Act | India | Current | v— | View |
| AYUSH Guidelines | Guideline | India | Current | v— | View |
| Examiner Report | Evidence | India | — | v— | View |

The India Post official-language page uses a structured document-list format with title, category, date, size, format and actions/version links. citeturn156345search0

---

# 36. Source Filters

Filters:

- Source type
- Jurisdiction
- IP domain
- Current/archived
- Language
- Date/version

Search:

```text
Search official sources...
```

---

# 37. Confidence UX

Do not use misleading language such as:

> `98% Correct`

Instead:

```text
CONFIDENCE

Medium

Why:
✓ Relevant evidence found
✓ Jurisdiction matched
⚠ Some case-specific information is missing
```

Tooltip:

> This is source-based guidance, not a substitute for professional legal advice.

The existing UX specification specifically identifies confidence interpretation as a potential overtrust risk. fileciteturn3file5L374-L380

---

# 38. Safe Abstention UX

When evidence is insufficient:

```text
We couldn't answer this confidently.

There isn't enough reliable evidence
for your specific case.

Missing information:
• Product classification
• Jurisdiction
• Specific ingredient information

[ Provide More Details ]
```

Do not generate a confident guess.

Safe abstention is a required part of the frozen RAG architecture. fileciteturn3file8L657-L660

---

# 39. Next Step Component

Every useful answer should end with one primary action.

Examples:

```text
[ Check Prior Art ]
```

or

```text
[ Classify My Product ]
```

or

```text
[ View Relevant Sources ]
```

Secondary actions can include:

- Ask follow-up;
- change jurisdiction;
- contact support.

---

# 40. Prior Art Page

Route:

`/prior-art`

Purpose:

Enable users to search relevant prior-art content in the indexed corpus.

UI:

```text
Search Prior Art

[ Describe your invention... ]

[ Search ]
```

Filters:

- jurisdiction;
- date;
- technology;
- source.

Result card:

```text
Patent / Document Title

Relevant passage...

Why this is relevant

Jurisdiction
Publication date

[ View Document ]
```

Do not tell users:

> “No prior art exists.”

Use:

> “No highly relevant results were found in the current indexed sources.”

---

# 41. ABS / Biodiversity Page

Route:

`/abs`

Main CTA:

**Check ABS Requirement**

Guided path:

```text
Product
↓
Biological resource?
↓
Source/context
↓
Purpose
↓
Jurisdiction
↓
Guidance
↓
Sources
↓
Next Step
```

---

# 42. Traditional Knowledge / TK Page

Route:

`/tk`

Sections:

- What is Traditional Knowledge?
- Why it matters to Ayurveda
- TK-related guidance
- Prior-art context
- Source references
- Ask a TK question

Do not imply unrestricted access to restricted/proprietary TKDL data.

---

# 43. Patent Page

Route:

`/patent`

Primary actions:

```text
[ Check Patentability ]
[ Search Prior Art ]
[ Ask Patent Question ]
[ View Patent Sources ]
```

---

# 44. Trademark Page

Route:

`/trademark`

Primary actions:

```text
[ Trademark Guidance ]
[ Ask Trademark Question ]
[ View Sources ]
```

---

# 45. GI Page

Route:

`/gi`

Primary actions:

```text
[ GI Guidance ]
[ Ask GI Question ]
[ View Sources ]
```

---

# 46. Copyright Page

Route:

`/copyright`

Primary actions:

```text
[ Copyright Guidance ]
[ Ask a Question ]
```

---

# 47. Design Page

Route:

`/design`

Primary actions:

```text
[ Design Protection Guidance ]
[ Ask a Question ]
```

---

# 48. Regulatory Guidance Page

Route:

`/regulatory`

This page is a guided service, not just an information article.

Sections:

- Product Classification
- Compliance Guidance
- ABS Check
- Relevant Sources

Primary CTA:

**Start Classification**

---

# 49. Updates Section

Inspired by India Post's homepage Updates section.

India Post currently groups updates into categories such as News & Updates, Tenders and Recruitment and displays date-based notices with document/version information. citeturn156345view0L57-L139

For IP-SAKTI, adapt this to:

### Important IP & Regulatory Updates

Tabs:

```text
All
Patent
Regulatory
AYUSH
Biodiversity / ABS
Traditional Knowledge
```

Each item:

```text
DATE

Update title

Short description

[Read More]
```

---

# 50. Trusted Sources Section

Homepage:

```text
Trusted Official Sources

IP India
Ministry / AYUSH-related official sources
TK / Traditional Knowledge references
Biodiversity / ABS sources
Patent / registry sources

[ View All Sources ]
```

### Logo policy

Do not present another organization's logo in a way that implies:

- partnership;
- endorsement;
- ownership;
- official affiliation.

Use logos only where their usage is authorized or permitted by their official brand rules.

Otherwise use:

```text
OFFICIAL SOURCE
IP India
[ View Source ]
```

The source relationship should be explicit.

---

# 51. Human Help / Escalation

Section:

**Need Human Help?**

Description:

> Some decisions may require professional review.

Actions:

```text
[ Contact / Escalate ]
[ Help & FAQ ]
```

Purpose:

- prevent overreliance on AI;
- support complex cases;
- provide responsible next action.

---

# 52. Help / FAQ Page

Route:

`/help`

Categories:

### Getting Started
- What can I ask?
- How do I use the assistant?

### IP
- Patent
- Trademark
- GI
- Copyright
- Design

### Ayurveda
- Product classification
- Traditional knowledge
- ABS

### AI & Trust
- How does the assistant work?
- What are sources?
- What does confidence mean?
- When does the system abstain?

### Support
- Contact
- Escalation

---

# 53. Breadcrumbs

Use breadcrumbs on inner pages.

Examples:

```text
Home > IP Categories > Patent
```

```text
Home > Regulatory Guidance > Product Classification
```

```text
Home > Sources > Patents Act, 1970
```

India Post uses breadcrumb-style navigation in its internal page architecture; this is a useful pattern for reducing navigation confusion in a deep public-service website. citeturn156345view1L12-L31

---

# 54. Footer

Footer structure:

```text
IP शक्ति सहायक
IP-SAKTI Sahayak

About
Accessibility
Privacy
Terms
Sources
Help
Contact

Language
English | हिंदी | संस्कृत
```

Optional:

```text
AI guidance is based on retrieved sources.
It does not replace professional legal advice.
```

Do not display unsupported government affiliation statements.

---

# 55. Responsive Behaviour

## Desktop ≥1024px

- full navigation;
- prominent search;
- 3–4 cards per row;
- answer + sources side-by-side;
- multi-column forms where appropriate.

## Tablet 768–1023px

- compact/hamburger navigation;
- 2-column cards;
- answer and sources stacked;
- reduced-width forms.

## Mobile ≤767px

- logo + search + hamburger;
- single-column cards;
- full-width primary buttons;
- full-screen chat/answer experience;
- one major question per step;
- bottom-sheet selectors;
- sticky/compact search where useful.

These responsive rules are consistent with the existing IP-SAKTI UI system. fileciteturn3file1L66-L92

---

# 56. Accessibility

Target:

**WCAG 2.1 AA**

Requirements:

- minimum 4.5:1 text contrast;
- 3:1 large text/icon contrast;
- visible focus ring;
- keyboard navigation;
- semantic HTML;
- `aria-label` for icon buttons;
- minimum 16px body text;
- minimum 48px tap targets;
- inline form validation;
- no color-only status;
- language attributes.

These requirements are already part of the approved design system. fileciteturn3file4L264-L276

---

# 57. Image / Visual Requirements

The frontend should support user-provided visual assets.

Possible image slots:

### Hero
Subtle Ayurveda/IP visual, not a massive decorative banner.

### Service icons
Simple outline icons.

### Informational sections
Optional Ayurveda-related photography/illustration.

### Logo
User-provided project logo.

### Trusted-source area
Only use third-party logos if authorized.

Images must not overload the service-oriented layout.

The first version should prioritize utility over decorative imagery.

---

# 58. AI Chat UI Rules

Do not make the conversation look exactly like a consumer chatbot.

Prefer:

```text
Question
↓
Case Context
↓
Guidance
↓
Why
↓
Sources
↓
Confidence
↓
Next Step
```

This is an evidence-oriented assistant, not a casual chat product.

---

# 59. Frontend ↔ Backend Contract

Frontend should send structured request data.

Example:

```json
{
  "query": "Meri Ayurvedic formulation patentable hai?",
  "input_language": "hinglish",
  "response_language": "hindi",
  "jurisdiction": "India",
  "conversation_id": "abc123",
  "case_profile": {}
}
```

Backend may be implemented with n8n/FastAPI/RAG.

Frontend must not depend on backend internal implementation details.

---

# 60. n8n Webhook Flow

```text
FRONTEND
   ↓
POST WEBHOOK REQUEST
   ↓
n8n
   ↓
QUERY UNDERSTANDING
   ↓
RAG
   ↓
LLM
   ↓
CLAIM / CITATION CHECK
   ↓
CONFIDENCE
   ↓
STRUCTURED JSON
   ↓
FRONTEND
```

The frozen product integration plan explicitly combines FastAPI, frontend, n8n orchestration and structured JSON responses. fileciteturn3file8L616-L626

---

# 61. Expected Frontend Response Model

```json
{
  "answer": "...",
  "summary": "...",
  "why": [],
  "jurisdiction": "India",
  "ip_type": "Patent",
  "confidence": {
    "level": "medium",
    "reason": "..."
  },
  "citations": [],
  "warnings": [],
  "next_steps": [],
  "needs_clarification": false
}
```

If:

```text
needs_clarification = true
```

render the clarification flow.

If:

```text
abstained = true
```

render the safe-abstention state.

---

# 62. Frontend State Model

Core state:

```text
language
responseLanguage
jurisdiction

query
conversationId

caseProfile
intent
ipType
domain

clarificationQuestions

answer
summary
why
citations
confidence
warnings
nextSteps

loading
error
abstained
```

---

# 63. Component Architecture

```text
App
├── GlobalHeader
├── UtilityBar
├── LanguageSwitcher
├── JurisdictionSwitcher
├── GlobalSearch
│
├── HomePage
│   ├── Hero
│   ├── AskBox
│   ├── SuggestedQuestions
│   ├── ServiceGrid
│   ├── ClassificationCTA
│   ├── UpdatesSection
│   ├── TrustedSources
│   ├── HowItWorks
│   └── HumanHelp
│
├── AskPage
│   ├── QuestionInput
│   ├── ClarificationFlow
│   ├── CaseContext
│   └── AnswerView
│
├── AnswerView
│   ├── AnswerSummary
│   ├── WhySection
│   ├── PracticalMeaning
│   ├── SourcesPanel
│   ├── CitationCard
│   ├── ConfidenceCard
│   ├── WarningCard
│   └── NextStepCard
│
├── ClassificationPage
├── PriorArtPage
├── ABSPage
├── TKPage
├── IPCategoryPages
├── SourcesPage
├── HelpPage
├── AboutPage
├── ContactPage
└── Footer
```

---

# 64. Tech Stack

Recommended:

### Frontend
React + Vite

### Styling
Tailwind CSS or CSS Modules

### Routing
React Router

### Internationalization
i18next

### State
Zustand or React Context

### API
REST / Fetch / Axios

### Accessibility
Semantic HTML + ARIA + axe-core testing

The existing IP-SAKTI UI direction already recommends React, Tailwind/CSS Modules, i18next, Zustand/Context and accessibility tooling.

---

# 65. Loading States

Instead of only:

> Loading...

show meaningful progress:

```text
Understanding your question       ✓
Finding the relevant route         ✓
Checking available sources         ...
Preparing guidance                 ...
```

Do not expose internal retrieval terminology such as BM25, RRF or reranking to normal users.

---

# 66. Error States

### Generic error

> We couldn't process your request right now.

`[ Try Again ]`

### Retrieval problem

> We couldn't retrieve the required sources right now.

`[ Retry ]`

### Incomplete case

> We need a little more information to guide you.

`[ Continue ]`

### No sufficient evidence

Use the safe-abstention UI rather than a generic error.

---

# 67. Search Behaviour

Global search should support:

- natural-language questions;
- source search;
- IP topics;
- page navigation.

Example:

```text
Search IP-SAKTI
```

Results may be grouped:

```text
AI Guidance
Sources
IP Topics
Pages
```

Do not overwhelm users with dozens of results.

---

# 68. How It Works

Homepage block:

```text
How IP-SAKTI Works

1. Ask your question
2. We identify the relevant route
3. We check available evidence
4. We explain the answer
5. We show sources
6. We suggest the next step
```

Keep the explanation user-centric.

---

# 69. Trust Design

Trust must be communicated by:

- source citations;
- authority labels;
- jurisdiction;
- current status/version where available;
- confidence;
- limitations;
- transparent abstention;
- human escalation.

Do not rely only on government-style colors to create trust.

The RAG specification explicitly prioritizes grounded, traceable, jurisdiction-aware answers over generic conversational answers. fileciteturn3file9L740-L750

---

# 70. Do Not Design

Do not create:

- 20+ unnecessary screens;
- giant AI dashboard;
- complex profile system;
- feature-heavy homepage;
- excessive animations;
- unnecessary gamification;
- giant charts;
- decorative government seals;
- fake partner logos;
- fake official affiliation;
- unsupported legal conclusions.

---

# 71. MVP Core Screens

First implementation must prioritize:

```text
1. Homepage
2. Ask IP Question
3. Clarification Flow
4. AI Answer
5. Sources
6. Confidence / Abstention
7. Product Classification
8. Language Switching
9. n8n Integration
```

Secondary pages can follow.

---

# 72. Core User Flow

```text
HOME
 ↓
USER ENTERS QUESTION
 ↓
LANGUAGE + JURISDICTION
 ↓
n8n WEBHOOK
 ↓
QUERY UNDERSTANDING
 ↓
NEEDS CLARIFICATION?
 ├── YES → ASK FOLLOW-UP → CONTINUE
 └── NO
       ↓
    RAG / EVIDENCE
       ↓
       LLM
       ↓
 CLAIM / CITATION VALIDATION
       ↓
   CONFIDENCE
       ↓
     RESULT
       ↓
 ┌─────┼──────────────┐
 ▼     ▼              ▼
WHY   SOURCES      NEXT STEP
       ↓
   OPTIONAL
 HUMAN ESCALATION
```

The underlying RAG architecture follows query understanding, case profiling, retrieval, reranking, authority/version filtering, context building, LLM generation, citation verification, grounding, confidence and safe abstention. fileciteturn3file8L670-L718

---

# 73. Main Demo Journey

The recommended hackathon demo:

```text
HOME

User types:
"मेरी Ayurvedic herbal formulation patentable है?"

↓

System asks:
"Is this a new or traditional formulation?"

↓

User selects:
"New"

↓

Jurisdiction:
"India"

↓

Processing

↓

PATENTABILITY GUIDANCE

Direct Answer
Why
Sources
Confidence
Next Step

↓

[ Check Prior Art ]
```

This single flow demonstrates:

- Ayurveda;
- IP;
- AI;
- multilingual UX;
- guided workflow;
- RAG;
- citations;
- trust;
- actionable output.

---

# 74. MVP Differentiators

The frontend should make two differentiators visually obvious:

## Differentiator 1 — Problem-to-Route Guidance

The user does not need to know the correct IP category first.

## Differentiator 2 — Evidence + Trust

The result is not just an AI paragraph.

It provides:

```text
ANSWER
+
WHY
+
SOURCES
+
CONFIDENCE
+
NEXT STEP
```

---

# 75. User Experience Quality Bar

A first-time user should be able to:

1. understand what IP-SAKTI does within seconds;
2. ask a question without understanding legal terminology;
3. understand which route the system is taking;
4. read the answer without legal expertise;
5. find the supporting source;
6. understand confidence and limitations;
7. know what to do next.

---

# 76. Frontend Success Criteria

The implementation is acceptable when:

### Discoverability
A first-time user can find the Ask flow immediately.

### Simplicity
The user can start without knowing IP terminology.

### Navigation
Users understand where they are and how to return.

### Multilingual
The UI can switch between English, Hindi and Sanskrit consistently.

### Evidence
Important claims expose supporting sources.

### Trust
Confidence and limitations are understandable.

### Safety
Insufficient evidence does not produce a confident legal conclusion.

### Actionability
Every meaningful answer includes a practical next step.

### Responsive
The core flow works on mobile, tablet and desktop.

### Integration
Frontend can receive structured n8n/backend responses and render them reliably.

---

# 77. Implementation Order

Build in this order:

```text
1. Project shell + routing
2. Design tokens
3. Header + language system
4. Homepage
5. Ask Question
6. n8n webhook integration
7. Structured response renderer
8. Sources / citations
9. Confidence / abstention
10. Clarification flow
11. Product classification
12. Responsive polish
13. Accessibility testing
14. Secondary pages
15. Visual polish
```

The goal is to make the main workflow work before expanding the website.

---

# 78. Antigravity Implementation Instructions

When this PRD is handed to an AI coding agent:

### First
Inspect the current project before changing anything.

### Second
Do not rebuild backend/RAG architecture.

### Third
Implement the frontend around the structured API response.

### Fourth
Use the supplied logo/image assets when available.

### Fifth
Use the exact IP-SAKTI color tokens in this PRD.

### Sixth
Use India Post only as a **UX/information-architecture reference**, never as a branding copy.

### Seventh
Build the homepage and Ask flow first.

### Eighth
Verify mobile + desktop before adding secondary pages.

### Ninth
Do not invent government affiliation.

### Tenth
Keep source citations, confidence and safe abstention visible and functional.

---

# 79. Final Product Experience

The final website should feel like:

> **A modern Indian public-service portal for Ayurveda IP and regulatory guidance.**

Not:

> a generic chatbot.

Not:

> an e-commerce Ayurveda website.

Not:

> a copy of India Post.

The intended character is:

**India Post-style public-service information architecture + IP-SAKTI branding + Ayurveda context + AI guidance + RAG evidence + multilingual accessibility.**

---

# 80. One-Line Frontend Product Definition

> **IP-SAKTI Sahayak is a multilingual, government-style public-service interface that turns a user's Ayurveda IP/regulatory problem into a simple guided journey, an evidence-backed explanation, transparent sources, confidence and a clear next action.**

---

# 81. Reference Basis

This PRD combines:

- India Post live website structure and service patterns;
- the existing IP-SAKTI UI/UX design system;
- the frozen IP-SAKTI RAG architecture;
- the project's multilingual, evidence-first and safe-abstention requirements.

India Post's live homepage currently demonstrates government identity, search, announcements, helpline/grievance, service discovery and performance/information sections. citeturn156345view0

The existing IP-SAKTI design system defines the approved colors, typography, navigation, components, accessibility and responsive behavior. fileciteturn3file0L13-L37 fileciteturn3file4L264-L276

The frozen RAG architecture defines the evidence, citation, confidence and abstention requirements that the frontend must expose appropriately. fileciteturn3file8L630-L666

---

# END OF PRD



================================================================================

# PART B — IP-SAKTI SAHAYAK: USER MULTILINGUAL DASHBOARD PRD

---

# IP-SAKTI Sahayak — User Multilingual Dashboard PRD

**Version:** 1.0  
**Product:** IP-SAKTI Sahayak  
**Document Type:** User Dashboard + Multilingual UX PRD  
**Status:** New Frontend Module  
**Primary Goal:** Give every user one place to track questions, cases, AI guidance, human reviews, status, sources and next actions in the user's selected language.

---

## 1. Product Objective

The IP-SAKTI user dashboard is the user's personal workspace after interacting with the assistant.

It should make the user's journey visible:

```text
QUESTION
   ↓
AI GUIDANCE
   ↓
CASE / REVIEW
   ↓
STATUS
   ↓
EXPERT REVIEW (when applicable)
   ↓
NEXT ACTION
```

The dashboard must not become a generic SaaS analytics dashboard. It should remain a public-service style, task-first interface.

---

## 2. Dashboard Goals

The user should be able to:

1. See recent questions and conversations.
2. See active and completed cases.
3. Track human-review requests.
4. See why a case was escalated.
5. See which expert category is involved.
6. See what information was shared.
7. Read AI guidance and supporting sources.
8. Read final human guidance separately.
9. Continue a case when more information is requested.
10. Change the entire dashboard language without reloading the page.
11. Use voice input wherever text entry is required.
12. Understand the next action immediately.

---

## 3. Dashboard Information Architecture

```text
MY DASHBOARD
│
├── Overview
├── My Questions
├── My Cases
│   ├── Active
│   ├── Waiting for Information
│   ├── Under Review
│   └── Completed
│
├── Human Reviews
├── Saved Sources
├── Notifications
├── Profile & Preferences
└── Language
```

Primary navigation may be simplified for mobile.

---

## 4. Government-Style Visual Direction

The dashboard should visually feel like a modern Indian public-service portal, inspired by the service clarity and structured information architecture of India Post while remaining a distinct IP-SAKTI brand.

Desired qualities:

- clear blue government-service style header
- strong page hierarchy
- white/surface cards
- restrained green secondary actions
- subtle accent highlights
- visible status labels
- clear borders
- readable typography
- generous whitespace
- no excessive glassmorphism
- no neon visual effects
- no unnecessary dashboard clutter

---

## 5. Approved Color Tokens

| Token | Value |
|---|---|
| Primary | `#1d5f9f` |
| Secondary | `#2e7d32` |
| Accent | `#f59e0b` |
| Background | `#ffffff` |
| Surface | `#f8f9fa` |
| Text Primary | `#0b0c0c` |
| Text Secondary | `#505a5f` |
| Border | `#cecece` |
| Hover | `#164a7a` |
| Active | `#0f3d5c` |
| Focus | `#ffdd00` |
| Success | `#0f7a52` |
| Warning | `#f59e0b` |
| Error | `#ca3535` |
| Info | `#1d5f9f` |

Status should never be communicated through color alone; pair color with text/icons.

---

## 6. Header and Large Logo

The supplied IP-SAKTI logo must be a visually important part of the dashboard header.

Requirements:

- use the real supplied logo asset;
- never replace it with a generic icon;
- preserve aspect ratio;
- use responsive sizing;
- never stretch or crop;
- maintain sufficient clear space;
- keep it recognizable on mobile;
- provide accessible alt text;
- maintain high-quality rendering.

Suggested desktop header:

```text
[ LARGE IP-SAKTI LOGO ]   IP शक्ति सहायक
                            IP-SAKTI Sahayak

Home | Ask | Cases | Sources | Help     🌐 Language
```

Mobile:

```text
[ LOGO ]                  [🌐] [☰]
```

---

## 7. Multilingual Dashboard — Core Requirement

The entire dashboard must dynamically change language based on the selected language.

This includes:

- navigation
- page titles
- cards
- buttons
- filters
- status labels
- forms
- placeholders
- notifications
- validation messages
- help text
- empty states
- source labels
- case labels
- human-review UI
- profile settings
- footer/utility text

No page refresh should be required for language switching.

---

## 8. Supported Languages

### Full UI Languages

1. English — `en`
2. Hindi — `hi`
3. Sanskrit — `sa`
4. Gujarati — `gu`
5. Telugu — `te`
6. Kannada — `kn`
7. Marathi — `mr`
8. Bengali — `bn`

### Conversational Response Mode

9. Hinglish — `hinglish`

Hinglish is treated primarily as a conversational response mode rather than a formal translated UI language. The architecture should still allow selected labels/help text to be localized where appropriate.

---

## 9. UI Language vs Response Language

Keep these concepts separate internally.

### UI Language

Controls the dashboard interface.

### Response Language

Controls the language in which AI guidance is generated.

Default behavior:

```text
User selects dashboard language
        ↓
UI switches to that language
        ↓
Response language may follow the same preference
        ↓
User can optionally choose a different response mode
```

This keeps the architecture flexible for future use.

---

## 10. Language Switcher

Use a highly visible language control:

```text
🌐 Language ▼

English
हिन्दी
संस्कृत
ગુજરાતી
తెలుగు
ಕನ್ನಡ
मराठी
বাংলা
Hinglish
```

After selecting a language:

- current screen updates immediately;
- navigation updates;
- dashboard cards update;
- status labels update;
- forms update;
- buttons update;
- notifications update;
- selected language remains active across navigation.

---

## 11. Language Persistence

Store the selected language in:

- application state;
- local storage/cookie as appropriate;
- user profile/preferences in Supabase when authenticated.

When the user navigates:

```text
Dashboard → Case → Human Review → Sources → Help
```

the selected language must remain active.

---

## 12. Internationalization Architecture

Recommended frontend architecture:

```text
i18n/
├── en.json
├── hi.json
├── sa.json
├── gu.json
├── te.json
├── kn.json
├── mr.json
└── bn.json
```

Hinglish response behavior should be handled separately from formal UI translation resources when necessary.

All static UI strings must use translation keys.

Do not hardcode user-facing dashboard labels directly inside React components.

---

## 13. Dashboard Overview

### Top Summary Cards

```text
My Questions        Active Cases
     12                  3

Human Reviews       Pending Actions
      2                  1
```

Cards should remain simple and service-oriented.

Do not turn the overview into a dense analytics screen.

---

## 14. Welcome / User Context

Example:

```text
Namaste, Prajwal

Here is the current status of your IP-SAKTI cases and questions.
```

Avoid unnecessary personal data display.

---

## 15. Active Case Card

Each active case should provide:

- Case ID
- Short title
- Domain/IP type
- Jurisdiction
- Current status
- Confidence indicator, when relevant
- Human review state, when relevant
- Last updated
- Next action

Example:

```text
CASE IPS-1024
Ayurvedic herbal formulation patent question

Domain: Patent + Traditional Knowledge
Jurisdiction: India
Status: Human Review in Progress

Next Action:
Wait for expert review

[ View Case ]
```

---

## 16. My Questions

Show previous questions in a simple searchable list.

Fields:

- date/time
- short question preview
- response language
- jurisdiction
- domain
- status
- open/view action

Example:

```text
12 Sep 2026
Can I patent my herbal formulation?
Patent · India · English
[ View ]
```

---

## 17. My Cases

Provide filters:

- All
- Active
- In Review
- Need More Information
- Completed
- Closed

Use clear status text.

---

## 18. Human Review Dashboard Section

This should be a dedicated user-facing area for cases that have been escalated.

The user must see:

- Case ID
- Reason for escalation
- Expert category
- Expert identity, where allowed
- Information shared
- Current status
- Timeline
- Information requested
- Final expert guidance
- Last update
- Next action

---

## 19. Human Review Status Card

```text
HUMAN REVIEW REQUESTED

Why escalated?
Complex IP + Traditional Knowledge case

Assigned Expert Category
Traditional Knowledge / IP

Status
● Submitted
● Expert Assigned
● In Review
○ Review Completed

[ View Review ]
```

When completed:

```text
✓ HUMAN REVIEW COMPLETED

Expert Guidance Available
[ Read Expert Guidance ]
```

---

## 20. Case Timeline

The dashboard should provide a simple timeline:

```text
● Case Created
│
● AI Guidance Generated
│
● Human Review Requested
│
● Expert Assigned
│
● Expert Reviewing
│
○ Review Completed
```

Each event should display the last update timestamp.

---

## 21. Information Shared View

Provide a transparency panel:

```text
Information Shared With Expert

✓ Original Question
✓ Relevant Case Builder Details
✓ AI Guidance
✓ Sources / Evidence
✓ Confidence
✓ Verification Result

[ View Details ]
```

Do not show internal-only system notes.

---

## 22. AI vs Human Guidance

The dashboard must visually separate:

### AI Guidance

- answer
- why
- sources
- confidence
- safe-abstention status
- next step

### Human Expert Guidance

- expert summary
- observations
- recommended action
- additional reference
- final review status

The user should immediately know which content came from AI and which content came from a human expert.

---

## 23. Additional Information Request

When an expert asks for more information:

```text
ACTION REQUIRED

Your expert reviewer needs more information.

Question:
Please describe the extraction process used in your formulation.

[ Type your response........................ ] [🎙]

[ Submit Information ]
```

The microphone must work in this field.

---

## 24. Global Microphone Experience

All natural-language input fields in the user dashboard should support a reusable microphone component.

Targets include:

- search
- case details
- additional information
- case updates
- comments
- profile free-text preferences, where present

### Voice Flow

```text
🎙
 ↓
Listening...
 ↓
Speech-to-Text
 ↓
Editable text
 ↓
Submit
```

The user must be able to edit transcribed text before submission.

---

## 25. Dashboard Notifications

Examples:

```text
Human review requested for Case IPS-1024.

Expert requested more information.

Your human expert review is complete.

Case status updated.
```

Notifications must follow the selected UI language.

---

## 26. Sources / Evidence

The dashboard should preserve access to the sources associated with a previous AI response.

A user should be able to open a prior answer and see:

- cited source title
- source type
- section/page where available
- citation reference
- evidence excerpt where permitted
- authority context

Do not replace source information with a generic “AI answer” label.

---

## 27. Search and Filters

Search should allow users to find:

- old questions
- cases
- human reviews

Filters may include:

- language
- domain
- jurisdiction
- status
- date

The search interface should remain simple and public-service oriented.

---

## 28. Profile and Preferences

Profile area may contain:

- display name
- preferred UI language
- preferred response mode
- notification preference
- privacy/data-control preferences

Avoid collecting information that is not necessary for product operation.

---

## 29. Supabase Storage

The dashboard should read application data from Supabase through the backend/API layer.

### Suggested data

```text
users
profiles
sessions
conversations
messages
cases
case_events
case_assignments
expert_reviews
notifications
audit_logs
saved_sources
```

The user dashboard can display stored AI responses and case history from Supabase.

### Important Boundary

Supabase is the application persistence layer. It is not automatically the source of truth for the RAG knowledge corpus.

Trusted RAG knowledge continues to use the project's approved retrieval architecture.

---

## 30. Dashboard Data Flow

```text
USER
 ↓
REACT FRONTEND
 ↓
FASTAPI / EXISTING API
 ├───────────────┐
 ↓               ↓
RAG / AI         SUPABASE
 ↓               ↓
AI ANSWER     USER/CASE HISTORY
 │               │
 └───────┬───────┘
         ↓
   DASHBOARD RENDERER
```

The frontend should consume structured JSON.

---

## 31. Mobile Layout

### Mobile Principles

- single-column layout
- large touch targets
- prominent logo
- language control easily reachable
- collapsible navigation
- full-width primary actions
- cards become stacked sections
- timeline remains readable
- voice button remains easy to reach

Example mobile structure:

```text
[LOGO]       [🌐] [☰]

My Dashboard

[ Active Cases 3 ]
[ Reviews 2 ]
[ Actions 1 ]

Active Case
────────────
IPS-1024
Human Review
[View Case]

Recent Questions
───────────────
...
```

---

## 32. Desktop Layout

Suggested structure:

```text
┌──────────────────────────────────────────────────┐
│ LARGE LOGO   IP शक्ति सहायक       Language  Help│
├──────────────────────────────────────────────────┤
│ Sidebar / Navigation │ Main Dashboard           │
│                      │                           │
│ Overview             │ Summary Cards             │
│ My Questions         │ Active Cases              │
│ My Cases             │ Human Reviews             │
│ Human Reviews        │ Recent Questions         │
│ Sources              │ Notifications            │
│ Settings             │                           │
└──────────────────────────────────────────────────┘
```

The sidebar may collapse on tablet.

---

## 33. Empty States

Every dashboard area needs a useful empty state.

Example:

```text
No active cases yet.
Ask your first IP or regulatory question to get started.

[ Ask a Question ]
```

Empty states must also translate into the selected language.

---

## 34. Error States

Example:

```text
We could not load your cases.
Please try again.

[ Retry ]
```

Errors must:

- be understandable;
- be localized;
- preserve user-entered text where possible;
- never expose raw backend stack traces.

---

## 35. Accessibility

Target:

**WCAG 2.1 AA**

Requirements include:

- strong text contrast;
- visible focus ring;
- keyboard navigation;
- semantic HTML;
- accessible icon labels;
- at least 16px body text;
- 48px minimum touch targets;
- no color-only status communication;
- appropriate language attributes;
- screen-reader-friendly status and timeline components.

---

## 36. Responsive Breakpoints

### Desktop ≥ 1024px

- full header/navigation
- sidebar/dashboard columns
- multi-column summary cards

### Tablet 768–1023px

- compact navigation
- 2-column card layouts where appropriate
- stacked case details

### Mobile ≤ 767px

- compact header
- hamburger menu
- stacked cards
- full-width actions
- bottom sheets/selectors where useful
- large readable status blocks

---

## 37. Core Components

```text
UserDashboard
DashboardSummaryCard
QuestionList
CaseList
CaseCard
HumanReviewCard
CaseTimeline
InformationSharedPanel
ExpertReviewCard
NotificationList
LanguageSwitcher
VoiceInputField
SourceList
ProfileSettings
EmptyState
ErrorState
```

---

## 38. UX Rules

### Rule 1 — Do not overwhelm

The dashboard should answer:

> What is happening with my work right now?

### Rule 2 — Show next action

Every active case should have an obvious next action.

### Rule 3 — Explain status

Do not show only “In Review.” Explain who is reviewing and what happens next when appropriate.

### Rule 4 — Preserve trust

AI output, evidence and human review must remain clearly separated.

### Rule 5 — Language is global

Language switching must update the entire dashboard, not just a few labels.

---

## 39. User Demo Flow

Recommended two-device demo:

### Device A — User

```text
Login
 ↓
Ask Question
 ↓
AI Answer
 ↓
Human Review Requested
 ↓
My Dashboard
 ↓
Case Status
```

### Device B — Expert

```text
Expert Login
 ↓
Expert Dashboard
 ↓
Assigned Case
 ↓
Review
 ↓
Submit
```

### Device A — User

```text
Refresh / Live Update
 ↓
Review Completed
 ↓
Read Expert Guidance
 ↓
See Next Action
```

---

## 40. Success Criteria

The dashboard is successful when:

- a new user understands the current status within seconds;
- the user can find active cases;
- the user can reopen previous questions;
- human review progress is transparent;
- AI and human guidance are clearly separated;
- the complete dashboard changes language correctly;
- selected language persists across navigation;
- Gujarati, Telugu, Kannada, Marathi and Bengali are supported in addition to English, Hindi and Sanskrit;
- Hinglish is available as a conversational response mode;
- voice input is available in natural-language text fields;
- the large supplied logo is displayed correctly;
- the dashboard works on mobile and desktop;
- stored case/history data is loaded through the backend/Supabase integration.

---

## 41. Implementation Order

```text
1. Dashboard route + shell
2. Header + large project logo
3. Language switcher + i18n
4. Supabase-backed user/case data through API
5. Overview cards
6. My Questions
7. My Cases
8. Human Reviews
9. Case Timeline
10. AI vs Human Guidance renderer
11. Notifications
12. VoiceInputField
13. Mobile responsive polish
14. Accessibility validation
15. Final visual polish
```

---

## 42. Final Dashboard Principle

> **The IP-SAKTI dashboard should make a complex IP/regulatory journey feel simple: see what you asked, understand what the system did, know who is reviewing the case, see what happens next, and experience the entire interface in your preferred language.**

---

# END OF PRD



================================================================================

# PART C — IP-SAKTI SAHAYAK: HUMAN EXPERT REVIEW & CASE ESCALATION ADD-ON PRD

---

# IP-SAKTI Sahayak — Human Expert Review & Case Escalation Add-on PRD

**Version:** 1.0  
**Product:** IP-SAKTI Sahayak  
**Document Type:** Frontend + Product Add-on PRD  
**Status:** Add-on to existing Frontend PRD  
**Primary Purpose:** Human-in-the-loop review for complex or low-confidence Ayurveda IP, Traditional Knowledge, ABS/Biodiversity and regulatory cases.

---

## 1. Purpose

IP-SAKTI Sahayak should not present AI guidance as the final authority. When a case is complex, cross-domain, high-risk, or insufficiently supported, the system should allow the user to request human review.

The human review layer must create a transparent journey:

```text
USER QUESTION
     ↓
AI / RAG ANALYSIS
     ↓
ESCALATION RECOMMENDED
     ↓
CASE CREATED
     ↓
DOMAIN-BASED EXPERT ROUTING
     ↓
EXPERT REVIEW
     ↓
FINAL EXPERT GUIDANCE
     ↓
USER SEES REVIEW + NEXT ACTION
```

The feature is an extension of the existing IP-SAKTI frontend and must integrate with the existing RAG, FastAPI/API and n8n workflow rather than replacing them.

---

## 2. Product Goal

Create a safe, traceable and demo-friendly human-in-the-loop workflow in which:

- AI can identify when human review is appropriate.
- The user can request or accept escalation.
- The system routes the case to a suitable expert category.
- Only relevant case information is shared.
- Expert access is protected by authentication and role-based authorization.
- The user can track what happened to the case.
- Expert feedback is returned as a clearly separated human review outcome.
- AI guidance and human guidance are never visually confused.

---

## 3. Core Expert Routing Logic

### 3.1 Domain-Based Routing

```text
AI / Case Analysis
       ↓
Identify Primary Domain
       ↓
┌────────────┬──────────────┬──────────────┐
│ Traditional│ IP / IPR     │ ABS /        │
│ Knowledge  │              │ Biodiversity │
└─────┬──────┴──────┬───────┴──────┬───────┘
      ↓             ↓              ↓
 TKDL / TK      IP Expert       ABS Expert
 Expert
```

### 3.2 Multi-Domain Cases

For a case involving more than one domain, such as:

> Patent + Traditional Knowledge + possible ABS implications

route to:

- Senior Expert; or
- Multi-domain IP facilitator; or
- controlled multi-expert review.

The UI should explain that multiple domains were detected.

---

## 4. When to Trigger Human Review

Human review may be recommended when one or more of the following applies:

1. Low AI confidence.
2. Insufficient supporting evidence.
3. High-risk or legally sensitive interpretation.
4. Traditional Knowledge / TKDL complexity.
5. ABS / biodiversity implications.
6. Cross-domain IP issues.
7. User explicitly requests expert review.
8. The system abstains from giving a confident conclusion.
9. Case-specific facts are incomplete and expert clarification would materially help.

The frontend must explain **why** escalation happened in simple language.

Example:

> **Human review recommended because this case involves Traditional Knowledge and possible IP implications, and the available evidence does not support a sufficiently confident conclusion.**

---

## 5. Case Package Sent to Expert

Only relevant information should be included in the expert case package.

### Minimum Case Package

- Case ID
- Case creation timestamp
- Original user question
- Relevant conversation/context
- User-selected language
- Jurisdiction
- Detected intent
- IP type/domain
- Product/formulation classification
- Case Builder answers
- AI-generated guidance
- Confidence score/label
- Abstention reason, where applicable
- Retrieved sources
- Source citations
- Relevant evidence passages
- Claim verification results
- Questions for expert
- User-provided attachments, where applicable and permitted

### Explicit Rule

Do not send unrelated conversations, unnecessary personal data, hidden system prompts, internal implementation details or internal notes.

---

## 6. User Experience — Human Review Status

After escalation, the user should see a dedicated status card.

```text
HUMAN REVIEW REQUESTED

Case ID: IPS-1024

Assigned Expert Category:
Traditional Knowledge / IP

Why was it escalated?
Complex cross-domain case + limited confidence

Information shared:
✓ Your question
✓ Relevant case details
✓ AI guidance
✓ Sources and evidence
✓ Confidence / verification status

Status:
● Submitted
● Expert Assigned
○ In Review
○ More Information Needed
○ Review Completed
```

---

## 7. User Case Timeline

The user should be able to open a timeline such as:

```text
Case Created
     ↓
Escalation Triggered
     ↓
Expert Assigned
     ↓
Expert Opened Case
     ↓
More Information Requested (optional)
     ↓
User Responded (optional)
     ↓
Expert Review Submitted
     ↓
Review Completed
```

Each event should show a timestamp.

---

## 8. User Transparency Requirements

The user should be able to understand:

- What they asked.
- Why the case was escalated.
- Which expert category is reviewing it.
- Expert identity, only where policy permits.
- What information was shared.
- Current status.
- What information the expert requested.
- What the expert concluded.
- Last updated time.
- Next recommended action.

### Principle

> **No silent escalation.**

The user should never wonder where their case went.

---

## 9. Expert Portal

### Routes

```text
/expert/login
/expert/dashboard
/expert/cases/:caseId
```

### Protected Roles

- EXPERT
- SENIOR_EXPERT
- ADMIN

Authorization must be enforced server-side. Frontend route guards alone are not sufficient.

---

## 10. Expert Login

### Required UI

- Email/username
- Password or approved authentication mechanism
- Login button
- Authentication error state
- Session state
- Logout

The expert portal must not be publicly accessible without authorization.

---

## 11. Expert Dashboard

Primary dashboard sections:

```text
MY OPEN CASES
PENDING REVIEW
IN REVIEW
RETURNED FOR INFORMATION
COMPLETED
```

Optional priority indicators:

- High Priority
- Low Confidence
- Overdue / Aging

### Case List Fields

- Case ID
- Domain
- Short case title
- Priority
- Confidence
- Status
- Created time
- Last updated
- Assigned expert

---

## 12. Expert Case Detail

The expert case page should contain:

### A. Original Question

Display the exact user question.

### B. System Understanding

Show structured understanding:

- language
- jurisdiction
- intent
- IP type
- product/formulation context

### C. Case Builder Context

Display answers supplied by the user.

### D. AI Guidance

Clearly label:

> **AI-generated guidance**

It must not appear visually equivalent to expert guidance.

### E. Evidence

Show relevant retrieved sources, citations and evidence passages.

### F. Claim Verification

Show claim support state where appropriate:

- Supported
- Unsupported
- Unverified

### G. Why Human Review

A clear explanation of the escalation trigger.

---

## 13. Expert Review Actions

The expert should have controlled actions:

```text
[ Accept AI Guidance ]
[ Modify / Correct ]
[ Request More Information ]
[ Reject / Correct ]
[ Escalate to Senior Expert ]
```

The expert should also be able to enter:

- Expert summary
- Observations
- Recommended next step
- Additional source/reference
- Risk notes
- Clarifying questions

Separate:

- Internal-only notes
- User-facing review

Internal notes must never accidentally appear in the user dashboard.

---

## 14. Expert Review Submission

Before submission, confirm:

- review content is complete;
- user-facing guidance is present;
- internal notes are separated;
- recommended next step is selected or written;
- status transition is valid.

On submission:

```text
Expert Review Submitted
        ↓
Case Status = REVIEW_COMPLETED
        ↓
User Notification
        ↓
User Dashboard Updated
```

---

## 15. Case Status Model

Use the following statuses:

```text
SUBMITTED
ASSIGNED
IN_REVIEW
NEED_MORE_INFORMATION
REVIEW_COMPLETED
REASSIGNED
CLOSED
```

The UI must use consistent status labels and should not rely only on color.

---

## 16. Human Guidance Presentation

On the user side, use separate sections:

### AI Guidance

> AI-generated guidance based on retrieved sources.

### Human Expert Review

> Reviewed by an authorized human expert.

Human guidance must remain clearly distinguishable from the AI output.

The product should continue to communicate that guidance is informational and does not replace professional legal advice.

---

## 17. Additional Information Request

An expert may request more information.

User screen:

```text
ADDITIONAL INFORMATION NEEDED

The expert needs more information about:

[ Question / Request ]

[ 🎤 ] [ Type your response ]

[ Submit Information ]
```

The global microphone input requirement applies here.

---

## 18. Global Microphone Requirement

Every user-facing typing field in the IP-SAKTI product that accepts natural-language text should support microphone input through one reusable component.

### Voice Input Component

```text
[ Type here..................................... ] [ 🎙 ]
```

### States

```text
IDLE
 ↓
LISTENING
 ↓
PROCESSING
 ↓
TEXT INSERTED
```

Error states must preserve the typed text and allow manual entry.

### Applies To

- Main AI question
- Search
- Case Builder responses
- Formulation details
- Ingredients
- Manufacturing/extraction details
- Biological resource details
- Existing knowledge details
- Human review additional information
- Expert comments where enabled

The microphone must supplement typing, not replace it.

---

## 19. Large Project Logo Requirement

The user-provided IP-SAKTI logo is a primary product identity asset.

Requirements:

- Use the supplied logo asset whenever available.
- Display it prominently in the header.
- Maintain the original aspect ratio.
- Never stretch, crop or distort.
- Use `object-fit: contain` where appropriate.
- Maintain clear space around the logo.
- Ensure sharp rendering on high-DPI displays.
- Provide accessible alt text.
- Use responsive sizing without turning the logo into a tiny icon.
- Support favicon/brand usage where appropriate.

Desktop should provide a visibly substantial brand area; mobile should remain clearly recognizable while respecting screen width.

---

## 20. Visual Direction

The UI should feel like:

> **Modern Indian public-service portal + IP-SAKTI branding + Ayurveda context + AI assistance.**

India Post is an information-architecture and public-service UX reference only.

Do not copy:

- India Post logo
- exact branding
- exact layout pixel-for-pixel
- government emblem without authorization
- wording that implies government ownership or endorsement

---

## 21. Approved Color System

Use the existing IP-SAKTI design system.

| Token | Value |
|---|---|
| Primary | `#1d5f9f` |
| Secondary | `#2e7d32` |
| Accent | `#f59e0b` |
| Background | `#ffffff` |
| Surface | `#f8f9fa` |
| Text Primary | `#0b0c0c` |
| Text Secondary | `#505a5f` |
| Border | `#cecece` |
| Hover | `#164a7a` |
| Active | `#0f3d5c` |
| Focus | `#ffdd00` |
| Success | `#0f7a52` |
| Warning | `#f59e0b` |
| Error | `#ca3535` |
| Info | `#1d5f9f` |

Use clear hierarchy, structured cards, strong headers and restrained visual effects. Avoid excessive gradients, glassmorphism, neon effects and animation-heavy surfaces.

---

## 22. Supabase Role in the Product

Supabase should store **application and case data**, not replace the frozen RAG knowledge architecture.

### Store in Supabase

- users / profiles
- sessions
- conversations
- questions
- AI answers
- source/citation snapshots
- confidence values
- cases
- case events
- expert assignments
- expert reviews
- notifications
- audit logs
- consent/data-control records where required

### Keep in RAG Knowledge Base

- authoritative statutes and rules
- official notifications
- official guidelines
- official registry records
- prior-art corpus
- TKDL reference corpus
- approved supporting evidence

### Important Boundary

Do not automatically turn user conversations or ordinary AI outputs into RAG knowledge.

A future knowledge-ingestion path should require explicit approval/validation before material enters the trusted corpus.

---

## 23. Suggested Supabase Data Model

```text
users
profiles
sessions
conversations
messages
cases
case_events
case_assignments
expert_profiles
expert_reviews
review_requests
notifications
audit_logs
attachments
```

Relationships should allow one case to have:

- one user;
- one or more assignments over time;
- one or more review events;
- optional additional-information cycles;
- a final review outcome.

---

## 24. Audit Log

Record important events such as:

- case created
- escalation triggered
- expert assigned
- expert viewed case
- information requested
- user responded
- expert review submitted
- reassigned
- closed

Audit logs should be append-oriented and access-controlled.

---

## 25. Notification Model

### User Notifications

- Human review requested
- Expert assigned
- More information needed
- Expert review completed
- Case status changed

### Expert Notifications

- New case assigned
- User responded to information request
- Case reassigned

Notification content should be localized where the user's selected language is supported.

---

## 26. Privacy and Data Minimization

Requirements:

- Share only case-relevant information.
- Avoid unnecessary personal data.
- Do not expose internal notes to users.
- Protect expert-only information.
- Avoid sensitive information in public URLs.
- Secure attachments.
- Maintain access logs.
- Apply appropriate consent and data-control mechanisms.

---

## 27. Language Support

The human review workflow must respect the product language architecture.

Supported UI target languages:

- English
- Hindi
- Sanskrit
- Hinglish response mode
- Gujarati
- Telugu
- Kannada
- Marathi
- Bengali

The selected language should be retained across:

- user case dashboard
- status labels
- notifications
- information requests
- buttons
- help text
- human-review status

The architecture should keep UI language and AI response language logically separable even when they default to the same selected language.

---

## 28. API / Backend Integration

The frontend should consume structured backend data rather than parsing free-form LLM text for core status rendering.

Suggested endpoints:

```text
POST /v1/cases
GET  /v1/cases/:caseId
POST /v1/cases/:caseId/escalate
GET  /v1/cases/:caseId/timeline
POST /v1/cases/:caseId/additional-info
GET  /v1/expert/dashboard
GET  /v1/expert/cases/:caseId
POST /v1/expert/cases/:caseId/assign
POST /v1/expert/cases/:caseId/review
POST /v1/expert/cases/:caseId/request-info
```

Exact endpoint naming may follow the existing FastAPI contract.

---

## 29. Existing n8n Integration

The human-review feature should integrate with the existing workflow concepts, including the human facilitator package and final human escalation response behavior.

The frontend should not invent a second, disconnected escalation pipeline.

---

## 30. Core Frontend Components

```text
HumanReviewCard
EscalationReasonCard
CaseStatusBadge
CaseTimeline
CaseInformationShared
ExpertAssignmentCard
ExpertReviewCard
ExpertDashboardTable
ExpertCaseDetail
ExpertReviewForm
AdditionalInformationForm
VoiceInputField
NotificationCenter
```

---

## 31. Mobile UX Requirement

The feature must work on a second mobile device for demo purposes.

### User Mobile

```text
User Login
   ↓
Question
   ↓
AI Answer
   ↓
Human Review
   ↓
Case Status
   ↓
Expert Review
```

### Expert Mobile

```text
Expert Login
   ↓
Expert Dashboard
   ↓
Assigned Case
   ↓
Review
   ↓
Submit Guidance
```

The same backend/case ID must connect both devices.

---

## 32. Hackathon Demo Flow

Recommended demo:

1. User asks an Ayurveda IP question.
2. AI returns source-backed guidance with confidence.
3. System recommends human review.
4. User submits the review request.
5. New case appears in the expert dashboard on another device.
6. Expert opens the case.
7. Expert sees the original question, case context, AI guidance and evidence.
8. Expert submits a review.
9. User dashboard changes status to **Review Completed**.
10. User sees final expert guidance and next action.

This demonstrates:

> **AI + RAG + evidence + trust + human oversight + traceability**

---

## 33. Success Criteria

The feature is acceptable when:

- users can request human review;
- the system can route cases by domain;
- the user can see why escalation occurred;
- expert access is protected;
- experts see the minimum relevant case package;
- users can track status;
- experts can submit structured guidance;
- user and expert views remain separate;
- audit events are recorded;
- language selection remains consistent;
- microphone input exists in applicable typing fields;
- supplied project logo is prominently and correctly rendered;
- mobile demo works across two devices/browsers.

---

## 34. Non-Goals

This add-on does not:

- replace the frozen RAG architecture;
- turn human reviews into automatic RAG knowledge;
- present the AI as legal authority;
- expose expert-only notes to users;
- imply official government affiliation;
- replace professional legal advice;
- require the expert dashboard to be embedded in the public user dashboard.

---

## 35. Implementation Priority

### P0 — Must Have

- Human review request
- Case creation
- Expert routing
- Protected expert login
- Expert dashboard
- Expert case detail
- Review submission
- User case status/timeline
- AI vs human guidance separation
- Supabase persistence

### P1 — High Value

- Additional information request
- Notifications
- Audit log
- Multi-domain routing
- Language localization of review workflow
- Global microphone input
- Large responsive project logo

### P2 — Enhancement

- Multi-expert collaboration
- Advanced SLA/aging indicators
- Rich analytics
- Expert workload balancing
- Advanced attachment handling

---

## 36. Final Product Principle

> **When AI reaches the edge of confidence, IP-SAKTI should not guess. It should explain the limitation, route the case responsibly, show the user what happened, and bring human expertise back into the loop.**

---

# END OF PRD



================================================================================

# END OF COMBINED MASTER PRD
