import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  Plus,
  Trash2,
  Download,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  BookOpen,
  UserCheck,
  RotateCcw,
  Save,
  HelpCircle,
  FileText,
  Printer,
  X,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { VoiceInputField } from '../../components/shared/VoiceInputField';
import { useAppStore, CaseRecord } from '../../store/appStore';
import { ExpertDirectorySelector, EmpanelledExpert, EMPANELLED_EXPERTS } from '../../components/expert/ExpertDirectorySelector';

interface IngredientRow {
  id: string;
  sanskritName: string;
  botanicalName: string;
  plantPart: string;
  sourceType: 'Wild' | 'Cultivated' | 'Market/Mandi' | 'Imported';
  sourceState: string;
  percentage: string;
}

export const CaseBuilderPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCaseProfile, setQuery, addCase, jurisdiction } = useAppStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);
  const [showExpertSelectorModal, setShowExpertSelectorModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<EmpanelledExpert>(EMPANELLED_EXPERTS[0]);

  // Section 1: Innovation Identity
  const [productName, setProductName] = useState('Swastha Respiratory Herbal Kadha');
  const [productType, setProductType] = useState('Proprietary Ayurvedic Medicine');
  const [targetIndication, setTargetIndication] = useState('Chronic Bronchial Clearance & Mucolytic Synergism');
  const [entityType, setEntityType] = useState<'Indian Startup / MSME' | 'Individual Vaidya' | 'Large Enterprise' | 'Foreign / NRI Entity'>('Indian Startup / MSME');

  // Section 2: Composition Matrix
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    {
      id: 'ing-1',
      sanskritName: 'Vasaka',
      botanicalName: 'Adhatoda vasica',
      plantPart: 'Leaf (Patra)',
      sourceType: 'Cultivated',
      sourceState: 'Uttarakhand',
      percentage: '40%'
    },
    {
      id: 'ing-2',
      sanskritName: 'Kantakari',
      botanicalName: 'Solanum surattense',
      plantPart: 'Whole Plant (Panchanga)',
      sourceType: 'Wild',
      sourceState: 'Himachal Pradesh',
      percentage: '35%'
    },
    {
      id: 'ing-3',
      sanskritName: 'Yashtimadhu',
      botanicalName: 'Glycyrrhiza glabra',
      plantPart: 'Root (Moola)',
      sourceType: 'Market/Mandi',
      sourceState: 'Rajasthan',
      percentage: '25%'
    }
  ]);

  // Section 3: Traditional Knowledge & Prior Art Benchmarking
  const [tkClassification, setTkClassification] = useState<'Classical AFI Formula' | 'Modified Traditional Composition' | 'Novel Phyto-Formulation'>('Modified Traditional Composition');
  const [classicalTextRef, setClassicalTextRef] = useState('Charaka Samhita, Chikitsa Sthana, Chapter 18 (Kasa Chikitsa)');
  const [noveltyDescription, setNoveltyDescription] = useState('Optimized hydro-ethanolic dual extraction ratio yielding standardized 3.5% total vasicine content with 2.8x enhanced bio-absorption compared to classical boiling decoction.');

  // Section 4: Synergistic Assay Evidence (Section 3e)
  const [hasBioAssay, setHasBioAssay] = useState(true);
  const [bioAssayDetails, setBioAssayDetails] = useState('In-vitro bronchodilator assay (guinea pig tracheal chain) demonstrates 142% greater smooth muscle relaxation than individual isolated components combined (CI < 0.85).');

  // Section 5: Target Operational Markets
  const [targetMarket, setTargetMarket] = useState<'India Domestic' | 'International Export (US/EU)' | 'Both India & Global'>('Both India & Global');

  // Case Package state
  const [showReportModal, setShowReportModal] = useState(false);

  // Add / Remove Ingredients
  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: `ing-${Date.now()}`,
        sanskritName: '',
        botanicalName: '',
        plantPart: 'Leaf',
        sourceType: 'Cultivated',
        sourceState: '',
        percentage: ''
      }
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((i) => i.id !== id));
    }
  };

  const handleUpdateIngredient = (id: string, field: keyof IngredientRow, val: string) => {
    setIngredients(
      ingredients.map((i) => (i.id === id ? { ...i, [field]: val } : i))
    );
  };

  // Readiness Score Calculation
  const calculateReadinessScore = () => {
    let score = 20; // Base identity
    if (ingredients.length >= 2) score += 20;
    if (classicalTextRef.trim()) score += 15;
    if (noveltyDescription.length > 25) score += 15;
    if (hasBioAssay && bioAssayDetails.length > 20) score += 20;
    if (targetIndication.trim()) score += 10;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadinessScore();

  // Create Case Package & Escalate or Inspect
  const handleAssembleCase = (action: 'EVALUATE_AI' | 'ESCALATE_EXPERT') => {
    const caseId = `IPS-${Math.floor(2000 + Math.random() * 8000)}`;
    const fullSummaryQuery = `Case Builder Formulation: ${productName} (${productType}) for ${targetIndication}. Composition: ${ingredients
      .map((i) => `${i.sanskritName} [${i.botanicalName}] ${i.percentage}`)
      .join(', ')}. TK Status: ${tkClassification} referenced from ${classicalTextRef}. Novelty: ${noveltyDescription}. Synergistic Assay: ${bioAssayDetails}. Target: ${targetMarket}.`;

    const assembledProfile = {
      productType,
      purpose: targetIndication,
      ingredients: ingredients.map((i) => `${i.sanskritName} (${i.botanicalName}) - ${i.percentage}`),
      jurisdiction: targetMarket.includes('Global') ? 'India + International' : 'India',
      isTraditional:
        tkClassification === 'Novel Phyto-Formulation'
          ? ('new' as const)
          : tkClassification === 'Classical AFI Formula'
          ? ('traditional' as const)
          : ('modified_traditional' as const),
      notes: `Case Builder Dossier ${caseId}. Entity: ${entityType}. Bio-Assay: ${bioAssayDetails}`
    };

    setCaseProfile(assembledProfile);
    setQuery(fullSummaryQuery);

    if (action === 'ESCALATE_EXPERT') {
      const newCase: CaseRecord = {
        id: caseId,
        title: `${productName} — ${productType}`,
        query: fullSummaryQuery,
        domain: selectedExpert.roleTitle,
        jurisdiction: targetMarket.includes('Global') ? 'India + International' : 'India',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        confidenceLevel: hasBioAssay ? 'high' : 'medium',
        escalated: true,
        escalationReason: `Case Builder structured submission by ${entityType}. Assigned to ${selectedExpert.name} (${selectedExpert.degrees}).`,
        assignedExpertCategory: selectedExpert.roleTitle,
        assignedExpertName: `${selectedExpert.name} (${selectedExpert.degrees.split(',')[0]})`,
        caseProfile: assembledProfile,
        events: [
          {
            id: `ev-cb-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title: 'Dossier Assembled & Specialist Assigned',
            description: `Case assigned to ${selectedExpert.name} (${selectedExpert.degrees}) with ${ingredients.length} botanical actives.`,
            actor: 'user',
            status: 'SUBMITTED'
          }
        ]
      };

      addCase(newCase);
      setCreatedCaseId(caseId);
      setGeneratedSuccess(true);
    } else {
      navigate('/ask');
    }
  };

  // Export JSON dossier
  const handleExportJSON = () => {
    const dossierData = {
      dossierVersion: '1.0',
      generatedAt: new Date().toISOString(),
      productName,
      productType,
      targetIndication,
      entityType,
      targetMarket,
      ingredients,
      traditionalKnowledge: {
        classification: tkClassification,
        classicalTreatise: classicalTextRef,
        noveltyClaim: noveltyDescription
      },
      synergisticEvidence: {
        hasBioAssay,
        assayData: bioAssayDetails
      },
      readinessScore: `${readinessScore}%`
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IP_SAKTI_Case_Dossier_${productName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download clean, standalone official PDF dossier
  const handleDownloadOfficialPDF = () => {
    const reportElem = document.getElementById('printable-case-report');
    if (!reportElem) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const reportHTML = reportElem.innerHTML;
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IP-SAKTI Official Case Dossier — ${productName}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4;
              margin: 12mm 15mm 12mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              margin: 0;
              padding: 24px;
              line-height: 1.5;
            }
            .no-print-toolbar {
              background: #0f3d5c;
              color: #ffffff;
              padding: 12px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: sticky;
              top: 0;
              z-index: 1000;
              border-radius: 6px;
              margin-bottom: 20px;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
            }
            .pdf-action-btn {
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              font-weight: 600;
              cursor: pointer;
              font-size: 13px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .pdf-action-btn.primary {
              background: #059669;
              color: white;
            }
            .pdf-action-btn.secondary {
              background: rgba(255,255,255,0.2);
              color: white;
            }
            .pdf-action-btn:hover {
              opacity: 0.9;
            }
            .report-logo-banner {
              height: 52px;
              object-fit: contain;
            }
            .report-doc-header {
              border-bottom: 2px solid #0f3d5c;
              padding-bottom: 14px;
              margin-bottom: 20px;
            }
            .report-header-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            }
            .report-doc-title {
              font-size: 20pt;
              font-weight: 800;
              color: #0f3d5c;
              margin: 4px 0;
              letter-spacing: -0.5px;
            }
            .report-doc-subtitle {
              font-size: 10pt;
              color: #4b5563;
              margin: 0 0 15px 0;
            }
            .report-meta-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px 16px;
              background: #f8fafc;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              font-size: 9.5pt;
            }
            .report-section-block {
              margin-top: 18px;
              padding-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
              page-break-inside: avoid;
            }
            .report-section-heading {
              font-size: 12pt;
              font-weight: 700;
              color: #0f3d5c;
              margin: 0 0 8px 0;
            }
            .report-section-content {
              font-size: 10pt;
              color: #374151;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 9pt;
            }
            .report-table th, .report-table td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              text-align: left;
            }
            .report-table th {
              background: #f1f5f9;
              font-weight: 700;
            }
            .report-sources-list {
              padding-left: 18px;
              margin: 6px 0;
              font-size: 9.5pt;
            }
            .report-sources-list li {
              margin-bottom: 4px;
            }
            .report-disclaimer-box {
              margin-top: 25px;
              padding: 12px;
              background: #fefce8;
              border: 1px solid #fef08a;
              border-radius: 6px;
              font-size: 8.5pt;
              color: #854d0e;
              line-height: 1.4;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 8px;
              font-size: 8pt;
              font-weight: 700;
              border-radius: 4px;
              background: #dcfce7;
              color: #15803d;
            }
            .low-confidence-alerts-stack {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .low-confidence-warning-box {
              border: 1px solid #fca5a5;
              background: #fef2f2;
              border-radius: 6px;
              padding: 10px 14px;
              font-size: 9pt;
            }
            .warning-title-bar {
              color: #991b1b;
              font-weight: 700;
              margin-bottom: 4px;
            }
            @media print {
              .no-print-toolbar {
                display: none !important;
              }
              body {
                padding: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print-toolbar">
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 700; font-size: 14px; letter-spacing: 0.3px;">IP-SAKTI SAHAYAK — OFFICIAL DOSSIER</span>
              <span style="font-size: 11px; opacity: 0.85;">Format: Standardized A4 PDF Dossier (14 Statutory Sections)</span>
            </div>
            <div style="display: flex; gap: 10px;">
              <button onclick="window.print()" class="pdf-action-btn primary">🖨 Save as PDF / Print</button>
              <button onclick="window.close()" class="pdf-action-btn secondary">✕ Close</button>
            </div>
          </div>
          ${reportHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="gov-case-builder-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: t('nav.caseBuilder', 'Case Builder'), link: '/case-builder' }]} />

      <div className="gov-container case-builder-container">
        {/* Header Block */}
        <div className="case-builder-header">
          <div className="cb-badge">
            <Scale size={16} className="text-secondary" />
            <span>{t('caseBuilder.badge', 'Structured Ayurveda IP Dossier Generator')}</span>
          </div>
          <h1 className="cb-main-title">{t('caseBuilder.title', 'Ayurveda Formulation Case Builder')}</h1>
          <p className="cb-main-subtitle">
            {t('caseBuilder.subtitle', 'Assemble an authoritative legal and botanical factsheet for your Ayurvedic formulation. Screen Section 3(p) exclusions, Access & Benefit Sharing (ABS) mandates, and generate a standardized case package for AI guidance or empanelled expert escalation.')}
          </p>
        </div>

        {/* Readiness Meter & Quick Action Strip */}
        <div className="gov-card readiness-meter-card">
          <div className="readiness-score-block">
            <div className="score-circle-wrapper">
              <span className="score-value">{readinessScore}%</span>
            </div>
            <div>
              <h3 className="score-heading">{t('caseBuilder.readinessScore', 'Formulation Dossier Readiness Score')}</h3>
              <p className="score-sub">
                {readinessScore >= 80
                  ? t('caseBuilder.readinessLevelHigh', 'Ready for Empanelled Filing / Clearance Review')
                  : readinessScore >= 50
                  ? t('caseBuilder.readinessLevelMed', 'Preliminary Draft — Needs Bioassay or Sourcing Details')
                  : t('caseBuilder.readinessDesc', 'Statutory completeness score based on botanical identity, classical concordance, novelty claims, and bio-assay synergism.')}
              </p>
            </div>
          </div>

          <div className="readiness-actions">
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="btn btn-primary btn-sm"
            >
              <FileText size={14} />
              <span>{t('caseBuilder.previewReport', 'Preview Case Dossier')}</span>
            </button>
            <button type="button" onClick={handleExportJSON} className="btn btn-outline btn-sm">
              <Download size={14} />
              <span>{t('caseBuilder.downloadJson', 'Download Dossier JSON')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleAssembleCase('ESCALATE_EXPERT')}
              className="btn btn-secondary btn-sm"
            >
              <UserCheck size={14} />
              <span>{t('caseBuilder.escalateExpert', 'Escalate to Empanelled Specialist')}</span>
            </button>
          </div>
        </div>

        {/* Escalation Success Alert */}
        {generatedSuccess && createdCaseId && (
          <div className="gov-card escalation-success-banner mb-6" role="alert">
            <CheckCircle2 size={28} className="text-success" />
            <div>
              <h3 className="font-bold text-lg">{t('caseBuilder.successTitle', 'Case Dossier Successfully Assembled!')} ({createdCaseId})</h3>
              <p>
                {t('caseBuilder.successDesc', 'Your structured case dossier has been registered in the system with case ID')} <strong>{createdCaseId}</strong>.
              </p>
              <div className="mt-3 flex gap-3">
                <Link to="/dashboard" className="btn btn-primary btn-sm">
                  <span>{t('caseBuilder.viewDashboard', 'View in Citizen Dashboard')}</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to={`/expert/cases/${createdCaseId}`} className="btn btn-outline btn-sm">
                  <span>{t('nav.expertPortal', 'Expert Portal')}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* The 5 Case Builder Form Sections */}
        <div className="case-builder-grid">
          {/* Main Form Fields */}
          <div className="cb-form-col">
            {/* Section 1: Product & Innovation Identity */}
            <div className="gov-card cb-section-card">
              <div className="cb-sec-header">
                <span className="sec-number">1</span>
                <div>
                  <h2 className="sec-title">{t('caseBuilder.section1Title', 'Section 1: Innovation Identity & Entity Profile')}</h2>
                  <p className="sec-desc">{t('caseBuilder.section1Desc', 'Basic regulatory details and entity classification under Indian IP laws.')}</p>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label htmlFor="cb-prod-name" className="gov-input-label">{t('caseBuilder.productName', 'Invention / Commercial Product Name *')}:</label>
                  <input
                    id="cb-prod-name"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="gov-input"
                    placeholder={t('caseBuilder.productNamePlaceholder', 'e.g. Swastha Respiratory Herbal Kadha')}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="cb-prod-type" className="gov-input-label">{t('caseBuilder.productType', 'Regulatory Category (Ayurveda Formulation Type) *')}:</label>
                  <select
                    id="cb-prod-type"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="gov-input"
                  >
                    <option value="Classical Ayurvedic Medicine (AFI/API)">{t('caseBuilder.typeClassical', 'Classical Ayurvedic Medicine (AFI/API)')}</option>
                    <option value="Proprietary Ayurvedic Medicine">{t('caseBuilder.typeProprietary', 'Proprietary Ayurvedic Medicine')}</option>
                    <option value="Ayurveda Aahara (FSSAI Food Supplement)">{t('caseBuilder.typeAahara', 'Ayurveda Aahara (Nutraceutical / Food Supplement)')}</option>
                    <option value="Herbal Cosmetic / Cosmeceutical">{t('caseBuilder.typeCosmetic', 'Ayurveda Cosmetic / Personal Care')}</option>
                    <option value="Standardized Phyto-Pharmaceutical Extract">Standardized Phyto-Pharmaceutical Extract</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2 mt-4">
                <div className="form-field-group">
                  <label htmlFor="cb-indication" className="gov-input-label">{t('caseBuilder.targetIndication', 'Target Clinical Indication / Therapeutic Use *')}:</label>
                  <input
                    id="cb-indication"
                    type="text"
                    value={targetIndication}
                    onChange={(e) => setTargetIndication(e.target.value)}
                    className="gov-input"
                    placeholder={t('caseBuilder.indicationPlaceholder', 'e.g. Chronic Bronchial Clearance & Mucolytic Synergism')}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="cb-entity-type" className="gov-input-label">{t('caseBuilder.entityType', 'Applicant Legal Entity (Determines Official Patent Office Fees) *')}:</label>
                  <select
                    id="cb-entity-type"
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as any)}
                    className="gov-input"
                  >
                    <option value="Indian Startup / MSME">{t('caseBuilder.entityStartup', 'Indian Startup / MSME')}</option>
                    <option value="Individual Vaidya">{t('caseBuilder.entityVaidya', 'Individual Vaidya')}</option>
                    <option value="Large Enterprise">{t('caseBuilder.entityEnterprise', 'Large Enterprise')}</option>
                    <option value="Foreign / NRI Entity">{t('caseBuilder.entityForeign', 'Foreign / NRI Entity')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Botanical & Biological Formulation Composition Matrix */}
            <div className="gov-card cb-section-card">
              <div className="cb-sec-header">
                <span className="sec-number">2</span>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <h2 className="sec-title">{t('caseBuilder.section2Title', 'Section 2: Active Botanical & Mineral Ingredients Matrix')}</h2>
                    <p className="sec-desc">{t('caseBuilder.section2Desc', 'Detailed breakdown of classical and novel botanical ingredients. Critical for State Biodiversity Board (SBB) ABS screening.')}</p>
                  </div>
                  <button type="button" onClick={handleAddIngredient} className="btn btn-outline btn-sm">
                    <Plus size={14} />
                    <span>{t('caseBuilder.addIngredient', '+ Add Botanical Ingredient')}</span>
                  </button>
                </div>
              </div>

              <div className="ingredients-table-wrapper">
                <table className="gov-table ingredients-matrix-table">
                  <thead>
                    <tr>
                      <th>{t('caseBuilder.sanskritName', 'Sanskrit / Common Name')}</th>
                      <th>{t('caseBuilder.botanicalName', 'Botanical / Scientific Binomial')}</th>
                      <th>{t('caseBuilder.plantPart', 'Plant Part Used')}</th>
                      <th>{t('caseBuilder.sourceType', 'Sourcing Origin')}</th>
                      <th>{t('caseBuilder.sourceState', 'Harvest State / Territory')}</th>
                      <th>{t('caseBuilder.percentage', 'Ratio / %')}</th>
                      <th>{t('common.actions', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ing) => (
                      <tr key={ing.id}>
                        <td>
                          <input
                            type="text"
                            value={ing.sanskritName}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'sanskritName', e.target.value)}
                            placeholder="e.g. Vasaka"
                            className="table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={ing.botanicalName}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'botanicalName', e.target.value)}
                            placeholder="e.g. Adhatoda vasica"
                            className="table-input italic"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={ing.plantPart}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'plantPart', e.target.value)}
                            placeholder="e.g. Leaf"
                            className="table-input"
                          />
                        </td>
                        <td>
                          <select
                            value={ing.sourceType}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'sourceType', e.target.value as any)}
                            className="table-select"
                          >
                            <option value="Cultivated">{t('caseBuilder.sourceCultivated', 'Cultivated')}</option>
                            <option value="Wild">{t('caseBuilder.sourceWild', 'Wild')}</option>
                            <option value="Market/Mandi">{t('caseBuilder.sourceMarket', 'Market/Mandi')}</option>
                            <option value="Imported">{t('caseBuilder.sourceImported', 'Imported')}</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={ing.sourceState}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'sourceState', e.target.value)}
                            placeholder="State"
                            className="table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={ing.percentage}
                            onChange={(e) => handleUpdateIngredient(ing.id, 'percentage', e.target.value)}
                            placeholder="%"
                            className="table-input w-16"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(ing.id)}
                            className="btn-icon text-error"
                            title="Remove ingredient"
                            disabled={ingredients.length <= 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Traditional Knowledge & Prior Art Benchmarking */}
            <div className="gov-card cb-section-card">
              <div className="cb-sec-header">
                <span className="sec-number">3</span>
                <div>
                  <h2 className="sec-title">{t('caseBuilder.section3Title', 'Section 3: Traditional Knowledge & Prior Art Benchmarking')}</h2>
                  <p className="sec-desc">{t('caseBuilder.section3Desc', 'Classify traditional formulation heritage and cite classical texts to address Section 3(p) screening.')}</p>
                </div>
              </div>

              <div className="form-field-group mb-4">
                <label className="gov-input-label">{t('caseBuilder.tkClass', 'Traditional Knowledge Classification *')}:</label>
                <div className="options-grid grid-3">
                  {[
                    { key: 'Classical AFI Formula', label: t('caseBuilder.tkClassical', 'Classical AFI Formula') },
                    { key: 'Modified Traditional Composition', label: t('caseBuilder.tkModified', 'Modified Traditional Composition') },
                    { key: 'Novel Phyto-Formulation', label: t('caseBuilder.tkNovel', 'Novel Phyto-Formulation') }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTkClassification(item.key as any)}
                      className={`wizard-option-card ${tkClassification === item.key ? 'selected' : ''}`}
                    >
                      <strong>{item.label}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field-group mb-4">
                <label htmlFor="cb-classical-ref" className="gov-input-label">{t('caseBuilder.classicalRef', 'Classical Ayurvedic Treatise Reference (Samhita / AFI / API) *')}:</label>
                <input
                  id="cb-classical-ref"
                  type="text"
                  value={classicalTextRef}
                  onChange={(e) => setClassicalTextRef(e.target.value)}
                  className="gov-input"
                  placeholder="e.g. Charaka Samhita, Chikitsa Sthana Ch. 18 / Bhavaprakasha Nighantu"
                />
              </div>

              <div className="form-field-group">
                <VoiceInputField
                  value={noveltyDescription}
                  onChange={setNoveltyDescription}
                  placeholder="Describe your extraction novelty, standardized active marker ratio, or unexpected bioavailability enhancement..."
                  multiline={true}
                  rows={3}
                  id="cb-novelty-claim"
                  label={t('caseBuilder.noveltyClaim', 'Novel Technical Feature / Extraction Advance Claim *')}
                />
              </div>
            </div>

            {/* Section 4: Synergistic Assay Evidence (Section 3e) */}
            <div className="gov-card cb-section-card">
              <div className="cb-sec-header">
                <span className="sec-number">4</span>
                <div>
                  <h2 className="sec-title">{t('caseBuilder.section4Title', 'Section 4: Synergistic Therapeutic Evidence (Section 3(e) Proof)')}</h2>
                  <p className="sec-desc">{t('caseBuilder.section4Desc', 'Statutory exemption under Section 3(e) requires demonstrating unexpected synergism over known classical components.')}</p>
                </div>
              </div>

              <div className="checkbox-field-row mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBioAssay}
                    onChange={(e) => setHasBioAssay(e.target.checked)}
                    className="checkbox-large"
                  />
                  <span className="font-semibold text-sm">
                    {t('caseBuilder.hasBioAssay', 'Comparative in-vitro / in-vivo synergistic bio-assay evidence is available')}
                  </span>
                </label>
              </div>

              {hasBioAssay && (
                <div className="form-field-group">
                  <VoiceInputField
                    value={bioAssayDetails}
                    onChange={setBioAssayDetails}
                    placeholder="Enter comparative synergy index (CI), IC50 values, or animal model pharmacological assay summary..."
                    multiline={true}
                    rows={3}
                    id="cb-bio-assay"
                    label={t('caseBuilder.bioAssayDetails', 'Synergistic Bio-Assay Evidence & Observations')}
                  />
                </div>
              )}
            </div>

            {/* Section 5: Target Operational Jurisdiction */}
            <div className="gov-card cb-section-card">
              <div className="cb-sec-header">
                <span className="sec-number">5</span>
                <div>
                  <h2 className="sec-title">{t('caseBuilder.section5Title', 'Section 5: Target Operational Markets & Export Jurisdictions')}</h2>
                  <p className="sec-desc">{t('caseBuilder.section5Desc', 'Filing route depends on domestic manufacturing vs. PCT international PCT/WIPO filing.')}</p>
                </div>
              </div>

              <div className="options-grid grid-3">
                {[
                  { key: 'India Domestic', label: t('caseBuilder.marketDomestic', 'India Domestic') },
                  { key: 'International Export (US/EU)', label: t('caseBuilder.marketExport', 'International Export (US/EU)') },
                  { key: 'Both India & Global', label: t('caseBuilder.marketBoth', 'Both India & Global') }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTargetMarket(item.key as any)}
                    className={`wizard-option-card ${targetMarket === item.key ? 'selected' : ''}`}
                  >
                    <strong>{item.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* Dedicated Empanelled Specialist Selection Card */}
            <div className="gov-card cb-section-card" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', borderColor: '#86efac' }}>
              <div className="cb-sec-header">
                <span className="sec-number" style={{ background: '#059669', color: '#ffffff' }}>★</span>
                <div>
                  <h2 className="sec-title">{t('expertDirectory.title', 'Select Empanelled AYUSH IP & TK Specialist')}</h2>
                  <p className="sec-desc">{t('expertDirectory.subtitle', 'Choose a certified legal facilitator with specialized expertise in your formulation domain. Inspect verified degrees, resolved case counts, and domain credentials.')}</p>
                </div>
              </div>

              <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{
                    background: selectedExpert.avatarGradient,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}>
                    <UserCheck size={24} color="#ffffff" strokeWidth={2.4} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontWeight: 700, color: '#0f3d5c', fontSize: '15px' }}>{selectedExpert.name}</h4>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                        {selectedExpert.experienceYears}+ {t('expertDirectory.yearsExp', 'Yrs Exp')} ({selectedExpert.casesResolved}+ {t('expertDirectory.casesResolved', 'Cases')})
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>
                      {t(selectedExpert.domainLabelKey, selectedExpert.roleTitle)}
                    </p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                      <strong>{t('expertDirectory.degreesLabel', 'Degrees')}:</strong> {selectedExpert.degrees}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExpertSelectorModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <UserCheck size={14} />
                  <span>{t('expertDirectory.allDomains', 'Change / Browse Specialists')}</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="cb-bottom-actions">
              <button
                type="button"
                onClick={() => handleAssembleCase('EVALUATE_AI')}
                className="btn btn-outline btn-lg"
              >
                <Scale size={18} />
                <span>{t('caseBuilder.evaluateAi', 'Evaluate with AI Guidance')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleAssembleCase('ESCALATE_EXPERT')}
                className="btn btn-primary btn-lg"
              >
                <UserCheck size={18} />
                <span>{t('caseBuilder.escalateExpert', 'Escalate to Empanelled Specialist')} ({selectedExpert.name.split(' ')[0]} {selectedExpert.name.split(' ')[1] || ''})</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Summary Sidebar (Live Factsheet Preview) */}
          <div className="cb-sidebar-col">
            <div className="gov-card live-factsheet-card">
              <div className="factsheet-header">
                <FileText size={18} className="text-primary" />
                <h3>{t('answer.caseFactsheet', 'Live Dossier Factsheet')}</h3>
              </div>

              <div className="factsheet-summary-stack">
                <div className="factsheet-item">
                  <span className="item-lbl">{t('caseReport.inventionProduct', 'Product')}:</span>
                  <strong>{productName || 'Untitled'}</strong>
                </div>

                <div className="factsheet-item">
                  <span className="item-lbl">{t('caseReport.applicantCategory', 'Category')}:</span>
                  <span className="status-badge info">{productType}</span>
                </div>

                <div className="factsheet-item">
                  <span className="item-lbl">{t('caseBuilder.section2Title', 'Actives')}:</span>
                  <strong>{ingredients.length} {t('caseBuilder.section2Title', 'Botanical Actives')}</strong>
                </div>

                <div className="factsheet-item">
                  <span className="item-lbl">{t('caseBuilder.tkClass', 'TK Position')}:</span>
                  <strong>{tkClassification}</strong>
                </div>

                <div className="factsheet-item">
                  <span className="item-lbl">{t('caseBuilder.section4Title', 'Synergy Proof')}:</span>
                  <span className={`status-badge ${hasBioAssay ? 'success' : 'warning'}`}>
                    {hasBioAssay ? 'Assay Proof Attached' : 'No Assay Data'}
                  </span>
                </div>

                <div className="factsheet-item">
                  <span className="item-lbl">{t('caseReport.marketScope', 'Target Scope')}:</span>
                  <strong>{targetMarket}</strong>
                </div>
              </div>

              {/* Statutory Warnings Checklist */}
              <div className="statutory-check-box mt-4">
                <h4>{t('caseReport.s3Rules', 'Statutory Flags')}:</h4>
                <ul className="statutory-flags-list">
                  <li>
                    {tkClassification === 'Classical AFI Formula' ? (
                      <span className="flag warning">⚠ Section 3(p) non-patentable (Use Trademark)</span>
                    ) : (
                      <span className="flag success">✓ Section 3(e) synergistic pathway viable</span>
                    )}
                  </li>
                  <li>
                    {ingredients.some((i) => i.sourceType === 'Wild') ? (
                      <span className="flag info">ℹ SBB Form I intimation required for wild herbs</span>
                    ) : (
                      <span className="flag success">✓ Cultivated sources reduce ABS complications</span>
                    )}
                  </li>
                  <li>
                    <span className="flag info">ℹ Nice Class 5 Trademark recommended</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Case Analysis Report Modal / Printable View (PRD Section 11 & 12) */}
        {showReportModal && (
          <div className="case-report-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
            <div className="case-report-modal-content">
              <div className="case-report-modal-bar">
                <h3 id="report-modal-title">
                  <FileText size={18} />
                  <span>{t('caseBuilder.modalTitle', 'Official Ayurveda IP Case Analysis Dossier')}</span>
                </h3>
                <div className="modal-bar-actions flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadOfficialPDF}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                    style={{ background: '#047857', borderColor: '#047857' }}
                  >
                    <Download size={15} />
                    <span>Download Official PDF Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-outline btn-sm text-white border-white/40 hover:bg-white/10 flex items-center gap-1.5"
                  >
                    <Printer size={15} />
                    <span>Print Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="btn-icon text-white"
                    aria-label="Close Report"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="case-report-scroll-body">
                <div className="case-report-document" id="printable-case-report">
                  {/* Document Official Header */}
                  <div className="report-doc-header">
                    <div className="report-header-top">
                      <img src="/logo-brand.png" alt="IP-SAKTI Sahayak Logo" className="report-logo-banner" />
                      <div className="text-right">
                        <span className="status-badge success">COMPLIANCE REPORT</span>
                        <div className="text-xs text-muted mt-1">Dossier ID: IPS-2026-CB</div>
                      </div>
                    </div>
                    <h1 className="report-doc-title">{t('caseReport.title', 'CASE ANALYSIS REPORT')}</h1>
                    <p className="report-doc-subtitle">
                      {t('caseReport.subtitle', 'National Ayurveda Intellectual Property Guidance & RAG Compliance Evaluation')}
                    </p>

                    <div className="report-meta-grid">
                      <div><strong>{t('caseReport.applicantCategory', 'Applicant Category')}:</strong> {entityType}</div>
                      <div><strong>{t('caseReport.inventionProduct', 'Invention / Product')}:</strong> {productName}</div>
                      <div><strong>{t('caseReport.targetIndication', 'Target Indication')}:</strong> {targetIndication}</div>
                      <div><strong>{t('caseReport.marketScope', 'Market Scope')}:</strong> {targetMarket}</div>
                      <div><strong>{t('caseReport.dateOfAssessment', 'Date of Assessment')}:</strong> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div><strong>{t('caseReport.readinessScore', 'Readiness Score')}:</strong> {readinessScore}%</div>
                    </div>
                  </div>

                  {/* 1. CASE SUMMARY */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s1Summary', '1. Case Summary')}</h2>
                    <div className="report-section-content">
                      <p>
                        The applicant proposes commercialization of <strong>{productName}</strong>, classified under <em>{productType}</em>. The formulation contains {ingredients.length} active botanical ingredients: {ingredients.map((i) => `${i.sanskritName} (${i.botanicalName}, ${i.percentage})`).join(', ')}. The innovation aims to establish therapeutic efficacy for {targetIndication}.
                      </p>
                    </div>
                  </section>

                  {/* 2. IP CLASSIFICATION */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s2IpClass', '2. IP Classification')}</h2>
                    <div className="report-section-content">
                      <p><strong>Primary Route:</strong> Patent Protection (Section 3(e) Synergistic Herbal Extraction) & Trademark Brand Protection (Nice Class 5 for pharmaceuticals, Class 3 for cosmetics).</p>
                      <p><strong>Secondary Protective Scope:</strong> Trade Secret process documentation for standardized hydro-ethanolic extraction ratios, and Design Registration for distinctive packaging.</p>
                    </div>
                  </section>

                  {/* 3. APPLICABLE RULES & LAWS */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s3Rules', '3. Applicable Rules & Laws')}</h2>
                    <div className="report-section-content">
                      <ul className="report-sources-list">
                        <li><strong>The Patents Act, 1970 — Section 3(p):</strong> Prohibits patenting of traditional knowledge or mere aggregation of known herbal properties.</li>
                        <li><strong>The Patents Act, 1970 — Section 3(e):</strong> Requires demonstration that combining botanical actives yields synergistic efficacy beyond mere additive properties.</li>
                        <li><strong>The Patents Act, 1970 — Section 3(d):</strong> Mandates demonstration of enhanced therapeutic efficacy for modified traditional compositions.</li>
                        <li><strong>The Biological Diversity Act, 2002 — Section 6:</strong> Prior NBA approval mandated before filing any IP based on Indian biological resources.</li>
                        <li><strong>The Trade Marks Act, 1999 — Section 9 & 13:</strong> Prohibits descriptive or generic classical Sanskrit ingredient names without distinctive branding.</li>
                      </ul>
                    </div>
                  </section>

                  {/* 4. RELEVANT GUIDELINES */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s4Guidelines', '4. Relevant Guidelines')}</h2>
                    <div className="report-section-content">
                      <p>
                        • <strong>Office of CGPDTM (2012 Guidelines):</strong> Guidelines for Examination of Patent Applications relating to Traditional Knowledge and Biological Material.<br />
                        • <strong>Ministry of AYUSH Regulatory Norms (2024):</strong> Quality standards for classical vs proprietary Ayurvedic formulations.<br />
                        • <strong>TKDL Examination Standard Operating Procedure:</strong> Multi-lingual classification matching Indian systems of medicine against IPC/CPC patent classes.
                      </p>
                    </div>
                  </section>

                  {/* 5. PRIOR ART / EXISTING KNOWLEDGE */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s5PriorArt', '5. Prior Art & Traditional Knowledge (TKDL)')}</h2>
                    <div className="report-section-content">
                      <p><strong>Classical References Cited:</strong> {classicalTextRef}</p>
                      <p><strong>Novelty Differentiation:</strong> {noveltyDescription}</p>
                      <p><strong>Prior Art Screening:</strong> Botanical actives cross-checked against TKDL classical formulations. Classical Kadha formulations in AFI Part I are non-patentable per se; novelty rests entirely on extraction ratio and verified synergistic bio-potency.</p>
                    </div>
                  </section>

                  {/* 6. REGULATORY INFORMATION */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s6Regulatory', '6. Regulatory Information')}</h2>
                    <div className="report-section-content">
                      <p>• <strong>Licensing Authority:</strong> State Licensing Authority (AYUSH) under Drugs and Cosmetics Act, 1940 (Chapter IVA).</p>
                      <p>• <strong>Manufacturing Standard:</strong> Mandatory Schedule T (Good Manufacturing Practices - GMP) compliance.</p>
                      <p>• <strong>Formulation Category:</strong> Proprietary Ayurvedic Medicine under Section 3(h), Drugs & Cosmetics Act.</p>
                    </div>
                  </section>

                  {/* 7. ABS / BIODIVERSITY */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s7Abs', '7. Access & Benefit Sharing (ABS) / Biodiversity')}</h2>
                    <div className="report-section-content">
                      <p>• <strong>Biological Resource Origin:</strong> Wild resources from Himachal Pradesh ({ingredients.filter((i) => i.sourceType === 'Wild').map((i) => i.sanskritName).join(', ') || 'Kantakari'}).</p>
                      <p>• <strong>Statutory Obligation:</strong> Prior intimation in Form I to the State Biodiversity Board (SBB) under Section 7 of the Biological Diversity Act, 2002.</p>
                      <p>• <strong>Benefit Sharing Levy:</strong> 0.1% to 0.5% on annual ex-factory gross sales value upon commercial manufacturing.</p>
                    </div>
                  </section>

                  {/* 8. FEES & PROCEDURE */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s8Fees', '8. Official Fees & Procedure')}</h2>
                    <div className="report-section-content">
                      <p>• <strong>Form 1 & Form 2 (Patent Application & Specification):</strong> ₹1,600 (Startup / Small Entity) / ₹8,000 (Large Entity).</p>
                      <p>• <strong>Form 18 (Request for Examination):</strong> ₹4,000 (Startup) / ₹20,000 (Large Entity).</p>
                      <p>• <strong>Form 28:</strong> Evidence of Startup / MSME status for 80% fee rebate.</p>
                      <p>• <strong>NBA Form III (IP Application Clearance):</strong> Statutory application fee ₹500.</p>
                    </div>
                  </section>

                  {/* 9. CASE-SPECIFIC ANALYSIS */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s9Analysis', '9. Case-Specific Analysis')}</h2>
                    <div className="report-section-content">
                      <p>
                        The formulation demonstrates viable patentability for the extraction method and synergistic composition: <em>"{bioAssayDetails}"</em>. Because classical text references exist in {classicalTextRef}, claims directed to pure herbal admixtures will face immediate Section 3(p) rejections. To succeed, patent claims must focus strictly on the synergistic concentration ratio and bio-potency enhancement verified in the assay.
                      </p>
                    </div>
                  </section>

                  {/* 10. CONFIDENCE & RISK */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s10Confidence', '10. Confidence & Risk Matrix')}</h2>
                    <div className="report-section-content">
                      <div className="report-meta-grid">
                        <div><strong>Overall Confidence:</strong> HIGH (88%)</div>
                        <div><strong>Section 3(p) Defense:</strong> HIGH (85%)</div>
                        <div><strong>Prior Art Grounding:</strong> HIGH (90%)</div>
                        <div><strong>Fees / Procedure:</strong> LOW (31%)</div>
                        <div><strong>ABS Exemption:</strong> LOW (42%)</div>
                      </div>
                    </div>
                  </section>

                  {/* 11. LOW-CONFIDENCE AREAS (MANDATORY PRD Section 13) */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s11LowConfidence', '11. Low-Confidence Areas (Statutory Warnings)')}</h2>
                    <div className="report-section-content">
                      <div className="low-confidence-alerts-stack">
                        <div className="low-confidence-warning-box">
                          <div className="warning-title-bar">
                            <AlertCircle size={16} className="text-error" />
                            <strong>⚠ {t('common.lowConfidenceArea', 'LOW CONFIDENCE AREA')} — FEES & STATUTORY TARIFF</strong>
                          </div>
                          <div className="warning-field">
                            <span className="field-key">{t('common.section', 'Section')}:</span>
                            <strong>Official Fees & Tariff Classification</strong>
                          </div>
                          <div className="warning-field">
                            <span className="field-key">{t('common.confidence', 'Confidence')}:</span>
                            <span className="text-error font-bold">31%</span>
                          </div>
                          <div className="warning-reason-text">
                            <strong>{t('common.reason', 'Reason')}:</strong> The available factsheet does not confirm official DPIIT Startup certificate registration or turnover limits, which determines whether the applicant qualifies for the 80% fee discount.
                          </div>
                        </div>

                        <div className="low-confidence-warning-box">
                          <div className="warning-title-bar">
                            <AlertCircle size={16} className="text-error" />
                            <strong>⚠ {t('common.lowConfidenceArea', 'LOW CONFIDENCE AREA')} — ABS EXEMPTION SCOPE</strong>
                          </div>
                          <div className="warning-field">
                            <span className="field-key">{t('common.section', 'Section')}:</span>
                            <strong>National Biodiversity Authority (ABS Clearance)</strong>
                          </div>
                          <div className="warning-field">
                            <span className="field-key">{t('common.confidence', 'Confidence')}:</span>
                            <span className="text-error font-bold">42%</span>
                          </div>
                          <div className="warning-reason-text">
                            <strong>{t('common.reason', 'Reason')}:</strong> Local mandi procurement invoices for wild Solanum surattense were not attached. If harvested without SBB notice, penal liabilities under Section 55 could arise.
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 12. MISSING INFORMATION */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s12MissingInfo', '12. Missing Information (Action Required)')}</h2>
                    <div className="report-section-content">
                      <ul className="report-sources-list">
                        <li>1. DPIIT recognition certificate or Udyam MSME certificate for subsidized patent fees.</li>
                        <li>2. Batch procurement receipts verifying mandi origin for wild harvested components.</li>
                        <li>3. Comparative single-herb control study data (Vasaka alone vs Kantakari alone vs Combined extract).</li>
                      </ul>
                    </div>
                  </section>

                  {/* 13. RECOMMENDED NEXT STEPS */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s13NextSteps', '13. Recommended Next Steps')}</h2>
                    <div className="report-section-content">
                      <ol className="report-sources-list" style={{ paddingLeft: '20px' }}>
                        <li><strong>Step 1:</strong> File Form I intimation with Himachal Pradesh State Biodiversity Board before scaling commercial extraction.</li>
                        <li><strong>Step 2:</strong> Prepare a Provisional Patent Specification focusing on synergistic ratio claims supported by the tracheal chain assay.</li>
                        <li><strong>Step 3:</strong> Register distinctive brand name under Nice Class 5 at the Trade Marks Registry.</li>
                      </ol>
                    </div>
                  </section>

                  {/* 14. SOURCES & CITATIONS */}
                  <section className="report-section-block">
                    <h2 className="report-section-heading">{t('caseReport.s14Sources', '14. Sources & Citations')}</h2>
                    <div className="report-section-content">
                      <p className="text-xs text-secondary">
                        [1] The Patents Act, 1970 (Act No. 39 of 1970) — Sections 2(1)(j), 3(d), 3(e), 3(p), 10.<br />
                        [2] Manual of Patent Office Practice and Procedure (AYUSH Formulation Guidelines 2012).<br />
                        [3] The Biological Diversity Act, 2002 (Act No. 18 of 2003) — Sections 3, 6, 7, 19, 24.<br />
                        [4] Traditional Knowledge Digital Library (TKDL) Reference Standards (CSIR / Ministry of AYUSH).<br />
                        [5] The Trade Marks Act, 1999 (Act No. 47 of 1999) — Section 9 & Section 13.<br />
                        [6] Drugs and Cosmetics Act, 1940 — Chapter IVA, Rules 151-160 (Schedule T GMP).
                      </p>
                    </div>
                  </section>

                  {/* DISCLAIMER */}
                  <div className="report-disclaimer-box">
                    <strong>{t('answer.limitationsTitle', 'Important Legal Notice')}:</strong> {t('footer.disclaimer', 'IP-SAKTI Sahayak provides source-grounded regulatory and intellectual property guidance for research and informational purposes. It does not replace professional legal counsel or formal patent prosecution by registered patent agents.')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showExpertSelectorModal && (
        <ExpertDirectorySelector
          selectedExpertId={selectedExpert.id}
          onSelectExpert={(exp) => {
            setSelectedExpert(exp);
            setShowExpertSelectorModal(false);
          }}
          modalMode={true}
          onClose={() => setShowExpertSelectorModal(false)}
        />
      )}
    </div>
  );
};
