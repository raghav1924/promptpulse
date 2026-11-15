# Dynamic Template Variable Interpolation

PromptPulse replaces mustache variables:
```json
{
  "template": "Analyze the customer query: {{query}} for tier {{tier}}.",
  "vars": { "query": "Billing issue", "tier": "Enterprise" }
}
```
