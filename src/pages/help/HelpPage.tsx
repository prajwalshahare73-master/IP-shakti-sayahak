import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ChevronDown, ChevronUp, Shield, Sparkles, UserCheck, BookOpen } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

export const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: t('help.q1', 'What is IP-SAKTI Sahayak and how does it help Ayurveda innovators?'),
      a: t('help.a1', 'IP-SAKTI Sahayak is a public-service portal designed to help Vaidyas, Ayurveda researchers, startups, and manufacturers navigate Intellectual Property (Patents, Trademarks, GI), Traditional Knowledge (TKDL), and Biodiversity (ABS) regulations in India without needing prior legal terminology expertise.')
    },
    {
      q: t('help.q2', 'Can classical Ayurvedic formulations (e.g., Chyawanprash, Sitopaladi Churna) be patented in India?'),
      a: t('help.a2', 'No. Under Section 3(p) of the Indian Patents Act 1970, classical formulations and traditional knowledge in the public domain cannot be patented. However, novel standardized extraction methods, novel pharmaceutical delivery carriers (e.g. nano-emulsions), or scientifically proven synergistic compositions with comparative bio-assay data may qualify under Section 3(e).')
    },
    {
      q: t('help.q3', 'Do I need National Biodiversity Authority (NBA) approval before manufacturing or filing patents?'),
      a: t('help.a3', 'Yes. Under the Biological Diversity Act 2002, commercial utilization of Indian biological resources requires prior intimation in Form I to the State Biodiversity Board (SBB). Furthermore, Section 6 mandates that any person applying for an Intellectual Property Right (patent) based on biological resources from India must obtain prior Form III approval from the NBA.')
    },
    {
      q: t('help.q4', 'What do the Confidence levels (High, Moderate, Preliminary) mean?'),
      a: t('help.a4', 'The confidence score indicates statutory grounding alignment between the facts in your query and verified provisions in Indian statutes and TKDL concordances. It is NOT a probabilistic guess or mathematical certainty. When facts are incomplete, the system will explicitly highlight missing information or abstain safely.')
    },
    {
      q: t('help.q5', 'How does Human Expert Review & Case Escalation work?'),
      a: t('help.a5', 'When an inquiry involves multi-domain complexity (e.g. synergistic therapeutic claims + classical TK + red-listed herbs), you can request human review. Your case package is routed to an empanelled IP facilitator or Traditional Knowledge specialist who delivers formal, signed guidance in your user dashboard.')
    },
    {
      q: t('help.q6', 'Is my data and formulation formula kept private and secure?'),
      a: t('help.a6', 'Yes. IP-SAKTI Sahayak strictly enforces Data Minimization principles. Only necessary formulation context is forwarded during expert reviews. Internal examiner notes are protected, and raw user inquiries are never automatically converted into public RAG knowledge without explicit validation.')
    }
  ];

  return (
    <div className="gov-help-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('nav.help', 'Help & FAQ'), link: '/help' }]} />

      <div className="gov-container help-container">
        <div className="help-header-banner">
          <div className="help-badge">
            <HelpCircle size={16} className="text-primary" />
            <span>{t('help.badge', 'Ayurveda IP Knowledge Base & FAQ')}</span>
          </div>
          <h1 className="help-main-title">{t('help.title', 'Frequently Asked Questions & Portal Guide')}</h1>
          <p className="help-main-subtitle">
            {t('help.subtitle', 'Find answers regarding patentability criteria, Section 3(p) exclusions, State Biodiversity Board approvals, and human expert escalation.')}
          </p>
        </div>

        <div className="gov-card faq-list-card">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="faq-question-btn"
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="faq-answer-box">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="gov-card help-contact-cta mt-8">
          <div className="flex items-center gap-3">
            <UserCheck size={28} className="text-secondary" />
            <div>
              <h3>{t('help.needHelp', 'Need Specialized Assistance?')}</h3>
              <p>{t('help.contactSupportDesc', 'Reach out to the technical and legal facilitation team for procedural guidance.')}</p>
            </div>
          </div>
          <Link to="/ask" className="btn btn-primary btn-sm">
            {t('hero.askIpQuestion', 'Ask an IP Question Now')}
          </Link>
        </div>
      </div>
    </div>
  );
};
