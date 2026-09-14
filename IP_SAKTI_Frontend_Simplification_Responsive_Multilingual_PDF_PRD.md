# IP-SAKTI Sahayak — Frontend Simplification, Responsive, Full Localization & PDF Report PRD

## 1. Objective

Modify the existing IP-SAKTI Sahayak website without rebuilding it from scratch.

The final UI must be:

- Simple
- Professional
- Responsive
- Mobile-friendly
- Browser-friendly
- Government/public-service inspired
- Ayurveda + IP focused
- Minimal visual clutter
- Fully multilingual
- Backend-driven
- Ready for RAG integration
- Ready for PDF report generation

### Core implementation instruction

> PRESERVE the existing application structure and working functionality. MODIFY only the UI/UX elements specified in this PRD. Do not unnecessarily redesign or replace the entire application.

---

## 2. Current UI Baseline

Use the current website/screenshots as the visual baseline.

Preserve where already working:

- Existing blue/white government-style visual direction
- Existing routing structure where useful
- Existing backend/API integration
- Existing Ask IP Question functionality
- Existing Case Builder functionality
- Existing dashboard functionality
- Existing responsive foundation
- Existing color palette unless a change is explicitly required
- Existing reusable components that already work correctly

Do not rebuild the application from zero.

---

## 3. Remove Unnecessary Content

Simplify the current homepage and navigation.

Remove or hide unnecessary items such as:

- Excessive marketing text
- Decorative public-service badges
- RAG marketing labels
- Technical RAG terminology
- Backend technology terminology
- Repeated feature descriptions
- Decorative AI graphics
- AI robot/brain imagery
- Random technology illustrations
- Excessive cards
- Duplicate navigation items
- Duplicate information
- Fake statistics
- Unused buttons
- Unused dashboard indicators

The user must never see internal technology terms such as:

- Chroma
- BM25
- RRF
- Reranker
- Embedding
- Ollama
- Vector Database
- Hybrid Retrieval

These are backend concepts and must remain internal.

---

## 4. AI Visual Design

Do not make the website look like a generic AI website.

AI should be represented mainly through simple functional icons.

Recommended icons:

- AI / assistant
- Search
- Document
- Shield / trust
- Language
- Voice / microphone
- Person / expert
- PDF / report
- Check
- Warning
- Information

Do not use:

- AI robot illustrations
- Human brain graphics
- Glowing AI heads
- Neon AI graphics
- 3D AI artwork
- Excessive sparkles
- Large futuristic AI backgrounds
- Glassmorphism
- Cyberpunk styling

### Design principle

`ICON = FUNCTION`

not

`AI IMAGE = DECORATION`

---

## 5. Project Logo — High Priority

Use the provided full IP-SAKTI Sahayak logo.

Do not use only the small shield/icon version as the primary branding.

### Desktop

Display the full logo prominently in the header.

Recommended width:

`200–260px`

Height must remain automatic.

### Mobile

Use the same full logo responsively.

Recommended width:

`150–190px`

### Logo rules

- Never stretch
- Never crop
- Never distort
- Never squeeze
- Preserve original aspect ratio
- Use `object-fit: contain`
- Preserve clear space
- Keep logo readable on mobile
- Use accessible alt text
- Do not make the main logo tiny

The full logo is the primary visual identity.

---

## 6. Simplified Header

Modify the existing header instead of replacing the whole header.

Recommended structure:

```text
-----------------------------------------------------
| IP-SAKTI SAHAYAK LOGO | Search | Language | Dashboard |
-----------------------------------------------------
| Home | Ask IP-SAKTI | Case Builder | My Cases | Help |
-----------------------------------------------------
```

Keep the existing blue navigation direction.

### Primary navigation

- Home
- Ask IP-SAKTI
- Case Builder
- My Cases
- Help & FAQ

Secondary areas such as IP Categories, Regulatory Guidance, Prior Art, ABS/Biodiversity and Sources may remain accessible through relevant pages, dropdowns, dashboard cards or contextual links instead of overcrowding the main navigation.

---

## 7. Homepage

The homepage must become much simpler.

### Target structure

```text
                  [FULL IP-SAKTI LOGO]

             IP & Ayurveda Guidance Made Simple

      Ask a question or build a detailed case report.

---------------------------------------------------------
|                                                       |
|  Ask your IP question...                       🎤    |
|                                                       |
|                         [ Ask IP-SAKTI ]              |
---------------------------------------------------------

Quick Actions

[ Ask an IP Question ]       [ Build Case Report ]

Popular Questions

[ What is a Patent? ]
[ What is a Trademark? ]
[ What is GI? ]
[ What is TKDL? ]
```

Keep the homepage focused on actual functionality.

---

## 8. Quick Query Mode

Quick Query is the normal question mode for simple informational questions such as:

- What is a patent?
- What is a trademark?
- What is GI?
- What is copyright?
- What is TKDL?
- What is ABS?

### User flow

```text
Question
  ↓
FastAPI / RAG
  ↓
Simple Answer
  ↓
Sources + Confidence
```

### Quick Answer UI

```text
Answer
────────────────────────────

Simple grounded explanation...

Sources
[1] Source
[2] Source

Confidence: High

[ Export PDF ]
```

### Storage rule

A normal query must not create a persistent case.

```text
Quick Query
→ Answer
→ Display
→ End
```

Conversation display in the UI is allowed, but Quick Query must not automatically become a persistent Case Builder record.

---

## 9. General IP Question → PDF

For a normal informational question, provide an optional:

`Export as PDF`

Example:

```text
What is a Patent?
        ↓
Simple Answer
        ↓
Export PDF
```

### General IP PDF structure

- IP-SAKTI Sahayak heading
- General IP Answer heading
- User question
- Grounded answer
- Key points
- Sources and citations
- Confidence
- Disclaimer

Do not turn every simple question into a complex case report.

---

## 10. Case Builder

Case Builder is the detailed analysis mode.

Keep the existing Case Builder concept but simplify its UI.

### Required sections

1. Applicant Information
2. Invention / Product Information
3. Formulation
4. Ingredients
5. Manufacturing Process
6. Extraction / Processing Method
7. Existing Knowledge
8. Traditional Knowledge / TKDL
9. Biological Resources
10. Intended Use
11. Jurisdiction
12. Additional Information

Each natural-language field should support:

```text
Text Input + Microphone
```

---

## 11. Case Builder → Case Report PDF

After the user submits the Case Builder:

```text
Case Information
        ↓
RAG Analysis
        ↓
Relevant Evidence
        ↓
Rules
        ↓
Guidelines
        ↓
Guidance
        ↓
Prior Art
        ↓
TK / TKDL
        ↓
ABS / Biodiversity
        ↓
Fees
        ↓
Procedure
        ↓
Confidence
        ↓
CASE REPORT PDF
```

The report must be a professional PDF.

---

## 12. Case Report PDF Structure

Use this order:

```text
================================================
                 IP-SAKTI SAHAYAK
              CASE ANALYSIS REPORT
================================================

APPLICANT NAME
[Large prominent name]

INVENTION / PRODUCT NAME
[Name]

CASE ID
DATE
JURISDICTION

------------------------------------------------
1. CASE SUMMARY
------------------------------------------------

2. IP CLASSIFICATION
------------------------------------------------

Primary IP type
Related IP types

------------------------------------------------
3. APPLICABLE RULES & LAWS
------------------------------------------------

Relevant Acts
Relevant Sections
Relevant Rules
Applicable exclusions

------------------------------------------------
4. RELEVANT GUIDELINES
------------------------------------------------

Relevant examination guidelines
AYUSH guidelines
TK/TKDL guidance
ABS guidance

------------------------------------------------
5. PRIOR ART / EXISTING KNOWLEDGE
------------------------------------------------

Relevant patents
Existing knowledge
TKDL / traditional knowledge
Examiner evidence

------------------------------------------------
6. REGULATORY INFORMATION
------------------------------------------------

Relevant regulatory requirements
Product classification
Relevant regulatory authority

------------------------------------------------
7. ABS / BIODIVERSITY
------------------------------------------------

Applicable information
Biological-resource considerations

------------------------------------------------
8. FEES & PROCEDURE
------------------------------------------------

Relevant official fees
Applicable filing procedure
Applicant category
Important procedural steps

------------------------------------------------
9. CASE-SPECIFIC ANALYSIS
------------------------------------------------

Evidence-grounded analysis

------------------------------------------------
10. CONFIDENCE & RISK
------------------------------------------------

Overall confidence
Section-level confidence

------------------------------------------------
11. LOW-CONFIDENCE AREAS
------------------------------------------------

Clearly highlighted.

------------------------------------------------
12. MISSING INFORMATION
------------------------------------------------

Information required from user

------------------------------------------------
13. RECOMMENDED NEXT STEPS
------------------------------------------------

Step 1
Step 2
Step 3

------------------------------------------------
14. SOURCES & CITATIONS
------------------------------------------------

[1]
[2]
[3]

------------------------------------------------
DISCLAIMER
------------------------------------------------

Information only, not legal advice.
================================================
```

---

## 13. Low Confidence Highlighting

This is mandatory.

Do not show only one overall confidence value when section-level confidence is available.

Example:

```text
CONFIDENCE

Patent Classification       HIGH
Patentability               MEDIUM
Prior Art                    HIGH
Regulatory                   HIGH
Fees                         LOW
ABS                          LOW
```

For low-confidence areas, show a prominent warning block:

```text
⚠ LOW CONFIDENCE

Section: Fees

Confidence: 31%

Reason:
The available evidence does not establish the applicable
fee category with sufficient confidence.
```

Rules:

- Do not invent confidence values.
- Display backend-provided values.
- Preserve the backend reason.
- Use warning icon + label + percentage + reason.

---

## 14. Microphone / Voice Input

Create one reusable microphone component and use it across all relevant natural-language fields.

### Required states

- Idle
- Listening
- Processing
- Transcript inserted
- Error
- Permission denied
- Unsupported / unavailable

### Behavior

```text
🎤
↓
User speaks
↓
Speech transcription
↓
Transcript appears in input
```

Do not automatically submit the query immediately after speech unless explicitly configured.

### Input pattern

```text
[ Input text.......................... 🎤 ]
```

Listening:

```text
[ Listening...                      ⏹ ]
```

### Fallback

If speech recognition is unavailable, gracefully keep normal typing available. Do not show a broken microphone control.

The voice component must work on desktop browsers, laptops, tablets and mobile browsers subject to browser speech-recognition support.

---

## 15. Language System — Mandatory

The language selector controls the entire user-facing website, not only the answer.

### Supported languages

- English
- Hindi
- Hinglish
- Sanskrit
- Gujarati
- Telugu
- Kannada
- Marathi
- Bengali

### Language selector

Use a clear, accessible dropdown or selector with both English names and native script where useful.

Examples:

```text
English
हिन्दी
Hinglish
संस्कृत
ગુજરાતી
తెలుగు
ಕನ್ನಡ
मराठी
বাংলা
```

The selected language must persist during the current session and be sent to the backend as the response language.

---

## 16. Full Website Translation

When a user selects a language, translate all visible UI content into that language.

This includes:

- Navigation
- Page titles
- Buttons
- Labels
- Placeholders
- Form fields
- Validation messages
- Error messages
- Tooltips
- Empty states
- Loading text
- Help text
- FAQ
- Dashboard
- Case Builder
- PDF report labels
- Confidence labels
- Notification text
- Confirmation dialogs
- Footer
- Accessibility labels
- Voice/microphone states

### No mixed-language UI

Do not leave English UI strings when another language is selected, except canonical technical/legal identifiers that must remain unchanged.

---

## 17. Centralized i18n

Do not hard-code visible UI strings throughout components.

Use a centralized localization system, for example:

```text
i18n/
├── en
├── hi
├── hinglish
├── sa
├── gu
├── te
├── kn
├── mr
└── bn
```

Translation keys may include:

```text
nav.home
nav.ask
nav.case_builder
common.submit
common.cancel
common.download
common.confidence
common.low_confidence
voice.listening
voice.permission_denied
```

Before release:

> 100% of visible UI strings must have translations for all supported languages.

Do not silently fall back to English for a missing visible string.

---

## 18. Response Language vs Question Language

Treat these as two separate concepts.

```text
Question Language
=
Language in which the user typed or spoke the question

Response Language
=
Language selected by the user
```

Examples:

```text
Selected language: Hindi
Question: What is a patent?
Final answer: Hindi
```

```text
Selected language: Marathi
Question: Patent kya hota hai?
Final answer: Marathi
```

The selected response language always controls the final generated answer.

---

## 19. Sanskrit Requirement

When Sanskrit is selected:

- Entire website UI → Sanskrit
- Question response → Sanskrit
- Case Builder labels → Sanskrit
- Buttons → Sanskrit
- Validation/errors → Sanskrit
- PDF report labels → Sanskrit
- Confidence labels → Sanskrit
- Help text → Sanskrit

Canonical information may remain in its original form where required, such as:

- Act names
- Section numbers
- Official source names
- URLs
- Citation identifiers

Do not machine-translate exact evidence/source passages unless explicitly requested.

---

## 20. Project-related Online Images

Add a small number of relevant online images only where they improve understanding.

Suitable themes:

- Ayurveda
- Traditional Knowledge
- Medicinal plants
- Patent documents
- Biodiversity
- IP documentation

### Rules

- No random AI images
- No unrelated stock photos
- No image-heavy homepage
- No major redesign around images
- Keep existing layout hierarchy
- Preserve image proportions
- Do not crop or distort source images
- Use license/permission-safe sources
- Provide attribution where required

Images are supporting visuals, not the main interface.

---

## 21. Responsive Design

The site must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

### Desktop

Use the current wide layout with clean spacing.

### Tablet

Reduce spacing and collapse secondary navigation when necessary.

### Mobile

Header example:

```text
[Logo]                     [☰]
```

Language and dashboard controls remain accessible.

Main content stacks vertically.

Case Builder fields become single-column.

### Mobile requirements

- No horizontal scrolling
- No clipped content
- No overlapping controls
- No tiny text
- Touch-friendly controls
- Microphone accessible
- Language selector accessible
- PDF actions accessible
- Cards stack vertically
- Navigation collapses cleanly

---

## 22. Icons

Use one consistent icon system.

Core icons:

- Home
- Search
- Question
- Case
- Document
- PDF
- Voice
- Language
- Shield
- Expert
- Warning
- Check
- Help
- Download

Do not mix unrelated icon styles.

Do not replace clear text labels with icons where text is necessary for accessibility or comprehension.

---

## 23. Simple Visual Hierarchy

Use:

```text
Logo
↓
Main task
↓
Answer / Case
↓
Evidence
↓
Actions
```

Avoid:

- 10+ competing cards
- Large decorative sections
- Huge blocks of marketing text
- Multiple competing CTAs
- Repeated feature descriptions

---

## 24. Backend Boundary

Frontend must not:

- Generate legal/IP answers
- Calculate confidence
- Perform RAG
- Perform citation verification
- Independently regenerate backend answers
- Independently translate the backend-generated answer

Frontend only renders backend-structured data.

Architecture:

```text
Frontend
   ↓
FastAPI
   ↓
RAG
   ↓
Structured Backend Response
   ↓
Frontend Renderer
```

---

## 25. Quick Query API Contract

The frontend should support a request conceptually similar to:

```json
{
  "mode": "quick_query",
  "question": "What is a patent?",
  "response_language": "hindi",
  "jurisdiction": "india",
  "session_id": "..."
}
```

Response conceptually:

```json
{
  "mode": "quick_query",
  "overall_answer": "...",
  "jurisdiction_analysis": "...",
  "key_findings": [],
  "sources": [],
  "confidence": 0.91,
  "confidence_label": "high",
  "abstained": false,
  "abstain_reason": null,
  "human_review_recommended": false,
  "query_analysis": {
    "language": "english"
  }
}
```

The frontend must render the response without changing its meaning.

---

## 26. Case Report Response

Case Builder UI should consume structured case-analysis data containing:

- Case information
- IP classification
- Rules
- Guidelines
- Prior art
- TKDL
- ABS
- Regulatory information
- Fees
- Procedure
- Analysis
- Confidence
- Low-confidence reasons
- Missing information
- Next steps
- Sources
- Citations

The frontend may render the report and invoke the configured PDF-generation path, but it must not independently invent or calculate the legal analysis.

---

## 27. PDF Actions

### Quick Query

```text
Ask
↓
Answer
↓
Export PDF
```

### Case Builder

```text
Submit Case
↓
Analyse
↓
Generate Case Report
↓
View PDF
↓
Download PDF
```

Use professional headers/footers, consistent typography and selected-language labels.

---

## 28. Accessibility

Maintain:

- Keyboard navigation
- Visible focus state
- Proper labels
- Accessible icons
- Screen-reader-friendly controls
- Sufficient contrast
- Large touch targets
- Accessible microphone states
- Accessible language selector
- Accessible PDF buttons

---

## 29. Error Handling

Never expose raw backend tracebacks to users.

Use a friendly localized message such as:

```text
Something went wrong.
Please try again.
```

RAG abstention must be presented clearly and translated into the selected language.

Low-confidence messages must remain visually prominent.

---

## 30. Current UI → Final UI Direction

### Remove

- Excessive hero content
- AI decorative elements
- RAG terminology
- Unnecessary cards
- Overloaded navigation
- Repeated descriptions
- Random AI imagery
- Technical backend information

### Keep

- IP-SAKTI branding
- Blue/white visual identity
- Ask Question
- Case Builder
- Dashboard
- Core navigation
- Voice input
- Language selector
- Existing working functionality

### Add

- Large full logo
- Simple functional icons
- Quick Query mode
- Quick Answer PDF export
- Case Report PDF
- Low-confidence highlighting
- Full website localization
- 9-language selection
- Responsive mobile layout
- Reusable microphone
- Project-related supporting images

---

## 31. Final User Journeys

### Journey A — Normal Question

```text
Home
 ↓
Ask IP-SAKTI
 ↓
“What is a patent?”
 ↓
RAG
 ↓
Simple answer
 ↓
Sources + confidence
 ↓
Export PDF
```

No persistent case creation.

### Journey B — Case Builder

```text
Case Builder
 ↓
Enter applicant details
 ↓
Enter invention/formulation/process
 ↓
Enter TK/ABS information
 ↓
Submit
 ↓
RAG Analysis
 ↓
Rules + Guidelines + Prior Art + Fees + Regulatory
 ↓
Confidence analysis
 ↓
Low-confidence highlighting
 ↓
Professional Case Report
 ↓
PDF
 ↓
View / Download
```

---

## 32. Final Acceptance Criteria

```text
[ ] Existing UI is modified rather than unnecessarily rebuilt
[ ] Full IP-SAKTI logo is large and clearly visible
[ ] AI imagery is removed
[ ] AI is represented mainly through functional icons
[ ] Unnecessary navigation/content is removed
[ ] Homepage is simple
[ ] Quick Query works
[ ] Quick Query does not create a persistent case
[ ] General IP answer can be exported as PDF
[ ] Case Builder works
[ ] Case Report is generated as PDF
[ ] Rules are included
[ ] Guidelines are included
[ ] Fees/procedure information is included
[ ] Prior art information is included
[ ] TK/TKDL information is included
[ ] ABS/biodiversity information is included
[ ] Low-confidence areas are highlighted
[ ] Microphone is reusable across relevant fields
[ ] Microphone has proper states and fallback
[ ] English works
[ ] Hindi works
[ ] Hinglish works
[ ] Sanskrit works
[ ] Gujarati works
[ ] Telugu works
[ ] Kannada works
[ ] Marathi works
[ ] Bengali works
[ ] Entire UI changes to selected language
[ ] Generated answer follows selected language
[ ] PDF labels follow selected language
[ ] No unnecessary mixed-language UI
[ ] Desktop responsive
[ ] Tablet responsive
[ ] Mobile responsive
[ ] No horizontal scrolling
[ ] Browser UI works without layout breakage
[ ] Frontend does not perform RAG or legal reasoning
[ ] Backend remains the source of truth
```

---

## 33. Final Architecture

```text
                       IP-SAKTI SAHAYAK
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        QUICK QUERY                       CASE BUILDER
             │                                 │
       Temporary answer                  Persistent Case
             │                                 │
       Optional PDF                    Detailed Analysis
             │                                 │
             └────────────────┬────────────────┘
                              ↓
                           FastAPI
                              ↓
                       Existing RAG
                              ↓
                   Structured Backend Data
                              ↓
                          Frontend
```

### Final design principle

> LESS DECORATION. MORE FUNCTION.

The frontend is the presentation layer. The backend/RAG remains the source of truth for evidence, legal reasoning, citations and confidence.
