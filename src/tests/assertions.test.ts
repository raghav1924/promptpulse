import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { AssertionEngine } from '../core/assertions.js';

describe('AssertionEngine Validation Rules', () => {
  it('validates keyword containment (contains & not_contains)', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    
    const passContains = AssertionEngine.evaluate({ type: 'contains', value: ['quick', 'fox'] }, text);
    assert.strictEqual(passContains.passed, true);

    const failContains = AssertionEngine.evaluate({ type: 'contains', value: ['elephant'] }, text);
    assert.strictEqual(failContains.passed, false);
    assert.ok(failContains.reason?.includes('elephant'));

    const passNotContains = AssertionEngine.evaluate({ type: 'not_contains', value: 'cat' }, text);
    assert.strictEqual(passNotContains.passed, true);

    const failNotContains = AssertionEngine.evaluate({ type: 'not_contains', value: 'fox' }, text);
    assert.strictEqual(failNotContains.passed, false);
  });

  it('validates regular expressions', () => {
    const emailText = 'Contact support at help@cloudplatform.io for assistance.';
    const passRegex = AssertionEngine.evaluate({ type: 'regex', value: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' }, emailText);
    assert.strictEqual(passRegex.passed, true);

    const failRegex = AssertionEngine.evaluate({ type: 'regex', value: '^Error:\\s\\d+' }, emailText);
    assert.strictEqual(failRegex.passed, false);
  });

  it('validates structured JSON schemas', () => {
    const validJson = JSON.stringify({
      status: 'success',
      count: 42,
      tags: ['ai', 'agent'],
    });

    const passSchema = AssertionEngine.evaluate({
      type: 'json_schema',
      value: {
        required: ['status', 'count', 'tags'],
        properties: {
          status: 'string',
          count: 'number',
          tags: 'array',
        },
      },
    }, validJson);
    assert.strictEqual(passSchema.passed, true);

    const missingKeySchema = AssertionEngine.evaluate({
      type: 'json_schema',
      value: {
        required: ['status', 'unauthorized_token'],
      },
    }, validJson);
    assert.strictEqual(missingKeySchema.passed, false);
    assert.ok(missingKeySchema.reason?.includes('unauthorized_token'));

    const badJson = '{ status: invalid json';
    const failSyntax = AssertionEngine.evaluate({ type: 'json_schema' }, badJson);
    assert.strictEqual(failSyntax.passed, false);
    assert.ok(failSyntax.reason?.includes('Syntax error'));
  });

  it('detects forbidden apologetic and filler phrases', () => {
    const cleanOutput = 'Your invoice #991 is confirmed and paid.';
    const passForbidden = AssertionEngine.evaluate({ type: 'forbidden_words' }, cleanOutput);
    assert.strictEqual(passForbidden.passed, true);

    const apologeticOutput = 'As an AI language model, I apologize for any confusion regarding your bill.';
    const failForbidden = AssertionEngine.evaluate({ type: 'forbidden_words' }, apologeticOutput);
    assert.strictEqual(failForbidden.passed, false);
    assert.ok(failForbidden.reason?.includes('as an ai'));
  });

  it('computes Levenshtein similarity against golden answers', () => {
    const actual = 'Authentication failed due to invalid credentials';
    const expected = 'Authentication failed due to invalid credentials';
    const passSim = AssertionEngine.evaluate({ type: 'similarity', threshold: 0.9 }, actual, 0, expected);
    assert.strictEqual(passSim.passed, true);

    const distant = 'Completely unrelated string about weather.';
    const failSim = AssertionEngine.evaluate({ type: 'similarity', threshold: 0.8 }, distant, 0, expected);
    assert.strictEqual(failSim.passed, false);
  });

  it('validates cost ceiling assertions against estimated completion token usage', () => {
    const output = 'Short concise response.';
    const passCost = AssertionEngine.evaluate({ type: 'cost_ceiling', threshold: 0.01 }, output, 50);
    assert.strictEqual(passCost.passed, true);

    const failCost = AssertionEngine.evaluate({ type: 'cost_ceiling', threshold: 0.000001 }, output, 50);
    assert.strictEqual(failCost.passed, false);
    assert.ok(failCost.reason?.includes('exceeded cost ceiling'));
  });

  it('evaluates max_tokens ceilings accurately based on token estimation', () => {
    const briefText = 'Hello world';
    const longText = 'This is a significantly longer text response that contains many words and will exceed five tokens easily.';
    const passTokenCeiling = AssertionEngine.evaluate({ type: 'max_tokens', threshold: 100 }, briefText, 10);
    assert.strictEqual(passTokenCeiling.passed, true);

    const failTokenCeiling = AssertionEngine.evaluate({ type: 'max_tokens', threshold: 5 }, longText, 50);
    assert.strictEqual(failTokenCeiling.passed, false);
    assert.ok(failTokenCeiling.reason?.includes('exceeded maximum threshold'));
  });
});
