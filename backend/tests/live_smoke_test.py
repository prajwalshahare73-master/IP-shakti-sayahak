"""
live_smoke_test.py
==================
Automated live smoke test against Render production URL:
https://ip-shakti-sayahak.onrender.com
"""
import time
import json
import httpx

LIVE_BASE_URL = "https://ip-shakti-sayahak.onrender.com"

def poll_health(max_retries=60, delay=10):
    print(f"Polling {LIVE_BASE_URL}/health for live deployment readiness...")
    for i in range(1, max_retries + 1):
        try:
            r = httpx.get(f"{LIVE_BASE_URL}/health", timeout=15.0)
            if r.status_code == 200:
                data = r.json()
                print(f"[Attempt {i}/{max_retries}] Status 200 OK: {json.dumps(data, indent=2)}", flush=True)
                if data.get("status") == "ok":
                    corpus_chunks = data.get("details", {}).get("corpus_chunks", 0)
                    print(f"Health verified! Corpus chunks: {corpus_chunks}", flush=True)
                    return data
            else:
                print(f"[Attempt {i}/{max_retries}] HTTP {r.status_code}: {r.text[:100]}", flush=True)
        except Exception as e:
            print(f"[Attempt {i}/{max_retries}] Waiting for service to respond ({e})...", flush=True)
        time.sleep(delay)
    raise TimeoutError(f"Service at {LIVE_BASE_URL} failed to become healthy within {max_retries * delay}s.")

def test_live_patent_query():
    print("\n--- TEST 1: What is a patent? ---")
    payload = {
        "question": "What is a patent?",
        "case_id": "",
        "session_id": "production-final-smoke-test-patent",
        "language": "en",
        "response_language": "en",
        "jurisdiction": "india",
        "case_builder_data": {
            "product_name": "",
            "applicant_type": "",
            "ip_category": "",
            "biological_material": False,
            "tk_involved": False,
            "export_planned": False,
            "ingredients": [],
            "formulation_details": "",
            "process_description": "",
            "target_countries": []
        },
        "search_context": {}
    }
    r = httpx.post(f"{LIVE_BASE_URL}/api/v1/query", json=payload, timeout=60.0)
    print(f"HTTP Status: {r.status_code}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    print("Question:", data.get("question"))
    print("Answer Preview:\n", data.get("answer", "")[:400], "...")
    print("Confidence:", data.get("confidence"))
    print("Abstained:", data.get("abstained"))
    print("Citations Count:", len(data.get("citations", [])))
    assert data.get("question") == "What is a patent?"
    assert len(data.get("answer", "")) > 50
    assert data.get("answer") != "string"
    return data

def test_live_ayurveda_section3p_query():
    print("\n--- TEST 2: Section 3(p) Ayurvedic Ashwagandha & Turmeric ---")
    payload = {
        "question": "Can I patent a traditional Ayurvedic Ashwagandha and Turmeric formulation under Section 3(p) of the Indian Patents Act?",
        "case_id": "",
        "session_id": "production-final-smoke-test-sec3p",
        "language": "en",
        "response_language": "en",
        "jurisdiction": "india",
        "case_builder_data": {
            "product_name": "AyurImmunity Formulation",
            "applicant_type": "startup",
            "ip_category": "patent",
            "biological_material": True,
            "tk_involved": True,
            "export_planned": False,
            "ingredients": ["Ashwagandha", "Turmeric"],
            "formulation_details": "Polyherbal extract blend",
            "process_description": "Standard aqueous extraction",
            "target_countries": ["India"]
        },
        "search_context": {}
    }
    r = httpx.post(f"{LIVE_BASE_URL}/api/v1/query", json=payload, timeout=60.0)
    print(f"HTTP Status: {r.status_code}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    print("Question:", data.get("question"))
    print("Answer Preview:\n", data.get("answer", "")[:400], "...")
    print("Confidence:", data.get("confidence"))
    print("Abstained:", data.get("abstained"))
    print("Citations Count:", len(data.get("citations", [])))
    print("Human Review:", data.get("human_review"))
    assert len(data.get("answer", "")) > 50
    return data

def test_live_out_of_scope_query():
    print("\n--- TEST 3: Out-of-Scope Query (Safe Abstention) ---")
    payload = {
        "question": "What is the best cricket bat brand in 2026?",
        "case_id": "",
        "session_id": "production-final-smoke-test-oos",
        "language": "en",
        "response_language": "en",
        "jurisdiction": "india",
        "case_builder_data": {
            "product_name": "",
            "applicant_type": "",
            "ip_category": "",
            "biological_material": False,
            "tk_involved": False,
            "export_planned": False,
            "ingredients": [],
            "formulation_details": "",
            "process_description": "",
            "target_countries": []
        },
        "search_context": {}
    }
    r = httpx.post(f"{LIVE_BASE_URL}/api/v1/query", json=payload, timeout=60.0)
    print(f"HTTP Status: {r.status_code}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    data = r.json()
    print("Abstained:", data.get("abstained"))
    print("Confidence:", data.get("confidence"))
    print("Abstention Reason:", data.get("abstention_reason"))
    assert data.get("abstained") is True
    assert data.get("confidence", 1.0) <= 0.3
    return data

if __name__ == "__main__":
    health_data = poll_health(max_retries=50, delay=8)
    q1 = test_live_patent_query()
    q2 = test_live_ayurveda_section3p_query()
    q3 = test_live_out_of_scope_query()
    print("\n============================================================")
    print("ALL LIVE PRODUCTION SMOKE TESTS PASSED SUCCESSFULLY!")
    print("============================================================")
