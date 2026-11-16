# Changelog

All notable changes to **PromptPulse** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-12

### Added
- Multi-operator assertion engine (`json_schema`, `contains`, `not_contains`, `regex`, `forbidden_words`, `max_tokens`, `cost_ceiling`, `similarity`).
- Variable interpolation for prompt templates (`{{variable}}`).
- Prompt comparison and regression detector comparing baseline against candidate prompts.
- Fast heuristic token estimation and cost calculation across major model pricing tiers.
- Interactive dark-mode Web Studio on port 6060 with live assertion matrix and diff viewer.
- Standalone HTML report exporter for CI/CD workflows.
- Native Node.js test runner suite with 10 passing unit tests.
- Zero runtime external dependencies.


## [1.1.0] - 2026-11-15
### Added
- Multi-operator assertion matrix documentation.
- Side-by-side prompt regression detection guides.
- Token calculation and inference cost models.

## [1.2.0] - 2026-11-16
### Added
- Master design system documentation (Ethereal, Bento Grid).
- Golden dataset curation guide for prompt engineering.
- Token ceiling and multi-model cost optimization strategies.
