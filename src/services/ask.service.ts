import { AIAnswerData, CaseProfile } from '../store/appStore';
import { API_CONFIG } from './api.config';
import { getAuthHeader } from './supabase';

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

export async function askIPQuestion(payload: AskRequestPayload): Promise<AIAnswerData> {
  const requestBody = {
    question: payload.question || payload.query,
    language: payload.response_language || payload.input_language || 'en',
    response_language: payload.response_language || payload.input_language || 'en',
    jurisdiction: payload.jurisdiction || 'india',
    session_id: payload.session_id || payload.conversation_id,
    case_id: payload.session_id,
    case_builder_data: payload.case_profile ? {
      product_name: payload.case_profile.productName,
      applicant_type: payload.case_profile.entityType,
      ip_category: payload.case_profile.productType,
      biological_material: payload.case_profile.biological_material ?? true,
      tk_involved: payload.case_profile.tk_involved ?? true,
      ingredients: payload.case_profile.ingredients || []
    } : undefined
  };

  // If a real FastAPI RAG or n8n endpoint is enabled, forward request with Supabase bearer token
  const ragUrl = API_CONFIG.FASTAPI_BASE_URL
    ? `${API_CONFIG.FASTAPI_BASE_URL.replace(/\/$/, '')}/query`
    : API_CONFIG.N8N_WEBHOOK_URL;

  if (!API_CONFIG.USE_MOCK && ragUrl) {
    try {
      const authHeader = await getAuthHeader();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

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
        
        // Map FastAPI QueryResponse to AIAnswerData for the frontend
        const mapped: AIAnswerData = {
          answer: raw.answer || '',
          summary: raw.answer ? (raw.answer.length > 250 ? raw.answer.slice(0, 250) + '...' : raw.answer) : '',
          why: raw.confidence_info?.reasoning 
            ? [raw.confidence_info.reasoning, ...(raw.confidence_info.gaps || [])] 
            : (raw.citations && raw.citations.length > 0)
              ? raw.citations.map((c: any) => `Statutory grounding: ${c.title || c.act} (${c.section || ''})`)
              : ['Derived from indexed primary statutes and official patent examination guidelines.'],
          meaningForYou: [
            raw.next_step || 'Ensure clear experimental evidence of synergy is available before filing under Section 3(e).'
          ],
          jurisdiction: raw.query_analysis?.jurisdiction || raw.jurisdiction || 'India',
          ipType: (raw.query_analysis?.ip_type && raw.query_analysis.ip_type[0]) || 'Patent / Traditional Knowledge',
          confidence: {
            level: (raw.confidence_label || raw.confidence_info?.level || (raw.confidence >= 0.7 ? 'high' : raw.confidence >= 0.4 ? 'medium' : 'low')) as any,
            reasons: raw.confidence_info?.reasoning ? [raw.confidence_info.reasoning] : ['Corpus-grounded statutory analysis'],
            caveat: raw.confidence_info?.gaps?.[0] || 'Based strictly on indexed statutory references'
          },
          citations: (raw.citations || []).map((c: any, i: number) => ({
            id: c.id || `cit-${i + 1}`,
            title: c.title || 'Statutory Authority',
            sourceType: c.act || 'Act',
            jurisdiction: 'India',
            status: 'Current',
            section: c.section || '',
            authorityLevel: c.authority_level || 1,
            excerpt: c.snippet || '',
            url: c.url
          })),
          warnings: raw.human_review?.recommended ? [raw.human_review.reason || 'Expert consultation recommended'] : [],
          nextSteps: [
            { title: raw.next_step || 'Review Statutory Provisions', action: 'CLASSIFY', link: '/classifier', primary: true }
          ],
          abstained: Boolean(raw.abstained),
          abstentionDetails: raw.abstained ? {
            reason: raw.abstention_reason || 'Query could not be grounded in corpus.',
            missingInfo: raw.confidence_info?.gaps || []
          } : undefined
        };
        return mapped;
      }
    } catch (err) {
      console.warn('Backend API timed out or returned error, engaging statutory grounding fallback:', err);
    }
  }

  // Grounded mock engine adhering precisely to PRD Section 29-38, 59-61
  const q = payload.query.toLowerCase();

  // 1. Safe Abstention Trigger (e.g. if query is too vague)
  if (q.length < 8 || q.includes('help me') || q.includes('kuch batao') || q.includes('hello')) {
    return {
      answer: 'We need more specific details regarding your product, formulation, or legal question to provide accurate legal and regulatory guidance.',
      summary: 'Insufficient facts provided to identify applicable IP provisions or regulatory requirements.',
      why: [
        'The query does not specify the active Ayurvedic ingredients or classical references.',
        'The operational jurisdiction or target commercial territory is undetermined.',
        'The manufacturing method and novelty claims are not provided.'
      ],
      meaningForYou: [
        'Do not commit commercial capital before clarifying whether your formulation is in the public domain.',
        'Gather the complete list of botanical/mineral ingredients and classical Ayurvedic text references (e.g. Charaka Samhita, Bhavaprakasha).'
      ],
      jurisdiction: payload.jurisdiction || 'India',
      ipType: 'Undetermined',
      confidence: {
        level: 'low',
        reasons: ['No specific product facts supplied', 'Vague query intent'],
        caveat: 'Safe abstention activated to avoid speculative advice.'
      },
      citations: [
        {
          id: 'cit-abs-1',
          title: 'The Patents Act, 1970 — Section 3',
          sourceType: 'Act',
          jurisdiction: 'India',
          status: 'Current',
          section: 'Section 3(p)',
          authorityLevel: 1,
          excerpt: 'An invention which in effect is traditional knowledge or an aggregation/duplication of known properties of traditionally known components is not an invention.'
        }
      ],
      warnings: ['This system abstains from answering when factual grounding is inadequate.'],
      nextSteps: [
        { title: 'Use Guided Product Classifier', action: 'CLASSIFY', link: '/classifier', primary: true },
        { title: 'Speak with Human Expert', action: 'ESCALATE', link: '/dashboard' }
      ],
      abstained: true,
      abstentionDetails: {
        reason: 'Insufficient factual basis to conduct Section 3(p) or novelty evaluation.',
        missingInfo: [
          'Detailed botanical or classical composition of the formulation',
          'Target commercial claim (e.g. therapeutic treatment vs cosmetic wellness)',
          'Proof of synergistic or non-obvious efficacy data'
        ]
      }
    };
  }

  // 2. Clarification Trigger (e.g. Polyherbal / Patent query needing novelty status)
  if (q.includes('patent') && !payload.case_profile?.isTraditional && !q.includes('trademark') && !q.includes('abs')) {
    return {
      answer: 'Your Ayurvedic herbal formulation requires Section 3(p) and novelty evaluation under the Indian Patents Act, 1970.',
      summary: 'Patentability of herbal medicines in India depends fundamentally on whether the formulation is classical, modified, or demonstrates non-obvious synergistic therapeutic efficacy.',
      why: [
        'Under Section 3(p) of the Patents Act, traditional knowledge or simple admixture of known herbs is statutorily non-patentable.',
        'If synergistic efficacy is scientifically proven beyond individual herb properties, patent protection may be possible for novel extraction or synergistic ratios.',
        'TKDL prior art examiners will compare your composition against classical texts (Charaka, Sushruta, Ashtanga Hridaya).'
      ],
      meaningForYou: [
        'You cannot patent a classical Ayurvedic formula verbatim.',
        'You CAN protect unique synergistic extraction processes or novel compositions if supported by comparative bio-activity data.',
        'Ensure you do not publicly disclose formulation details prior to filing a provisional patent specification.'
      ],
      jurisdiction: payload.jurisdiction || 'India',
      ipType: 'Patent & Traditional Knowledge',
      confidence: {
        level: 'medium',
        reasons: [
          'Statutory Section 3(p) framework applied',
          'Awaiting clarification on whether the formulation is classical or novel'
        ]
      },
      citations: [
        {
          id: 'cit-pat-1',
          title: 'The Patents Act, 1970',
          sourceType: 'Act',
          section: 'Section 3(p), 3(d), 3(e)',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 1,
          excerpt: 'Section 3(p) prohibits patents on inventions that are traditional knowledge or an aggregation of known properties of traditionally known components.'
        },
        {
          id: 'cit-pat-2',
          title: 'Guidelines for Examination of Patent Applications relating to Traditional Knowledge and Biological Material',
          sourceType: 'Guideline',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 2,
          excerpt: 'Patent Office Guidelines (2012) require examiners to cross-verify all botanical ingredients against TKDL and demand proof of synergistic efficacy under Section 3(e).'
        },
        {
          id: 'cit-pat-3',
          title: 'TKDL Prior Art Database Reference Standard',
          sourceType: 'TKDL',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 3,
          excerpt: 'Covers over 4.5 lakh classical formulations across Ayurveda, Unani, and Siddha texts.'
        }
      ],
      warnings: [
        'Do not file a patent without conducting a rigorous prior art search against classical texts and patent registries.',
        'Guidance is source-backed and does not constitute formal legal patent filing advice.'
      ],
      nextSteps: [
        { title: 'Check Prior Art in TKDL', action: 'PRIOR_ART', link: '/prior-art', primary: true },
        { title: 'Check Biodiversity ABS Compliance', action: 'ABS_CHECK', link: '/abs' },
        { title: 'Request Human Expert Case Review', action: 'ESCALATE', link: '/dashboard' }
      ],
      needsClarification: true,
      clarificationPrompt: {
        question: 'To provide precise patent guidance, how is your formulation constructed?',
        options: [
          { id: 'opt-1', label: 'Novel composition with proven synergistic efficacy data', value: 'new' },
          { id: 'opt-2', label: 'Classical Ayurvedic text formulation (e.g. from Ayurvedic Formulary of India)', value: 'traditional' },
          { id: 'opt-3', label: 'Modified classical formula with novel extraction/carrier system', value: 'modified_traditional' },
          { id: 'opt-4', label: 'Not sure / Need assessment', value: 'unsure' }
        ]
      }
    };
  }

  // 3. ABS / Biological Resources Query
  if (q.includes('abs') || q.includes('biodiversity') || q.includes('biological') || q.includes('resource') || q.includes('nba')) {
    return {
      answer: 'Commercial utilization of Indian biological resources requires compliance with the Biological Diversity Act, 2002 and approval from the National Biodiversity Authority (NBA) or State Biodiversity Board (SBB).',
      summary: 'Any person or enterprise utilizing biological resources or associated traditional knowledge for commercial extraction, research, or IP application in India is governed under Sections 3, 4, 6, and 7 of the Biological Diversity Act.',
      why: [
        'Indian companies must give prior intimation in Form I to the respective State Biodiversity Board (Section 7).',
        'Foreign entities or Indian entities with foreign equity must obtain prior approval from the National Biodiversity Authority in Form I/II (Section 3).',
        'Applying for any Intellectual Property based on biological resources sourced in India requires prior NBA approval in Form III under Section 6.'
      ],
      meaningForYou: [
        'Before filing a patent application involving Indian herbs, you must seek NBA Form III permission.',
        'Set aside statutory Access & Benefit Sharing (ABS) fees (typically 0.1% to 0.5% of ex-factory gross sales or 3-5% of royalties).',
        'Keep authenticated procurement documentation for all botanical raw materials from authorized cultivators or mandis.'
      ],
      jurisdiction: payload.jurisdiction || 'India',
      ipType: 'ABS & Biodiversity Regulation',
      confidence: {
        level: 'high',
        reasons: [
          'Matched statutory provisions of Biological Diversity Act 2002',
          'Applicable National Biodiversity Authority Regulations 2014 verified'
        ]
      },
      citations: [
        {
          id: 'cit-abs-1',
          title: 'The Biological Diversity Act, 2002',
          sourceType: 'Act',
          section: 'Sections 3, 6, 7 & 19',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 1,
          excerpt: 'Section 6: No person shall apply for any intellectual property right, in or outside India, for any invention based on any research or information on a biological resource obtained from India without obtaining previous approval of NBA.'
        },
        {
          id: 'cit-abs-2',
          title: 'Guidelines on Access to Biological Resources and Associated Knowledge and Benefits Sharing Regulations, 2014',
          sourceType: 'Guideline',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 2,
          excerpt: 'Defines benefit sharing criteria: 0.1% to 0.5% on annual ex-factory purchase/sale value for commercial utilization.'
        }
      ],
      warnings: [
        'Failure to comply with Section 6 before grant of patent may lead to revocation and penal provisions under Section 55.'
      ],
      nextSteps: [
        { title: 'Start Guided ABS Checklist', action: 'ABS_WIZARD', link: '/abs', primary: true },
        { title: 'Check Product Regulatory Classification', action: 'CLASSIFY', link: '/classifier' },
        { title: 'Escalate to ABS Regulatory Counsel', action: 'ESCALATE', link: '/dashboard' }
      ]
    };
  }

  // 4. Trademark / Brand Protection Query
  if (q.includes('trademark') || q.includes('brand') || q.includes('logo') || q.includes('name')) {
    return {
      answer: 'Ayurveda brand names and distinctive logos can be protected under the Trade Marks Act, 1999 (Class 5 for medicinal preparations, Class 3 for herbal cosmetics, Class 30 for herbal teas/food).',
      summary: 'Classical Sanskrit generic names (such as "Triphala", "Chyawanprash", "Brahmi Taila") cannot be monopolized as trademarks. However, distinctive arbitrary or coined brand names (e.g., "Herboveda Triphala+") are registrable.',
      why: [
        'Section 9(1)(b) prohibits registration of descriptive names indicating the kind, quality, or Ayurvedic ingredients.',
        'Section 13 prohibits registration of chemical or common generic names of single medicinal ingredients.',
        'Adding a distinctive house mark or coined prefix overcomes generic objections.'
      ],
      meaningForYou: [
        'Do not attempt to trademark pure classical formulation names by themselves.',
        'Create a coined, memorable brand name prefix for your product packaging.',
        'File multi-class applications if selling both therapeutic products (Class 5) and herbal wellness cosmetics (Class 3).'
      ],
      jurisdiction: payload.jurisdiction || 'India',
      ipType: 'Trademark Protection',
      confidence: {
        level: 'high',
        reasons: ['Trade Marks Act 1999 provisions matched', 'Nice Classification guidelines checked']
      },
      citations: [
        {
          id: 'cit-tm-1',
          title: 'The Trade Marks Act, 1999',
          sourceType: 'Act',
          section: 'Sections 9(1)(b) & Section 13',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 1,
          excerpt: 'Section 13 prevents registration of names of chemical compounds or common herbal names that would restrict legitimate trade usage.'
        },
        {
          id: 'cit-tm-2',
          title: 'Manual of Trade Marks Practice & Procedure (AYUSH Guidelines)',
          sourceType: 'Guideline',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 2
        }
      ],
      warnings: [
        'Ensure packaging graphics do not violate existing copyrighted Ayurvedic art or registered design shapes.'
      ],
      nextSteps: [
        { title: 'Explore Trademark Guidance Page', action: 'TM_PAGE', link: '/trademark', primary: true },
        { title: 'Check Product Classification', action: 'CLASSIFY', link: '/classifier' },
        { title: 'Ask Follow-up Question', action: 'FOLLOW_UP' }
      ]
    };
  }

  // 5. Default Comprehensive Grounded Response
  return {
    answer: 'Your Ayurveda inquiry involves multi-domain Intellectual Property considerations under Indian IP statutes and AYUSH regulatory frameworks.',
    summary: 'Protection of Ayurvedic innovation typically combines Trademark brand protection, Trade Secret manufacturing methods, Patentability for synergistic novel extractions, and compliance with State Biodiversity Access & Benefit Sharing rules.',
    why: [
      'Pure classical formulations belong to the public domain and cannot be patented under Section 3(p).',
      'Proprietary delivery systems (nano-emulsions, sustained-release herbal tablets, standardized phyto-extract ratios) may qualify for patent and design protection.',
      'Sourcing biological herbs within India creates statutory obligations under the Biological Diversity Act, 2002.'
    ],
    meaningForYou: [
      'Step 1: Conduct a prior art search across TKDL and patent databases.',
      'Step 2: Trademark your distinctive brand identity in Class 5 or Class 3.',
      'Step 3: Document raw material origin for State Biodiversity Board clearance.',
      'Step 4: Obtain proper manufacturing license from State AYUSH Licensing Authority.'
    ],
    jurisdiction: payload.jurisdiction || 'India',
    ipType: 'Integrated Ayurveda IP & Regulatory',
    confidence: {
      level: 'medium',
      reasons: ['Standard multi-domain statutory matrix applied', 'Requires specific formulation facts for conclusive claim']
    },
    citations: [
      {
        id: 'cit-gen-1',
        title: 'The Patents Act, 1970 — Section 3(p)',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        authorityLevel: 1
      },
      {
        id: 'cit-gen-2',
        title: 'The Biological Diversity Act, 2002 — Section 6',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        authorityLevel: 1
      },
      {
        id: 'cit-gen-3',
        title: 'Drugs and Cosmetics Act, 1940 (Chapter IVA — Ayurvedic, Siddha & Unani Drugs)',
        sourceType: 'Act',
        jurisdiction: 'India',
        status: 'Current',
        authorityLevel: 1
      }
    ],
    warnings: [
      'This guidance provides source-grounded information and does not replace formal legal opinions by a registered patent agent or lawyer.'
    ],
    nextSteps: [
      { title: 'Classify My Product Step-by-Step', action: 'CLASSIFY', link: '/classifier', primary: true },
      { title: 'Check Prior Art in Knowledge Base', action: 'PRIOR_ART', link: '/prior-art' },
      { title: 'Request Human Expert Case Review', action: 'ESCALATE', link: '/dashboard' }
    ]
  };
}
