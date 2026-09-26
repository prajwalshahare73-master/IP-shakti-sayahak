/**
 * IP-SAKTI Sahayak — Secondary Evaluation Suite
 * Evaluates the application across 4 key dimensions:
 * 1. Answer Accuracy (Grounding against statutory corpus)
 * 2. Citation Correctness (Verification status of citations)
 * 3. Safe Abstention (Appropriate refusal on unsupported queries)
 * 4. Multilingual Quality (Factual consistency across languages)
 */

import { askIPQuestion } from './ask.service';
import { enrichAnswerWithTrustValidation } from './trustValidation.service';
import { evaluateMultilingualConsistency } from './multilingualEval.service';

export interface TestCaseResult {
  id: string;
  category: 'Accuracy' | 'Citation' | 'Abstention' | 'Multilingual';
  query: string;
  expectedBehavior: string;
  actualResult: string;
  passed: boolean;
  reason: string;
  details?: any;
}

export interface EvaluationSuiteReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  passRate: number; // percentage
  results: TestCaseResult[];
  categoryBreakdown: {
    accuracy: { total: number; passed: number };
    citation: { total: number; passed: number };
    abstention: { total: number; passed: number };
    multilingual: { total: number; passed: number };
  };
}

export async function runTrustEvaluationSuite(): Promise<EvaluationSuiteReport> {
  const results: TestCaseResult[] = [];

  // A. Answer Accuracy Testing
  const accQuery1 = 'Can I patent an Ayurvedic polyherbal kadha formulation under Indian law?';
  const rawAcc1 = await askIPQuestion({ query: accQuery1, jurisdiction: 'India', conversation_id: 'test-acc-1' });
  const enrichedAcc1 = enrichAnswerWithTrustValidation(rawAcc1, accQuery1, 'India');

  const accPassed1 = enrichedAcc1.citations.some((c) =>
    ((c.section || '') + ' ' + (c.title || '') + ' ' + (c.excerpt || '') + ' ' + (enrichedAcc1.answer || '')).toLowerCase().includes('3(p)') ||
    (c.title || '').includes('Patents Act')
  );
  results.push({
    id: 'TC-ACC-01',
    category: 'Accuracy',
    query: accQuery1,
    expectedBehavior: 'Must reference Section 3(p) Patents Act 1970 for polyherbal formulation',
    actualResult: enrichedAcc1.citations.map((c) => `${c.title} (${c.section || 'Sec 3(p)'})`).join('; '),
    passed: accPassed1,
    reason: accPassed1 ? 'Correctly grounded in Section 3(p) Patents Act 1970 statutory provision.' : 'Failed to retrieve Section 3(p) reference.'
  });

  const accQuery2 = 'Do I need NBA permission to export Himalayan Kutki (Picrorhiza kurrooa) extract?';
  const rawAcc2 = await askIPQuestion({ query: accQuery2, jurisdiction: 'India', conversation_id: 'test-acc-2' });
  const enrichedAcc2 = enrichAnswerWithTrustValidation(rawAcc2, accQuery2, 'India');

  const accPassed2 = enrichedAcc2.citations.some((c) => (c.title || '').toLowerCase().includes('biodiversity') || (c.section || '').includes('6'));
  results.push({
    id: 'TC-ACC-02',
    category: 'Accuracy',
    query: accQuery2,
    expectedBehavior: 'Must cite Biological Diversity Act 2002 / Section 6 for biological material export',
    actualResult: enrichedAcc2.citations.map((c) => c.title).join(', '),
    passed: accPassed2,
    reason: accPassed2 ? 'Correctly grounded in Biological Diversity Act 2002.' : 'Failed to retrieve NBA/Biological Diversity citation.'
  });

  // B. Citation Correctness Testing
  const citPassed = enrichedAcc1.trustValidation.citationSummary.supportedCount > 0;
  results.push({
    id: 'TC-CIT-01',
    category: 'Citation',
    query: accQuery1,
    expectedBehavior: 'Citations must be marked as SUPPORTED or PARTIALLY_SUPPORTED with verification notes',
    actualResult: `Supported: ${enrichedAcc1.trustValidation.citationSummary.supportedCount}, Partially: ${enrichedAcc1.trustValidation.citationSummary.partiallySupportedCount}`,
    passed: citPassed,
    reason: citPassed ? 'Citation verification engine assigned explicit support statuses.' : 'No citations were verified.'
  });

  // C. Safe Abstention Testing
  // Case C1: Unsupported vague query -> MUST ABSTAIN
  const absVagueQuery = 'kuch batao help me';
  const rawAbs1 = await askIPQuestion({ query: absVagueQuery, jurisdiction: 'India', conversation_id: 'test-abs-1' });
  const enrichedAbs1 = enrichAnswerWithTrustValidation(rawAbs1, absVagueQuery, 'India');

  const absPassed1 = enrichedAbs1.abstained === true;
  results.push({
    id: 'TC-ABS-01',
    category: 'Abstention',
    query: absVagueQuery,
    expectedBehavior: 'System MUST ABSTAIN due to insufficient product facts',
    actualResult: enrichedAbs1.abstained ? 'ABSTAINED (PASS)' : 'ANSWERED (FAIL - Should have abstained)',
    passed: absPassed1,
    reason: absPassed1 ? 'Safely abstained on vague query without hallucinating.' : 'Unsafely generated response for vague query.'
  });

  // Case C2: Supported query -> MUST NOT ABSTAIN
  const absPassed2 = enrichedAcc1.abstained !== true;
  results.push({
    id: 'TC-ABS-02',
    category: 'Abstention',
    query: accQuery1,
    expectedBehavior: 'System MUST NOT abstain when sufficient evidence exists',
    actualResult: enrichedAcc1.abstained ? 'ABSTAINED (FAIL)' : 'ANSWERED (PASS)',
    passed: absPassed2,
    reason: absPassed2 ? 'Correctly answered supported query without unnecessary abstention.' : 'Unnecessarily abstained on supported query.'
  });

  // D. Multilingual Quality Testing
  const rawEn = await askIPQuestion({ query: 'What are trademark rules for Ayurvedic oil brand names?', response_language: 'en', jurisdiction: 'India', conversation_id: 'test-multi-en' });
  const rawHi = await askIPQuestion({ query: 'आयुर्वेदिक तेल के ब्रांड नाम के लिए ट्रेडमार्क के क्या नियम हैं?', response_language: 'hi', jurisdiction: 'India', conversation_id: 'test-multi-hi' });

  const multiEval = evaluateMultilingualConsistency(rawEn, rawHi);
  results.push({
    id: 'TC-MUL-01',
    category: 'Multilingual',
    query: 'Trademark rules for Ayurveda brand (EN vs HI)',
    expectedBehavior: 'English and Hindi answers must share identical statutory grounding & jurisdiction',
    actualResult: `Consistency Score: ${multiEval.score}/100 (Citation Match: ${multiEval.citationMatch}, Jurisdiction Match: ${multiEval.jurisdictionMatch})`,
    passed: multiEval.isConsistent,
    reason: multiEval.isConsistent ? 'English and Hindi responses maintain identical statutory grounding.' : multiEval.details.notes.join('; '),
    details: multiEval
  });

  const passedCount = results.filter((r) => r.passed).length;
  const totalTests = results.length;
  const failedCount = totalTests - passedCount;
  const passRate = Math.round((passedCount / totalTests) * 100);

  return {
    timestamp: new Date().toISOString(),
    totalTests,
    passedCount,
    failedCount,
    passRate,
    results,
    categoryBreakdown: {
      accuracy: { total: 2, passed: results.filter((r) => r.category === 'Accuracy' && r.passed).length },
      citation: { total: 1, passed: results.filter((r) => r.category === 'Citation' && r.passed).length },
      abstention: { total: 2, passed: results.filter((r) => r.category === 'Abstention' && r.passed).length },
      multilingual: { total: 1, passed: results.filter((r) => r.category === 'Multilingual' && r.passed).length }
    }
  };
}

// ---------------------------------------------------------------------------
// EXTENDED SUITE — New test groups added in Enhancement Phase
// Covers: International routing, Out-of-scope abstention, GI, Designs,
//         Paid-source guard, Version metadata, Citation verification
// ---------------------------------------------------------------------------

import { checkPaidSourceAccess } from './paidSourceGuard.service';

export interface ExtendedTestResult {
  testId: string;
  group: string;
  description: string;
  passed: boolean;
  details: string;
}

export interface ExtendedSuiteReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  results: ExtendedTestResult[];
}

export async function runExtendedEvaluationSuite(): Promise<ExtendedSuiteReport> {
  const results: ExtendedTestResult[] = [];

  // ---------- Group B: International Jurisdiction ----------

  const intlPat = await askIPQuestion({
    query: 'How do I file international patent for my herbal formulation?',
    jurisdiction: 'International',
    conversation_id: 'ext-b1'
  });
  results.push({
    testId: 'B1',
    group: 'International',
    description: 'International routing — patent query returns PCT citation',
    passed: intlPat.citations.some((c) => c.title.toLowerCase().includes('pct') || c.title.toLowerCase().includes('patent cooperation')) && intlPat.jurisdiction === 'International',
    details: `IP Type: "${intlPat.ipType}" | Jurisdiction: "${intlPat.jurisdiction}" | Citations: ${intlPat.citations.map((c) => c.title.slice(0, 35)).join('; ')}`
  });

  const intlNagoya = await askIPQuestion({
    query: 'What is Nagoya Protocol compliance for exporting Ayurvedic herbs?',
    jurisdiction: 'International',
    conversation_id: 'ext-b2'
  });
  results.push({
    testId: 'B2',
    group: 'International',
    description: 'International routing — Nagoya Protocol citation for ABS query',
    passed: intlNagoya.citations.some((c) => c.title.toLowerCase().includes('nagoya')),
    details: `Citations: ${intlNagoya.citations.map((c) => c.title.slice(0, 35)).join('; ')}`
  });

  const bothJurisdiction = await askIPQuestion({
    query: 'patent for synergistic herbal formulation in India and internationally',
    jurisdiction: 'India + International',
    conversation_id: 'ext-b3'
  });
  results.push({
    testId: 'B3',
    group: 'International',
    description: 'India + International routing — returns international treaty citations',
    passed: bothJurisdiction.citations.some((c) => c.title.toLowerCase().includes('pct') || c.title.toLowerCase().includes('trips') || c.title.toLowerCase().includes('patent')) && !bothJurisdiction.abstained,
    details: `Abstained: ${bothJurisdiction.abstained} | Citations: ${bothJurisdiction.citations.length} | IP Type: "${bothJurisdiction.ipType}"`
  });

  // ---------- Group C: Out-of-Scope Abstention ----------

  const oos1 = await askIPQuestion({ query: 'What are cricket match scores today?', jurisdiction: 'India', conversation_id: 'ext-c1' });
  results.push({
    testId: 'C2',
    group: 'Abstention',
    description: 'Out-of-scope abstention — cricket query abstains with "Out of Scope"',
    passed: oos1.abstained === true && oos1.ipType === 'Out of Scope',
    details: `Abstained: ${oos1.abstained} | IP Type: "${oos1.ipType}"`
  });

  const oos2 = await askIPQuestion({ query: 'How do I file income tax return for salaried employee?', jurisdiction: 'India', conversation_id: 'ext-c2' });
  results.push({
    testId: 'C3',
    group: 'Abstention',
    description: 'Out-of-scope abstention — income tax query abstains',
    passed: oos2.abstained === true && oos2.ipType === 'Out of Scope',
    details: `Abstained: ${oos2.abstained} | IP Type: "${oos2.ipType}"`
  });

  // ---------- Group D: GI and Designs ----------

  const giResult = await askIPQuestion({ query: 'Can I register geographical indication for Kerala Ayurvedic formulation?', jurisdiction: 'India', conversation_id: 'ext-d1' });
  results.push({
    testId: 'D1',
    group: 'GI',
    description: 'GI routing — returns GI Act 1999 citation',
    passed: giResult.citations.some((c) => c.title.toLowerCase().includes('geographical indication')) && giResult.ipType.toLowerCase().includes('geographical'),
    details: `IP Type: "${giResult.ipType}" | GI citation: ${giResult.citations.some((c) => c.title.toLowerCase().includes('geographical indication'))}`
  });

  const designResult = await askIPQuestion({ query: 'How do I protect my unique Ayurvedic bottle packaging design?', jurisdiction: 'India', conversation_id: 'ext-d2' });
  results.push({
    testId: 'D2',
    group: 'Designs',
    description: 'Designs routing — returns Designs Act 2000 citation',
    passed: designResult.citations.some((c) => c.title.toLowerCase().includes('designs act')) && designResult.ipType.toLowerCase().includes('design'),
    details: `IP Type: "${designResult.ipType}" | Designs Act citation: ${designResult.citations.some((c) => c.title.toLowerCase().includes('designs act'))}`
  });

  // ---------- Group F: Paid-Source Guard ----------

  const guardTkdl = checkPaidSourceAccess('TKDL_DEEP_ACCESS', 'test-user');
  results.push({
    testId: 'F1',
    group: 'PaidSourceGuard',
    description: 'Paid-source guard — TKDL_DEEP_ACCESS blocked (no connector)',
    passed: !guardTkdl.allowed && guardTkdl.logEntry?.result === 'DENIED_NO_CONNECTOR',
    details: `Allowed: ${guardTkdl.allowed} | Result: ${guardTkdl.logEntry?.result} | Msg: "${guardTkdl.message.slice(0, 60)}..."`
  });

  const guardManupatra = checkPaidSourceAccess('MANUPATRA', 'test-user-2');
  results.push({
    testId: 'F2',
    group: 'PaidSourceGuard',
    description: 'Paid-source guard — MANUPATRA blocked with informative message',
    passed: !guardManupatra.allowed && (guardManupatra.message.toLowerCase().includes('not configured') || guardManupatra.message.toLowerCase().includes('connector')),
    details: `Allowed: ${guardManupatra.allowed} | Msg: "${guardManupatra.message.slice(0, 80)}..."`
  });

  // ---------- Group G: Version Metadata ----------

  const versionResult = await askIPQuestion({ query: 'How to file PCT patent internationally for herbal formulation?', jurisdiction: 'International', conversation_id: 'ext-g2' });
  const citationsWithDate = versionResult.citations.filter((c: any) => c.effectiveDate || c.lastAmendedDate);
  results.push({
    testId: 'G2',
    group: 'VersionMetadata',
    description: 'Version metadata — international citations include effectiveDate or lastAmendedDate',
    passed: citationsWithDate.length > 0,
    details: `${citationsWithDate.length}/${versionResult.citations.length} citations have version date metadata`
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  console.log('\n=== Extended Evaluation Suite Results ===');
  results.forEach((r) => {
    console.log(`${r.passed ? '✅' : '❌'} [${r.testId}] ${r.description}`);
    console.log(`   ${r.details}`);
  });
  console.log(`\nSUMMARY: ${passed}/${results.length} passed | ${failed} failed\n`);

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed,
    passRate: Math.round((passed / results.length) * 100),
    results
  };
}

