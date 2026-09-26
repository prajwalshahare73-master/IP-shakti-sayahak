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

        When Ollama is offline, returns an evidence-grounded abstention message that
        surfaces already-retrieved statutory documents from the prompt context.

        IMPORTANT: This method NEVER falls back to hard-coded legal conclusions.
        Per the RAG-first mandate, if the LLM is unavailable the system must
        surface retrieved evidence and recommend expert review — not invent answers.
        """
        try:
            async with self.semaphore:
                # Fast 2.0s connect timeout to prevent cloud container hangs when localhost:11434 is absent
                timeout_config = httpx.Timeout(connect=2.0, read=min(30.0, float(self.timeout)), write=5.0, pool=5.0)
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
                    else:
                        print(f"[LLM] Non-200 response ({response.status_code}): {response.text}")
        except Exception as e:
            print(
                f"[LLM] Ollama unavailable ({e}). "
                "Returning RAG evidence-grounded abstention — no hard-coded legal conclusions."
            )

        # RAG-Evidence Abstention Fallback
        # ----------------------------------------------------------------
        # We surface the retrieved evidence that was already injected into
        # the prompt by context_builder.py.  We do NOT synthesise or
        # invent any factual legal conclusions.
        # ----------------------------------------------------------------
        return self._evidence_grounded_abstention(prompt)

    def _evidence_grounded_abstention(self, prompt: str) -> str:
        """
        Extracts any retrieved statutory evidence that was already injected into
        the prompt by context_builder.build_evidence_context() and returns it
        to the caller as a structured, traceable response.

        Rules (per RAG-first mandate):
        - NEVER generate factual legal conclusions.
        - NEVER use if/elif keyword patterns to decide patent eligibility,
          TKDL status, ABS requirements, or any other domain-specific guidance.
        - ONLY surface retrieved evidence from the knowledge base.
        - Direct the user to expert review for legal interpretation.
        """
        import re

        # Extract evidence blocks injected by build_evidence_context()
        evidence_blocks = re.findall(
            r"--- EVIDENCE \[(\d+)\] ---\n(.*?)(?=--- EVIDENCE \[|\Z)",
            prompt,
            re.DOTALL
        )

        if evidence_blocks:
            evidence_section = "\n\n".join(
                f"**[{num}]** {block.strip()}"
                for num, block in evidence_blocks
            )
            return (
                "### ⚠️ LLM Generation Unavailable\n\n"
                "The language model (Ollama) is not reachable. "
                "The system cannot synthesise a legal interpretation without the LLM.\n\n"
                "**Per the RAG-first mandate**, no pre-written legal conclusions are provided "
                "as a substitute. The system instead surfaces the statutory documents that "
                "were retrieved from the knowledge base for your query.\n\n"
                "---\n\n"
                "### Retrieved Statutory Evidence from Knowledge Base\n\n"
                "The following primary sources were retrieved and ranked for your query. "
                "Please review these provisions or submit this case for expert human consultation:\n\n"
                f"{evidence_section}\n\n"
                "---\n\n"
                "### Recommended Next Step\n"
                "Submit this case for review by an empanelled IP specialist who can interpret "
                "the above statutory provisions in the context of your specific formulation, "
                "ingredients, and commercial facts.\n\n"
                "> *This is retrieved statutory information, not legal advice. "
                "For a binding opinion, consult a qualified IP professional.*"
            )

        # No evidence was retrieved from the knowledge base — full abstention
        return (
            "### ⚠️ Insufficient Evidence & LLM Unavailable\n\n"
            "Two conditions prevent a grounded response:\n"
            "1. The language model (Ollama) is not reachable.\n"
            "2. No relevant statutory documents were retrieved from the knowledge base "
            "for this query.\n\n"
            "**The system cannot provide a legal assessment under these conditions.** "
            "Please:\n"
            "- Rephrase your query with more specific product, ingredient, or jurisdiction details.\n"
            "- Ensure your Case Builder information (product type, ingredients, TK involvement) "
            "is complete so the retriever can match relevant statutory documents.\n"
            "- Submit this case for human expert review.\n\n"
            "> *This system is designed to prevent ungrounded legal conclusions. "
            "No factual or legal guidance is generated without retrieved statutory evidence "
            "from the knowledge base.*"
        )


llm_client = OllamaClient()
