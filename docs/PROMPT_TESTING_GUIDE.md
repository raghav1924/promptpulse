# Prompt Regression Testing Guide

A practical guide to implementing continuous integration prompt regression testing with **PromptPulse**.

Author: [Jatin Sharma](https://jatinsh.netlify.app/) (`@raghav1924`)

---

## 1. Defining a Prompt Regression Suite

Create `promptpulse.config.json` at the root of your application:

```json
{
  "system_prompt": "You are a customer support agent. Reply in strictly formatted JSON with keys 'status' and 'resolution'.",
  "test_cases": [
    {
      "id": "refund_inquiry",
      "user_input": "I want a refund for order #12345",
      "expected_output": "{\"status\":\"approved\",\"resolution\":\"processed\"}",
      "assertions": [
        { "type": "json_schema", "schema": { "required": ["status", "resolution"] } },
        { "type": "forbidden_words", "words": ["as an AI language model", "sorry"] },
        { "type": "max_tokens", "max": 150 }
      ]
    }
  ]
}
```

---

## 2. Running Automated Regression Audits

```bash
# Execute evaluation
npx promptpulse evaluate --config promptpulse.config.json --min-score 95
```

---

## 3. Side-by-Side Prompt Diffing

When tuning system prompts to reduce token counts or eliminate corporate filler phrases:

```bash
npx promptpulse compare --baseline prompts/v1.txt --candidate prompts/v2.txt
```

PromptPulse will highlight:
- Score change ($\Delta$) across your test fixtures
- Estimated token savings percentage
- Cost reduction across 1,000,000 monthly inference calls

