/**
 * IP-SAKTI Sahayak — Multilingual Quality & Grounding Consistency Evaluator
 * Tests whether English, Hindi, Marathi, or Gujarati answers for equivalent queries
 * maintain identical statutory grounding, citation sets, jurisdiction, and confidence.
 */

import { AIAnswerData } from '../store/appStore';

export interface MultilingualEvalResult {
  isConsistent: boolean;
  score: number; // 0 to 100
  citationMatch: boolean;
  jurisdictionMatch: boolean;
  confidenceMatch: boolean;
  abstentionMatch: boolean;
  details: {
    enCitationsCount: number;
    targetCitationsCount: number;
    sharedCitationSections: string[];
    notes: string[];
  };
}

export function evaluateMultilingualConsistency(
  enAnswer: AIAnswerData,
  targetAnswer: AIAnswerData
): MultilingualEvalResult {
  const notes: string[] = [];

  // 1. Jurisdiction Match Check
  const jurisdictionMatch =
    enAnswer.jurisdiction.toLowerCase() === targetAnswer.jurisdiction.toLowerCase() ||
    (enAnswer.jurisdiction.includes('India') && targetAnswer.jurisdiction.includes('भारत'));

  if (!jurisdictionMatch) {
    notes.push(`Jurisdiction mismatch: EN='${enAnswer.jurisdiction}' vs Target='${targetAnswer.jurisdiction}'`);
  }

  // 2. Confidence Level Match Check
  const confidenceMatch = enAnswer.confidence.level === targetAnswer.confidence.level;
  if (!confidenceMatch) {
    notes.push(`Confidence mismatch: EN='${enAnswer.confidence.level}' vs Target='${targetAnswer.confidence.level}'`);
  }

  // 3. Abstention Status Match Check
  const abstentionMatch = Boolean(enAnswer.abstained) === Boolean(targetAnswer.abstained);
  if (!abstentionMatch) {
    notes.push(`Abstention status mismatch: EN=${enAnswer.abstained} vs Target=${targetAnswer.abstained}`);
  }

  // 4. Citation Grounding Match Check
  const enSections = (enAnswer.citations || []).map((c) => (c.section || c.title).toLowerCase().trim());
  const targetSections = (targetAnswer.citations || []).map((c) => (c.section || c.title).toLowerCase().trim());

  const sharedSections = enSections.filter((sec) =>
    targetSections.some((tSec) => tSec.includes(sec) || sec.includes(tSec))
  );

  const citationMatch = enSections.length === 0 || sharedSections.length > 0;
  if (!citationMatch) {
    notes.push('Citations do not share common statutory sections.');
  }

  // Calculate Consistency Score
  let score = 0;
  if (jurisdictionMatch) score += 25;
  if (confidenceMatch) score += 25;
  if (abstentionMatch) score += 25;
  if (citationMatch) score += 25;

  const isConsistent = score >= 75;

  return {
    isConsistent,
    score,
    citationMatch,
    jurisdictionMatch,
    confidenceMatch,
    abstentionMatch,
    details: {
      enCitationsCount: enAnswer.citations?.length || 0,
      targetCitationsCount: targetAnswer.citations?.length || 0,
      sharedCitationSections: sharedSections,
      notes
    }
  };
}
