from typing import Optional, Dict, Any
from datetime import datetime
from ..models.case import CaseProfile
from ..models.query import CaseBuilderInput, QueryAnalysis

def build_case_profile(
    case_id: str,
    question: str,
    query_analysis: QueryAnalysis,
    case_builder_data: Optional[CaseBuilderInput] = None,
    user_id: Optional[str] = "anon_user",
    jurisdiction: str = "india"
) -> CaseProfile:
    """
    Builds a normalized, comprehensive CaseProfile entity by unifying Case Builder inputs,
    question, and multi-domain analysis.
    """
    title = question[:80] + ("..." if len(question) > 80 else "")
    if case_builder_data and case_builder_data.product_name:
        title = f"{case_builder_data.product_name}: {question[:50]}..."

    ip_categories = query_analysis.ip_type
    if case_builder_data and case_builder_data.ip_category:
        if case_builder_data.ip_category.upper() not in ip_categories:
            ip_categories.append(case_builder_data.ip_category.upper())

    ingredients = case_builder_data.ingredients if case_builder_data and case_builder_data.ingredients else []

    return CaseProfile(
        case_id=case_id,
        user_id=user_id or "anon_user",
        title=title,
        product_name=case_builder_data.product_name if case_builder_data else None,
        applicant_type=case_builder_data.applicant_type if case_builder_data else None,
        ip_categories=ip_categories,
        biological_material=case_builder_data.biological_material if case_builder_data else ("ABS" in query_analysis.domain),
        tk_involved=case_builder_data.tk_involved if case_builder_data else ("TK" in query_analysis.domain),
        export_planned=case_builder_data.export_planned if case_builder_data else False,
        key_questions=[question],
        ingredients=ingredients,
        language=query_analysis.language,
        jurisdiction=jurisdiction,
        created_at=datetime.utcnow()
    )
