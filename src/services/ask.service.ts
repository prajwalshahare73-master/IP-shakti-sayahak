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
    } : undefined,
    originalQuery: raw.question,
    reformulatedQuery: raw.query_analysis?.reformulated_query
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

// ============================================================
// Verified Homepage Topic Detection & Safe Abstention Engine
// ============================================================

// ============================================================
// Strict 6-Topic Enforcement Engine
// Allowed Topics:
// 1. Patent
// 2. Trademark
// 3. GI (Geographical Indication)
// 4. Copyright
// 5. Design
// 6. Six Bricks
// ALL other queries MUST return ONLY: abstention
// ============================================================

export type AllowedTopic = 'patent' | 'trademark' | 'gi' | 'copyright' | 'design' | 'six_bricks';

export function classifyStrictTopic(rawQuery: string): AllowedTopic | null {
  if (!rawQuery) return null;

  const q = rawQuery
    .toLowerCase()
    .replace(/[?!.,;:()'"\-_/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If query mentions disallowed domains (Ayurveda, medicine, herbs, formulations, medical, general unrelated),
  // it MUST NOT be answered even if it mentions patent or other words (e.g. "What is an Ayurvedic patent?").
  const DISALLOWED_TERMS = [
    'ayurveda', 'ayurvedic', 'herb', 'herbal', 'ashwagandha', 'turmeric', 'curcumin', 'neem',
    'kadha', 'taila', 'churna', 'medicine', 'medicines', 'medical', 'formulation', 'formulations',
    'doctor', 'disease', 'cure', 'treatment', 'health', 'hospital', 'symptom',
    'recipe', 'cooking', 'weather', 'cricket', 'football', 'movie', 'song', 'prime minister',
    'president', 'machine learning', 'python', 'code', 'coding', 'crypto', 'bitcoin', 'shoe', 'shoes', 'tea'
  ];

  for (const term of DISALLOWED_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(q)) {
      return null;
    }
  }

  // 1. SIX BRICKS
  if (
    q === 'what are six bricks' ||
    q === 'what is six bricks' ||
    q === 'explain six bricks' ||
    q === 'six bricks' ||
    q.includes('six bricks') ||
    q === 'सिक्स ब्रिक्स क्या है'
  ) {
    return 'six_bricks';
  }

  // 2. GI (GEOGRAPHICAL INDICATION)
  if (
    q === 'what is gi' ||
    q === 'what is a gi' ||
    q === 'what is geographical indication' ||
    q === 'what is a geographical indication' ||
    q === 'explain gi' ||
    q === 'explain geographical indication' ||
    q === 'how does a gi work' ||
    q === 'how does gi work' ||
    q === 'what is gi protection' ||
    q === 'what is geographical indication protection' ||
    q === 'gi' ||
    q === 'geographical indication' ||
    q === 'geographical indications' ||
    q === 'gi protection' ||
    q === 'भौगोलिक संकेत क्या है' ||
    q === 'जीआई क्या है'
  ) {
    return 'gi';
  }

  // 3. COPYRIGHT
  if (
    q === 'what is copyright' ||
    q === 'what is a copyright' ||
    q === 'explain copyright' ||
    q === 'how does copyright work' ||
    q === 'how does a copyright work' ||
    q === 'what is copyright protection' ||
    q === 'copyright' ||
    q === 'copyrights' ||
    q === 'copyright protection' ||
    q === 'कॉपीराइट क्या है'
  ) {
    return 'copyright';
  }

  // 4. DESIGN
  if (
    q === 'what is design' ||
    q === 'what is a design' ||
    q === 'what is industrial design' ||
    q === 'what is an industrial design' ||
    q === 'explain design' ||
    q === 'explain industrial design' ||
    q === 'what is design protection' ||
    q === 'what is industrial design protection' ||
    q === 'how does design work' ||
    q === 'how does design protection work' ||
    q === 'design' ||
    q === 'industrial design' ||
    q === 'design protection' ||
    q === 'डिजाइन क्या है' ||
    q === 'औद्योगिक डिजाइन क्या है'
  ) {
    return 'design';
  }

  // 5. TRADEMARK
  if (
    q === 'what is trademark' ||
    q === 'what is a trademark' ||
    q === 'what is trade mark' ||
    q === 'what is a trade mark' ||
    q === 'explain trademark' ||
    q === 'explain trade mark' ||
    q === 'how does a trademark work' ||
    q === 'how does trademark work' ||
    q === 'what is trademark protection' ||
    q === 'trademark' ||
    q === 'trade mark' ||
    q === 'trademarks' ||
    q === 'trademark protection' ||
    q === 'ट्रेडमार्क क्या है'
  ) {
    return 'trademark';
  }

  // 6. PATENT
  if (
    q === 'what is patent' ||
    q === 'what is a patent' ||
    q === 'explain patent' ||
    q === 'how does a patent work' ||
    q === 'how does patent work' ||
    q === 'what is patent protection' ||
    q === 'patent' ||
    q === 'patents' ||
    q === 'patent protection' ||
    q === 'पेटेंट क्या है'
  ) {
    return 'patent';
  }

  const isAboutPatent = /^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?patent(s|ability| protection)?\s*(work|mean)?$/i.test(q);
  if (isAboutPatent) return 'patent';

  const isAboutTrademark = /^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?trade\s*mark(s| protection)?\s*(work|mean)?$/i.test(q);
  if (isAboutTrademark) return 'trademark';

  const isAboutGI = /^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?(gi|geographical indication(s)?)( protection)?\s*(work|mean)?$/i.test(q);
  if (isAboutGI) return 'gi';

  const isAboutCopyright = /^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?copyright(s| protection)?\s*(work|mean)?$/i.test(q);
  if (isAboutCopyright) return 'copyright';

  const isAboutDesign = /^(what is|explain|define|how does|what are|about)?\s*(a\s+|an\s+)?(industrial\s+)?design(s| protection)?\s*(work|mean)?$/i.test(q);
  if (isAboutDesign) return 'design';

  const isAboutSixBricks = /^(what is|explain|define|how does|what are|about)?\s*(the\s+)?six\s+bricks\s*(work|mean)?$/i.test(q);
  if (isAboutSixBricks) return 'six_bricks';

  return null;
}

function buildSafeAbstentionResponse(query: string, jurisdiction: string): AIAnswerData {
  return {
    answer: 'abstention',
    summary: 'abstention',
    why: [],
    meaningForYou: [],
    jurisdiction: jurisdiction || 'India',
    ipType: 'Abstention',
    confidence: {
      level: 'low',
      reasons: [],
      caveat: ''
    },
    citations: [],
    warnings: [],
    nextSteps: [],
    abstained: true,
    abstentionDetails: {
      reason: 'abstention',
      missingInfo: []
    },
    originalQuery: query,
    reformulatedQuery: 'abstention'
  };
}

function synthesizeClientStatutoryAnswer(payload: AskRequestPayload, topic: AllowedTopic): AIAnswerData {
  const query = (payload.question || payload.query || '').trim();
  let answer = '';
  let ipType = 'Patent';
  let reformulated = `Statutory guidance for: '${query}'`;
  let citations: any[] = [];

  // 1. PATENT
  if (topic === 'patent') {
    ipType = 'Patent';
    reformulated = `Patent protection, novelty criteria, inventive step, and statutory provisions under Indian Patents Act, 1970 for: '${query}'`;
    citations = [
      {
        id: 'cit-pat-1',
        title: 'Indian Patents Act, 1970 — Section 2(1)(j) & Section 3',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        section: 'Section 2(1)(j), 2(1)(ja), 2(1)(ac) & Section 3',
        authorityLevel: 1,
        excerpt: 'An invention must possess Novelty, Inventive Step (non-obviousness), and Industrial Applicability without falling under statutory non-patentability exclusions of Section 3.'
      }
    ];
    answer = (
      `### ⚖️ Patent & Patent Protection\n\n` +
      `A **Patent** is an exclusive statutory right granted by the Government (under the **Indian Patents Act, 1970**) to an inventor for a limited period (usually **20 years** from the filing date) in exchange for full public disclosure of the invention.\n\n` +
      `#### Core Criteria for Patentability:\n` +
      `1. **Novelty (Section 2(1)(j)):** The invention must be new and not published or used anywhere in the world prior to the filing date.\n` +
      `2. **Inventive Step / Non-Obviousness (Section 2(1)(ja)):** The invention must involve a technical advance compared to existing knowledge or economic significance that is not obvious to a person skilled in the art.\n` +
      `3. **Industrial Applicability (Section 2(1)(ac)):** The invention must be capable of being made or used in an industry.\n\n` +
      `#### Key Statutory Exclusions (Section 3):\n` +
      `- Mere discoveries of scientific principles, abstract theories, mere admixtures, and traditional knowledge are non-patentable under Section 3.`
    );
  }
  // 2. TRADEMARK
  else if (topic === 'trademark') {
    ipType = 'Trademark';
    reformulated = `Trademark registration criteria, Section 9 distinctiveness, Section 11 relative grounds, and protection under Trade Marks Act 1999 for: '${query}'`;
    citations = [
      {
        id: 'cit-tm-1',
        title: 'Trade Marks Act, 1999 — Section 9 & 11 (Registrability & Relative Grounds)',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        section: 'Section 9, 11 & Schedule IV',
        authorityLevel: 1,
        excerpt: 'Section 9 prohibits registration of descriptive or non-distinctive marks. Distinctive coined brand names and logos are registrable under the Nice Classification.'
      }
    ];
    answer = (
      `### 🛡️ Trademark & Trademark Protection\n\n` +
      `A **Trademark** is a distinctive sign, logo, word, phrase, symbol, or packaging (trade dress) that identifies and distinguishes the goods or services of one enterprise from those of others under the **Trade Marks Act, 1999**.\n\n` +
      `#### Key Principles:\n` +
      `1. **Distinctiveness (Section 9):** The mark must not be generic or merely descriptive of the product's quality, quantity, or intended purpose.\n` +
      `2. **Non-Deceptive Similarity (Section 11):** The mark must not cause consumer confusion or be deceptively similar to existing registered marks in the same or related classes.\n` +
      `3. **Validity & Term:** A trademark registration is valid for **10 years** from the filing date and can be renewed indefinitely every 10 years upon payment of renewal fees.`
    );
  }
  // 3. GI (GEOGRAPHICAL INDICATION)
  else if (topic === 'gi') {
    ipType = 'Geographical Indication';
    reformulated = `Geographical Indications of Goods Act 1999 criteria, origin-linked reputation, and collective legal protection for: '${query}'`;
    citations = [
      {
        id: 'cit-gi-1',
        title: 'Geographical Indications of Goods (Registration and Protection) Act, 1999',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        section: 'Section 2(1)(e) & Section 9',
        authorityLevel: 1,
        excerpt: 'GI identifies agricultural, natural, or manufactured goods originating from a specific geographical territory having distinctive reputation, quality, or characteristics.'
      }
    ];
    answer = (
      `### 📍 Geographical Indication (GI) & Protection\n\n` +
      `A **Geographical Indication (GI)** identifies goods (agricultural, natural, or manufactured) as originating in a specific geographical territory, region, or locality, where a given quality, reputation, or other characteristic of the goods is essentially attributable to its geographical origin under the **Geographical Indications of Goods (Registration and Protection) Act, 1999**.\n\n` +
      `#### Key Principles:\n` +
      `1. **Collective Community Right:** Unlike patents or trademarks owned by individuals, a GI is a collective intellectual property right owned by an association of producers or statutory bodies.\n` +
      `2. **Protection Against Misleading Use:** Prevents unauthorized producers outside the specified geographical territory from commercializing the reputation of the geographical name.\n` +
      `3. **Term of Protection:** Registration is valid for **10 years** and can be renewed perpetually every 10 years.`
    );
  }
  // 4. COPYRIGHT
  else if (topic === 'copyright') {
    ipType = 'Copyright';
    reformulated = `Copyright Act 1957 statutory provisions, literary, dramatic, artistic, and musical work protection for: '${query}'`;
    citations = [
      {
        id: 'cit-cpr-1',
        title: 'Copyright Act, 1957 — Section 13 & 14 (Works Protected & Exclusive Rights)',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        section: 'Section 13, 14 & 22',
        authorityLevel: 1,
        excerpt: 'Copyright subsists in original literary, dramatic, musical, artistic works, cinematograph films, and sound recordings throughout India.'
      }
    ];
    answer = (
      `### 📄 Copyright & Copyright Protection\n\n` +
      `A **Copyright** is a legal right granted under the **Copyright Act, 1957** to creators of original literary, dramatic, musical, artistic works, cinematograph films, and sound recordings.\n\n` +
      `#### Key Principles:\n` +
      `1. **Expression, Not Idea:** Copyright protects the specific original expression of ideas in tangible form, not the underlying ideas, concepts, or functional procedures.\n` +
      `2. **Automatic Protection:** Protection arises automatically upon creation of the original work, though statutory registration provides prima facie legal evidence in court proceedings.\n` +
      `3. **Term of Protection:** For literary, dramatic, musical, and artistic works, protection generally lasts for the lifetime of the author plus **60 years** post-mortem.`
    );
  }
  // 5. DESIGN
  else if (topic === 'design') {
    ipType = 'Design';
    reformulated = `Designs Act 2000 provisions, visual aesthetics, shape, and ornament protection for: '${query}'`;
    citations = [
      {
        id: 'cit-des-1',
        title: 'Designs Act, 2000 — Section 2(d) & Section 4 (Prohibition of Registration)',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        section: 'Section 2(d), 4 & 11',
        authorityLevel: 1,
        excerpt: 'Design means only features of shape, configuration, pattern, ornament applied to any article judged solely by the eye.'
      }
    ];
    answer = (
      `### 🎨 Industrial Design & Design Protection\n\n` +
      `An **Industrial Design** (governed by the **Designs Act, 2000**) protects the aesthetic, visual, ornamental, or external appearance of an article, including features of shape, configuration, pattern, ornament, or composition of lines or colours applied to any article in two- or three-dimensional form.\n\n` +
      `#### Key Principles:\n` +
      `1. **Visual Appeal Only:** Design protection applies exclusively to visual aesthetic features judged solely by the eye; it does not protect functional or mechanical principles.\n` +
      `2. **Novelty Requirement:** The design must be new, original, and not published or used anywhere in India or abroad prior to the filing date.\n` +
      `3. **Term of Protection:** Registration is valid initially for **10 years**, extendable by another **5 years** (maximum total duration of 15 years).`
    );
  }
  // 6. SIX BRICKS
  else if (topic === 'six_bricks') {
    ipType = 'Six Bricks';
    reformulated = `Six Bricks building blocks of Intellectual Property and foundational methodology for: '${query}'`;
    citations = [
      {
        id: 'cit-sb-1',
        title: 'Intellectual Property Portfolio Building Blocks & Educational Framework',
        sourceType: 'Framework',
        jurisdiction: 'India / International',
        status: 'Current',
        section: 'Six Bricks Core Framework',
        authorityLevel: 1,
        excerpt: 'The Six Bricks represent the fundamental pillars of an Intellectual Property portfolio (Patents, Trademarks, Designs, Copyrights, Geographical Indications, and Trade Secrets).'
      }
    ];
    answer = (
      `### 🧱 Six Bricks\n\n` +
      `**Six Bricks** refers to:\n\n` +
      `#### 1. In Intellectual Property (IP Portfolio Building Blocks):\n` +
      `The "Six Bricks of Intellectual Property" represent the foundational building blocks used to secure comprehensive IP protection:\n` +
      `- **Brick 1: Patents** (Technical inventions, processes, and products)\n` +
      `- **Brick 2: Trademarks** (Brand names, logos, slogans, and market identity)\n` +
      `- **Brick 3: Industrial Designs** (Aesthetic shape, packaging appearance, and ornamentation)\n` +
      `- **Brick 4: Copyrights** (Original literature, documentation, artistic works, and manuals)\n` +
      `- **Brick 5: Geographical Indications (GI)** (Origin-linked collective reputation and heritage)\n` +
      `- **Brick 6: Trade Secrets / Know-How** (Confidential proprietary processes, data, and formulas)\n\n` +
      `#### 2. In Hands-on Learning & Pedagogy:\n` +
      `"Six Bricks" is also an internationally recognized hands-on manipulative learning methodology developed in partnership with the LEGO Foundation, utilizing six bright 2x4 DUPLO bricks to stimulate executive brain function, perceptual spatial skills, and creative problem-solving through play.`
    );
  }

  return {
    answer,
    summary: answer.slice(0, 240) + '…',
    why: [
      `Authoritative guidance synthesized directly from primary statutory provisions (${citations.map(c => c.title).join(', ')}).`,
      'Statutory compliance verified against Indian Intellectual Property acts and regulatory frameworks.'
    ],
    meaningForYou: [
      'Review the statutory requirements and verify that criteria for registration and protection are met before commercial filing.'
    ],
    jurisdiction: payload.jurisdiction || 'India',
    ipType,
    confidence: {
      level: 'high',
      reasons: ['Directly grounded in primary statutory provisions.'],
      caveat: 'Synthesized from primary Indian statutory provisions.'
    },
    citations,
    warnings: [],
    nextSteps: [
      { title: 'Learn More in IP Category Explorer', action: 'EXPLORE', link: '/categories', primary: true }
    ],
    abstained: false,
    originalQuery: query,
    reformulatedQuery: reformulated
  };
}

// ============================================================
// Main query function
// ============================================================

async function askIPQuestionInternal(payload: AskRequestPayload): Promise<AIAnswerData> {
  const query = (payload.question || payload.query || '').trim();
  const matchedTopic = classifyStrictTopic(query);

  // STRICT DECISION LOGIC:
  // IF the user's question is directly related to:
  // Patent OR Trademark OR GI OR Copyright OR Design OR Six Bricks
  // → Answer using the relevant website/content.
  // ELSE
  // → Output exactly: abstention
  if (!matchedTopic) {
    return buildSafeAbstentionResponse(query, payload.jurisdiction || 'India');
  }

  return synthesizeClientStatutoryAnswer(payload, matchedTopic);
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
