# PromptPulse CLI Cheatsheet & Assertion Reference

A fast reference guide for using **PromptPulse** in prompt evaluation pipelines and CI/CD gates.

Author: [Jatin Sharma](https://jatinsh.netlify.app/) (`@raghav1924`)

---

## Supported Assertion Operators

| Operator | Config Key | Parameter | Description |
|---|---|---|---|
| `contains` | `type: "contains"` | `value: string[]` | Output must contain all specified substrings |
| `not_contains` | `type: "not_contains"` | `value: string[]` | Output must not contain any forbidden terms |
| `regex` | `type: "regex"` | `value: string` | Output must match regular expression |
| `json_schema` | `type: "json_schema"` | `value: object` | Output must conform to strict JSON Schema keys |
| `forbidden_words` | `type: "forbidden_words"` | `words: string[]` | Flags AI filler phrases ("as an AI model", etc.) |
| `similarity` | `type: "similarity"` | `threshold: 0.8` | Levenshtein similarity against golden output |
| `max_tokens` | `type: "max_tokens"` | `threshold: 200` | Estimated output token ceiling |
| `cost_ceiling` | `type: "cost_ceiling"` | `threshold: 0.02` | Max dollar cost per completion |

---

## CLI Commands

```bash
# Evaluate test suite
npx promptpulse evaluate --config promptpulse.config.json --min-score 90

# Compare two prompts side-by-side
npx promptpulse compare --baseline prompts/v1.txt --candidate prompts/v2.txt

# Start local visual evaluation studio
npx promptpulse studio --port 6060
```

