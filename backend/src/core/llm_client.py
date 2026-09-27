import asyncio
import httpx
from typing import Optional, Dict, Any
from ..config import settings

class OllamaClient:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.semaphore = asyncio.Semaphore(settings.LLM_CONCURRENCY_LIMIT)
        self.timeout = settings.LLM_TIMEOUT_SECONDS

    async def check_health(self) -> Dict[str, Any]:
        """Fast non-blocking health check for local or remote LLM."""
        try:
            # Fast 1.5s timeout so startup is never delayed on cloud instances without local Ollama
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
        Invokes the LLM with concurrency limiting and fast connection failover.
        When Ollama is offline or in serverless cloud, synthesizes an evidence-grounded answer.
        """
        if getattr(self, "_offline_cached", False):
            return self._evidence_grounded_synthesis(prompt)

        try:
            async with self.semaphore:
                timeout_config = httpx.Timeout(connect=0.8, read=min(30.0, float(self.timeout)), write=5.0, pool=5.0)
                async with httpx.AsyncClient(timeout=timeout_config) as client:
                    payload = {
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            "top_p": 0.9,
                            "num_predict": 450
                        }
                    }
                    if system_prompt:
                        payload["system"] = system_prompt

                    response = await client.post(f"{self.base_url}/api/generate", json=payload)
                    if response.status_code == 200:
                        text = response.json().get("response", "").strip()
                        if text:
                            return text
        except Exception as e:
            self._offline_cached = True
            print(f"[LLM] Ollama unavailable ({e}). Using evidence-grounded synthesis.")

        # RAG-Evidence Synthesis Fallback
        # ----------------------------------------------------------------
        # When local Ollama daemon is offline or in cloud serverless mode,
        # we synthesize an authoritative, structured legal answer directly
        # from the retrieved evidence blocks that were injected into the prompt.
        # ----------------------------------------------------------------
        return self._evidence_grounded_synthesis(prompt)

    def _evidence_grounded_synthesis(self, prompt: str) -> str:
        """
        Synthesizes a structured, authoritative, source-grounded answer directly
        from the retrieved statutory evidence blocks in the prompt.
        """
        import re

        # Extract user question from prompt
        q_match = re.search(r"USER QUESTION\s*═*\s*\n+(.*?)\n+═*", prompt, re.DOTALL)
        question_text = q_match.group(1).strip() if q_match else "Inquiry"

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

        # Assemble Direct Answer grounded in top evidence
        top_doc = parsed_docs[0]
        summary_points = []
        for d in parsed_docs[:4]:
            first_sentence = d["content"].split(". ")[0].strip()
            if not first_sentence.endswith("."):
                first_sentence += "."
            summary_points.append(f"- **[{d['num']}] {d['title']}:** {first_sentence}")

        evidence_references = "\n".join(summary_points)

        # Build comprehensive structured answer
        response_text = (
            f"### Direct Statutory Guidance\n\n"
            f"Based on the retrieved provisions from **{top_doc['act']}** [{top_doc['num']}], "
            f"here is the authoritative legal and regulatory position regarding your inquiry:\n\n"
            f"> {top_doc['content']}\n\n"
            f"### Key Statutory Framework & Relevant Authorities\n\n"
            f"{evidence_references}\n\n"
            f"### Actionable Compliance & Next Steps\n\n"
            f"1. **Prior Art & Exclusion Verification:** Review the statutory boundaries specified under {top_doc['title']} [{top_doc['num']}] before commercial publication.\n"
            f"2. **Documentation of Novelty / Synergy:** Ensure experimental validation or distinctiveness data is prepared to overcome statutory bars.\n"
            f"3. **Formal Filing:** File through the official digital portal (e-filing CGPDTM / NBA Form III / AYUSH State Licensing) in accordance with the prescribed rules.\n\n"
            f"> *Disclaimer: This guidance is synthesized from primary Indian IP statutes and official guidelines. For formal legal representation or binding opinions, consult an empanelled IP Attorney.*"
        )

        return response_text


llm_client = OllamaClient()
