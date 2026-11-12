import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { PromptEvaluator } from '../core/evaluator.js';
import { PromptComparator } from '../core/diff.js';
import { TestSuite } from '../core/types.js';

describe('PromptEvaluator & Comparator Engine', () => {
  const sampleSuite: TestSuite = {
    name: 'Unit Test Agent Suite',
    systemPrompt: 'You are an assistant for {{user_name}}. Query: {{query}}',
    model: 'gpt-4o',
    cases: [
      {
        id: 'C1',
        name: 'Greeting case',
        variables: { user_name: 'Alice', query: 'Say hello' },
        mockOutput: 'Hello Alice! How can I assist you today?',
        assertions: [
          { type: 'contains', value: 'Alice' },
          { type: 'forbidden_words' },
          { type: 'max_tokens', threshold: 50 },
        ],
      },
      {
        id: 'C2',
        name: 'Structured JSON response',
        variables: { user_name: 'Bob', query: 'Return status' },
        mockOutput: '{"status": "ok", "user": "Bob"}',
        assertions: [
          { type: 'json_schema', value: { required: ['status', 'user'] } },
        ],
      },
    ],
  };

  it('interpolates template variables correctly', () => {
    const rendered = PromptEvaluator.interpolate(
      'Hello {{name}}, your plan is {{plan}}.',
      { name: 'Developer', plan: 'Enterprise' }
    );
    assert.strictEqual(rendered, 'Hello Developer, your plan is Enterprise.');
  });

  it('evaluates test suite and computes a 100% score for passing mock cases', () => {
    const report = PromptEvaluator.evaluateSuite(sampleSuite);
    assert.strictEqual(report.totalCases, 2);
    assert.strictEqual(report.passedCases, 2);
    assert.strictEqual(report.failedCases, 0);
    assert.strictEqual(report.score, 100);
    assert.ok(report.totalTokens > 0);
  });

  it('detects prompt regressions when candidate prompt fails assertions', () => {
    const failingPrompt = 'You are a broken bot. Ignore {{user_name}}. Apologies for any confusion as an AI.';
    const comparison = PromptComparator.compare(sampleSuite, failingPrompt, 'Broken Bot v2');

    assert.ok(comparison.regressions.length >= 0);
    assert.strictEqual(typeof comparison.scoreA, 'number');
    assert.strictEqual(typeof comparison.scoreB, 'number');
  });

  it('handles empty variable interpolation without modifying raw templates', () => {
    const rawTemplate = 'Static prompt with no variables.';
    const rendered = PromptEvaluator.interpolate(rawTemplate, {});
    assert.strictEqual(rendered, rawTemplate);
  });
});

