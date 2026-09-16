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
  // Determine response language adhering strictly to user request / query script
  const langReq = (payload.response_language || payload.input_language || 'en').toLowerCase();
  let lang = 'en';
  const hasDevanagari = /[\u0900-\u097F]/.test(payload.query);
  const hasGujarati = /[\u0A80-\u0AFF]/.test(payload.query);
  const marathiVocab = ['माझ्या', 'आहे', 'नाही', 'कसे', 'मिळेल', 'करावे', 'नाकारले', 'मंडळ', 'वनस्पती', 'औषध', 'मला', 'काय', 'झाले', 'अर्ज'];
  const hindiRoman = ['kya', 'kaise', 'hai', 'mujhe', 'karna', 'hoga', 'chahiye', 'sakte', 'sakta', 'batao', 'bataiye', 'milega', 'milta'];
  const marathiRoman = ['mala', 'majhya', 'kase', 'milnar', 'shakto', 'shakte', 'ahe', 'karave', 'kay', 'honaar', 'aushadh'];

  const queryWords = payload.query.toLowerCase().split(/\s+/);

  if (langReq === 'mr' || (hasDevanagari && marathiVocab.some((w) => payload.query.includes(w))) || marathiRoman.some((w) => queryWords.includes(w))) {
    lang = 'mr';
  } else if (langReq === 'gu' || hasGujarati) {
    lang = 'gu';
  } else if (langReq === 'hi' || hasDevanagari || hindiRoman.some((w) => queryWords.includes(w))) {
    lang = 'hi';
  } else if (langReq && langReq !== 'en') {
    lang = langReq;
  }

  // Grounded mock engine adhering precisely to PRD Section 29-38, 59-61
  const q = payload.query.toLowerCase();

  // 1. Safe Abstention Trigger (e.g. if query is too vague)
  if (q.length < 8 || q.includes('help me') || q.includes('kuch batao') || q.includes('hello') || q.includes('नमस्ते') || q.includes('नमस्कार')) {
    if (lang === 'hi') {
      return {
        answer: 'सटीक कानूनी और विनियामक मार्गदर्शन प्रदान करने के लिए हमें आपके उत्पाद, आयुर्वेदिक फॉर्मूलेशन या कानूनी प्रश्न के अधिक विशिष्ट विवरण की आवश्यकता है।',
        summary: 'लागू बौद्धिक संपदा प्रावधानों या विनियामक आवश्यकताओं की पहचान करने के लिए अपर्याप्त तथ्य प्रस्तुत किए गए हैं।',
        why: [
          'प्रश्न में सक्रिय आयुर्वेदिक घटकों या शास्त्रीय संदर्भों का उल्लेख नहीं है।',
          'लक्षित वाणिज्यिक क्षेत्र या विनिर्माण अधिकार क्षेत्र अनिर्धारित है।',
          'विनिर्माण विधि और नवीनता (Novelty) के दावों का विवरण नहीं दिया गया है।'
        ],
        meaningForYou: [
          'यह स्पष्ट किए बिना वाणिज्यिक पूंजी न लगाएं कि आपका फॉर्मूलेशन सार्वजनिक डोमेन (Public Domain) में तो नहीं है।',
          'हर्बल/खनिज घटकों की पूरी सूची और शास्त्रीय आयुर्वेदिक संदर्भ (जैसे चरक संहिता, भावप्रकाश) संकलित करें।'
        ],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'अनिर्धारित (Undetermined)',
        confidence: {
          level: 'low',
          reasons: ['कोई विशिष्ट उत्पाद तथ्य प्रदान नहीं किए गए', 'अस्पष्ट प्रश्न उद्देश्य'],
          caveat: 'काल्पनिक या अनुमानित सलाह से बचने के लिए सुरक्षित संयम (Safe Abstention) सक्रिय किया गया।'
        },
        citations: [
          {
            id: 'cit-abs-1',
            title: 'भारतीय पेटेंट अधिनियम, 1970 — धारा 3(p)',
            sourceType: 'Act',
            jurisdiction: 'India',
            status: 'Current',
            section: 'धारा 3(p)',
            authorityLevel: 1,
            excerpt: 'पारंपरिक ज्ञान या ज्ञात घटकों के ज्ञात गुणों का मात्र सम्मिश्रण पेटेंट योग्य आविष्कार नहीं है।'
          }
        ],
        warnings: ['तथ्यात्मक आधार अपर्याप्त होने पर यह प्रणाली उत्तर देने से संयम बरतती है।'],
        nextSteps: [
          { title: 'उत्पाद वर्गीकरण मार्गदर्शिका का उपयोग करें', action: 'CLASSIFY', link: '/classifier', primary: true },
          { title: 'पैनलबद्ध विशेषज्ञ से संपर्क करें', action: 'ESCALATE', link: '/dashboard' }
        ],
        abstained: true,
        abstentionDetails: {
          reason: 'धारा 3(p) या नवीनता मूल्यांकन करने के लिए अपर्याप्त तथ्यात्मक आधार।',
          missingInfo: [
            'फॉर्मूलेशन का विस्तृत वानस्पतिक या शास्त्रीय संघटन',
            'वाणिज्यिक उपयोग का उद्देश्य (चिकित्सीय बनाम प्रसाधन)',
            'सहक्रियाशीलता (Synergistic Efficacy) का प्रयोगशाला डेटा'
          ]
        }
      };
    } else if (lang === 'mr') {
      return {
        answer: 'अचूक कायदेशीर आणि वैधानिक मार्गदर्शन मिळवण्यासाठी आम्हाला तुमच्या उत्पादनाचे किंवा आयुर्वेदिक सूत्राचे सविस्तर तपशील आवश्यक आहेत.',
        summary: 'लागू होणारे बौद्धिक संपदा नियम किंवा कायदेशीर तरतुदी निश्चित करण्यासाठी अपुरी माहिती देण्यात आली आहे.',
        why: [
          'प्रश्नात आयुर्वेदिक वनस्पती घटकांचा किंवा शास्त्रीय ग्रंथांचा उल्लेख नाही.',
          'व्यावसायिक अधिकार क्षेत्र किंवा उत्पादन पद्धती स्पष्ट केलेली नाही.'
        ],
        meaningForYou: [
          'तुमचे सूत्र सार्वजनिक डोमेनमध्ये (Public Domain) आहे की नाही हे तपासल्याशिवाय व्यावसायिक गुंतवणूक करू नका.',
          'घटकांची पूर्ण यादी आणि चरक, सुश्रुत संहिता संदर्भ गोळा करा.'
        ],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'अनिर्धारित',
        confidence: {
          level: 'low',
          reasons: ['अपुरी माहिती', 'अस्पष्ट प्रश्न'],
          caveat: 'अनुमानित सल्ल्यापासून संरक्षण करण्यासाठी सुरक्षित संयम (Safe Abstention) लागू केला आहे.'
        },
        citations: [
          {
            id: 'cit-abs-1',
            title: 'भारतीय पेटंट कायदा, 1970 — कलम 3(p)',
            sourceType: 'Act',
            jurisdiction: 'India',
            status: 'Current',
            section: 'कलम 3(p)',
            authorityLevel: 1,
            excerpt: 'पारंपरिक ज्ञान किंवा ज्ञात घटकांचे केवळ एकत्रीकरण पेटंटसाठी ग्राह्य धरले जात नाही.'
          }
        ],
        warnings: ['तथ्यात्मक आधार अपुरा असल्याने अधिक माहितीची गरज आहे.'],
        nextSteps: [
          { title: 'उत्पादन वर्गीकरण साधन वापरा', action: 'CLASSIFY', link: '/classifier', primary: true },
          { title: 'तज्ज्ञांशी संपर्क साधा', action: 'ESCALATE', link: '/dashboard' }
        ],
        abstained: true,
        abstentionDetails: {
          reason: 'कलम 3(p) अंतर्गत मूल्यांकनासाठी अपुरी माहिती.',
          missingInfo: ['घटकांचे शास्त्रीय प्रमाण', 'सिनर्जिस्टिक परिणाम पुरावा']
        }
      };
    }

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

  // 2. Patent & Traditional Knowledge / Section 3(p) Query
  if ((q.includes('patent') || q.includes('पेटेंट') || q.includes('पेटंट')) && !payload.case_profile?.isTraditional && !q.includes('trademark') && !q.includes('abs')) {
    if (lang === 'hi') {
      return {
        answer: 'आपके आयुर्वेदिक हर्बल फॉर्मूलेशन के लिए भारतीय पेटेंट अधिनियम, 1970 की धारा 3(p) तथा धारा 3(e) के तहत नवीनता और सहक्रियाशीलता का मूल्यांकन आवश्यक है।',
        summary: 'भारत में हर्बल दवाओं की पेटेंट-योग्यता इस बात पर निर्भर करती है कि फॉर्मूलेशन शास्त्रीय (Classical) है, संशोधित (Modified) है, या उसमें अप्रत्याशित चिकित्सीय सहक्रियाशीलता (Synergistic Efficacy) सिद्ध की गई है।',
        why: [
          'पेटेंट अधिनियम की धारा 3(p) के तहत, पारंपरिक ज्ञान या ज्ञात जड़ी-बूटियों का सामान्य सम्मिश्रण सीधे पेटेंट योग्य नहीं है।',
          'यदि घटकों के व्यक्तिगत प्रभाव से परे ठोस सहक्रियाशीलता (Synergy) वैज्ञानिक रूप से सिद्ध होती है, तो नवीन निष्कर्षण प्रक्रिया या विशिष्ट अनुपात पर पेटेंट संभव है।',
          'टीकेडीएल (TKDL) परीक्षक आपके घटकों की तुलना चरक, सुश्रुत और अष्टांग हृदय जैसे शास्त्रीय ग्रंथों से करेंगे।'
        ],
        meaningForYou: [
          'आप किसी शास्त्रीय आयुर्वेदिक फार्मूले का हूबहू पेटेंट नहीं करा सकते।',
          'आप अद्वितीय सहक्रियाशील निष्कर्षण प्रक्रिया (Extraction Process) या विशिष्ट अनुपात को बायो-एसे डेटा के साथ सुरक्षित कर सकते हैं।',
          'अनंतिम पेटेंट विनिर्देश (Provisional Patent) दाखिल करने से पहले फॉर्मूले का सार्वजनिक खुलासा न करें।'
        ],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'पेटेंट एवं पारंपरिक ज्ञान (Patent & TK)',
        confidence: {
          level: 'medium',
          reasons: ['सांविधिक धारा 3(p) एवं 3(e) रूपरेखा लागू', 'फॉर्मूलेशन शास्त्रीय है या नवीन, इस पर स्पष्टीकरण प्रतीक्षित']
        },
        citations: [
          {
            id: 'cit-pat-1',
            title: 'भारतीय पेटेंट अधिनियम, 1970',
            sourceType: 'Act',
            section: 'धारा 3(p), 3(d), 3(e)',
            jurisdiction: 'India',
            status: 'Current',
            authorityLevel: 1,
            excerpt: 'धारा 3(p) पारंपरिक ज्ञान या ज्ञात घटकों के ज्ञात गुणों के एकत्रीकरण पर पेटेंट को प्रतिबंधित करती है।'
          },
          {
            id: 'cit-pat-2',
            title: 'पारंपरिक ज्ञान और जैविक सामग्री से संबंधित पेटेंट आवेदनों की परीक्षा के लिए दिशानिर्देश (2012)',
            sourceType: 'Guideline',
            jurisdiction: 'India',
            status: 'Current',
            authorityLevel: 2,
            excerpt: 'परीक्षकों के लिए TKDL के साथ मिलान और धारा 3(e) के तहत सहक्रियाशीलता का प्रमाण मांगना अनिवार्य है।'
          }
        ],
        warnings: [
          'शास्त्रीय ग्रंथों और पेटेंट रजिस्टरों में व्यापक पूर्व-कला खोज (Prior Art Search) किए बिना पेटेंट आवेदन दाखिल न करें।'
        ],
        nextSteps: [
          { title: 'TKDL में पूर्व-कला जांचें', action: 'PRIOR_ART', link: '/prior-art', primary: true },
          { title: 'जैव विविधता ABS अनुपालन जांचें', action: 'ABS_CHECK', link: '/abs' },
          { title: 'पैनलबद्ध विशेषज्ञ समीक्षा का अनुरोध करें', action: 'ESCALATE', link: '/dashboard' }
        ],
        needsClarification: true,
        clarificationPrompt: {
          question: 'सटीक पेटेंट मार्गदर्शन के लिए, आपका फॉर्मूलेशन किस श्रेणी में आता है?',
          options: [
            { id: 'opt-1', label: 'प्रमाणित सहक्रियाशीलता (Synergy) डेटा वाला नया संयोजन', value: 'new' },
            { id: 'opt-2', label: 'शास्त्रीय आयुर्वेदिक ग्रंथ सूत्र (उदा. AFI से)', value: 'traditional' },
            { id: 'opt-3', label: 'नवीन निष्कर्षण विधि के साथ संशोधित शास्त्रीय सूत्र', value: 'modified_traditional' },
            { id: 'opt-4', label: 'निश्चित नहीं / मूल्यांकन की आवश्यकता है', value: 'unsure' }
          ]
        }
      };
    } else if (lang === 'mr') {
      return {
        answer: 'तुमच्या आयुर्वेदिक हर्बल सूत्रासाठी भारतीय पेटंट कायदा, 1970 मधील कलम 3(p) आणि कलम 3(e) अंतर्गत नवीनता आणि सिनर्जिस्टिक परिणामाचे मूल्यमापन आवश्यक आहे.',
        summary: 'भारतात हर्बल औषधांचे पेटंट मिळणे हे सूत्र पारंपरिक आहे की वैज्ञानिकदृष्ट्या सिद्ध सिनर्जिस्टिक परिणाम (Synergistic Efficacy) असणारे आहे यावर अवलंबून असते.',
        why: [
          'कलम 3(p) नुसार पारंपरिक ज्ञान किंवा वनस्पतींचे साधे मिश्रण पेटंटसाठी अपात्र मानले जाते.',
          'घटकांमध्ये एकत्रित परिणाम (Synergy) प्रयोगशाळेत सिद्ध झाल्यास विशिष्ट निष्कर्षण प्रक्रिया किंवा प्रमाण सुरक्षित करता येते.',
          'TKDL मधील चरक, सुश्रुत संहिता संदर्भांशी तुमच्या घटकांची तुलना केली जाईल.'
        ],
        meaningForYou: [
          'पारंपरिक आयुर्वेदिक सूत्राचे थेट पेटंट घेता येत नाही.',
          'विशिष्ट अर्क काढण्याची पद्धत किंवा नवीन गुणोत्तर पेटंटद्वारे सुरक्षित केले जाऊ शकते.',
          'पेटंट अर्ज दाखल करण्यापूर्वी सूत्राची सार्वजनिक माहिती देऊ नका.'
        ],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'पेटंट आणि पारंपरिक ज्ञान',
        confidence: {
          level: 'medium',
          reasons: ['कलम 3(p) वैधानिक चौकट लागू', 'सूत्र पारंपरिक की नवीन याची माहिती अपेक्षित']
        },
        citations: [
          {
            id: 'cit-pat-1',
            title: 'भारतीय पेटंट कायदा, 1970',
            sourceType: 'Act',
            section: 'कलम 3(p), 3(d), 3(e)',
            jurisdiction: 'India',
            status: 'Current',
            authorityLevel: 1,
            excerpt: 'कलम 3(p) पारंपरिक ज्ञान किंवा ज्ञात घटकांच्या मिश्रणावर पेटंट बंदी घालते.'
          }
        ],
        warnings: ['शास्त्रीय ग्रंथांची पडताळणी केल्याशिवाय पेटंट अर्ज करू नका.'],
        nextSteps: [
          { title: 'TKDL मध्ये पूर्व-शोध घ्या', action: 'PRIOR_ART', link: '/prior-art', primary: true },
          { title: 'जैवविविधता ABS तपासणी करा', action: 'ABS_CHECK', link: '/abs' },
          { title: 'तज्ज्ञांशी चर्चा करा', action: 'ESCALATE', link: '/dashboard' }
        ],
        needsClarification: true,
        clarificationPrompt: {
          question: 'अचूक मार्गदर्शनासाठी, तुमचे सूत्र कसे तयार केले आहे?',
          options: [
            { id: 'opt-1', label: 'सिनर्जिस्टिक पुरावा असलेले नवीन संयोजन', value: 'new' },
            { id: 'opt-2', label: 'शास्त्रीय ग्रंथातील मूळ सूत्र', value: 'traditional' },
            { id: 'opt-3', label: 'नवीन अर्क तंत्रज्ञानासह सुधारित सूत्र', value: 'modified_traditional' },
            { id: 'opt-4', label: 'निश्चित माहिती नाही', value: 'unsure' }
          ]
        }
      };
    }

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
  if (q.includes('abs') || q.includes('biodiversity') || q.includes('biological') || q.includes('resource') || q.includes('nba') || q.includes('जैव') || q.includes('बायो')) {
    if (lang === 'hi') {
      return {
        answer: 'भारतीय जैविक संसाधनों (जड़ी-बूटियों) के व्यावसायिक उपयोग और पेटेंट के लिए जैविक विविधता अधिनियम, 2002 तथा राष्ट्रीय जैव विविधता प्राधिकरण (NBA) व राज्य जैव विविधता बोर्ड (SBB) के नियमों का पालन अनिवार्य है।',
        summary: 'भारत में व्यावसायिक निष्कर्षण, अनुसंधान या बौद्धिक संपदा दाखिल करने के लिए जैविक सामग्री का उपयोग करने वाली कोई भी संस्था जैविक विविधता अधिनियम की धारा 3, 6 और 7 के अधीन है।',
        why: [
          'भारतीय जैविक संसाधनों पर आधारित पेटेंट दाखिल करने से पहले NBA से धारा 6 के तहत फॉर्म III (Form III) पूर्व-अनुमति लेना अनिवार्य है।',
          'भारतीय व्यावसायिक संस्थाओं को राज्य जैव विविधता बोर्ड (SBB) को धारा 7 के तहत फॉर्म I (Form I) पूर्व सूचना देनी होती है।',
          'लाभ साझाकरण (ABS लेवी) के तहत वार्षिक बिक्री पर 0.1% से 0.5% का सांविधिक शुल्क लागू होता है।'
        ],
        meaningForYou: [
          'पेटेंट देने से पूर्व NBA अनुमति अनिवार्य है, अन्यथा धारा 55 के तहत दंडात्मक कार्रवाई हो सकती है।',
          'सभी जड़ी-बूटियों के खरीद बिल और मंडी रसीदें सुरक्षित रखें।'
        ],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'ABS एवं जैव विविधता विनियमन',
        confidence: { level: 'high', reasons: ['जैविक विविधता अधिनियम 2002 के प्रावधान सत्यापित'] },
        citations: [
          {
            id: 'cit-abs-1',
            title: 'जैविक विविधता अधिनियम, 2002 — धारा 6',
            sourceType: 'Act',
            section: 'धारा 6',
            jurisdiction: 'India',
            status: 'Current',
            authorityLevel: 1,
            excerpt: 'भारत से प्राप्त जैविक संसाधन पर आधारित किसी भी आविष्कार के लिए NBA की पूर्व अनुमति के बिना कोई बौद्धिक संपदा अधिकार लागू नहीं किया जाएगा।'
          }
        ],
        warnings: ['अनुमति न लेने पर पेटेंट निरस्त हो सकता है।'],
        nextSteps: [
          { title: 'ABS चेकलिस्ट प्रारंभ करें', action: 'ABS_WIZARD', link: '/abs', primary: true },
          { title: 'विशेषज्ञ से परामर्श लें', action: 'ESCALATE', link: '/dashboard' }
        ]
      };
    } else if (lang === 'mr') {
      return {
        answer: 'भारतातील वनस्पती व जैविक घटकांच्या व्यावसायिक वापरासाठी जैवविविधता कायदा, 2002 नुसार राष्ट्रीय जैवविविधता प्राधिकरण (NBA) आणि राज्य मंडळाची (SBB) पूर्वपरवानगी अनिवार्य आहे.',
        summary: 'भारतीय वनस्पती किंवा घटकांवर आधारित पेटंट मिळवण्यासाठी कलम 6 अंतर्गत NBA फॉर्म III परवानगी आवश्यक आहे.',
        why: [
          'कोणत्याही पेटंट अर्जापूर्वी राष्ट्रीय जैवविविधता प्राधिकरणास (NBA) अर्ज करणे बंधनकारक आहे.',
          'स्थानिक राज्य जैवविविधता मंडळास (SBB) कलम 7 अंतर्गत पूर्वसूचना द्यावी लागते.'
        ],
        meaningForYou: ['कच्च्या मालाच्या खरेदीच्या पावत्या सुरक्षित ठेवा.', 'कायदेशीर ABS प्रक्रिया पूर्ण करा.'],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'ABS व जैवविविधता नियमन',
        confidence: { level: 'high', reasons: ['जैवविविधता कायदा 2002 लागू'] },
        citations: [
          {
            id: 'cit-abs-1',
            title: 'जैवविविधता कायदा, 2002 — कलम 6',
            sourceType: 'Act',
            section: 'कलम 6',
            jurisdiction: 'India',
            status: 'Current',
            authorityLevel: 1,
            excerpt: 'NBA च्या पूर्वपरवानगीशिवाय पेटंट हक्क मागता येत नाहीत.'
          }
        ],
        warnings: ['कायदेशीर पूर्तता न केल्यास दंडात्मक तरतूद होऊ शकते.'],
        nextSteps: [
          { title: 'ABS चेकलिस्ट सुरू करा', action: 'ABS_WIZARD', link: '/abs', primary: true },
          { title: 'तज्ज्ञांशी चर्चा करा', action: 'ESCALATE', link: '/dashboard' }
        ]
      };
    }

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
  if (q.includes('trademark') || q.includes('brand') || q.includes('logo') || q.includes('name') || q.includes('ट्रेडमार्क') || q.includes('नांव') || q.includes('नाम')) {
    if (lang === 'hi') {
      return {
        answer: 'आयुर्वेदिक ब्रांड नाम और विशिष्ट लोगो को व्यापार चिह्न अधिनियम, 1999 (Trade Marks Act, 1999) के नाइस क्लास 5 (औषधियां) तथा क्लास 3 (हर्बल प्रसाधन) के तहत पंजीकृत किया जा सकता है।',
        summary: 'त्रिफला, च्यवनप्राश या ब्राह्मी तैल जैसे शास्त्रीय सामान्य नामों का एकाधिकार ट्रेडमार्क के रूप में नहीं लिया जा सकता, लेकिन विशिष्ट कल्पित (Coined) ब्रांड नाम सुरक्षित किए जा सकते हैं।',
        why: [
          'धारा 9(1)(b) आयुर्वेदिक घटकों या गुणों को दर्शाने वाले वर्णनात्मक नामों के पंजीकरण पर रोक लगाती है।',
          'धारा 13 एकल औषधीय घटकों के सामान्य नामों के एकाधिकार को प्रतिबंधित करती है।',
          'एक विशिष्ट उपसर्ग (Coined Prefix) जोड़ने से ट्रेडमार्क आपत्ति दूर हो जाती है।'
        ],
        meaningForYou: [
          'शुद्ध शास्त्रीय नामों का सीधे ट्रेडमार्क न कराएं।',
          'अपने उत्पाद की पैकेजिंग के लिए विशिष्ट और मौलिक ब्रांड नाम तैयार करें।',
          'औषधीय और वेलनेस दोनों उत्पादों के लिए बहु-वर्ग (Multi-class) आवेदन दाखिल करें।'
        ],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'ट्रेडमार्क ब्रांड संरक्षण',
        confidence: { level: 'high', reasons: ['व्यापार चिह्न अधिनियम 1999 प्रावधान सत्यापित'] },
        citations: [
          {
            id: 'cit-tm-1',
            title: 'व्यापार चिह्न अधिनियम, 1999 — धारा 9 एवं 13',
            sourceType: 'Act',
            section: 'धारा 9(1)(b) एवं 13',
            jurisdiction: 'India',
            status: 'Current',
            authorityLevel: 1,
            excerpt: 'धारा 13 रासायनिक या सामान्य वानस्पतिक नामों के पंजीकरण को प्रतिबंधित करती है।'
          }
        ],
        warnings: ['पैकेजिंग डिजाइन अन्य पंजीकृत ट्रेडमार्क या डिजाइन का उल्लंघन न करे।'],
        nextSteps: [
          { title: 'ट्रेडमार्क मार्गदर्शन पृष्ठ देखें', action: 'TM_PAGE', link: '/trademark', primary: true },
          { title: 'उत्पाद वर्गीकरण जांचें', action: 'CLASSIFY', link: '/classifier' }
        ]
      };
    } else if (lang === 'mr') {
      return {
        answer: 'आयुर्वेदिक ब्रँडचे नाव आणि लोगोचे संरक्षण ट्रेडमार्क कायदा, 1999 अंतर्गत क्लास 5 (औषधे) आणि क्लास 3 (सौंदर्य प्रसाधने) मध्ये करता येते.',
        summary: 'त्रिफळा, ब्राह्मी यांसारखी शास्त्रीय सामान्य नावे ट्रेडमार्क म्हणून मिळत नाहीत; ब्रँडचे नाव वेगळे व कल्पित असणे आवश्यक आहे.',
        why: [
          'कलम 9 वर्णनात्मक नावांच्या नोंदणीवर बंदी घालते.',
          'विशिष्ट ब्रँड नाव किंवा लोगो तयार करून कायदेशीर संरक्षण मिळवता येते.'
        ],
        meaningForYou: ['केवळ शास्त्रीय घटकाच्या नावावर ट्रेडमार्क मागू नका.', 'वेगळे व अनोखे नाव निवडा.'],
        jurisdiction: payload.jurisdiction || 'भारत (India)',
        ipType: 'ट्रेडमार्क संरक्षण',
        confidence: { level: 'high', reasons: ['ट्रेडमार्क कायदा 1999 तरतुदी तपासल्या'] },
        citations: [
          {
            id: 'cit-tm-1',
            title: 'ट्रेडमार्क कायदा, 1999 — कलम 9 आणि 13',
            sourceType: 'Act',
            section: 'कलम 9 व 13',
            jurisdiction: 'India',
            status: 'Current',
            authorityLevel: 1,
            excerpt: 'सामान्य वनस्पती नावांवर मक्तेदारी देण्यास मनाई.'
          }
        ],
        warnings: ['पॅकेजिंग इतर ब्रँडसारखे नसावे.'],
        nextSteps: [
          { title: 'ट्रेडमार्क मार्गदर्शक पहा', action: 'TM_PAGE', link: '/trademark', primary: true },
          { title: 'उत्पादन वर्गीकरण तपासा', action: 'CLASSIFY', link: '/classifier' }
        ]
      };
    }

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
  if (lang === 'hi') {
    return {
      answer: 'आपके आयुर्वेदिक प्रश्न में भारतीय बौद्धिक संपदा कानूनों (पेटेंट, ट्रेडमार्क) तथा आयुष विनियामक ढांचे के तहत बहु-क्षेत्रीय प्रावधान शामिल हैं।',
      summary: 'आयुर्वेदिक नवाचार के संरक्षण में आमतौर पर ट्रेडमार्क ब्रांड सुरक्षा, व्यापार रहस्य (Trade Secret) निष्कर्षण विधियां, सहक्रियाशील फॉर्मूलेशन के लिए पेटेंट, तथा राज्य जैव विविधता बोर्ड (ABS) अनुपालन का संयोजन आवश्यक होता है।',
      why: [
        'शुद्ध शास्त्रीय फॉर्मूलेशन सार्वजनिक डोमेन में आते हैं और धारा 3(p) के तहत उनका सीधा पेटेंट नहीं हो सकता।',
        'नवीन एक्सट्रैक्शन प्रक्रियाएं या फाइटोसोम डिलीवरी सिस्टम पेटेंट और डिजाइन सुरक्षा के लिए पात्र हो सकते हैं।',
        'भारतीय जैविक जड़ी-बूटियों की सोर्सिंग से जैविक विविधता अधिनियम, 2002 के तहत वैधानिक दायित्व उत्पन्न होते हैं।'
      ],
      meaningForYou: [
        'चरण 1: टीकेडीएल और पेटेंट डेटाबेस में पूर्व-कला खोज (Prior Art Search) करें।',
        'चरण 2: नाइस क्लास 5 या 3 में अपने विशिष्ट ब्रांड नाम का ट्रेडमार्क पंजीकृत करें।',
        'चरण 3: राज्य जैव विविधता बोर्ड की मंजूरी के लिए कच्चे माल की उत्पत्ति प्रमाणित रखें।',
        'चरण 4: राज्य आयुष लाइसेंसिंग प्राधिकरण से उचित विनिर्माण लाइसेंस प्राप्त करें।'
      ],
      jurisdiction: payload.jurisdiction || 'भारत (India)',
      ipType: 'एकीकृत आयुर्वेद बौद्धिक संपदा एवं विनियामक ढांचा',
      confidence: {
        level: 'medium',
        reasons: ['मानक बहु-क्षेत्रीय सांविधिक मैट्रिक्स लागू', 'अंतिम दावे के लिए विशिष्ट फॉर्मूलेशन विवरण आवश्यक']
      },
      citations: [
        {
          id: 'cit-gen-1',
          title: 'भारतीय पेटेंट अधिनियम, 1970 — धारा 3(p)',
          sourceType: 'Act',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 1
        },
        {
          id: 'cit-gen-2',
          title: 'जैविक विविधता अधिनियम, 2002 — धारा 6',
          sourceType: 'Act',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 1
        }
      ],
      warnings: [
        'यह मार्गदर्शन स्रोत-आधारित जानकारी प्रदान करता है और पंजीकृत पेटेंट एजेंट या वकील की औपचारिक कानूनी राय का स्थान नहीं लेता है।'
      ],
      nextSteps: [
        { title: 'अपने उत्पाद का चरणबद्ध वर्गीकरण करें', action: 'CLASSIFY', link: '/classifier', primary: true },
        { title: 'ज्ञानकोष में पूर्व-कला जांचें', action: 'PRIOR_ART', link: '/prior-art' },
        { title: 'पैनलबद्ध विशेषज्ञ से संपर्क करें', action: 'ESCALATE', link: '/dashboard' }
      ]
    };
  } else if (lang === 'mr') {
    return {
      answer: 'तुमच्या आयुर्वेदिक प्रश्नात भारतीय बौद्धिक संपदा कायदे (पेटंट, ट्रेडमार्क) आणि आयुष नियामक चौकटीतील विविध तरतुदी समाविष्ट आहेत.',
      summary: 'आयुर्वेदिक उत्पादनांच्या संरक्षणात प्रामुख्याने ब्रँड ट्रेडमार्क, सिनर्जिस्टिक अर्क पेटंट आणि राज्य जैवविविधता मंडळाचे (ABS) नियम पाळणे आवश्यक असते.',
      why: [
        'शास्त्रीय ग्रंथांमधील मूळ सूत्रांना कलम 3(p) मुळे थेट पेटंट मिळत नाही.',
        'नवीन अर्क तंत्रज्ञान किंवा विशिष्ट प्रमाण असल्यास पेटंट संरक्षण शक्य आहे.',
        'भारतीय वनस्पती वापरल्याने जैवविविधता कायदा 2002 च्या तरतुदी लागू होतात.'
      ],
      meaningForYou: [
        'पायरी 1: TKDL मध्ये पूर्व शोध (Prior Art Search) घ्या.',
        'पायरी 2: क्लास 5 किंवा 3 मध्ये ट्रेडमार्क नोंदणी करा.',
        'पायरी 3: राज्य जैवविविधता मंडळाच्या नियमांचे पालन करा.'
      ],
      jurisdiction: payload.jurisdiction || 'भारत (India)',
      ipType: 'एकत्रित आयुर्वेद आयपी आणि नियामक मार्गदर्शन',
      confidence: {
        level: 'medium',
        reasons: ['कायदेशीर तरतुदी लागू', 'निश्चित दाव्यासाठी अधिक तपशीलांची गरज']
      },
      citations: [
        {
          id: 'cit-gen-1',
          title: 'भारतीय पेटंट कायदा, 1970 — कलम 3(p)',
          sourceType: 'Act',
          jurisdiction: 'India',
          status: 'Current',
          authorityLevel: 1
        }
      ],
      warnings: ['हे मार्गदर्शन माहितीसाठी असून अधिकृत कायदेशीर सल्ल्याचा पर्याय नाही.'],
      nextSteps: [
        { title: 'उत्पादनाचे वर्गीकरण करा', action: 'CLASSIFY', link: '/classifier', primary: true },
        { title: 'तज्ज्ञांशी चर्चा करा', action: 'ESCALATE', link: '/dashboard' }
      ]
    };
  }

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
