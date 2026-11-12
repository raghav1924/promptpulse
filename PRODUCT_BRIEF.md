# Product Brief: PromptPulse ⚡

**Date:** 2026-11-12  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))  
**GitHub:** [@raghav1924](https://github.com/raghav1924)  
**Repository:** [https://github.com/raghav1924/promptpulse](https://github.com/raghav1924/promptpulse)  

---

## 1. Executive Summary

As production engineering teams rapidly deploy Large Language Models (LLMs), AI agents, and Model Context Protocol (MCP) servers, they face a critical operational crisis: **Prompt Regressions & Brittle Prompt Updates**. 

A single tweak to a system prompt or instruction template often leads to downstream failures:
- Broken JSON schemas in structured outputs
- Uncontrolled token bloat inflating API costs by 30-70%
- Accidental hallucination or omission of mandatory safety tags
- Leaked system prompt instructions or forbidden keywords

Existing evaluation tools (such as LangSmith, Braintrust, or promptfoo) are either heavy cloud SaaS platforms requiring paid plans and remote telemetry, or bloated packages with dozens of dependencies.

**PromptPulse** is a lightweight, zero-dependency, developer-first **Prompt Regression Tester, Output Assertion Engine & Interactive Visual Evaluation Studio** built in TypeScript for Node.js. It allows developers to define deterministic prompt test suites, run automated assertions (JSON schema, regex, keyword containment, token thresholds, and cost ceilings), detect regressions across prompt versions, enforce CI/CD gates, and inspect test matrices in a dark-mode Web Studio on `localhost:6060`.

---

## 2. Core Value Propositions

1. **Deterministic Prompt Testing Locally:** Run test suites locally in milliseconds without mandatory cloud accounts or external network egress.
2. **Multi-Faceted Assertion Engine:**
   - `json_schema`: Ensures LLM output parses into valid JSON conforming to expected keys and types.
   - `contains` / `not_contains`: Verifies required citations or disallows sensitive terms.
   - `regex`: Deep pattern validation for formatted outputs (UUIDs, code blocks, URLs).
   - `forbidden_words`: Catches hallucinations, apologetic filler, or leaked system tokens.
   - `max_tokens` & `cost_ceiling`: Flags token bloat and budget overruns per 1,000 requests.
   - `similarity`: Levenshtein distance check against ground-truth golden answers.
3. **Prompt Diff & Regression Engine:** Directly compare Prompt v1 (baseline) vs Prompt v2 (candidate) across test fixtures to measure delta in score, token count, and latency.
4. **Interactive Dark-Mode Web Studio (`:6060`):** Visual matrix dashboard with pass/fail badges, live token counters, side-by-side prompt diffing, and exportable HTML reports.
5. **Zero External Dependencies:** Built with pure TypeScript and Node.js standard libraries (`node:http`, `node:fs`, `node:path`, `node:crypto`) for instant execution and maximum portability.

---

## 3. Architecture & Components

```
promptpulse/
├── src/
│   ├── core/
│   │   ├── types.ts          # Test suites, assertions, results, token heuristics
│   │   ├── tokenizer.ts      # Fast BPE token estimation & pricing models (GPT-4o, Claude 3.5, Gemini 1.5)
│   │   ├── assertions.ts     # Assertion engine with rich diffs & diagnostics
│   │   ├── evaluator.ts      # Test runner with variable interpolation and scoring
│   │   └── diff.ts           # Version comparison and regression detector
│   ├── server/
│   │   └── studio.ts         # Embedded dark-mode HTTP Visual Studio (:6060)
│   ├── utils/
│   │   └── logger.ts         # ANSI terminal logger & formatted test reports
│   ├── tests/
│   │   ├── assertions.test.ts # Unit tests for assertion operators
│   │   ├── tokenizer.test.ts  # Unit tests for token & cost calculators
│   │   └── evaluator.test.ts  # Unit tests for evaluation suite runner
│   ├── cli.ts                # Command-line interface (run, compare, studio, init)
│   ├── index.ts              # Programmatic library exports
│   ├── bin.ts                # Executable binary entry point
│   └── node.d.ts             # Strict Node.js ambient declarations
├── examples/
│   ├── suite.json            # Example evaluation suite for customer-support agent
│   ├── prompt_v1.txt         # Baseline system prompt
│   └── prompt_v2.txt         # Optimized candidate prompt
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

---

## 4. Key Metrics & Success Criteria
- Clean TypeScript compilation with strict mode (`noImplicitAny`, zero warnings).
- 100% passing unit tests via `node --test`.
- Sub-second test suite execution in mock mode.
- Single command execution via `npx promptpulse` or `./dist/bin.js`.
- Standalone HTML report export for CI/CD pipelines.

