# Token Counting & Cost Estimation

Fast BPE token heuristics estimate token consumption without external API latency:
- Approximates token count at ~4 characters per token for English text.
- Applies pricing rates for GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro.
