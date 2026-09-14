import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, ShieldCheck, CheckCircle2, ArrowRight, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

export const ABSPage: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [entityType, setEntityType] = useState('Indian Citizen / Indian Entity');
  const [resourceSource, setResourceSource] = useState('Wild-harvested in India');
  const [commercialActivity, setCommercialActivity] = useState('Commercial Ayurvedic drug manufacturing');

  return (
    <div className="gov-abs-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: 'ABS / Biodiversity', link: '/abs' }]} />

      <div className="gov-container abs-container">
        <div className="abs-header-banner">
          <div className="abs-badge">
            <Layers size={16} className="text-secondary" />
            <span>National Biodiversity Authority (NBA) Statutory Compliance</span>
          </div>
          <h1 className="abs-main-title">Access & Benefit Sharing (ABS) Guided Checklist</h1>
          <p className="abs-main-subtitle">
            Determine whether your commercial use of Indian medicinal plants and biological resources requires State Biodiversity Board (SBB) Form I intimation or NBA Form III IP permission.
          </p>
        </div>

        {/* 6-Step Guided Checklist Wizard */}
        <div className="gov-card abs-wizard-card">
          <div className="abs-step-nav">
            <button
              onClick={() => setCurrentStep(1)}
              className={`abs-step-btn ${currentStep === 1 ? 'active' : currentStep > 1 ? 'done' : ''}`}
            >
              1. Entity Origin
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`abs-step-btn ${currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : ''}`}
            >
              2. Resource Source
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`abs-step-btn ${currentStep === 3 ? 'active' : currentStep > 3 ? 'done' : ''}`}
            >
              3. Commercial Intent
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className={`abs-step-btn ${currentStep === 4 ? 'active' : ''}`}
            >
              4. ABS Compliance Output
            </button>
          </div>

          <div className="abs-step-body">
            {currentStep === 1 && (
              <div>
                <h3 className="step-q">1. What is the legal status of the applicant / manufacturing entity?</h3>
                <div className="options-grid">
                  {[
                    { title: 'Indian Citizen / Indian Entity', desc: '100% Indian shareholding and management without foreign equity.' },
                    { title: 'Non-Resident Indian (NRI) / Foreign National', desc: 'Governed directly under Section 3 of Biological Diversity Act 2002.' },
                    { title: 'Indian Company with Foreign Equity / Shareholding', desc: 'Treated under Section 3(2) requiring National Biodiversity Authority (NBA) prior approval.' }
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setEntityType(item.title);
                        setCurrentStep(2);
                      }}
                      className={`wizard-option-card ${entityType === item.title ? 'selected' : ''}`}
                    >
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="step-q">2. Where and how are the medicinal herbs or biological raw materials sourced?</h3>
                <div className="options-grid">
                  {[
                    { title: 'Wild-harvested in India (Forests / Mandis)', desc: 'Direct harvesting from natural habitats across Indian states.' },
                    { title: 'Cultivated by Registered Farmers (Krishi/Agri-farms)', desc: 'Cultivated biological resources with authenticated agricultural invoices.' },
                    { title: 'Imported from outside India', desc: 'Botanicals imported through customs clearance (exempt from Indian ABS rules).' }
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setResourceSource(item.title);
                        setCurrentStep(3);
                      }}
                      className={`wizard-option-card ${resourceSource === item.title ? 'selected' : ''}`}
                    >
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="step-q">3. What is the intended operational activity?</h3>
                <div className="options-grid">
                  {[
                    { title: 'Commercial Ayurvedic drug manufacturing', desc: 'Extracting, compounding, and packaging for commercial sale.' },
                    { title: 'Filing a Patent / IP Application', desc: 'Applying for Indian or International patent rights on the formulation.' },
                    { title: 'Transfer of Research Results to Foreign Entity', desc: 'Sharing biological assay data or cell-line data abroad (Section 4).' }
                  ].map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setCommercialActivity(item.title);
                        setCurrentStep(4);
                      }}
                      className={`wizard-option-card ${commercialActivity === item.title ? 'selected' : ''}`}
                    >
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="abs-result-box">
                <div className="result-alert success">
                  <CheckCircle2 size={24} className="text-success" />
                  <div>
                    <h3>Statutory ABS Assessment & Filing Pathway</h3>
                    <p>Based on your selected profile, here is your compliance roadmap:</p>
                  </div>
                </div>

                <div className="abs-requirements-list">
                  <div className="req-card">
                    <h4>1. Prior Intimation in Form I to State Biodiversity Board (SBB)</h4>
                    <p>
                      Under Section 7 of the Biological Diversity Act 2002, Indian citizens and companies utilizing Indian biological resources for commercial manufacturing must give prior intimation to the concerned State Biodiversity Board.
                    </p>
                  </div>

                  <div className="req-card">
                    <h4>2. Mandatory NBA Form III before Patent Filing (Section 6)</h4>
                    <p>
                      If you intend to file a patent application, you MUST obtain prior approval from the National Biodiversity Authority (NBA) in Form III before the patent can be granted.
                    </p>
                  </div>

                  <div className="req-card">
                    <h4>3. Statutory Benefit Sharing Fee</h4>
                    <p>
                      Benefit sharing obligation is calculated at <strong>0.1% to 0.5% of ex-factory gross sales</strong> under the 2014 ABS Regulations.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Link to="/ask" className="btn btn-primary">
                    <span>Ask Detailed Formulation Question</span>
                    <ArrowRight size={16} />
                  </Link>
                  <button onClick={() => setCurrentStep(1)} className="btn btn-outline">
                    Restart Assessment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
