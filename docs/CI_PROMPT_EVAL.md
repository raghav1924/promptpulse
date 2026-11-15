# Continuous Prompt Testing in CI

Run prompt assertion suites on every commit:
```yaml
- name: Evaluate System Prompts
  run: node dist/bin.js test prompts/eval-suite.json --strict
```
