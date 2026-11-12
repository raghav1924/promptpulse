import { TestSuite, TestCase, TestCaseResult, SuiteExecutionResult } from './types.js';
import { AssertionEngine } from './assertions.js';
import { TokenCalculator } from './tokenizer.js';

export class PromptEvaluator {
  /**
   * Replace template tags like {{variable_name}} with values from variables dictionary.
   */
  public static interpolate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  /**
   * Evaluates a single test case against the rendered prompt.
   */
  public static evaluateCase(
    testCase: TestCase,
    systemPrompt: string,
    model: string = 'gpt-4o'
  ): TestCaseResult {
    const renderedPrompt = this.interpolate(systemPrompt, testCase.variables);
    const inputTokens = TokenCalculator.estimateTokens(renderedPrompt);

    // Get model output: Use testCase.mockOutput if available, else simulate deterministic response
    const output = testCase.mockOutput !== undefined
      ? this.interpolate(testCase.mockOutput, testCase.variables)
      : (testCase.expectedOutput || 'Default simulation response.');

    const outputTokens = TokenCalculator.estimateTokens(output);
    const estimatedCostUsd = TokenCalculator.calculateCost(inputTokens, outputTokens, model);

    const assertionResults = testCase.assertions.map(assertion =>
      AssertionEngine.evaluate(assertion, output, inputTokens, testCase.expectedOutput)
    );

    const passed = assertionResults.every(r => r.passed);

    return {
      testCase,
      renderedPrompt,
      output,
      passed,
      assertionResults,
      tokenCount: inputTokens + outputTokens,
      estimatedCostUsd,
    };
  }

  /**
   * Run an entire test suite and calculate composite metrics.
   */
  public static evaluateSuite(suite: TestSuite): SuiteExecutionResult {
    const results: TestCaseResult[] = [];
    let totalTokens = 0;
    let totalCost = 0;

    for (const testCase of suite.cases) {
      const res = this.evaluateCase(testCase, suite.systemPrompt, suite.model || 'gpt-4o');
      results.push(res);
      totalTokens += res.tokenCount;
      totalCost += res.estimatedCostUsd;
    }

    const passedCases = results.filter(r => r.passed).length;
    const failedCases = results.length - passedCases;
    const score = results.length > 0 ? Math.round((passedCases / results.length) * 100) : 100;

    return {
      suiteName: suite.name,
      timestamp: new Date().toISOString(),
      totalCases: results.length,
      passedCases,
      failedCases,
      score,
      totalTokens,
      totalCostEstimate: parseFloat(totalCost.toFixed(6)),
      results,
    };
  }
}
