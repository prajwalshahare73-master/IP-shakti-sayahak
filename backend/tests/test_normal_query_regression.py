import asyncio
import json
import sys
import os
from pathlib import Path

# Ensure paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

os.environ["APP_ENV"] = "development"
os.environ["DISABLE_VECTOR_EMBEDDINGS"] = "true"
os.environ["DISABLE_HEAVY_RERANKER"] = "true"

from backend.src.api.v1.query import execute_query_pipeline
from backend.src.models.query import QueryRequest

TEST_CASES = [
    # 1. Definitions
    {
        "id": "TC-01",
        "category": "Definition",
        "query": "What is a patent?",
        "should_abstain": False,
        "expected_domain": "PATENT"
    },
    {
        "id": "TC-02",
        "category": "Definition - TKDL",
        "query": "What is TKDL?",
        "should_abstain": False,
        "expected_domain": "TK"
    },
    {
        "id": "TC-03",
        "category": "Definition - ABS",
        "query": "What is ABS in Ayurveda?",
        "should_abstain": False,
        "expected_domain": "ABS"
    },
    {
        "id": "TC-04",
        "category": "Definition - GI",
        "query": "What is GI or Geographical Indication for herbal products?",
        "should_abstain": False,
        "expected_domain": "IP"
    },
    # 2. Comparison Queries
    {
        "id": "TC-05",
        "category": "Comparison",
        "query": "What is the difference between patent and trademark?",
        "should_abstain": False,
        "expected_domain": "IP"
    },
    # 3. Ayurveda IP & Formulations
    {
        "id": "TC-06",
        "category": "Ayurveda IP",
        "query": "patent for ayurvedic hair oil",
        "should_abstain": False,
        "expected_domain": "PATENT"
    },
    {
        "id": "TC-07",
        "category": "Ayurveda IP - Classical",
        "query": "Can I patent a classical polyherbal kadha under Section 3(p)?",
        "should_abstain": False,
        "expected_domain": "PATENT"
    },
    # 4. Traditional Knowledge & Section 3(p)
    {
        "id": "TC-08",
        "category": "Traditional Knowledge",
        "query": "How does Section 3(p) of the Indian Patents Act prevent biopiracy of traditional knowledge?",
        "should_abstain": False,
        "expected_domain": "PATENT"
    },
    # 5. Access & Benefit Sharing / NBA
    {
        "id": "TC-09",
        "category": "ABS / NBA",
        "query": "When is NBA Form III prior approval mandatory under the Biological Diversity Act 2002?",
        "should_abstain": False,
        "expected_domain": "ABS"
    },
    # 6. Trademark
    {
        "id": "TC-10",
        "category": "Trademark",
        "query": "Can I register a generic Ayurvedic herb name like Pure Ashwagandha as a trademark?",
        "should_abstain": False,
        "expected_domain": "TRADEMARK"
    },
    # 7. Regulatory & AYUSH Licensing
    {
        "id": "TC-11",
        "category": "Regulatory",
        "query": "What are the manufacturing license requirements for proprietary Ayurvedic medicines under Rule 158-B?",
        "should_abstain": False,
        "expected_domain": "AYUSH"
    },
    # 8. Patent Synergy & Section 3(e)
    {
        "id": "TC-12",
        "category": "Patentability - Synergy",
        "query": "What evidence is required to overcome Section 3(e) mere admixture rejection for herbal formulations?",
        "should_abstain": False,
        "expected_domain": "PATENT"
    },
    # 9. Multilingual Queries (Hindi, Marathi)
    {
        "id": "TC-13",
        "category": "Multilingual - Hindi",
        "query": "आयुर्वेदिक औषधि के लिए पेटेंट कैसे प्राप्त करें?",
        "should_abstain": False,
        "expected_domain": "PATENT"
    },
    {
        "id": "TC-14",
        "category": "Multilingual - Hinglish",
        "query": "Kya hum ayurvedic formulation ka patent le sakte hain?",
        "should_abstain": False,
        "expected_domain": "PATENT"
    },
    # 10. Deliberate Unsupported / No-Evidence Queries
    {
        "id": "TC-15",
        "category": "No-Evidence / Unsupported",
        "query": "How to register a Martian quantum telepathy patent in Antarctica?",
        "should_abstain": True,
        "expected_domain": "OUT_OF_SCOPE"
    },
    {
        "id": "TC-16",
        "category": "No-Evidence / Unsupported",
        "query": "What is the cryptocurrency staking yield for alien blockchain tokens?",
        "should_abstain": True,
        "expected_domain": "OUT_OF_SCOPE"
    }
]

async def run_suite():
    print("=" * 70)
    print("IP-SAKTI Sahayak — Master Normal Query Acceptance & Regression Suite")
    print("=" * 70)

    results = []
    supported_pass_count = 0
    total_supported = 0
    no_evidence_pass_count = 0
    total_no_evidence = 0
    false_abstention_count = 0

    for tc in TEST_CASES:
        req = QueryRequest(question=tc["query"], jurisdiction="india")
        res = await execute_query_pipeline(req)

        is_no_evidence = tc["should_abstain"]
        if is_no_evidence:
            total_no_evidence += 1
            passed = res.abstained is True
            if passed:
                no_evidence_pass_count += 1
        else:
            total_supported += 1
            passed = res.abstained is False and len(res.answer) > 50 and len(res.citations) > 0
            if passed:
                supported_pass_count += 1
            elif res.abstained:
                false_abstention_count += 1

        status_str = "PASS" if passed else "FAIL"
        reformulated = res.query_analysis.reformulated_query or "N/A"
        citations_count = len(res.citations)
        sources_count = len(res.sources)

        print(f"\n[{tc['id']}] Category: {tc['category']}")
        print(f"  Query: {tc['query']}")
        print(f"  Reformulated: {reformulated}")
        print(f"  Retrieved Sources: {sources_count} | Citations: {citations_count}")
        print(f"  Confidence: {res.confidence} ({res.confidence_label})")
        print(f"  Abstained: {res.abstained} (Expected Abstain: {tc['should_abstain']})")
        print(f"  Answer Snippet: {res.answer[:120]}...")
        print(f"  Result: {status_str}")

        results.append({
            "id": tc["id"],
            "query": tc["query"],
            "reformulated": reformulated,
            "sources_count": sources_count,
            "citations_count": citations_count,
            "confidence": res.confidence,
            "abstained": res.abstained,
            "expected_abstain": tc["should_abstain"],
            "passed": passed
        })

    print("\n" + "=" * 70)
    print("EVALUATION SUMMARY")
    print("=" * 70)
    direct_answer_rate = (supported_pass_count / total_supported) * 100
    safe_abstention_rate = (no_evidence_pass_count / total_no_evidence) * 100

    print(f"Supported Queries Total: {total_supported}")
    print(f"Direct Answers Generated: {supported_pass_count}/{total_supported} ({direct_answer_rate:.1f}%)")
    print(f"False Self-Abstention Count: {false_abstention_count}")
    print(f"No-Evidence Queries Total: {total_no_evidence}")
    print(f"Safe Abstention Accuracy: {no_evidence_pass_count}/{total_no_evidence} ({safe_abstention_rate:.1f}%)")
    print("=" * 70)

    assert direct_answer_rate >= 95.0, f"Direct answer rate {direct_answer_rate}% is below 95%"
    assert false_abstention_count == 0, f"False self-abstentions detected: {false_abstention_count}"
    assert safe_abstention_rate >= 95.0, f"Safe abstention rate {safe_abstention_rate}% is below 95%"
    print("ALL ACCEPTANCE CRITERIA SATISFIED! (100% PASS)")

if __name__ == "__main__":
    asyncio.run(run_suite())
