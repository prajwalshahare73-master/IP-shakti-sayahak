from typing import List, Dict, Any, Optional
from ..models.query import QueryAnalysis, CaseBuilderInput


def _build_case_context_string(case_builder_data: Optional[CaseBuilderInput]) -> str:
    """
    Serialises all Case Builder fields into a retrieval-query context string.
    Every field contributes to the retrieval query so that the RAG retriever
    can surface maximally relevant statutory evidence.

    IMPORTANT: This function only assembles text for query construction.
    It never makes legal determinations.
    """
    if not case_builder_data:
        return ""

    parts = []

    if case_builder_data.product_name:
        parts.append(f"product: {case_builder_data.product_name}")

    if case_builder_data.applicant_type:
        parts.append(f"applicant type: {case_builder_data.applicant_type}")

    if case_builder_data.ip_category:
        parts.append(f"IP category: {case_builder_data.ip_category}")

    if case_builder_data.ingredients:
        parts.append(f"ingredients/components: {', '.join(case_builder_data.ingredients)}")

    if case_builder_data.formulation_details:
        parts.append(f"formulation details: {case_builder_data.formulation_details}")

    if case_builder_data.process_description:
        parts.append(f"extraction/process innovation: {case_builder_data.process_description}")

    if case_builder_data.biological_material:
        parts.append("biological resource involved: yes")

    if case_builder_data.tk_involved:
        parts.append("traditional knowledge involved: yes")

    if case_builder_data.export_planned:
        parts.append("international commercialization/export planned: yes")

    if case_builder_data.target_countries:
        parts.append(f"target countries: {', '.join(case_builder_data.target_countries)}")

    return " | ".join(parts)


def decompose_query(
    question: str,
    analysis: QueryAnalysis,
    case_builder_data: Optional[CaseBuilderInput] = None
) -> List[Dict[str, Any]]:
    """
    Decomposes multi-domain queries into targeted sub-queries for collection-specific retrieval.

    All Case Builder fields are incorporated into the retrieval query context so that:
    - Ingredient-specific prior art can be found (TKDL cross-reference)
    - Process/extraction innovations are surfaced as patentable subject matter
    - Biological resource flags trigger ABS retrieval
    - TK flags trigger TKDL and Section 3(p) retrieval
    - Export flags trigger international treaty and TRIPS retrieval
    - Target countries influence jurisdictional filtering
    """
    sub_queries = []
    text = question

    # Serialise all case builder context into a retrieval context string
    case_context = _build_case_context_string(case_builder_data)

    # Sub-query for Patentability / Sections 3(p), 3(d), 3(e)
    if "PATENTABILITY" in analysis.intent or "PATENT" in analysis.ip_type:
        p_query = (
            f"Patentability criteria Section 3(p) Section 3(e) Section 3(d) "
            f"Indian Patents Act 1970 novelty inventive step {text}"
        )
        if case_context:
            p_query += f" | {case_context}"
        sub_queries.append({
            "domain": "PATENT",
            "query": p_query,
            "target_collections": ["statutes_rules_india", "patent_office_guidelines", "prior_art_patents"]
        })

    # Sub-query for Traditional Knowledge (TKDL)
    if "TRADITIONAL_KNOWLEDGE" in analysis.intent or "TK" in analysis.domain:
        tk_query = (
            f"Traditional Knowledge Digital Library TKDL Ayurveda classical formulary "
            f"prior art Charaka Samhita Sushruta Samhita Section 3(p) {text}"
        )
        if case_builder_data and case_builder_data.ingredients:
            tk_query += f" herbs: {', '.join(case_builder_data.ingredients)}"
        if case_builder_data and case_builder_data.formulation_details:
            tk_query += f" | formulation: {case_builder_data.formulation_details}"
        if case_context:
            tk_query += f" | {case_context}"
        sub_queries.append({
            "domain": "TK",
            "query": tk_query,
            "target_collections": ["tkdl_reference", "statutes_rules_india", "patent_office_guidelines"]
        })

    # Sub-query for Access & Benefit Sharing (ABS / NBA)
    if "ABS_BIODIVERSITY" in analysis.intent or "ABS" in analysis.domain:
        abs_query = (
            f"Biological Diversity Act 2002 National Biodiversity Authority NBA "
            f"approval Form III Section 3 Section 6 State Biodiversity Board SBB "
            f"intimation commercial utilization biological resource {text}"
        )
        if case_builder_data and case_builder_data.target_countries:
            abs_query += f" | target markets: {', '.join(case_builder_data.target_countries)}"
        if case_context:
            abs_query += f" | {case_context}"
        sub_queries.append({
            "domain": "ABS",
            "query": abs_query,
            "target_collections": ["biodiversity_material", "statutes_rules_india"]
        })

    # Sub-query for Trademark & Branding
    if "TRADEMARK" in analysis.intent:
        tm_query = (
            f"Trade Marks Act 1999 Section 9 distinctiveness Section 11 conflict "
            f"generic descriptive name AYUSH Class 5 trademark registration {text}"
        )
        if case_builder_data and case_builder_data.product_name:
            tm_query += f" | brand name: {case_builder_data.product_name}"
        if case_context:
            tm_query += f" | {case_context}"
        sub_queries.append({
            "domain": "TRADEMARK",
            "query": tm_query,
            "target_collections": ["statutes_rules_india", "patent_office_guidelines"]
        })

    # Sub-query for AYUSH Regulatory Licensing
    if "REGULATORY_CLASSIFICATION" in analysis.intent or "AYUSH" in analysis.domain:
        ayush_query = (
            f"AYUSH manufacturing license Drugs and Cosmetics Rules Rule 158-B "
            f"Schedule T GMP proprietary Ayurvedic medicine licensing {text}"
        )
        if case_builder_data and case_builder_data.formulation_details:
            ayush_query += f" | formulation: {case_builder_data.formulation_details}"
        if case_context:
            ayush_query += f" | {case_context}"
        sub_queries.append({
            "domain": "AYUSH",
            "query": ayush_query,
            "target_collections": ["ayush_regulatory", "statutes_rules_india"]
        })

    # Sub-query for International / Export jurisdiction
    if (
        case_builder_data
        and case_builder_data.export_planned
        and case_builder_data.target_countries
    ):
        intl_query = (
            f"TRIPS Agreement international patent protection PCT application "
            f"foreign filing export commercialization {text} "
            f"| target countries: {', '.join(case_builder_data.target_countries)}"
        )
        sub_queries.append({
            "domain": "INTERNATIONAL",
            "query": intl_query,
            "target_collections": ["statutes_rules_india", "patent_office_guidelines"]
        })

    # Default fallback sub-query if none matched
    if not sub_queries:
        fallback_query = text
        if case_context:
            fallback_query += f" | {case_context}"
        sub_queries.append({
            "domain": "GENERAL_IP",
            "query": fallback_query,
            "target_collections": [
                "statutes_rules_india",
                "patent_office_guidelines",
                "tkdl_reference",
                "biodiversity_material"
            ]
        })

    return sub_queries
