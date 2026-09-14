from typing import List, Dict, Any, Optional
from ..models.case import CaseProfile
from ..models.query import CaseBuilderInput, QueryAnalysis

def build_evidence_context(documents: List[Dict[str, Any]]) -> str:
    """
    Builds structured legal evidence markdown block for the prompt.
    """
    if not documents:
        return "No specific statutory documents retrieved."

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
    Constructs the grounded legal reasoning prompt for LLaMA 3.1 with strict language enforcement.
    """
    evidence_text = build_evidence_context(documents)

    context_details = []
    if case_profile:
        if case_profile.product_name:
            context_details.append(f"- Product/Invention Name: {case_profile.product_name}")
        if case_profile.applicant_type:
            context_details.append(f"- Applicant Type: {case_profile.applicant_type}")
        if case_profile.ingredients:
            context_details.append(f"- Ingredients / Botanical Components: {', '.join(case_profile.ingredients)}")
        if case_profile.biological_material:
            context_details.append("- Biological Resource Involved: YES (Requires NBA/SBB ABS scrutiny)")
        if case_profile.tk_involved:
            context_details.append("- Traditional Knowledge (TK) Involved: YES (Requires Section 3(p) & TKDL scrutiny)")
        if case_profile.export_planned:
            context_details.append("- Export/International Commercialization: YES")

    case_context_str = "\n".join(context_details) if context_details else "Standard general query without prior case profile."

    lang_code = query_analysis.language.lower() if query_analysis.language else "en"
    lang_info = LANGUAGE_DIRECTIVES.get(lang_code, LANGUAGE_DIRECTIVES["en"])
    lang_name = lang_info["name"]
    lang_instruction = lang_info["instruction"]

    prompt = f"""You are IP-SAKTI Sahayak, the authorized Legal AI Assistant for Indian Intellectual Property, Traditional Knowledge (TKDL), and Biological Diversity (ABS/NBA) compliance.

YOUR CORE MANDATE:
1. Provide accurate, clear, legally-grounded guidance based strictly on the provided Legal Evidence and statutory provisions of Indian Law.
2. If Traditional Knowledge is involved, explain Section 3(p) of the Patents Act, 1970 and requirement for experimental synergy / novel extraction.
3. If Biological Resources are used, explain the Biological Diversity Act, 2002 requirements (NBA Form III approval / SBB intimation).
4. Provide structured guidance with:
   - Clear Assessment & Legal Status
   - Specific Statutory Provisions (Citing Acts and Sections)
   - Concrete Actionable Next Steps (e.g. Form filings, testing, prior art search)
   - Strategic Recommendations
5. {lang_instruction}

CASE PROFILE & SUBMISSION CONTEXT:
{case_context_str}

USER QUESTION:
{question}

RETRIEVED LEGAL EVIDENCE:
{evidence_text}

MANDATORY RESPONSE LANGUAGE:
Target Language: {lang_name} ({lang_info['script']})
Direction: {lang_instruction}
Note: Statutory identifiers (such as Section 3(p), Patents Act 1970, Form III NBA) may be cited with their standard statutory names, but your explanations, rationale, headings, and recommendations MUST be written in {lang_name}.

Provide your comprehensive, professional, grounded legal assessment below in {lang_name}:"""

    return prompt
