import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class ValidationResult(BaseModel):
    valid: bool
    readiness_score: int
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    passed_checks: List[str] = Field(default_factory=list)
    statutory_flags: List[Dict[str, Any]] = Field(default_factory=list)

def validate_case_dossier(data: Dict[str, Any], initial_question: Optional[str] = None) -> ValidationResult:
    """
    Performs deep statutory and legal completeness validation for an Ayurvedic IP case dossier.
    Dynamic logic inspects actual fields: product identity, composition matrix, TK status,
    synergistic assay proof (Sec 3e), Section 3(p) exclusion risks, and NBA Biological Diversity rules.
    """
    errors: List[str] = []
    warnings: List[str] = []
    recommendations: List[str] = []
    passed_checks: List[str] = []
    statutory_flags: List[Dict[str, Any]] = []

    # Extract fields safely
    product_name = (data.get("product_name") or data.get("title") or "").strip()
    applicant_type = (data.get("applicant_type") or data.get("entityType") or "").strip()
    ip_category = (data.get("ip_category") or data.get("productType") or "").strip()
    target_indication = (data.get("purpose") or data.get("target_indication") or data.get("targetIndication") or data.get("initial_question") or data.get("title") or "").strip()
    jurisdiction = (data.get("jurisdiction") or data.get("targetMarket") or "India").strip()
    ingredients = data.get("ingredients") or []
    formulation_details = (data.get("formulation_details") or data.get("noveltyDescription") or "").strip()
    process_description = (data.get("process_description") or data.get("bioAssayDetails") or "").strip()
    biological_material = data.get("biological_material", False)
    tk_involved = data.get("tk_involved", False)
    classical_ref = (data.get("classical_text_ref") or data.get("classicalTextRef") or "").strip()

    # 1. Product Identity Checks
    if not product_name:
        errors.append("Missing Product Name: Every case dossier must define an identifiable product or formulation title.")
    elif len(product_name) < 3:
        errors.append("Invalid Product Name: Formulation name must be at least 3 characters.")
    else:
        passed_checks.append("Product name identified and verified.")

    if not target_indication:
        errors.append("Missing Intended Use / Indication: Therapeutic or commercial utility must be declared for patent/licensing assessment.")
    else:
        passed_checks.append("Intended therapeutic/functional indication provided.")

    if not applicant_type:
        warnings.append("Applicant category not specified. Official fee subsidies (80% for MSME/Startups under Patents Rules 2024) cannot be calculated.")
    else:
        passed_checks.append(f"Applicant category verified: {applicant_type}.")

    # 2. Jurisdiction Checks
    if not jurisdiction:
        errors.append("Missing Jurisdiction: Please specify target protection territory (India Domestic vs. International PCT).")
    else:
        passed_checks.append(f"Jurisdiction confirmed: {jurisdiction}.")

    # 3. Composition Matrix Checks
    if not ingredients or len(ingredients) == 0:
        errors.append("Missing Composition Details: At least one botanical active or herb must be listed in the formulation matrix.")
    else:
        passed_checks.append(f"Composition matrix contains {len(ingredients)} ingredient(s).")
        has_wild_source = False
        for idx, ing in enumerate(ingredients):
            ing_str = ing if isinstance(ing, str) else str(ing.get("sanskritName", "") or ing.get("botanicalName", ""))
            if not ing_str or len(ing_str.strip()) < 2:
                warnings.append(f"Ingredient #{idx+1} has incomplete nomenclature.")
            if isinstance(ing, dict) and ing.get("sourceType") == "Wild":
                has_wild_source = True
            elif isinstance(ing, str) and "wild" in ing.lower():
                has_wild_source = True

        if has_wild_source and not biological_material:
            warnings.append("Wild botanical harvesting detected: The 'biological_material' flag must be enabled for NBA Form I intimation.")

    # 4. Traditional Knowledge & Section 3(p) Screening
    is_classical = "classical" in ip_category.lower() or "afi" in formulation_details.lower() or tk_involved
    if is_classical:
        statutory_flags.append({
            "section": "Section 3(p), Patents Act 1970",
            "risk_level": "HIGH",
            "message": "Invention involves Traditional Knowledge. Direct patent claims on known uses or minor variants face mandatory rejection under Section 3(p) & TKDL citations."
        })
        if not classical_ref:
            warnings.append("Missing Classical Reference: Traditional knowledge claim lacks citation to Ayurvedic Formulary of India (AFI), Charaka, Sushruta, or Ashtanga Hridaya.")
        else:
            passed_checks.append("Classical treatise formulary reference documented.")

    # 5. Synergistic Evidence & Section 3(e) Screening
    if len(ingredients) > 1:
        statutory_flags.append({
            "section": "Section 3(e), Patents Act 1970",
            "risk_level": "MEDIUM",
            "message": "Poly-herbal formulation: Under Section 3(e), a mere admixture resulting only in aggregation of properties is non-patentable without synergistic bio-assay proof."
        })
        has_synergy_proof = len(process_description) > 20 or "combination index" in process_description.lower() or "synerg" in process_description.lower() or "assay" in process_description.lower()
        if not has_synergy_proof:
            warnings.append("Missing Synergistic Proof (Section 3e): Multi-ingredient herbal compositions require comparative bio-assay or quantitative synergism data (e.g. CI < 1.0) to overcome patent office objections.")
        else:
            passed_checks.append("Synergistic bio-assay evidence or experimental validation documented.")

    # 6. Biological Diversity Act (NBA / SBB) Screening
    if biological_material or any("wild" in str(i).lower() for i in ingredients):
        statutory_flags.append({
            "section": "Section 6 & Section 7, Biological Diversity Act 2002",
            "risk_level": "STATUTORY MANDATE",
            "message": "Use of Indian biological resources requires mandatory intimation to State Biodiversity Board (SBB Form I) or National Biodiversity Authority approval (NBA Form III) prior to patent grant."
        })
        recommendations.append("File NBA Form III before commercialization or international patent PCT phase entry.")

    # 7. Contradictory Information Check
    if "novel" in formulation_details.lower() and "classical" in ip_category.lower() and not classical_ref:
        warnings.append("Contradictory Claim: Formulation claimed as both 'Classical AFI' and 'Novel Invention' without specifying the exact modified extract or standardization.")

    # Compute Readiness Score (0 - 100)
    score = 20
    if product_name and len(product_name) >= 3:
        score += 15
    if target_indication:
        score += 15
    if len(ingredients) >= 2:
        score += 20
    elif len(ingredients) == 1:
        score += 10
    if len(formulation_details) > 20:
        score += 15
    if len(process_description) > 20:
        score += 15
    if not errors:
        score += 5

    # Penalize for critical warnings
    if len(errors) > 0:
        score = min(score, 45)

    is_valid = len(errors) == 0

    if not is_valid:
        recommendations.append("Resolve all critical validation errors before escalating to Empanelled Legal Counsel.")
    else:
        recommendations.append("Dossier meets statutory formatting requirements. Ready for prior art search and expert review.")

    return ValidationResult(
        valid=is_valid,
        readiness_score=min(score, 100),
        errors=errors,
        warnings=warnings,
        recommendations=recommendations,
        passed_checks=passed_checks,
        statutory_flags=statutory_flags
    )
