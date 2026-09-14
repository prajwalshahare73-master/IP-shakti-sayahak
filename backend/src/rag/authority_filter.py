from typing import List, Dict, Any, Optional

def filter_by_authority_and_jurisdiction(
    documents: List[Dict[str, Any]],
    target_jurisdiction: str = "india",
    min_authority_level: int = 1,
    max_authority_level: int = 4,
    enforce_current_version_only: bool = True
) -> List[Dict[str, Any]]:
    """
    Filters retrieved candidate documents by:
    - Authority Level (1 = Statute/Rules, 2 = Official Guidelines, 3 = Case Law/Examiner precedents, 4 = Commentary)
    - Jurisdiction match (India vs International)
    - Document version status (Active / Current vs Repealed)
    """
    filtered = []
    for doc in documents:
        # Check jurisdiction
        doc_jurisdiction = doc.get("jurisdiction", "india").lower()
        if target_jurisdiction.lower() != "all" and doc_jurisdiction != "global" and doc_jurisdiction != target_jurisdiction.lower():
            continue

        # Check authority level safely
        raw_auth = doc.get("authority_level", 2)
        try:
            auth_level = int(raw_auth)
        except (ValueError, TypeError):
            auth_level = 2
        doc["authority_level"] = auth_level

        if not (min_authority_level <= auth_level <= max_authority_level):
            continue

        # Check version status
        is_active = doc.get("is_active", True)
        if enforce_current_version_only and not is_active:
            continue

        filtered.append(doc)

    # Sort primarily by authority level ascending (1 is highest authority) and secondarily by relevance score
    def _sort_key(d):
        raw_a = d.get("authority_level", 3)
        try:
            a_int = int(raw_a)
        except (ValueError, TypeError):
            a_int = 3
        rel = d.get("relevance_score", d.get("rrf_score", 0.0))
        try:
            rel_f = float(rel)
        except (ValueError, TypeError):
            rel_f = 0.0
        return (a_int, -rel_f)

    filtered.sort(key=_sort_key)
    return filtered
