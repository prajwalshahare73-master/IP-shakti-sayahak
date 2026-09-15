#!/usr/bin/env python3
"""
smoke_test_api.py
=================
Configurable HTTP smoke test for the IP-SAKTI Sahayak backend.

Usage:
    python tests/smoke_test_api.py                          # targets http://localhost:8000
    BASE_URL=https://ip-shakti-sayahak.onrender.com python tests/smoke_test_api.py

Environment:
    BASE_URL   Backend base URL (default: http://localhost:8000)
"""
import os
import sys
import json
import time
import httpx

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000").rstrip("/")

GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

results = []


def ok(msg):
    print(f"  {GREEN}PASS{RESET}  {msg}")
    results.append(True)


def fail(msg):
    print(f"  {RED}FAIL{RESET}  {msg}")
    results.append(False)


def warn(msg):
    print(f"  {YELLOW}WARN{RESET}  {msg}")


def section(title):
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  {title}{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")


# ==============================================================================
# TEST 1: Health check
# ==============================================================================
section("1. Health Check")
try:
    t0 = time.time()
    r = httpx.get(f"{BASE_URL}/health", timeout=15)
    elapsed = round(time.time() - t0, 2)
    if r.status_code == 200:
        ok(f"GET /health -> 200 ({elapsed}s)")
        data = r.json()
        if data.get("status") == "ok":
            ok("  status: ok")
        else:
            fail(f"  status: {data.get('status')}")
        print(f"     bm25: {data.get('bm25')}")
        print(f"     chroma: {data.get('chroma')}")
        print(f"     ollama: {data.get('ollama')}")
        print(f"     corpus_docs: {data.get('details',{}).get('corpus_docs','?')}")
    else:
        fail(f"GET /health -> {r.status_code}")
except Exception as e:
    fail(f"GET /health raised: {e}")


# ==============================================================================
# TEST 2: POST /api/v1/query — General patent query
# ==============================================================================
section('2. Query: "What is a patent?"')
PATENT_PAYLOAD = {
    "question": "What is a patent?",
    "case_id": "", "session_id": "smoke-001",
    "language": "en", "response_language": "en", "jurisdiction": "india",
    "case_builder_data": {
        "product_name":"","applicant_type":"","ip_category":"",
        "biological_material":False,"tk_involved":False,"export_planned":False,
        "ingredients":[],"formulation_details":"","process_description":"","target_countries":[]
    },
    "search_context": {}
}
try:
    t0 = time.time()
    r = httpx.post(f"{BASE_URL}/api/v1/query", json=PATENT_PAYLOAD, timeout=120)
    elapsed = round(time.time() - t0, 2)
    if r.status_code == 200:
        ok(f"POST /api/v1/query -> 200 ({elapsed}s)")
        data = r.json()
        answer = data.get("answer", "")
        if answer and answer not in ("string", "", "null") and len(answer) > 50:
            ok(f"  answer is real content ({len(answer)} chars)")
        else:
            fail(f"  answer is placeholder or empty: {repr(answer[:100])}")
        sources = data.get("sources", [])
        citations = data.get("citations", [])
        confidence = data.get("confidence", None)
        abstained = data.get("abstained", None)
        print(f"     query_id:  {data.get('query_id','?')}")
        print(f"     confidence: {confidence}")
        print(f"     abstained:  {abstained}")
        print(f"     sources:    {len(sources)}")
        print(f"     citations:  {len(citations)}")
        print(f"     answer[:150]: {answer[:150].strip()}")
        if confidence is not None:
            ok(f"  confidence field present: {confidence}")
        else:
            fail("  confidence field missing")
    else:
        fail(f"POST /api/v1/query -> {r.status_code}: {r.text[:300]}")
except Exception as e:
    fail(f"POST /api/v1/query raised: {e}")


# ==============================================================================
# TEST 3: POST /api/v1/query — TK domain query
# ==============================================================================
section("3. Domain Query: Traditional Knowledge / Section 3(p)")
TK_PAYLOAD = {
    "question": "Can I patent a traditional Ayurvedic Ashwagandha and Turmeric formulation under Section 3(p) of the Indian Patents Act?",
    "case_id": "", "session_id": "smoke-002",
    "language": "en", "response_language": "en", "jurisdiction": "india",
    "case_builder_data": {
        "product_name":"AyurBoost","applicant_type":"startup","ip_category":"patent",
        "biological_material":True,"tk_involved":True,"export_planned":False,
        "ingredients":["Ashwagandha","Turmeric"],"formulation_details":"Polyherbal capsule",
        "process_description":"Standard extraction","target_countries":[]
    },
    "search_context": {}
}
try:
    t0 = time.time()
    r = httpx.post(f"{BASE_URL}/api/v1/query", json=TK_PAYLOAD, timeout=120)
    elapsed = round(time.time() - t0, 2)
    if r.status_code == 200:
        ok(f"POST /api/v1/query (TK) -> 200 ({elapsed}s)")
        data = r.json()
        sources = data.get("sources", [])
        citations = data.get("citations", [])
        answer = data.get("answer","")
        print(f"     confidence: {data.get('confidence')}")
        print(f"     abstained:  {data.get('abstained')}")
        print(f"     sources:    {len(sources)}")
        print(f"     citations:  {len(citations)}")
        if len(sources) > 0 or len(citations) > 0:
            ok(f"  evidence present (sources={len(sources)}, citations={len(citations)})")
        else:
            warn("  sources & citations are empty — BM25 may not be finding matches")
        if answer and len(answer) > 50:
            ok(f"  answer contains content ({len(answer)} chars)")
        else:
            fail(f"  answer too short: {repr(answer[:100])}")
    else:
        fail(f"POST /api/v1/query (TK) -> {r.status_code}: {r.text[:300]}")
except Exception as e:
    fail(f"POST /api/v1/query (TK) raised: {e}")


# ==============================================================================
# TEST 4: Out-of-scope query triggers abstention
# ==============================================================================
section("4. Out-of-Scope Query — Safe Abstention")
OOS_PAYLOAD = {
    "question": "What is the best cricket bat for Test matches?",
    "case_id": "", "session_id": "smoke-003",
    "language": "en", "response_language": "en", "jurisdiction": "india",
    "case_builder_data": {
        "product_name":"","applicant_type":"","ip_category":"",
        "biological_material":False,"tk_involved":False,"export_planned":False,
        "ingredients":[],"formulation_details":"","process_description":"","target_countries":[]
    },
    "search_context": {}
}
try:
    t0 = time.time()
    r = httpx.post(f"{BASE_URL}/api/v1/query", json=OOS_PAYLOAD, timeout=120)
    elapsed = round(time.time() - t0, 2)
    if r.status_code == 200:
        ok(f"POST /api/v1/query (OOS) -> 200 ({elapsed}s)")
        data = r.json()
        abstained = data.get("abstained", False)
        confidence = data.get("confidence", 1.0)
        if abstained:
            ok(f"  abstained=true (correct)")
        else:
            fail(f"  abstained=false for out-of-scope query")
        if confidence <= 0.3:
            ok(f"  confidence={confidence} (correctly low)")
        else:
            fail(f"  confidence={confidence} (too high for OOS)")
    else:
        fail(f"POST /api/v1/query (OOS) -> {r.status_code}: {r.text[:300]}")
except Exception as e:
    fail(f"POST /api/v1/query (OOS) raised: {e}")


# ==============================================================================
# Summary
# ==============================================================================
section("SUMMARY")
passed = sum(1 for r in results if r)
total  = len(results)
failed = total - passed
print(f"  Passed: {GREEN}{passed}{RESET} / {total}")
if failed:
    print(f"  Failed: {RED}{failed}{RESET} / {total}")
    sys.exit(1)
else:
    print(f"  {GREEN}All smoke tests passed!{RESET}")
    sys.exit(0)
