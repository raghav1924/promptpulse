# Prompt Assertion Operators

PromptPulse evaluates LLM output against deterministic criteria:
- `json_schema`: Validates strict JSON response structure and required fields.
- `contains` / `not_contains`: Asserts presence or absence of key phrases.
- `regex`: Pattern matching on structured outputs.
- `similarity`: Cosine/Levenshtein similarity relative to gold benchmark answers.
