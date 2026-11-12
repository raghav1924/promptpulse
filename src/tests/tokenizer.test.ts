import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { TokenCalculator } from '../core/tokenizer.js';

describe('TokenCalculator & Cost Estimation', () => {
  it('estimates token counts for simple sentences and code snippets', () => {
    assert.strictEqual(TokenCalculator.estimateTokens(''), 0);
    assert.strictEqual(TokenCalculator.estimateTokens('   '), 0);

    const tokens1 = TokenCalculator.estimateTokens('Hello world');
    assert.ok(tokens1 >= 2 && tokens1 <= 3);

    const longText = 'The quick brown fox jumps over the lazy dog repeatedly to test tokenization heuristics.';
    const tokens2 = TokenCalculator.estimateTokens(longText);
    assert.ok(tokens2 >= 12 && tokens2 <= 25);
  });

  it('calculates dollar costs accurately across model pricing tiers', () => {
    // 100,000 input tokens, 20,000 output tokens on GPT-4o
    // Input: (100,000 / 1M) * 2.50 = 0.25
    // Output: (20,000 / 1M) * 10.00 = 0.20
    // Total = 0.45
    const costGpt4o = TokenCalculator.calculateCost(100_000, 20_000, 'gpt-4o');
    assert.strictEqual(costGpt4o, 0.45);

    // Gemini 1.5 Pro: $1.25 in, $5.00 out
    // Input: 0.125, Output: 0.10 => Total 0.225
    const costGemini = TokenCalculator.calculateCost(100_000, 20_000, 'gemini-1-5-pro');
    assert.strictEqual(costGemini, 0.225);
  });
});
