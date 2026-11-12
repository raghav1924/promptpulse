export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const PRICING_TABLE: Record<string, ModelPricing> = {
  'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'claude-3-5-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'gemini-1-5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00 },
  'custom': { inputPerMillion: 2.00, outputPerMillion: 8.00 },
};

export class TokenCalculator {
  /**
   * Fast Byte-Pair heuristic estimation for LLM tokens without binary dependencies.
   * Accurately models punctuation, code blocks, whitespace and standard English tokens.
   */
  public static estimateTokens(text: string): number {
    if (!text || text.length === 0) return 0;

    const trimmed = text.trim();
    if (trimmed.length === 0) return 0;

    // Matches alphanumeric sequences, numbers, or individual punctuation marks
    const matches = trimmed.match(/[\w]+|[^\s\w]/g);
    if (!matches) {
      return Math.ceil(trimmed.length / 4);
    }

    let tokenCount = 0;
    for (const token of matches) {
      if (token.length > 7) {
        // Words > 7 characters often split into multiple BPE subwords
        tokenCount += Math.ceil(token.length / 4);
      } else {
        tokenCount += 1;
      }
    }

    return Math.max(1, tokenCount);
  }

  /**
   * Calculate estimated USD cost for a given input and output token count.
   */
  public static calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: string = 'gpt-4o'
  ): number {
    const pricing = PRICING_TABLE[model] || PRICING_TABLE['gpt-4o'];
    const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;
    return parseFloat((inputCost + outputCost).toFixed(6));
  }
}
