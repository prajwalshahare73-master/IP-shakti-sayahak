import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Shield, Sparkles, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

export const TKPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="gov-tk-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: 'Traditional Knowledge (TK)', link: '/tk' }]} />

      <div className="gov-container tk-container">
        <div className="tk-header-banner">
          <div className="tk-badge">
            <BookOpen size={16} className="text-accent" />
            <span>Defensive Protection & Public Domain Preservation</span>
          </div>
          <h1 className="tk-main-title">Traditional Knowledge & TKDL Guidance</h1>
          <p className="tk-main-subtitle">
            Understand how centuries of classical Ayurvedic knowledge are protected against biopiracy and how Section 3(p) of the Patents Act 1970 applies to herbal formulations.
          </p>
        </div>

        <div className="tk-content-grid">
          <div className="gov-card tk-card-main">
            <h2>What is Traditional Knowledge in Ayurveda?</h2>
            <p>
              Traditional Knowledge (TK) in Ayurveda refers to the vast body of medical wisdom, formulations, pharmacological properties (Rasa, Guna, Virya, Vipaka, Prabhava), and manufacturing methods described in authoritative classical treatises including:
            </p>
            <ul className="tk-treatise-list">
              <li>• <strong>Brihat Trayi:</strong> Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya</li>
              <li>• <strong>Laghu Trayi:</strong> Madhava Nidana, Sharngadhara Samhita, Bhavaprakasha</li>
              <li>• <strong>Classical Pharmacopoeias:</strong> Ayurvedic Formulary of India (AFI), Ayurvedic Pharmacopoeia of India (API)</li>
            </ul>

            <div className="statutory-box mt-6">
              <h3>Section 3(p) of the Patents Act, 1970</h3>
              <p>
                Under Section 3(p), any invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is <strong>statutorily non-patentable</strong> in India.
              </p>
            </div>
          </div>

          <div className="gov-card tk-sidebar-card">
            <h3>When CAN an Ayurvedic innovation be patented?</h3>
            <p>
              While classical formulas belong to the public domain, patent protection may be sought if the applicant proves:
            </p>
            <ul className="patentable-checks">
              <li>
                <CheckCircle2 size={16} className="text-success" />
                <span><strong>Synergistic Therapeutic Efficacy (Section 3e):</strong> Clear bio-assay comparative data demonstrating the combined extract outperforms individual components.</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="text-success" />
                <span><strong>Novel Extraction Technology:</strong> Standardized multi-solvent fractionations yielding unexpected bioavailability.</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="text-success" />
                <span><strong>Novel Delivery System:</strong> Targeted herbal nanoparticles, transdermal micro-carriers, or sustained-release formulations.</span>
              </li>
            </ul>

            <div className="tk-cta-box mt-6">
              <Link to="/ask" className="btn btn-primary w-full">
                <span>Check Your Formulation Patentability</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
