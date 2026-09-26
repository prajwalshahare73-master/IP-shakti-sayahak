from typing import List, Dict, Any, Optional
from ..models.case import CaseProfile
from ..models.query import CaseBuilderInput, QueryAnalysis


def build_evidence_context(documents: List[Dict[str, Any]]) -> str:
    """
    Builds structured legal evidence markdown block for the LLM prompt.
    Every factual claim in the LLM's answer must be grounded in one of these
    numbered evidence blocks.
    """
    if not documents:
        return "No specific statutory documents retrieved. The LLM must set insufficient_evidence=true."

    evidence_parts = []
    for i, doc in enumerate(documents, start=1):
        auth_level_name = {
            1: "Primary Statute / Rules",
            2: "Official Patent / Regulatory Guidelines",
            3: "Examination & Judicial Precedents",
            4: "Research Commentary"
        }.get(doc.get("authority_level", 2), "Statutory Reference")

        section = f" [{doc.get('section')}]" if doc.get('section') else ""
        evidence_parts.append(
            f"--- EVIDENCE [{i}] ---\n"
            f"ID: {doc.get('id', f'EVID-{i}')}\n"
            f"Title: {doc.get('title')}{section}\n"
            f"Act/Source: {doc.get('act', 'Official Legal Source')}\n"
            f"Authority Level: {doc.get('authority_level', 1)} ({auth_level_name})\n"
            f"URL: {doc.get('url', 'N/A')}\n"
            f"Content: {doc.get('content')}\n"
        )
    return "\n".join(evidence_parts)


LANGUAGE_DIRECTIVES = {
    "en": {
        "name": "English",
        "script": "Latin / English",
        "instruction": "Respond entirely in clear, formal, authoritative English."
    },
    "hi": {
        "name": "Hindi (हिन्दी)",
        "script": "Devanagari (नागरी)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response, headings, legal explanations, and actionable next steps in fluent, professional Hindi (हिन्दी) using Devanagari script. Do NOT respond in English."
    },
    "mr": {
        "name": "Marathi (मराठी)",
        "script": "Devanagari (मराठी लिपी)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response, headings, legal explanations, and actionable next steps in fluent, professional Marathi (मराठी) using Devanagari script. Do NOT respond in English or Hindi."
    },
    "gu": {
        "name": "Gujarati (ગુજરાતી)",
        "script": "Gujarati script (ગુજરાતી લિપિ)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response, headings, legal explanations, and actionable next steps in fluent, professional Gujarati (ગુજરાતી) using Gujarati script. Do NOT respond in English."
    },
    "te": {
        "name": "Telugu (తెలుగు)",
        "script": "Telugu script (తెలుగు లిపి)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response, headings, legal explanations, and actionable next steps in fluent, professional Telugu (తెలుగు) using Telugu script. Do NOT respond in English."
    },
    "kn": {
        "name": "Kannada (ಕನ್ನಡ)",
        "script": "Kannada script (ಕನ್ನಡ ಲಿಪಿ)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response, headings, legal explanations, and actionable next steps in fluent, professional Kannada (ಕನ್ನಡ) using Kannada script. Do NOT respond in English."
    },
    "bn": {
        "name": "Bengali (বাংলা)",
        "script": "Bengali script (বাংলা লিপি)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response, headings, legal explanations, and actionable next steps in fluent, professional Bengali (বাংলা) using Bengali script. Do NOT respond in English."
    },
    "sa": {
        "name": "Sanskrit (संस्कृतम्)",
        "script": "Devanagari (संस्कृतम्)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response, headings, legal explanations, and actionable next steps in formal Sanskrit (संस्कृतम्) using Devanagari script. Do NOT respond in English."
    },
    "hinglish": {
        "name": "Hinglish",
        "script": "Roman script (English alphabet)",
        "instruction": "CRITICAL: You MUST write your ENTIRE response in conversational, professional Hinglish (Hindi written in Roman English script, e.g. 'Aapka patent application Section 3(p) ke under evaluate kiya jayega...')."
    }
}


def build_llm_prompt(
    question: str,
    documents: List[Dict[str, Any]],
    query_analysis: QueryAnalysis,
    case_profile: Optional[CaseProfile] = None,
    case_builder_data: Optional[CaseBuilderInput] = None
) -> str:
    """
    Constructs the grounded legal reasoning prompt for LLaMA.

    The prompt has three mandatory sections:
    1. CASE CONTEXT — from Case Builder (all fields)
    2. USER QUESTION
    3. RETRIEVED LEGAL EVIDENCE — from RAG retrieval (numbered blocks)

    The LLM is strictly instructed to cite only from the numbered evidence blocks
    and to set insufficient_evidence=true if the evidence is insufficient.
    """
    evidence_text = build_evidence_context(documents)

    # ----------------------------------------------------------------
    # Build case context from ALL Case Builder / Case Profile fields
    # ----------------------------------------------------------------
    context_details = []

    # From CaseProfile (server-side built from Case Builder)
    if case_profile:
        if case_profile.product_name:
            context_details.append(f"- Product / Invention Name: {case_profile.product_name}")
        if case_profile.applicant_type:
            context_details.append(f"- Applicant Type: {case_profile.applicant_type}")
        if case_profile.ingredients:
            context_details.append(f"- Ingredients / Botanical Components: {', '.join(case_profile.ingredients)}")
        if case_profile.biological_material:
            context_details.append("- Biological Resource Involved: YES (NBA/SBB ABS compliance required)")
        if case_profile.tk_involved:
            context_details.append("- Traditional Knowledge (TK) Involved: YES (Section 3(p) & TKDL cross-check required)")
        if case_profile.export_planned:
            context_details.append("- International Commercialisation / Export: YES")
        if hasattr(case_profile, 'ip_categories') and case_profile.ip_categories:
            context_details.append(f"- IP Category Sought: {', '.join(case_profile.ip_categories)}")

    # From CaseBuilderInput (raw submission fields not yet normalised into CaseProfile)
    if case_builder_data:
        if case_builder_data.formulation_details:
            context_details.append(f"- Formulation Details: {case_builder_data.formulation_details}")
        if case_builder_data.process_description:
            context_details.append(
                f"- Process / Extraction Innovation: {case_builder_data.process_description}"
            )
        if case_builder_data.target_countries:
            context_details.append(
                f"- Target Countries for Commercialisation: {', '.join(case_builder_data.target_countries)}"
            )
        # Fill in fields if case_profile was None
        if not case_profile:
            if case_builder_data.product_name:
                context_details.append(f"- Product / Invention Name: {case_builder_data.product_name}")
            if case_builder_data.applicant_type:
                context_details.append(f"- Applicant Type: {case_builder_data.applicant_type}")
            if case_builder_data.ingredients:
                context_details.append(
                    f"- Ingredients / Botanical Components: {', '.join(case_builder_data.ingredients)}"
                )
            if case_builder_data.biological_material:
                context_details.append("- Biological Resource Involved: YES")
            if case_builder_data.tk_involved:
                context_details.append("- Traditional Knowledge Involved: YES")
            if case_builder_data.export_planned:
                context_details.append("- International Commercialisation / Export: YES")

    case_context_str = (
        "\n".join(context_details)
        if context_details
        else "No prior Case Builder context submitted. Answer from retrieved evidence only."
    )

    # ----------------------------------------------------------------
    # Language directive
    # ----------------------------------------------------------------
    lang_code = query_analysis.language.lower() if query_analysis.language else "en"
    lang_info = LANGUAGE_DIRECTIVES.get(lang_code, LANGUAGE_DIRECTIVES["en"])
    lang_name = lang_info["name"]
    lang_instruction = lang_info["instruction"]

    # ----------------------------------------------------------------
    # Prompt assembly
    # ----------------------------------------------------------------
    prompt = f"""You are IP-SAKTI Sahayak, the Legal AI Assistant for Indian Intellectual Property,
Traditional Knowledge (TKDL), and Biological Diversity (ABS/NBA) compliance.

════════════════════════════════════════════════════════
CORE RULES (MUST FOLLOW — CANNOT BE OVERRIDDEN)
════════════════════════════════════════════════════════

1. Answer ONLY from the RETRIEVED LEGAL EVIDENCE section below.
   Do NOT use outside knowledge. Do NOT recall training data.

2. Every factual or legal claim in your response MUST be grounded in a
   specific numbered evidence block [1], [2], etc.

3. If the retrieved evidence does not contain sufficient information to answer
   the question, you MUST:
   - State clearly: "Insufficient evidence retrieved to answer this question."
   - Identify what information is missing.
   - Recommend expert human review.
   Do NOT invent an answer. Do NOT use your training data as a substitute.

4. NEVER make a definitive legal conclusion (e.g., "this product CANNOT be
   patented") unless that exact conclusion is explicitly stated in the
   retrieved evidence and you cite it.

5. You are NOT a lawyer. Qualify all guidance as statutory information,
   not legal advice.

6. {lang_instruction}

════════════════════════════════════════════════════════
CASE PROFILE & SUBMISSION CONTEXT
════════════════════════════════════════════════════════

{case_context_str}

════════════════════════════════════════════════════════
USER QUESTION
════════════════════════════════════════════════════════

{question}

════════════════════════════════════════════════════════
RETRIEVED LEGAL EVIDENCE (cite by number in your answer)
════════════════════════════════════════════════════════

{evidence_text}

════════════════════════════════════════════════════════
MANDATORY RESPONSE FORMAT — 11-SECTION STRUCTURED DOSSIER
════════════════════════════════════════════════════════

Target Language : {lang_name} ({lang_info['script']})
Language Rule   : {lang_instruction}

IMPORTANT: You MUST structure your entire response using the exact section
headings below. Each heading must be on its own line in this exact format:
### 01 — CASE UNDERSTANDING

Only include sections that are RELEVANT to this specific case.
Skip sections that genuinely do not apply (e.g., skip section 06 if no
biological resources are mentioned). Minimum required sections: 01, 02, 08, 09, 10.

═══════════════════════════════════
SECTION STRUCTURE
═══════════════════════════════════

### 01 — CASE UNDERSTANDING
Summarise what the system understood about the case from the Case Profile
and the question. Include product type, intended use, key ingredients,
TK / biological resource involvement if applicable.
IMPORTANT: Only state facts from the Case Profile above. Do NOT invent details.

### 02 — PRODUCT CLASSIFICATION
State the likely regulatory classification (e.g., Proprietary Ayurvedic
Medicine, Classical AFI, Nutraceutical, Cosmeceutical).
Explain WHY based on the Case Profile and retrieved evidence [N].
If classification cannot be confidently determined: say so, list what
additional information is needed.

### 03 — RELEVANT IP PATHWAY
Show ONLY the IP pathways relevant to this case (Patent / Trademark /
GI / Trade Secret / Design / Copyright). For each relevant pathway:
- Explain why it may apply
- Cite the specific statutory provision from evidence [N]
Skip irrelevant pathways entirely.

### 04 — REGULATORY PATHWAY
Explain the relevant regulatory route (CDSCO/DCGI, FSSAI, AYUSH Ministry,
state licensing). Separate India and international pathways if both apply.
Cite from evidence [N] only.

### 05 — TRADITIONAL KNOWLEDGE / PRIOR ART
Include ONLY if TK is involved or a prior art concern exists.
- What TK issue was identified
- What prior art consideration applies
- What was retrieved as evidence [N]
- What needs further verification
Do NOT make unsupported patentability conclusions.

### 06 — BIODIVERSITY / ABS
Include ONLY if biological resources or associated TK is involved.
- Why ABS/NBA may apply (cite evidence [N])
- What compliance steps are indicated by evidence [N]
- What information is still missing

### 07 — EVIDENCE & SOURCES
List the key factual claims made in this answer with their evidence citation.
Format each as:
Claim: [short factual claim]
Evidence: [relevant passage from evidence block]
Source: [EVIDENCE [N] — title]

### 08 — CONFIDENCE & LIMITATIONS
State: HIGH / MEDIUM / LOW confidence with explanation.
Explain WHY confidence is at that level (e.g., missing bioassay data,
no prior art search result submitted, limited retrieved evidence).
Do NOT claim high confidence just because you generated a confident answer.

### 09 — INFORMATION STILL REQUIRED
List ONLY genuinely missing information needed for a conclusive assessment.
Be specific. Example: "Exact extraction ratio and solvent details for the
hydro-ethanolic process claimed as novel."
If no information is missing: state "All required information was provided."

### 10 — RECOMMENDED NEXT ACTIONS
List 3–6 practical, prioritised next steps.
Be actionable. Example: "1. File provisional patent application to secure
priority date before public disclosure." Each step should reference why
it is recommended, based on evidence [N] where applicable.

### 11 — EXPERT REVIEW
Include ONLY if the case is complex, uncertain, incomplete, or requires
professional legal action.
State: EXPERT REVIEW RECOMMENDED / NOT REQUIRED AT THIS STAGE
If recommended: specify the domain (Patent Agent / TK Examiner / ABS
Regulatory Expert / Ayurveda IP Specialist) and the specific reason.

═══════════════════════════════════
NOTE
═══════════════════════════════════
- Statutory identifiers (Section 3(p), Patents Act 1970, Form III NBA) may
  be cited in their canonical English form even in non-English responses.
- All explanations, rationale, headings, and recommendations MUST be in {lang_name}.
- Do NOT add any section not listed above.
- Do NOT omit the section number prefix (### 01, ### 02, etc.)

Begin your structured 11-section assessment below:"""

    return prompt
