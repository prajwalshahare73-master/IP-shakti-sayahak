import requests
import json
import sqlite3
from pathlib import Path

BASE_URL = "http://localhost:8000"

def run_pre_deployment_e2e():
    print("=" * 70)
    print("STARTING COMPLETE PRE-DEPLOYMENT E2E FEATURE VERIFICATION")
    print("Target: Backend on http://localhost:8000")
    print("=" * 70)

    # 1. Health Verification
    h_res = requests.get(f"{BASE_URL}/health")
    assert h_res.status_code == 200, f"Health check failed: {h_res.text}"
    h_data = h_res.json()
    print(f"[OK Health Check] Status: {h_data.get('status')}, Corpus chunks: {h_data.get('details', {}).get('corpus_docs')}")

    # 2. Quick Query Feature Verification
    query_payload = {
        "question": "What is the requirement under Section 3(p) of the Patents Act regarding traditional knowledge?",
        "language": "en",
        "jurisdiction": "india"
    }
    q_res = requests.post(f"{BASE_URL}/v1/query", json=query_payload, timeout=120)
    assert q_res.status_code == 200, f"Quick Query failed: {q_res.text}"
    q_data = q_res.json()
    assert q_data.get("abstained") is False, "Positive query should not abstain!"
    assert q_data.get("confidence") >= 0.7, f"Confidence too low: {q_data.get('confidence')}"
    assert len(q_data.get("citations", [])) > 0, "Citations list empty!"
    print(f"[OK Quick Query Feature] Answer length: {len(q_data['answer'])}, Confidence: {q_data['confidence']}, Citations: {len(q_data['citations'])}")

    # 3. Case Builder Feature Verification
    cb_payload = {
        "title": "Adhatoda Vasaka Herbal Kadha Case",
        "language": "en",
        "jurisdiction": "india",
        "initial_question": "Verify Section 3(p) and 3(e) patentability.",
        "case_builder_data": {
            "product_name": "Adhatoda Vasaka Herbal Kadha",
            "applicant_type": "Indian Startup",
            "ip_category": "Proprietary Ayurvedic Medicine",
            "biological_material": True,
            "tk_involved": True,
            "ingredients": ["Vasaka 50%", "Mulethi 30%", "Kantakari 20%"]
        }
    }
    cb_res = requests.post(f"{BASE_URL}/v1/cases", json=cb_payload)
    assert cb_res.status_code == 200, f"Case creation failed: {cb_res.text}"
    case_record = cb_res.json()
    case_id = case_record["id"]
    print(f"[OK Case Builder Creation] Case created with ID: {case_id}")

    # 4. Case Analysis Feature Verification
    an_res = requests.post(f"{BASE_URL}/v1/cases/{case_id}/analyze", json={"response_language": "en"}, timeout=120)
    assert an_res.status_code == 200, f"Case analysis failed: {an_res.text}"
    an_data = an_res.json()
    assert an_data.get("status") in ["analysis_complete", "IN_REVIEW"], f"Unexpected analyze status: {an_data.get('status')}"

    # Verify updated case record status
    case_check_res = requests.get(f"{BASE_URL}/v1/cases/{case_id}")
    assert case_check_res.status_code == 200, f"Get case check failed: {case_check_res.text}"
    updated_case_record = case_check_res.json()
    assert updated_case_record["status"] == "IN_REVIEW", f"Case status not updated in DB! Got: {updated_case_record['status']}"
    print(f"[OK Case Analysis Feature] Analyzed status: {updated_case_record['status']}, Confidence: {an_data.get('confidence')}")

    # 5. Expert Portal Feature Verification
    login_res = requests.post(f"{BASE_URL}/v1/expert/login", json={"email": "dr.patel@ipsakti.gov.in", "password": "password123"})
    assert login_res.status_code == 200, f"Expert login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    
    exp_res = requests.get(f"{BASE_URL}/v1/expert/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert exp_res.status_code == 200, f"Expert list cases failed: {exp_res.text}"
    exp_cases = exp_res.json()
    assert any(c["id"] == case_id for c in exp_cases), "Created case missing from Expert portal queue!"
    print(f"[OK Expert Portal Queue] Logged in as Dr. Patel. Verified {len(exp_cases)} cases accessible in expert dashboard.")

    # 6. Disk Persistence Check
    db_path = Path("backend/data/ip_sakthi_db.sqlite")
    assert db_path.exists(), "SQLite database file missing!"
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cases")
    count = cursor.fetchone()[0]
    conn.close()
    assert count > 0, "No cases found in disk database!"
    print(f"[OK Disk Persistence Engine] Verified {count} total persistent cases in SQLite DB.")

    print("=" * 70)
    print("ALL PRE-DEPLOYMENT E2E TESTS PASSED (100% READY FOR RENDER & VERCEL)")
    print("=" * 70)

if __name__ == "__main__":
    run_pre_deployment_e2e()
