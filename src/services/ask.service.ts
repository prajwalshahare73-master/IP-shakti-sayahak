import { AIAnswerData, CaseProfile } from '../store/appStore';
import { API_CONFIG } from './api.config';
import { getAuthHeader } from './supabase';
import { enrichAnswerWithTrustValidation } from './trustValidation.service';

export interface AskRequestPayload {
  mode?: 'quick_query' | 'case_query';
  question?: string;
  query: string;
  input_language?: string;
  response_language?: string;
  jurisdiction: string;
  session_id?: string;
  conversation_id: string;
  case_profile?: CaseProfile;
}

// ============================================================
// RAG Response Mapper
// Maps the FastAPI QueryResponse → AIAnswerData for the UI.
// Only factual content retrieved from the knowledge base is
// surfaced. No hard-coded answers are inserted here.
// ============================================================

function mapRagResponseToAnswerData(raw: any): AIAnswerData {
  // Determine confidence level
  const confidenceLevel = (
    raw.confidence_label ||
    raw.confidence_info?.level ||
    (raw.confidence >= 0.7 ? 'high' : raw.confidence >= 0.4 ? 'medium' : 'low')
  ) as 'high' | 'medium' | 'low';

  // Build 'why' from retrieved evidence reasoning + gaps
  const why: string[] = [];
  if (raw.confidence_info?.reasoning) {
    why.push(raw.confidence_info.reasoning);
  }
  if (raw.confidence_info?.gaps?.length) {
    why.push(...raw.confidence_info.gaps);
  }
  // If no reasoning, surface the titles of retrieved sources
  if (why.length === 0 && raw.sources?.length) {
    raw.sources.slice(0, 3).forEach((s: any) => {
      if (s.title) why.push(`Retrieved source: ${s.title}${s.section ? ` [${s.section}]` : ''}`);
    });
  }
  if (why.length === 0 && raw.citations?.length) {
    why.push(...raw.citations.map((c: any) => `Statutory grounding: ${c.title || c.act} (${c.section || ''})`));
  }
  if (why.length === 0) {
    why.push('Answer derived from retrieved knowledge base documents.');
  }

  // Map citations from retrieved sources
  // Priority: explicit citations verified by claim_verifier > retrieved_sources > sources
  const citationSource = raw.citations?.length ? raw.citations
    : (raw.retrieved_sources?.length ? raw.retrieved_sources : raw.sources) || [];

  const citations = citationSource.map((c: any, i: number) => ({
    id: c.id || `cit-${i + 1}`,
    title: c.title || c.act || 'Legal Authority',
    sourceType: (c.act ? 'Act' : 'Evidence') as any,
    jurisdiction: c.jurisdiction || 'India',
    status: 'Current' as const,
    section: c.section || undefined,
    authorityLevel: (c.authority_level || 1) as 1 | 2 | 3 | 4,
    excerpt: c.snippet || c.content?.slice(0, 300) || '',
    url: c.url || undefined
  }));

  // Warnings
  const warnings: string[] = [];
  if (raw.human_review?.recommended && raw.human_review?.reason) {
    warnings.push(raw.human_review.reason);
  }
  if (raw.abstained) {
    warnings.push('⚠️ The system could not generate a fully grounded answer. Please review the retrieved sources below or submit for expert review.');
  }

  // Next steps
  const nextSteps: Array<{ title: string; action: string; link?: string; primary?: boolean }> = [];
  if (raw.next_step) {
    nextSteps.push({ title: raw.next_step, action: 'NEXT', link: '/dashboard', primary: true });
  }
  if (raw.human_review?.recommended) {
    nextSteps.push({
      title: `Request Review by ${raw.human_review.suggested_specialist || 'IP Expert'}`,
      action: 'ESCALATE',
      link: '/dashboard'
    });
  }
  if (nextSteps.length === 0) {
    nextSteps.push({ title: 'Review Retrieved Statutory Sources', action: 'SOURCES', link: '/dashboard', primary: true });
  }

  return {
    answer: raw.answer || '',
    summary: raw.answer
      ? raw.answer.length > 250 ? raw.answer.slice(0, 250) + '…' : raw.answer
      : '',
    why,
    meaningForYou: [raw.next_step || 'Review the retrieved statutory sources in the Evidence panel.'],
    jurisdiction: raw.query_analysis?.jurisdiction || 'india',
    ipType: raw.query_analysis?.ip_type?.[0] || raw.query_analysis?.domain?.[0] || 'IP',
    confidence: {
      level: confidenceLevel,
      reasons: why,
      caveat: raw.confidence_info?.gaps?.[0] || 'Based on retrieved statutory knowledge base'
    },
    citations,
    warnings,
    nextSteps,
    abstained: Boolean(raw.abstained),
    abstentionDetails: raw.abstained ? {
      reason: raw.abstention_reason || 'Insufficient evidence retrieved from knowledge base.',
      missingInfo: raw.confidence_info?.gaps || []
    } : undefined
  };
}

// ============================================================
// Backend Unavailable — RAG-Grounded Abstention
// ============================================================
// When the FastAPI RAG backend is unreachable (network error,
// timeout, or non-2xx), this function returns a structured
// abstention response.
//
// IMPORTANT: This function MUST NOT return hard-coded legal
// answers. It must only:
// 1. Acknowledge the backend is unavailable.
// 2. Ask the user to retry or submit for expert review.
// 3. Optionally show what Case Builder context was sent.
//
// Hard-coded answers for patent eligibility, TKDL status,
// ABS requirements, or any domain-specific guidance are
// STRICTLY PROHIBITED here.
// ============================================================

function buildBackendUnavailableResponse(payload: AskRequestPayload): AIAnswerData {
  const contextParts: string[] = [];

  if (payload.case_profile) {
    const p = payload.case_profile;
    if (p.productName) contextParts.push(`Product: ${p.productName}`);
    if (p.productType) contextParts.push(`Type: ${p.productType}`);
    if (p.ingredients?.length) contextParts.push(`Ingredients: ${p.ingredients.join(', ')}`);
    if (p.tk_involved) contextParts.push('Traditional Knowledge: Yes');
    if (p.biological_material) contextParts.push('Biological Resource: Yes');
    if (p.export_planned) contextParts.push('Export Planned: Yes');
  }

  const contextStr = contextParts.length > 0
    ? `\n\nCase context submitted:\n${contextParts.map(c => `- ${c}`).join('\n')}`
    : '';

  return {
    answer: (
      `### ⚠️ Knowledge Base Unavailable\n\n` +
      `The IP-SAKTI Sahayak knowledge retrieval service is currently unreachable. ` +
      `No statutory evidence could be retrieved for your query, and no answer has been generated.\n\n` +
      `**This system does not provide pre-written legal conclusions.** ` +
      `Every answer must be derived from documents retrieved from the statutory knowledge base.\n\n` +
      `Please:\n` +
      `1. **Retry your query** — the service may become available shortly.\n` +
      `2. **Submit for expert review** — an empanelled IP specialist can review your case directly.\n` +
      `3. **Check your query** — ensure it contains specific product, ingredient, or legal context ` +
      `so the retriever can surface relevant statutory provisions.` +
      contextStr
    ),
    summary: 'Knowledge retrieval service unavailable. No RAG answer generated. Please retry or submit for expert review.',
    why: [
      'The FastAPI RAG backend (statutory knowledge retrieval service) could not be reached.',
      'The system cannot generate a grounded answer without retrieved evidence.',
      'No hard-coded legal conclusions are provided as a substitute.'
    ],
    meaningForYou: [
      'Retry your query when the service is available, or submit this case for human expert review.'
    ],
    jurisdiction: payload.jurisdiction || 'India',
    ipType: 'Undetermined (no retrieval)',
    confidence: {
      level: 'low',
      reasons: ['Backend unavailable — no evidence retrieved'],
      caveat: 'System cannot answer without retrieved statutory evidence from the knowledge base.'
    },
    citations: [],
    warnings: [
      '⚠️ The knowledge retrieval backend is unreachable. Your query was not processed.',
      'No legal conclusions have been generated. This is not a substitute for legal advice.'
    ],
    nextSteps: [
      { title: 'Retry Query', action: 'RETRY', link: '/ask', primary: true },
      { title: 'Submit for Expert Review', action: 'ESCALATE', link: '/dashboard' }
    ],
    abstained: true,
    abstentionDetails: {
      reason: 'The RAG backend is unavailable. No statutory evidence was retrieved.',
      missingInfo: ['Knowledge base connection required to retrieve and cite statutory provisions']
    }
  };
}

// ============================================================
// Main query function
// ============================================================

async function askIPQuestionInternal(payload: AskRequestPayload): Promise<AIAnswerData> {
  // Build request body — pass ALL case builder context so the backend
  // can incorporate it into retrieval query construction
  const requestBody = {
    question: payload.question || payload.query,
    language: payload.response_language || payload.input_language || 'en',
    response_language: payload.response_language || payload.input_language || 'en',
    jurisdiction: payload.jurisdiction || 'india',
    session_id: payload.session_id || payload.conversation_id,
    case_id: payload.session_id,
    // Pass ALL Case Builder fields — every field influences RAG retrieval
    case_builder_data: payload.case_profile ? {
      product_name: payload.case_profile.productName,
      applicant_type: payload.case_profile.entityType,
      ip_category: payload.case_profile.productType,
      biological_material: payload.case_profile.biological_material ?? false,
      tk_involved: payload.case_profile.tk_involved ?? false,
      export_planned: payload.case_profile.export_planned ?? false,
      ingredients: payload.case_profile.ingredients || [],
      formulation_details: payload.case_profile.formulation_details || undefined,
      process_description: payload.case_profile.process_description || undefined,
      target_countries: payload.case_profile.target_countries || []
    } : undefined
  };

  // Build RAG endpoint URL
  const ragUrl = API_CONFIG.FASTAPI_BASE_URL
    ? `${API_CONFIG.FASTAPI_BASE_URL.replace(/\/$/, '')}/query`
    : API_CONFIG.N8N_WEBHOOK_URL;

  if (!API_CONFIG.USE_MOCK && ragUrl) {
    try {
      const authHeader = await getAuthHeader();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(ragUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const raw = await response.json();
        // Map the RAG pipeline response to the frontend AIAnswerData model
        return mapRagResponseToAnswerData(raw);
      }

      // Non-2xx from backend — surface as abstention (not a hard-coded answer)
      console.warn(`[ask.service] Backend returned ${response.status}. Returning abstention response.`);
      const errorBody = await response.json().catch(() => ({}));
      return {
        ...buildBackendUnavailableResponse(payload),
        answer: (
          `### ⚠️ Knowledge Retrieval Error\n\n` +
          `The IP-SAKTI knowledge base returned an error (HTTP ${response.status}). ` +
          `No statutory evidence was retrieved and no answer has been generated.\n\n` +
          (errorBody?.error?.message ? `Error: ${errorBody.error.message}\n\n` : '') +
          `Please retry your query or submit this case for expert review.`
        )
      };

    } catch (err: any) {
      // Network error or timeout — abstention (not a hard-coded answer)
      console.warn('[ask.service] Backend unreachable or timed out:', err?.message || err);
      return buildBackendUnavailableResponse(payload);
    }
  }

  // No RAG endpoint configured — cannot answer without a knowledge base
  return {
    ...buildBackendUnavailableResponse(payload),
    answer: (
      `### ⚠️ Knowledge Base Not Configured\n\n` +
      `No RAG backend endpoint is configured (VITE_API_BASE_URL). ` +
      `IP-SAKTI Sahayak cannot generate answers without the statutory knowledge retrieval service.\n\n` +
      `Please configure \`VITE_API_BASE_URL\` in your environment to point to the FastAPI backend, ` +
      `or contact your system administrator.`
    ),
    warnings: [
      '⚠️ No knowledge base endpoint is configured. Please set VITE_API_BASE_URL.',
      'No legal conclusions are provided without RAG retrieval.'
    ]
  };
}

export async function askIPQuestion(payload: AskRequestPayload): Promise<AIAnswerData> {
  const raw = await askIPQuestionInternal(payload);
  return enrichAnswerWithTrustValidation(
    raw,
    payload.query || payload.question || '',
    payload.jurisdiction || 'India',
    payload.case_profile
  );
}
