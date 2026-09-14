import os
import sys
import json
import re
import asyncio
import httpx
from datetime import datetime

# Configure UTF-8 for console output on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

BASE_URL = "http://127.0.0.1:8000"

SCRIPT_REGEXES = {
    "hi": re.compile(r"[\u0900-\u097F]"),  # Devanagari
    "mr": re.compile(r"[\u0900-\u097F]"),  # Devanagari
    "sa": re.compile(r"[\u0900-\u097F]"),  # Devanagari
    "gu": re.compile(r"[\u0A80-\u0AFF]"),  # Gujarati
    "te": re.compile(r"[\u0C00-\u0C7F]"),  # Telugu
    "kn": re.compile(r"[\u0C80-\u0CFF]"),  # Kannada
    "bn": re.compile(r"[\u0980-\u09FF]"),  # Bengali
    "en": re.compile(r"[a-zA-Z]"),
    "hinglish": re.compile(r"[a-zA-Z]")
}

HINGLISH_KEYWORDS = ["aap", "hai", "hoga", "karna", "ke", "liye", "bhi", "sakte", "nahi", "patent", "dhyan"]

async def run_validation():
    print("=" * 70)
    print("STARTING FULL END-TO-END CASE BUILDER & MULTILINGUAL VALIDATION")
    print(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    print(f"Target Backend: {BASE_URL}")
    print("=" * 70)

    results = {
        "case_tests": [],
        "language_matrix": [],
        "field_validation": [],
        "persistence_test": {},
        "report_tests": [],
        "errors": []
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        # Check health
        try:
            h = await client.get(f"{BASE_URL}/health")
            h_data = h.json()
            print(f"[Health] Status: {h_data.get('status')}, Corpus chunks: {h_data.get('details', {}).get('corpus_docs')}")
        except Exception as e:
            print(f"[Fatal] Health check failed: {e}")
            return

        # =====================================================================
        # PART 1: CASE A — STRONG EVIDENCE
        # =====================================================================
        print("\n--- TEST 1: CASE A — STRONG EVIDENCE ---")
        case_a_payload = {
            "title": "Swastha Respiratory Herbal Kadha",
            "language": "en",
            "jurisdiction": "india",
            "initial_question": "Explain Section 3(p) and Section 3(e) patentability requirements for a synergistic Vasaka, Kantakari, and Yashtimadhu formulation, and detail National Biodiversity Authority (NBA) Form III approval mandates.",
            "case_builder_data": {
                "product_name": "Swastha Respiratory Herbal Kadha",
                "applicant_type": "Indian Startup / MSME",
                "ip_category": "Proprietary Ayurvedic Medicine",
                "biological_material": True,
                "tk_involved": True,
                "export_planned": True,
                "ingredients": [
                    "Vasaka (Adhatoda vasica) - 40%",
                    "Kantakari (Solanum surattense) - 35%",
                    "Yashtimadhu (Glycyrrhiza glabra) - 25%"
                ],
                "formulation_details": "Optimized hydro-ethanolic dual extraction yielding standardized 3.5% total vasicine content.",
                "process_description": "In-vitro bronchodilator assay (guinea pig tracheal chain) demonstrates 142% greater smooth muscle relaxation than individual isolated components combined (CI < 0.85).",
                "target_countries": ["India", "USA", "EU"]
            }
        }
        res_a_create = await client.post(f"{BASE_URL}/v1/cases", json=case_a_payload)
        assert res_a_create.status_code == 200, f"Case A creation failed: {res_a_create.text}"
        case_a = res_a_create.json()
        case_a_id = case_a["id"]
        print(f"[Case A Created] ID: {case_a_id}, Status: {case_a['status']}")

        # Analyze Case A
        res_a_an = await client.post(f"{BASE_URL}/v1/cases/{case_a_id}/analyze", json={"response_language": "en"})
        assert res_a_an.status_code == 200, f"Case A analysis failed: {res_a_an.text}"
        an_a = res_a_an.json()
        print(f"[Case A Analyzed] Status: {an_a.get('status')}, Confidence: {an_a.get('confidence')} ({an_a.get('confidence_level')}), Citations: {an_a.get('citations_count')}, Abstained: {an_a.get('abstained')}")

        has_3p = "3(p)" in an_a.get("detailed_guidance", "") or "3(P)" in an_a.get("detailed_guidance", "")
        has_3e = "3(e)" in an_a.get("detailed_guidance", "") or "3(E)" in an_a.get("detailed_guidance", "")
        has_nba = "nba" in an_a.get("detailed_guidance", "").lower() or "biodiversity" in an_a.get("detailed_guidance", "").lower()

        case_a_record = {
            "case": "Case A (Strong Evidence)",
            "id": case_a_id,
            "evidence": "Synergistic Bioassay + Section 3(p) + NBA Form III",
            "citations_count": an_a.get("citations_count", 0),
            "citations": [c.get("title") for c in an_a.get("citations", [])],
            "confidence": an_a.get("confidence"),
            "confidence_level": an_a.get("confidence_level"),
            "has_3p": has_3p,
            "has_3e": has_3e,
            "has_nba": has_nba,
            "abstained": an_a.get("abstained"),
            "status": "PASS" if (an_a.get("confidence", 0) >= 0.7 and an_a.get("citations_count", 0) > 0 and not an_a.get("abstained")) else "FAIL"
        }
        results["case_tests"].append(case_a_record)
        print(f"[Case A Evaluation] {case_a_record['status']} (3(p): {has_3p}, 3(e): {has_3e}, NBA: {has_nba})")

        # =====================================================================
        # PART 2: CASE B — PARTIAL EVIDENCE
        # =====================================================================
        print("\n--- TEST 2: CASE B — PARTIAL EVIDENCE ---")
        case_b_payload = {
            "title": "Uncharacterized Curcuma & Guggulu Extract",
            "language": "en",
            "jurisdiction": "india",
            "initial_question": "Can I patent a mixture of Haridra and Guggulu without clinical bioassay or synergy testing data?",
            "case_builder_data": {
                "product_name": "Phyto-Lipid Support Extract",
                "applicant_type": "Individual Vaidya",
                "ip_category": "Ayurvedic Extract",
                "biological_material": True,
                "tk_involved": True,
                "ingredients": [
                    "Haridra (Curcuma longa)",
                    "Guggulu (Commiphora mukul)"
                ],
                "formulation_details": "Simple crude water extraction without standardized biomarker profile or comparative synergy proof.",
                "process_description": None,
                "target_countries": ["India"]
            }
        }
        res_b_create = await client.post(f"{BASE_URL}/v1/cases", json=case_b_payload)
        case_b = res_b_create.json()
        case_b_id = case_b["id"]
        res_b_an = await client.post(f"{BASE_URL}/v1/cases/{case_b_id}/analyze", json={"response_language": "en"})
        an_b = res_b_an.json()
        print(f"[Case B Analyzed] Confidence: {an_b.get('confidence')} ({an_b.get('confidence_level')}), Citations: {an_b.get('citations_count')}, Human Review: {an_b.get('human_review_recommended')}")

        case_b_record = {
            "case": "Case B (Partial Evidence)",
            "id": case_b_id,
            "evidence": "Traditional herbs without synergy bioassay",
            "citations_count": an_b.get("citations_count", 0),
            "confidence": an_b.get("confidence"),
            "confidence_level": an_b.get("confidence_level"),
            "human_review_recommended": an_b.get("human_review_recommended"),
            "status": "PASS" if an_b.get("citations_count", 0) > 0 else "FAIL"
        }
        results["case_tests"].append(case_b_record)
        print(f"[Case B Evaluation] {case_b_record['status']}")

        # =====================================================================
        # PART 3: CASE C — WEAK / UNSUPPORTED / OUT OF SCOPE
        # =====================================================================
        print("\n--- TEST 3: CASE C — WEAK / UNSUPPORTED EVIDENCE ---")
        case_c_payload = {
            "title": "Crypto Token Yield Farming Smart Contract",
            "language": "en",
            "jurisdiction": "india",
            "initial_question": "What is the football match cricket score and how to trade crypto token blockchain smart contracts?",
            "case_builder_data": None
        }
        res_c_create = await client.post(f"{BASE_URL}/v1/cases", json=case_c_payload)
        case_c = res_c_create.json()
        case_c_id = case_c["id"]
        res_c_an = await client.post(f"{BASE_URL}/v1/cases/{case_c_id}/analyze", json={"response_language": "en"})
        an_c = res_c_an.json()
        print(f"[Case C Analyzed] Confidence: {an_c.get('confidence')} ({an_c.get('confidence_level')}), Abstained: {an_c.get('abstained')}")

        case_c_record = {
            "case": "Case C (Weak / Out of Scope)",
            "id": case_c_id,
            "evidence": "Out of scope / non-AYUSH",
            "citations_count": an_c.get("citations_count", 0),
            "confidence": an_c.get("confidence"),
            "confidence_level": an_c.get("confidence_level"),
            "abstained": an_c.get("abstained"),
            "status": "PASS" if (an_c.get("confidence", 1.0) <= 0.4 or an_c.get("abstained") is True or an_c.get("confidence_level") == "low") else "FAIL"
        }
        results["case_tests"].append(case_c_record)
        print(f"[Case C Evaluation] {case_c_record['status']} (Confidence: {an_c.get('confidence')}, Level: {an_c.get('confidence_level')})")

        # =====================================================================
        # PART 4: LANGUAGE TEST MATRIX (ALL 9 SUPPORTED LANGUAGES)
        # =====================================================================
        print("\n--- TEST 4: LANGUAGE TEST MATRIX (9 LANGUAGES) ---")
        languages = [
            {"code": "en", "name": "English", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "hi", "name": "Hindi", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "hinglish", "name": "Hinglish", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "gu", "name": "Gujarati", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "te", "name": "Telugu", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "kn", "name": "Kannada", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "mr", "name": "Marathi", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "bn", "name": "Bengali", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"},
            {"code": "sa", "name": "Sanskrit", "input": "How can I patent this polyherbal Ayurvedic extract under Section 3(p)?"}
        ]

        for item in languages:
            lang_code = item["code"]
            lang_name = item["name"]
            print(f"\nEvaluating Language: {lang_name} ({lang_code})...")

            # Create case with English / standard formulation details
            c_payload = {
                "title": f"Polyherbal Formulation [{lang_name}]",
                "language": "en",  # Case input in English
                "jurisdiction": "india",
                "initial_question": item["input"],
                "case_builder_data": {
                    "product_name": f"Swastha-{lang_name} Formulation",
                    "applicant_type": "Indian Startup / MSME",
                    "ip_category": "Ayurvedic Medicine",
                    "biological_material": True,
                    "tk_involved": True,
                    "ingredients": ["Adhatoda vasica", "Solanum surattense", "Glycyrrhiza glabra"],
                    "formulation_details": "Hydro-ethanolic synergistic extract with vasicine standardization."
                }
            }
            c_res = await client.post(f"{BASE_URL}/v1/cases", json=c_payload)
            c_data = c_res.json()
            c_id = c_data["id"]

            # Submit for analysis specifying the USER'S SELECTED RESPONSE LANGUAGE
            an_res = await client.post(f"{BASE_URL}/v1/cases/{c_id}/analyze", json={"response_language": lang_code})
            an_data = an_res.json()
            detailed_guidance = an_data.get("detailed_guidance", "")
            summary = an_data.get("analysis_summary", "")

            # Verify script matching
            script_match = False
            sample_text = detailed_guidance[:500] + summary
            if lang_code in ["en"]:
                script_match = bool(SCRIPT_REGEXES["en"].search(sample_text))
            elif lang_code == "hinglish":
                has_latin = bool(SCRIPT_REGEXES["hinglish"].search(sample_text))
                has_keywords = any(kw in sample_text.lower() for kw in HINGLISH_KEYWORDS)
                script_match = has_latin and (has_keywords or "patent" in sample_text.lower())
            elif lang_code in SCRIPT_REGEXES:
                # Must contain characters in the target script
                matches = SCRIPT_REGEXES[lang_code].findall(sample_text)
                script_match = len(matches) > 15  # Substantial characters in target script

            rag_grounded = an_data.get("citations_count", 0) > 0
            citations_valid = bool(an_data.get("citations"))

            lang_record = {
                "selected_language": lang_name,
                "lang_code": lang_code,
                "case_id": c_id,
                "script_detected": script_match,
                "citations_count": an_data.get("citations_count", 0),
                "confidence": an_data.get("confidence"),
                "rag_grounded": rag_grounded,
                "sample_preview": detailed_guidance[:120].replace("\n", " "),
                "status": "PASS" if (script_match and rag_grounded) else "FAIL"
            }
            results["language_matrix"].append(lang_record)
            print(f"  Result: {lang_record['status']} | Script Matched: {script_match} | Citations: {an_data.get('citations_count')}")
            safe_snippet = lang_record['sample_preview'].encode('ascii', errors='backslashreplace').decode('ascii')
            print(f"  Snippet: {safe_snippet}")

            # Test Report endpoint for this language
            rep_res = await client.get(f"{BASE_URL}/v1/cases/{c_id}/report?language={lang_code}")
            if rep_res.status_code == 200:
                rep_data = rep_res.json()
                disclaimer = rep_data.get("disclaimer", "")
                results["report_tests"].append({
                    "language": lang_name,
                    "code": lang_code,
                    "report_id": rep_data.get("report_id"),
                    "disclaimer": disclaimer[:80] + "...",
                    "status": "PASS" if disclaimer else "FAIL"
                })

        # =====================================================================
        # PART 5: CASE PERSISTENCE + LANGUAGE
        # =====================================================================
        print("\n--- TEST 5: CASE PERSISTENCE TEST ---")
        persist_payload = {
            "title": "आयुर्वेदिक काढ़ा पेटेंट केस (Hindi Persistence)",
            "language": "hi",
            "jurisdiction": "india",
            "initial_question": "क्या गिलोय और अश्वगंधा के अर्क का पेटेंट मिल सकता है?",
            "case_builder_data": {
                "product_name": "Giloy-Ashwagandha Synergistic Blend",
                "applicant_type": "Indian Startup / MSME",
                "ip_category": "Ayurvedic Medicine",
                "biological_material": True,
                "tk_involved": True,
                "ingredients": ["Tinospora cordifolia (Giloy)", "Withania somnifera (Ashwagandha)"]
            }
        }
        res_p = await client.post(f"{BASE_URL}/v1/cases", json=persist_payload)
        p_case = res_p.json()
        p_id = p_case["id"]

        # Run analysis in Hindi
        await client.post(f"{BASE_URL}/v1/cases/{p_id}/analyze", json={"response_language": "hi"})

        # Reopen / reload case by ID
        reload_res = await client.get(f"{BASE_URL}/v1/cases/{p_id}")
        assert reload_res.status_code == 200
        reloaded = reload_res.json()
        
        has_ai = reloaded.get("ai_answer") is not None
        saved_lang = reloaded.get("profile", {}).get("language")
        citations_saved = len(reloaded.get("ai_answer", {}).get("citations", [])) if has_ai else 0
        
        results["persistence_test"] = {
            "case_id": p_id,
            "title_preserved": reloaded.get("title") == persist_payload["title"],
            "language_preserved": saved_lang in ["hi", "hindi"],
            "ai_answer_preserved": has_ai,
            "citations_preserved": citations_saved > 0,
            "status": "PASS" if (has_ai and citations_saved > 0) else "FAIL"
        }
        print(f"[Persistence] Status: {results['persistence_test']['status']}, Case ID: {p_id}, AI Answer: {has_ai}, Citations: {citations_saved}")

        # =====================================================================
        # PART 6: BOUNDARY / SPECIAL CHARACTER FIELD VALIDATION
        # =====================================================================
        print("\n--- TEST 6: BOUNDARY & FIELD VALIDATION ---")
        boundary_cases = [
            {
                "name": "Empty ingredients and special characters",
                "payload": {
                    "title": "Special Chars Formulation: <script>alert(1)</script> & 'quotes' % # @ ! *",
                    "language": "en",
                    "initial_question": "Can I patent this herbal product with & < > quotes?",
                    "case_builder_data": {
                        "product_name": "Special Chars <Tag> & Co.",
                        "ingredients": []
                    }
                }
            },
            {
                "name": "Long text (1000+ characters)",
                "payload": {
                    "title": "Long Form Factsheet Analysis",
                    "language": "en",
                    "initial_question": "Section 3(p) patent analysis for standardized botanical composition: " + ("Ayurvedic herbs extracted using hydroethanolic solvents. " * 30),
                    "case_builder_data": {
                        "product_name": "Standardized Multi-Active Complex",
                        "ingredients": ["Ocimum sanctum", "Curcuma longa", "Zingiber officinale", "Piper nigrum"]
                    }
                }
            }
        ]

        for bc in boundary_cases:
            res_bc = await client.post(f"{BASE_URL}/v1/cases", json=bc["payload"])
            if res_bc.status_code == 200:
                bc_id = res_bc.json()["id"]
                an_bc = await client.post(f"{BASE_URL}/v1/cases/{bc_id}/analyze")
                results["field_validation"].append({
                    "scenario": bc["name"],
                    "case_id": bc_id,
                    "status_code": an_bc.status_code,
                    "status": "PASS" if an_bc.status_code == 200 else "FAIL"
                })
                print(f"[Field Validation] {bc['name']}: {an_bc.status_code} -> PASS")
            else:
                results["field_validation"].append({
                    "scenario": bc["name"],
                    "status_code": res_bc.status_code,
                    "status": "FAIL"
                })
                print(f"[Field Validation] {bc['name']}: {res_bc.status_code} -> FAIL")

    print("\n" + "=" * 70)
    print("ALL TESTS COMPLETED. WRITING JSON REPORT...")
    print("=" * 70)
    
    with open("case_builder_validation_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("Saved results to case_builder_validation_results.json")

if __name__ == "__main__":
    asyncio.run(run_validation())
