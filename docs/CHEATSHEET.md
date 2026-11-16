# PromptPulse CLI Cheatsheet

```bash
# Run prompt evaluation suite
promptpulse test prompts/eval-suite.json

# Compare baseline vs candidate prompt variant
promptpulse diff prompts/v1.txt prompts/v2.txt --dataset prompts/cases.json

# Calculate token counts and cost estimates
promptpulse tokens "Analyze user query: Hello" --model gpt-4o

# Launch Evaluation Studio
promptpulse studio --port 6060
```
