import re
from typing import Dict, Any, List, Optional
from ..models.query import QueryAnalysis, CaseBuilderInput

# Multilingual keywords and intent lexicons
INTENT_PATTERNS = {
    "TRADITIONAL_KNOWLEDGE": [
        r"traditional knowledge", r"tkdl", r"ayush", r"ayurveda", r"siddha", r"unani", 
        r"herbal", r"herb", r"plant extract", r"ashwagandha", r"curcumin", r"turmeric", 
        r"neem", r"traditional formulation", r"charaka", r"sushruta", r"samhita"
    ],
    "ABS_BIODIVERSITY": [
        r"abs", r"access and benefit sharing", r"biodiversity", r"nba", r"national biodiversity authority",
        r"sbb", r"state biodiversity board", r"biological resource", r"form iii", r"form 3",
        r"section 3 biological", r"section 6 biological", r"foreign entity", r"commercial utilization"
    ],
    "PATENTABILITY": [
        r"patent", r"patentable", r"section 3\(p\)", r"section 3\(d\)", r"section 3\(e\)",
        r"prior art", r"novelty", r"inventive step", r"non-obvious", r"claims", r"infringement",
        r"form 1", r"provisional specification", r"complete specification", r"synergistic"
    ],
    "TRADEMARK": [
        r"trademark", r"trade mark", r"tm", r"brand name", r"logo", r"device mark",
        r"section 9", r"section 11", r"deceptive similarity", r"class 5", r"class 3"
    ],
    "REGULATORY_CLASSIFICATION": [
        r"ayush license", r"manufacturing license", r"rule 158-b", r"schedule t", r"gmp",
        r"drugs and cosmetics", r"fssai", r"proprietary medicine", r"classical medicine"
    ]
}

def analyze_query(
    question: str, 
    requested_language: Optional[str] = "en",
    requested_jurisdiction: Optional[str] = "india",
    case_builder_data: Optional[CaseBuilderInput] = None
) -> QueryAnalysis:
    """
    Classifies intent, IP types, technical domain, jurisdiction, and language from query + context.
    """
    text = question.lower()

    # Normalize and prioritize requested language
    LANG_NORM_MAP = {
        "english": "en", "en": "en",
        "hindi": "hi", "hi": "hi",
        "marathi": "mr", "mr": "mr",
        "gujarati": "gu", "gu": "gu",
        "telugu": "te", "te": "te",
        "kannada": "kn", "kn": "kn",
        "bengali": "bn", "bn": "bn",
        "sanskrit": "sa", "sa": "sa",
        "hinglish": "hinglish"
    }
    cleaned_req = (requested_language or "").lower().strip()
    norm_lang = LANG_NORM_MAP.get(cleaned_req)

    if norm_lang:
        # Selected language is the supreme authority for response language
        detected_lang = norm_lang
    else:
        # Fallback to auto-detection only when no valid language was explicitly requested
        detected_lang = "en"
        if re.search(r"[\u0900-\u097F]", question):
            detected_lang = "hi"
        elif any(word in text.split() for word in ["kya", "kaise", "hai", "mujhe", "karna", "hoga", "chahiye", "patent", "le", "sakte"]):
            detected_lang = "hinglish"

    intents: List[str] = []
    domains: List[str] = ["IP"]
    ip_types: List[str] = []

    # Check intent patterns
    for intent, patterns in INTENT_PATTERNS.items():
        if any(re.search(p, text) for p in patterns):
            intents.append(intent)

    # If Case Builder context is present, enhance intent & domain detection
    if case_builder_data:
        if case_builder_data.tk_involved:
            if "TRADITIONAL_KNOWLEDGE" not in intents:
                intents.append("TRADITIONAL_KNOWLEDGE")
            if "TK" not in domains:
                domains.append("TK")
        if case_builder_data.biological_material:
            if "ABS_BIODIVERSITY" not in intents:
                intents.append("ABS_BIODIVERSITY")
            if "ABS" not in domains:
                domains.append("ABS")
        if case_builder_data.ip_category:
            ip_cat = case_builder_data.ip_category.upper()
            if ip_cat not in ip_types:
                ip_types.append(ip_cat)

    # Keywords related to Indian IP, AYUSH, or legal procedures (multilingual)
    IP_AYUSH_KEYWORDS = [
        "patent", "trademark", "trade mark", "copyright", "design", "gi", "geographical indication",
        "ip", "ipr", "ayush", "ayurveda", "siddha", "unani", "formulation", "kadha", "herb", "herbal",
        "medicine", "drug", "extract", "tkdl", "abs", "biodiversity", "nba", "sbb", "section",
        "statute", "license", "licensing", "fssai", "prior art", "invention", "novelty", "claim",
        "traditional knowledge", "law", "rule", "fee", "fees", "examination", "infringement",
        # Devanagari (Hindi, Marathi, Sanskrit)
        "पेटेंट", "ट्रेडमार्क", "कॉपीराइट", "आयुष", "आयुर्वेद", "काढ़ा", "औषध", "दवा", "जैव विविधता", "टीकेडीएल", "पेटंट", "वनस्पति",
        # Gujarati
        "પેટન્ટ", "આયુર્વેદ", "ઔષધ",
        # Telugu
        "పేటెంట్", "ఆయుర్వేదం",
        # Kannada
        "ಪೇಟೆಂಟ್", "ಆಯುರ್ವೇದ",
        # Bengali
        "পেটেন্ট", "আয়ুর্বেদ", "ঔষধ"
    ]

    has_domain_terms = any(kw in text for kw in IP_AYUSH_KEYWORDS)

    # Check for explicitly out-of-scope questions (weather, sports, politics, general chat)
    OUT_OF_SCOPE_TERMS = [
        "weather", "temperature", "forecast", "rain", "cricket", "football", "match", "score",
        "movie", "film", "song", "actor", "recipe", "cooking", "president", "prime minister",
        "capital of", "joke", "story", "bitcoin", "crypto", "stock market today"
    ]

    is_out_of_scope = any(re.search(r"\b" + re.escape(w) + r"\b", text) for w in OUT_OF_SCOPE_TERMS)

    if (not intents and not has_domain_terms and not case_builder_data) or is_out_of_scope:
        return QueryAnalysis(
            language=detected_lang,
            intent=["OUT_OF_SCOPE"],
            ip_type=[],
            domain=["OUT_OF_SCOPE"],
            jurisdiction=requested_jurisdiction or "india",
            query_type="out_of_scope",
            requires_case_context=False
        )

    # Map intents to IP types and domains
    if "PATENTABILITY" in intents or (not intents and has_domain_terms):
        if "PATENT" not in ip_types:
            ip_types.append("PATENT")
        if not intents:
            intents.append("PATENTABILITY")

    if "TRADEMARK" in intents:
        if "TRADEMARK" not in ip_types:
            ip_types.append("TRADEMARK")

    if "TRADITIONAL_KNOWLEDGE" in intents and "TK" not in domains:
        domains.append("TK")
    if "ABS_BIODIVERSITY" in intents and "ABS" not in domains:
        domains.append("ABS")
    if "REGULATORY_CLASSIFICATION" in intents and "AYUSH" not in domains:
        domains.append("AYUSH")

    jurisdiction = requested_jurisdiction or "india"
    requires_context = bool(case_builder_data) or len(text.split()) > 15

    return QueryAnalysis(
        language=detected_lang,
        intent=intents,
        ip_type=ip_types,
        domain=domains,
        jurisdiction=jurisdiction,
        query_type="case_specific" if requires_context else "general",
        requires_case_context=requires_context
    )
