# PromptPulse Architecture & Design Principles

This document explains the technical architecture, deterministic assertion mechanics, and zero-dependency implementation of **PromptPulse**.

Author: [Jatin Sharma](https://jatinsh.netlify.app/) (`@raghav1924`)

---

## High-Level Architecture

PromptPulse evaluates and compares LLM prompt outputs without sending live credentials or relying on bloated testing libraries:

```
Test Cases (JSON/YAML)
         │
         ▼
 [ Assertion Engine ] ─── Multi-Operator Evaluator
         │
         ├──> JSON Schema Validator (Types, Required, Properties)
         ├──> Regex & Substring Search (Contains, Forbidden Words)
         ├──> Tokenizer & Cost Heuristics (BPE approximation, pricing)
         └──> Levenshtein Similarity Metrics (Output stability)
         │
         ▼
[ Regression Comparator ] ─── Baseline vs Candidate
         │
         ├──> Delta Score Matrix (± Pass Rate)
         ├──> Token Usage Inflation Analysis
         └──> Latency & Cost Projection
         │
         ▼
 ┌───────────────┴───────────────┐
 ▼                               ▼
CLI Evaluation Report        Web Studio Dashboard
(Exit Code 0 / 1)             (Port :6060)
```

---

## 1. Deterministic Multi-Operator Assertions (`src/core/assertions.ts`)

Each assertion operates purely in-memory:
- `json_schema`: Verifies keys, object types, and required fields without requiring third-party libraries like Ajv.
- `contains` / `not_contains`: Case-insensitive substring verification.
- `regex`: Pattern matching for structured identifiers (e.g. tracking codes, dates).
- `forbidden_words`: Detects evasive phrases (e.g. "as an AI language model", "I cannot fulfill").
- `max_tokens` & `cost_ceiling`: Evaluates token ceilings based on BPE heuristic approximations.
- `similarity`: Computes Levenshtein normalized distance to identify behavioral drifts.

---

## 2. Zero External Dependencies Guarantee

PromptPulse is built strictly with Node.js standard modules (`node:fs`, `node:path`, `node:http`, `node:url`). All token estimations, JSON validations, and web dashboards run at native speeds with sub-millisecond evaluation times.
