import { Assertion, AssertionResult } from './types.js';
import { TokenCalculator } from './tokenizer.js';

export class AssertionEngine {
  public static evaluate(
    assertion: Assertion,
    output: string,
    inputTokens: number = 0,
    expectedOutput?: string
  ): AssertionResult {
    switch (assertion.type) {
      case 'contains':
        return this.evalContains(assertion, output);

      case 'not_contains':
        return this.evalNotContains(assertion, output);

      case 'regex':
        return this.evalRegex(assertion, output);

      case 'json_schema':
        return this.evalJsonSchema(assertion, output);

      case 'forbidden_words':
        return this.evalForbiddenWords(assertion, output);

      case 'max_tokens':
        return this.evalMaxTokens(assertion, output);

      case 'cost_ceiling':
        return this.evalCostCeiling(assertion, output, inputTokens);

      case 'similarity':
        return this.evalSimilarity(assertion, output, expectedOutput);

      default:
        return {
          assertion,
          passed: false,
          reason: `Unknown assertion type: ${(assertion as any).type}`,
        };
    }
  }

  private static evalContains(assertion: Assertion, output: string): AssertionResult {
    const targets: string[] = Array.isArray(assertion.value) ? assertion.value : [String(assertion.value)];
    const missing: string[] = [];

    for (const target of targets) {
      if (!output.toLowerCase().includes(String(target).toLowerCase())) {
        missing.push(target);
      }
    }

    if (missing.length === 0) {
      return { assertion, passed: true };
    }

    return {
      assertion,
      passed: false,
      reason: `Output missing required keyword(s): [${missing.map(m => `"${m}"`).join(', ')}]`,
    };
  }

  private static evalNotContains(assertion: Assertion, output: string): AssertionResult {
    const targets: string[] = Array.isArray(assertion.value) ? assertion.value : [String(assertion.value)];
    const found: string[] = [];

    for (const target of targets) {
      if (output.toLowerCase().includes(String(target).toLowerCase())) {
        found.push(target);
      }
    }

    if (found.length === 0) {
      return { assertion, passed: true };
    }

    return {
      assertion,
      passed: false,
      reason: `Output contained forbidden term(s): [${found.map(f => `"${f}"`).join(', ')}]`,
    };
  }

  private static evalRegex(assertion: Assertion, output: string): AssertionResult {
    try {
      const pattern = typeof assertion.value === 'string' ? new RegExp(assertion.value) : (assertion.value as RegExp);
      const passed = pattern.test(output);
      return {
        assertion,
        passed,
        reason: passed ? undefined : `Output does not match regular expression: ${pattern.toString()}`,
      };
    } catch (err: any) {
      return {
        assertion,
        passed: false,
        reason: `Invalid regex syntax: ${err.message}`,
      };
    }
  }

  private static evalJsonSchema(assertion: Assertion, output: string): AssertionResult {
    let parsed: any;

    // Check if JSON wrapped in markdown code fence
    let rawJson = output.trim();
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return {
        assertion,
        passed: false,
        reason: `Output is not valid JSON. Syntax error during parse.`,
      };
    }

    if (!assertion.value || typeof assertion.value !== 'object') {
      return { assertion, passed: true, actualValue: parsed };
    }

    const schema = assertion.value;

    // Validate required fields
    if (Array.isArray(schema.required)) {
      const missingKeys: string[] = [];
      for (const reqKey of schema.required) {
        if (!(reqKey in parsed)) {
          missingKeys.push(reqKey);
        }
      }
      if (missingKeys.length > 0) {
        return {
          assertion,
          passed: false,
          actualValue: parsed,
          reason: `JSON missing required schema keys: [${missingKeys.join(', ')}]`,
        };
      }
    }

    // Validate property types if specified
    if (schema.properties && typeof schema.properties === 'object') {
      for (const [propName, expectedType] of Object.entries(schema.properties)) {
        if (propName in parsed) {
          const actualVal = parsed[propName];
          const actualType = Array.isArray(actualVal) ? 'array' : typeof actualVal;
          if (expectedType !== actualType) {
            return {
              assertion,
              passed: false,
              actualValue: parsed,
              reason: `Property "${propName}" expected type "${expectedType}", received "${actualType}"`,
            };
          }
        }
      }
    }

    return { assertion, passed: true, actualValue: parsed };
  }

  private static evalForbiddenWords(assertion: Assertion, output: string): AssertionResult {
    const defaultForbidden = [
      'as an ai',
      'i am an ai language model',
      'as an artificial intelligence',
      'apologies for any confusion',
      'i cannot assist with this',
    ];
    const forbiddenList: string[] = Array.isArray(assertion.value) && assertion.value.length > 0
      ? assertion.value
      : defaultForbidden;

    const matched: string[] = [];
    const lowerOutput = output.toLowerCase();

    for (const phrase of forbiddenList) {
      if (lowerOutput.includes(phrase.toLowerCase())) {
        matched.push(phrase);
      }
    }

    if (matched.length === 0) {
      return { assertion, passed: true };
    }

    return {
      assertion,
      passed: false,
      reason: `Found forbidden apologetic / filler tokens: [${matched.map(m => `"${m}"`).join(', ')}]`,
    };
  }

  private static evalMaxTokens(assertion: Assertion, output: string): AssertionResult {
    const limit = assertion.threshold || 500;
    const tokens = TokenCalculator.estimateTokens(output);

    if (tokens <= limit) {
      return { assertion, passed: true, actualValue: tokens };
    }

    return {
      assertion,
      passed: false,
      actualValue: tokens,
      reason: `Output token count (${tokens}) exceeded maximum threshold (${limit})`,
    };
  }

  private static evalCostCeiling(assertion: Assertion, output: string, inputTokens: number): AssertionResult {
    const ceilingUsd = assertion.threshold || 0.05;
    const outputTokens = TokenCalculator.estimateTokens(output);
    const cost = TokenCalculator.calculateCost(inputTokens, outputTokens);

    if (cost <= ceilingUsd) {
      return { assertion, passed: true, actualValue: cost };
    }

    return {
      assertion,
      passed: false,
      actualValue: cost,
      reason: `Estimated completion cost ($${cost}) exceeded cost ceiling ($${ceilingUsd})`,
    };
  }

  private static evalSimilarity(assertion: Assertion, output: string, expectedOutput?: string): AssertionResult {
    const target = String(assertion.value || expectedOutput || '');
    if (!target) {
      return { assertion, passed: true };
    }

    const threshold = assertion.threshold !== undefined ? assertion.threshold : 0.7;
    const similarity = this.calculateLevenshteinSimilarity(output.trim().toLowerCase(), target.trim().toLowerCase());

    if (similarity >= threshold) {
      return { assertion, passed: true, actualValue: similarity };
    }

    return {
      assertion,
      passed: false,
      actualValue: similarity,
      reason: `Similarity score (${(similarity * 100).toFixed(1)}%) below target threshold (${(threshold * 100).toFixed(1)}%)`,
    };
  }

  public static calculateLevenshteinSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const len1 = s1.length;
    const len2 = s2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return Math.max(0, 1 - distance / maxLen);
  }
}
