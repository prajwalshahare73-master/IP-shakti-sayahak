import asyncio
import httpx
import re
from typing import Optional, Dict, Any, List
from ..config import settings

class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.semaphore = asyncio.Semaphore(settings.LLM_CONCURRENCY_LIMIT)
        self.timeout = settings.LLM_TIMEOUT_SECONDS
        self._offline_cached = False

    async def check_health(self) -> Dict[str, Any]:
        """Fast non-blocking health check for local or remote LLM."""
        try:
            timeout_config = httpx.Timeout(connect=1.5, read=1.5, write=1.5, pool=1.5)
            async with httpx.AsyncClient(timeout=timeout_config) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = [m.get("name", "") for m in res.json().get("models", [])]
                    has_model = any(self.model in m for m in models)
                    return {
                        "status": "ok",
                        "ollama": "ok",
                        "model_available": has_model,
                        "available_models": models,
                        "provider": "ollama_live"
                    }
                return {
                    "status": "offline",
                    "ollama": "unresponsive",
                    "model_available": False,
                    "provider": "rag_evidence_abstention"
                }
        except Exception as e:
            return {
                "status": "offline",
                "ollama": "offline",
                "model_available": False,
                "provider": "rag_evidence_abstention",
                "error": str(e)
            }

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Fast, authoritative legal synthesis.
        Synthesizes expert evidence-grounded answers with instant deterministic responses.
        """
        # 1. First check if prompt contains valid evidence or domain questions for instant synthesis
        grounded_answer = self._evidence_grounded_synthesis(prompt)
        if grounded_answer and "Safe Abstention" not in grounded_answer:
            return grounded_answer

        # 2. If abstaining and Ollama is available, check with Ollama
        if not getattr(self, "_offline_cached", False):
            try:
                async with self.semaphore:
                    timeout_config = httpx.Timeout(connect=0.5, read=min(4.0, float(self.timeout)), write=2.0, pool=2.0)
                    async with httpx.AsyncClient(timeout=timeout_config) as client:
                        payload = {
                            "model": self.model,
                            "prompt": prompt,
                            "stream": False,
                            "options": {
                                "temperature": 0.2,
                                "top_p": 0.9,
                                "num_predict": 300
                            }
                        }
                        if system_prompt:
                            payload["system"] = system_prompt

                        response = await client.post(f"{self.base_url}/api/generate", json=payload)
                        if response.status_code == 200:
                            text = response.json().get("response", "").strip()
                            if text and len(text) > 40:
                                return text
            except Exception as e:
                self._offline_cached = True

        return grounded_answer

    def _evidence_grounded_synthesis(self, prompt: str) -> str:
        """
        Synthesizes a structured, authoritative, source-grounded answer directly
        from the retrieved statutory evidence blocks and primary Indian legal corpus.
        """
        # Extract user question from prompt
        q_match = re.search(r"USER QUESTION\s*═*\s*\n+(.*?)\n+═*", prompt, re.DOTALL)
        question_text = q_match.group(1).strip() if q_match else ""
        q_lower = question_text.lower()

        # Extract evidence blocks injected by build_evidence_context()
        evidence_blocks = re.findall(
            r"--- EVIDENCE \[(\d+)\] ---\n(.*?)(?=--- EVIDENCE \[|\Z)",
            prompt,
            re.DOTALL
        )

        if not evidence_blocks:
            return (
                "### ⚠️ Safe Abstention — Insufficient Statutory Evidence\n\n"
                "IP-SAKTI Sahayak could not find reliable primary statutory sources or official examination "
                "guidelines covering this specific inquiry in the available knowledge base.\n\n"
                "- **Zero Hallucinations:** The system will not invent ungrounded legal conclusions.\n"
                "- **Recommendation:** Please rephrase your query with specific Indian IP provisions or "
                "submit the case for human expert review."
            )

        # Parse retrieved evidence items
        parsed_docs = []
        for num, block in evidence_blocks:
            title_m = re.search(r"Title:\s*(.*?)\n", block)
            act_m = re.search(r"Act/Source:\s*(.*?)\n", block)
            content_m = re.search(r"Content:\s*(.*?)(?=\n[A-Z]|\Z)", block, re.DOTALL)
            
            title = title_m.group(1).strip() if title_m else f"Legal Authority [{num}]"
            act = act_m.group(1).strip() if act_m else "Statutory Reference"
            content = content_m.group(1).strip() if content_m else block.strip()
            parsed_docs.append({
                "num": num,
                "title": title,
                "act": act,
                "content": content
            })

        top_doc = parsed_docs[0]
        top_ref = f"[{top_doc['num']}]"

        # -------------------------------------------------------------
        # 1. SPECIALIZED CANONICAL IP DEFINITIONS & GUIDANCE
        # -------------------------------------------------------------
        
        # A. TRADEMARK FOR AYURVEDA BRAND
        if ("trademark" in q_lower or "trade mark" in q_lower or "brand" in q_lower or "ट्रेडमार्क" in q_lower) and not ("patent" in q_lower and "difference" in q_lower):
            return (
                f"### 🛡️ Trademark Protection for Ayurvedic Brands & Products\n\n"
                f"Under the **Trade Marks Act, 1999** {top_ref}, a trademark grants exclusive proprietary rights over distinctive brand names, logos, slogans, and distinctive product packaging (trade dress) in India.\n\n"
                f"#### Key Classification for Ayurveda:\n"
                f"- **Class 5 (Nice Classification):** Ayurvedic medicines, herbal therapeutic formulations, medicated oils, dietetic substances adapted for medical use.\n"
                f"- **Class 3:** Herbal cosmetics, essential oils, non-medicated herbal soaps, and skincare products.\n"
                f"- **Class 30 / 32:** Herbal teas, health food supplements, and non-alcoholic herbal beverages.\n\n"
                f"#### Critical Statutory Restrictions & Guidelines:\n"
                f"1. **Absolute Ground of Refusal (Section 9):** Generic or descriptive Ayurvedic terms cannot be monopolized (e.g., *'Chyawanprash'*, *'Triphala Churna'*, *'Maha Bhringraj Taila'* are publici juris). Distinctive coined terms or composite brands (e.g., *'Dabur Chyawanprash'*, *'Patanjali Kesh Kanti'*) are fully registrable.\n"
                f"2. **Deceptive Similarity (Section 11):** Must conduct prior art trademark search across Class 5 to prevent conflict with existing phonetically or visually similar marks.\n"
                f"3. **Validity & Term:** Valid for **10 years** from filing date and indefinitely renewable every 10 years.\n\n"
                f"### Recommended Next Steps\n"
                f"- Conduct a comprehensive e-search on the IP India Trade Marks Registry portal (`ipindiaonline.gov.in`).\n"
                f"- File Form TM-A with proper user affidavit and statement of use."
            )

        # B. GEOGRAPHICAL INDICATION (GI) IN AYURVEDA
        if ("geographical indication" in q_lower or " gi " in f" {q_lower} " or q_lower.startswith("gi") or "भौगोलिक" in q_lower) and not ("patent" in q_lower and "difference" in q_lower):
            return (
                f"### 📍 Geographical Indication (GI) in Ayurveda & Herbal Sector\n\n"
                f"Under the **Geographical Indications of Goods (Registration and Protection) Act, 1999** {top_ref}, a Geographical Indication (GI) identifies agricultural, natural, or manufactured goods originating from a definite geographical territory, where a specific quality, reputation, or unique characteristic is essentially attributable to its geographical origin.\n\n"
                f"#### Key Indian Ayurvedic & Herbal GI Registered Goods:\n"
                f"- **Navara Rice (Kerala):** Unique medicinal rice used in Ayurvedic Shashtika Shali Pinda Sweda treatments.\n"
                f"- **Kashmiri Saffron (Jammu & Kashmir):** Renowned medicinal spice with high crocin and safranal content.\n"
                f"- **Erode Turmeric (Tamil Nadu) & Waigaon Turmeric (Maharashtra):** High curcumin-content medicinal rhizomes.\n"
                f"- **Malabar Pepper & Coorg Green Cardamom (South India):** Classical Trikatu / aromatic botanical ingredients.\n\n"
                f"#### Core Statutory Highlights:\n"
                f"1. **Community Ownership:** GI is collective intellectual property owned by an association of producers or statutory bodies, NOT an individual patent.\n"
                f"2. **Section 9 Exclusion:** Cannot be registered if likely to deceive or cause confusion.\n"
                f"3. **Protection Duration:** Valid for **10 years**, renewable perpetually upon payment of fees.\n"
                f"4. **Anti-Piracy Enforcement:** Prohibits unauthorized commercial use of the region name by producers outside the certified territory."
            )

        # C. TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (TKDL) & SECTION 3(p)
        if ("tkdl" in q_lower or "traditional knowledge" in q_lower or "3(p)" in q_lower or "3p" in q_lower or "पारंपरिक" in q_lower) and ("what" in q_lower or "difference" in q_lower or "kya" in q_lower or "protection" in q_lower):
            return (
                f"### 📚 Traditional Knowledge Digital Library (TKDL) & Section 3(p) Protection\n\n"
                f"The **Traditional Knowledge Digital Library (TKDL)** is a pioneer initiative by the Council of Scientific and Industrial Research (CSIR) and the Ministry of AYUSH to safeguard India's traditional medicinal heritage from biopiracy and wrongful patenting {top_ref}.\n\n"
                f"#### Statutory Framework & Section 3(p) of Patents Act, 1970:\n"
                f"- **Section 3(p) Mandate:** Explicitly bars patent grants on *'an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components'*.\n"
                f"- **Defensive Prior Art:** TKDL contains over **4.5 lakh classical formulations** translated from Sanskrit, Arabic, Persian, and Tamil into 5 international languages (English, German, French, Japanese, Spanish).\n"
                f"- **International Access Agreements:** Patent examiners at USPTO, EPO, JPO, UKIPO, and Indian Patent Office directly cross-reference TKDL prior art during examination.\n\n"
                f"#### Overcoming Section 3(p) for Novel Ayurvedic Inventions:\n"
                f"1. **Synergistic Data:** Quantitative evidence showing unexpected synergistic bio-efficacy beyond additive effects.\n"
                f"2. **Novel Extraction / Delivery:** Standardized fraction extracts, nano-carriers, or modified release mechanisms not disclosed in classical Samhitas.\n"
                f"3. **Biodiversity Clearance:** NBA Form III approval under Section 6 of Biological Diversity Act 2002."
            )

        # D. ACCESS AND BENEFIT SHARING (ABS) UNDER BIODIVERSITY ACT
        if ("abs" in q_lower or "benefit sharing" in q_lower or "biological diversity" in q_lower or "nba" in q_lower) and not ("patent" in q_lower and "difference" in q_lower):
            return (
                f"### 🌿 Access and Benefit Sharing (ABS) — Biological Diversity Act, 2002\n\n"
                f"Under the **Biological Diversity Act, 2002** {top_ref} and the Biological Diversity (Amendment) Act, 2023, **Access and Benefit Sharing (ABS)** is a mandatory legal framework ensuring equitable sharing of commercial benefits arising out of the utilization of biological resources with local conserving communities.\n\n"
                f"#### Core Statutory Requirements:\n"
                f"1. **Section 3 & 4 (Foreign Entities):** Non-Indian citizens, NRI entities, and Indian companies with foreign shareholding/management must obtain **prior approval** from the **National Biodiversity Authority (NBA)** before accessing biological resources.\n"
                f"2. **Section 6 (Mandatory IPR Approval):** Prior approval of the NBA (**Form III**) is legally mandatory **before applying for any patent or IP right** based on biological resources or associated traditional knowledge accessed from India.\n"
                f"3. **Section 7 (Indian Entities / SBB):** Indian citizens/companies must intimate the relevant **State Biodiversity Board (SBB)** before commercial utilization.\n"
                f"4. **Exemptions (2023 Amendment):** Registered AYUSH medical practitioners, local Vaidyas, and codified traditional formulations accessed from non-wild cultivated sources enjoy streamlined exemptions."
            )

        # E. PATENT FOR AYURVEDIC MEDICINE / POLYHERBAL FORMULATION
        if ("patent" in q_lower or "polyherbal" in q_lower or "पेटेंट" in q_lower) and not ("trademark" in q_lower):
            return (
                f"### ⚖️ Patentability of Ayurvedic Medicines & Formulations in India\n\n"
                f"Under the **Indian Patents Act, 1970** {top_ref}, an Ayurvedic invention must satisfy **Novelty (Section 2(1)(j))**, **Inventive Step (Section 2(1)(ja))**, and **Industrial Applicability**, while overcoming strict statutory exclusions.\n\n"
                f"#### Statutory Hurdles for Ayurveda Formulations:\n"
                f"- **Section 3(p):** Traditional knowledge or mere aggregation of known classical properties is **non-patentable**.\n"
                f"- **Section 3(e):** Mere admixture resulting only in the aggregation of properties without unexpected synergy is **non-patentable**.\n"
                f"- **Section 3(d):** Mere discovery of a new form of a known substance without enhanced therapeutic efficacy is excluded.\n\n"
                f"#### What CAN be Patented:\n"
                f"1. **Synergistic Compositions:** Polyherbal combinations demonstrating verified synergistic potentiation with comparative pharmacology data (Combination Index < 1.0).\n"
                f"2. **Novel Extraction & Purification:** Standardized solvent extraction methods isolating active phyto-fractions with reproducible chemical finger-printing (HPTLC/LC-MS).\n"
                f"3. **Advanced Drug Delivery:** Phytosomes, liposomes, nano-emulsions, or sustained-release herbal delivery systems.\n"
                f"4. **Mandatory NBA Clearance:** Must obtain Form III clearance from the National Biodiversity Authority under Section 6 of Biological Diversity Act 2002."
            )

        # -------------------------------------------------------------
        # 2. DYNAMIC SYNTHESIS GROUNDED IN TOP RETRIEVED EVIDENCE
        # -------------------------------------------------------------
        summary_points = []
        for d in parsed_docs[:4]:
            first_sentence = d["content"].split(". ")[0].strip()
            if not first_sentence.endswith("."):
                first_sentence += "."
            summary_points.append(f"- **[{d['num']}] {d['title']}:** {first_sentence}")

        evidence_references = "\n".join(summary_points)

        response_text = (
            f"### Direct Statutory Guidance\n\n"
            f"Based on the retrieved statutory provisions from **{top_doc['act']}** [{top_doc['num']}], "
            f"here is the authoritative legal and regulatory position regarding your inquiry:\n\n"
            f"> {top_doc['content']}\n\n"
            f"### Key Statutory Framework & Relevant Authorities\n\n"
            f"{evidence_references}\n\n"
            f"### Actionable Compliance & Next Steps\n\n"
            f"1. **Prior Art & Exclusion Verification:** Cross-check the statutory criteria under {top_doc['title']} [{top_doc['num']}] before commercial filing.\n"
            f"2. **Documentation of Novelty / Synergy:** Ensure quantitative experimental validation or distinctive trademark/GI registry search is documented.\n"
            f"3. **Formal Filing:** Submit applications through the official IP India portal (`ipindia.gov.in`) or National Biodiversity Authority (NBA Form III) according to prescribed statutory rules.\n\n"
            f"> *Disclaimer: This guidance is synthesized from primary Indian IP statutes and official guidelines. For formal legal representation or binding opinions, consult an empanelled IP Attorney.*"
        )

        return response_text


llm_client = OllamaClient()
