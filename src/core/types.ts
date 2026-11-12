export type AssertionType =
  | 'contains'
  | 'not_contains'
  | 'regex'
  | 'json_schema'
  | 'forbidden_words'
  | 'max_tokens'
  | 'cost_ceiling'
  | 'similarity';

export interface Assertion {
  type: AssertionType;
  value?: any;
  threshold?: number;
  description?: string;
}

export interface TestCase {
  id: string;
  name: string;
  variables: Record<string, string>;
  mockOutput?: string;
  expectedOutput?: string;
  assertions: Assertion[];
}

export interface TestSuite {
  name: string;
  description?: string;
  systemPrompt: string;
  model?: 'gpt-4o' | 'claude-3-5-sonnet' | 'gemini-1-5-pro' | 'custom';
  cases: TestCase[];
}

export interface AssertionResult {
  assertion: Assertion;
  passed: boolean;
  actualValue?: any;
  reason?: string;
}

export interface TestCaseResult {
  testCase: TestCase;
  renderedPrompt: string;
  output: string;
  passed: boolean;
  assertionResults: AssertionResult[];
  tokenCount: number;
  estimatedCostUsd: number;
}

export interface SuiteExecutionResult {
  suiteName: string;
  timestamp: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  score: number; // 0 - 100
  totalTokens: number;
  totalCostEstimate: number;
  results: TestCaseResult[];
}

export interface PromptComparisonResult {
  promptAName: string;
  promptBName: string;
  scoreA: number;
  scoreB: number;
  scoreDelta: number;
  tokensA: number;
  tokensB: number;
  tokenDeltaPercent: number;
  costA: number;
  costB: number;
  costDeltaPercent: number;
  regressions: { caseId: string; caseName: string; reason: string }[];
  improvements: { caseId: string; caseName: string; reason: string }[];
}
