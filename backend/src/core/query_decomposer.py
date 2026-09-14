from typing import List, Dict, Any, Optional
from ..models.query import QueryAnalysis, CaseBuilderInput

def decompose_query(
    question: str, 
    analysis: QueryAnalysis,
    case_builder_data: Optional[CaseBuilderInput] = None
) -> List[Dict[str, Any]]:
    """
    Decomposes multi-domain queries into targeted sub-queries for collection-specific retrieval.
    """
    sub_queries = []
    text = question

    # Sub-query for Patentability / Sections 3(p), 3(d), 3(e)
    if "PATENTABILITY" in analysis.intent or "PATENT" in analysis.ip_type:
        p_query = f"Patentability criteria Section 3(p) Section 3(e) Section 3(d) Indian Patents Act 1970 {text}"
        if case_builder_data and case_builder_data.ingredients:
            p_query += f" ingredients: {' '.join(case_builder_data.ingredients)}"
        sub_queries.append({
            "domain": "PATENT",
            "query": p_query,
            "target_collections": ["statutes_rules_india", "patent_office_guidelines", "prior_art_patents"]
        })

    # Sub-query for Traditional Knowledge (TKDL)
    if "TRADITIONAL_KNOWLEDGE" in analysis.intent or "TK" in analysis.domain:
        tk_query = f"Traditional Knowledge Digital Library TKDL Ayurveda classical formulary prior art {text}"
        if case_builder_data and case_builder_data.ingredients:
            tk_query += f" herbs: {' '.join(case_builder_data.ingredients)}"
        sub_queries.append({
            "domain": "TK",
            "query": tk_query,
            "target_collections": ["tkdl_reference", "statutes_rules_india", "patent_office_guidelines"]
        })

    # Sub-query for Access & Benefit Sharing (ABS / NBA)
    if "ABS_BIODIVERSITY" in analysis.intent or "ABS" in analysis.domain:
        abs_query = f"Biological Diversity Act 2002 National Biodiversity Authority NBA approval Form III Section 3 Section 6 State Biodiversity Board SBB intimation {text}"
        sub_queries.append({
            "domain": "ABS",
            "query": abs_query,
            "target_collections": ["biodiversity_material", "statutes_rules_india"]
        })

    # Sub-query for Trademark & Branding
    if "TRADEMARK" in analysis.intent:
        tm_query = f"Trade Marks Act 1999 Section 9 distinctiveness Section 11 conflict generic descriptive name {text}"
        sub_queries.append({
            "domain": "TRADEMARK",
            "query": tm_query,
            "target_collections": ["statutes_rules_india", "patent_office_guidelines"]
        })

    # Sub-query for AYUSH Regulatory Licensing
    if "REGULATORY_CLASSIFICATION" in analysis.intent or "AYUSH" in analysis.domain:
        ayush_query = f"AYUSH manufacturing license Drugs and Cosmetics Rules Rule 158-B Schedule T GMP {text}"
        sub_queries.append({
            "domain": "AYUSH",
            "query": ayush_query,
            "target_collections": ["ayush_regulatory", "statutes_rules_india"]
        })

    # Default fallback sub-query if none matched
    if not sub_queries:
        sub_queries.append({
            "domain": "GENERAL_IP",
            "query": text,
            "target_collections": ["statutes_rules_india", "patent_office_guidelines", "tkdl_reference", "biodiversity_material"]
        })

    return sub_queries
