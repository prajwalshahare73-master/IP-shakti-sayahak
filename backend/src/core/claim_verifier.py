from typing import List, Dict, Any, Tuple
import re
from ..models.query import Citation

def extract_and_verify_citations(
    answer: str,
    retrieved_documents: List[Dict[str, Any]]
) -> Tuple[List[Citation], float]:
    """
    Verifies that the generated answer is grounded in retrieved legal documents,
    and produces structured Citation objects with authority levels and snippets.
    Returns: (citations_list, grounding_score)
    """
    citations: List[Citation] = []
    answer_lower = answer.lower()
    grounded_evidence_count = 0

    for doc in retrieved_documents:
        doc_title = doc.get("title", "")
        doc_section = doc.get("section", "")
        doc_act = doc.get("act", "")
        doc_content = doc.get("content", "")

        # Check if the document's specific section is referenced
        is_referenced = False
        if doc_section and doc_section.lower() in answer_lower:
            is_referenced = True
        else:
            # Check for distinctive keyword overlap from title/tags (excluding generic act terms)
            keywords = [w for w in re.findall(r"\w+", doc_title.lower()) if len(w) > 4 and w not in ("patents", "statute", "rules", "india", "section", "guidelines")]
            matches = sum(1 for kw in keywords if kw in answer_lower)
            if matches >= 2:
                is_referenced = True

        if is_referenced:
            grounded_evidence_count += 1
            citation = Citation(
                id=doc.get("id", f"CIT-{len(citations)+1}"),
                title=doc_title,
                section=doc_section,
                act=doc_act,
                authority_level=doc.get("authority_level", 1),
                url=doc.get("url"),
                snippet=doc.get("snippet", doc_content[:200]),
                year=doc.get("year", 2024),
                relevance_score=round(doc.get("rerank_score", 0.85), 2)
            )
            citations.append(citation)

    # Only include citations that have genuine grounding in the answer and retrieved text.
    # We do NOT fabricate or attach fallback citations when there is no supporting evidence.
    grounding_ratio = grounded_evidence_count / max(len(retrieved_documents), 1) if retrieved_documents else 0.0
    return citations, round(grounding_ratio, 2)
