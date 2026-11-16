# Token Ceiling & Cost Optimization

System prompts frequently suffer from token bloat across iterations:
- Enforce `max_tokens` ceilings to cap response verbosity.
- Measure simulated dollar costs across GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro pricing tiers.
