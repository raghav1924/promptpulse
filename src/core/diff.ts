import { TestSuite, PromptComparisonResult } from './types.js';
import { PromptEvaluator } from './evaluator.js';

export class PromptComparator {
  public static compare(
    baseSuite: TestSuite,
    candidatePrompt: string,
    candidateName: string = 'Candidate Prompt'
  ): PromptComparisonResult {
    const candidateSuite: TestSuite = {
      ...baseSuite,
      name: `${baseSuite.name} [Candidate]`,
      systemPrompt: candidatePrompt,
    };

    const resultA = PromptEvaluator.evaluateSuite(baseSuite);
    const resultB = PromptEvaluator.evaluateSuite(candidateSuite);

    const regressions: { caseId: string; caseName: string; reason: string }[] = [];
    const improvements: { caseId: string; caseName: string; reason: string }[] = [];

    for (let i = 0; i < resultA.results.length; i++) {
      const caseA = resultA.results[i];
      const caseB = resultB.results[i];

      if (caseA.passed && !caseB.passed) {
        const failure = caseB.assertionResults.find(a => !a.passed);
        regressions.push({
          caseId: caseA.testCase.id,
          caseName: caseA.testCase.name,
          reason: failure?.reason || 'Assertion failed in candidate prompt',
        });
      } else if (!caseA.passed && caseB.passed) {
        improvements.push({
          caseId: caseA.testCase.id,
          caseName: caseA.testCase.name,
          reason: 'All assertions now pass with candidate prompt',
        });
      }
    }

    const tokenDelta = resultB.totalTokens - resultA.totalTokens;
    const tokenDeltaPercent = resultA.totalTokens > 0
      ? parseFloat(((tokenDelta / resultA.totalTokens) * 100).toFixed(1))
      : 0;

    const costDelta = resultB.totalCostEstimate - resultA.totalCostEstimate;
    const costDeltaPercent = resultA.totalCostEstimate > 0
      ? parseFloat(((costDelta / resultA.totalCostEstimate) * 100).toFixed(1))
      : 0;

    return {
      promptAName: 'Baseline Prompt (v1)',
      promptBName: candidateName,
      scoreA: resultA.score,
      scoreB: resultB.score,
      scoreDelta: resultB.score - resultA.score,
      tokensA: resultA.totalTokens,
      tokensB: resultB.totalTokens,
      tokenDeltaPercent,
      costA: resultA.totalCostEstimate,
      costB: resultB.totalCostEstimate,
      costDeltaPercent,
      regressions,
      improvements,
    };
  }
}

