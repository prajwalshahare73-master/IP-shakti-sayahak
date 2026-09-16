import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileSearch,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Layers,
  Scale,
  Award,
  BookOpen
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { useAppStore } from '../../store/appStore';

export const ClassificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCaseProfile, setQuery } = useAppStore();

  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState('Ayurvedic Medicine / Classical Aushadhi');
  const [purpose, setPurpose] = useState('Therapeutic Treatment');
  const [ingredients, setIngredients] = useState<string[]>(['Plant / Botanical']);
  const [targetJurisdiction, setTargetJurisdiction] = useState('India');
  const [noveltyLevel, setNoveltyLevel] = useState('Modified traditional formula');

  const handleIngredientToggle = (item: string) => {
    if (ingredients.includes(item)) {
      setIngredients(ingredients.filter((i) => i !== item));
    } else {
      setIngredients([...ingredients, item]);
    }
  };

  const handleFinish = () => {
    setCaseProfile({
      productType,
      purpose,
      ingredients,
      jurisdiction: targetJurisdiction,
      isTraditional:
        noveltyLevel.includes('Novel') ? 'new' : noveltyLevel.includes('Classical') ? 'traditional' : 'modified_traditional'
    });

    const generatedQuery = `I am developing a ${productType} for ${purpose} containing ${ingredients.join(', ')}. What are the applicable IP, Section 3(p) patentability, and ABS requirements in ${targetJurisdiction}?`;
    setQuery(generatedQuery);
    navigate('/ask');
  };

  return (
    <div className="gov-classification-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: 'Product Classification', link: '/classifier' }]} />

      <div className="gov-container wizard-container">
        <div className="wizard-header">
          <div className="wizard-badge">
            <FileSearch size={16} className="text-secondary" />
            <span>Task-First Guided Assessment</span>
          </div>
          <h1 className="wizard-main-title">Ayurveda Product & IP Pathway Classifier</h1>
          <p className="wizard-main-subtitle">
            Answer 4 simple questions about your product. We will map your exact Intellectual Property, Traditional Knowledge safeguards, and regulatory compliance paths.
          </p>

          {/* Stepper Progress Bar */}
          <div className="wizard-stepper">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`stepper-step ${step === s ? 'active' : step > s ? 'completed' : ''}`}
                onClick={() => (s < step ? setStep(s) : null)}
              >
                <div className="stepper-circle">{step > s ? <CheckCircle2 size={16} /> : s}</div>
                <span className="stepper-label">
                  {s === 1
                    ? '1. Product'
                    : s === 2
                    ? '2. Purpose'
                    : s === 3
                    ? '3. Ingredients'
                    : s === 4
                    ? '4. Jurisdiction'
                    : '5. Guidance Path'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Card Body */}
        <div className="gov-card wizard-body-card">
          {/* STEP 1: Product Type */}
          {step === 1 && (
            <div className="wizard-step-content">
              <h2 className="step-question-title">Step 1: What type of Ayurveda product are you developing?</h2>
              <p className="step-question-desc">Select the category that best describes your formulation:</p>

              <div className="options-grid">
                {[
                  { title: 'Ayurvedic Medicine / Classical Aushadhi', desc: 'Therapeutic medicine made as per classical Ayurvedic Formulary of India (AFI).' },
                  { title: 'Proprietary Ayurvedic Medicine', desc: 'Modified herbal formula manufactured under an Ayurvedic drug license.' },
                  { title: 'Herbal Cosmetic / Cosmeceutical', desc: 'Skin, hair, or oral care formulation with botanical extracts.' },
                  { title: 'Ayurveda Aahara / Dietary Supplement', desc: 'Health food or nutraceutical complying with FSSAI Ayurveda Aahara standards.' },
                  { title: 'Single Herb Phyto-Extract / Botanical Active', desc: 'Standardized phytopharmaceutical chemical extract.' },
                  { title: 'Novel Delivery System / Device', desc: 'Herbal transdermal patch, inhaler, nano-emulsion, or specialized dispenser.' }
                ].map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => setProductType(opt.title)}
                    className={`wizard-option-card ${productType === opt.title ? 'selected' : ''}`}
                  >
                    <strong className="opt-title">{opt.title}</strong>
                    <p className="opt-desc">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Primary Purpose */}
          {step === 2 && (
            <div className="wizard-step-content">
              <h2 className="step-question-title">Step 2: What is the primary intended purpose or claim?</h2>
              <p className="step-question-desc">How will the product be marketed and positioned to consumers or doctors?</p>

              <div className="options-grid">
                {[
                  { title: 'Therapeutic Treatment / Cure', desc: 'Intended to cure, mitigate, or treat a diagnosed health condition.' },
                  { title: 'Preventive Healthcare / Immunity (Rasayana)', desc: 'Promoting vitality, longevity, or immune enhancement.' },
                  { title: 'General Wellness & Daily Nutrition', desc: 'Dietary supplementation with digestive/vital benefits.' },
                  { title: 'Cosmetic Beautification & Personal Care', desc: 'Topical beauty, cleansing, conditioning, and aesthetic care.' },
                  { title: 'Pain Relief & Topical Soothing', desc: 'Local application for joint pain, muscle aches, or skin soothing.' }
                ].map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => setPurpose(opt.title)}
                    className={`wizard-option-card ${purpose === opt.title ? 'selected' : ''}`}
                  >
                    <strong className="opt-title">{opt.title}</strong>
                    <p className="opt-desc">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Ingredients & Biological Resources */}
          {step === 3 && (
            <div className="wizard-step-content">
              <h2 className="step-question-title">Step 3: What biological resources and knowledge base are used?</h2>
              <p className="step-question-desc">Select all applicable ingredient sources (determines ABS & TKDL triggers):</p>

              <div className="options-grid">
                {[
                  { title: 'Plant / Botanical (Herbs, Roots, Barks, Leaves)', desc: 'Wild-harvested or cultivated Indian medicinal plants.' },
                  { title: 'Mineral / Metal (Rasa Shastra Bhasmas)', desc: 'Purified mineral or metallic classical formulations (Shodhana/Marana).' },
                  { title: 'Animal-Derived Substance (Honey, Ghee, Milk)', desc: 'Organic animal derivatives utilized in classical compounding.' },
                  { title: 'Microbial / Fermented Extract (Asava / Arishta)', desc: 'Naturally fermented classical biomedical preparations.' },
                  { title: 'Endangered or Red-Listed Botanical (e.g. Kutki, Jatamansi)', desc: 'CITES/wild-sourced herbs with strict biodiversity compliance rules.' }
                ].map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => handleIngredientToggle(opt.title)}
                    className={`wizard-option-card ${ingredients.includes(opt.title) ? 'selected' : ''}`}
                  >
                    <strong className="opt-title">{opt.title}</strong>
                    <p className="opt-desc">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <label className="gov-input-label">Is the composition classical, modified, or entirely novel?</label>
                <div className="options-grid grid-3">
                  {[
                    'Classical formula verbatim (e.g. AFI/API)',
                    'Modified traditional formula',
                    'Novel composition with bio-assay efficacy'
                  ].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNoveltyLevel(lvl)}
                      className={`wizard-option-card ${noveltyLevel === lvl ? 'selected' : ''}`}
                    >
                      <strong className="opt-title">{lvl}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Target Jurisdiction */}
          {step === 4 && (
            <div className="wizard-step-content">
              <h2 className="step-question-title">Step 4: Where will you manufacture and market this product?</h2>
              <p className="step-question-desc">Legal protection and compliance requirements vary across jurisdictions:</p>

              <div className="options-grid">
                {[
                  { title: 'India Only', desc: 'Governed under Patents Act 1970, Drugs & Cosmetics Act 1940, and Biodiversity Act 2002.' },
                  { title: 'International Export (US / EU / ASEAN)', desc: 'Requires PCT patent applications, FDA / EFSA botanical compliance, and NBA export clearance.' },
                  { title: 'Both Domestic & Global Markets', desc: 'Dual pathway ensuring domestic SBB clearance + international trademark & patent filing.' }
                ].map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={() => setTargetJurisdiction(opt.title)}
                    className={`wizard-option-card ${targetJurisdiction === opt.title ? 'selected' : ''}`}
                  >
                    <strong className="opt-title">{opt.title}</strong>
                    <p className="opt-desc">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Result Guidance Path */}
          {step === 5 && (
            <div className="wizard-step-content">
              <div className="result-header-badge">
                <CheckCircle2 size={24} className="text-success" />
                <h2>Recommended Legal & Regulatory Guidance Path</h2>
              </div>

              <div className="result-summary-grid">
                <div className="gov-card result-path-card">
                  <div className="path-icon-row">
                    <Shield size={22} className="text-primary" />
                    <h3>1. Patent & Section 3(p) Strategy</h3>
                  </div>
                  <p>
                    {noveltyLevel.includes('Classical')
                      ? 'Pure classical compositions are non-patentable under Section 3(p). Focus on Trademark & Trade Secret protection.'
                      : 'Novel synergistic ratios or extraction techniques require proof under Section 3(e) to overcome Section 3(p) TKDL objections.'}
                  </p>
                </div>

                <div className="gov-card result-path-card">
                  <div className="path-icon-row">
                    <Layers size={22} className="text-secondary" />
                    <h3>2. Access & Benefit Sharing (ABS)</h3>
                  </div>
                  <p>
                    Commercial extraction of Indian herbs mandates prior intimation in Form I to the State Biodiversity Board under Section 7 of the Biological Diversity Act.
                  </p>
                </div>

                <div className="gov-card result-path-card">
                  <div className="path-icon-row">
                    <Award size={22} className="text-secondary" />
                    <h3>3. Trademark Protection</h3>
                  </div>
                  <p>
                    Register your brand mark under Nice Class 5 (Ayurvedic medicinal products) or Class 3 (herbal cosmetics). Avoid generic Sanskrit ingredient names.
                  </p>
                </div>

                <div className="gov-card result-path-card">
                  <div className="path-icon-row">
                    <Scale size={22} className="text-primary" />
                    <h3>4. Manufacturing License</h3>
                  </div>
                  <p>
                    Apply for an Ayurvedic Drug Manufacturing License (Form 25D) from your State AYUSH Licensing Authority.
                  </p>
                </div>
              </div>

              <div className="result-cta-box">
                <p>
                  We have mapped your product profile. Proceed to receive source-backed, clause-by-clause guidance.
                </p>
                <button onClick={handleFinish} className="btn btn-primary btn-lg">
                  <span>View Complete Evidence-Backed Guidance</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          {step < 5 && (
            <div className="wizard-controls-row">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-outline"
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn btn-primary"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
