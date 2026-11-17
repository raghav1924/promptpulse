# Architectural Overview — promptpulse

**Category:** AI Quality & Evaluation  
**Core Focus:** Multi-operator prompt assertions, Levenshtein distance, BPE token heuristics  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))

---

## 1. High-Level Design Principles

promptpulse was engineered around three strict software architectural pillars:

1. **Zero External Runtime Dependencies:** Utilizing native Node.js core modules (`node:http`, `node:crypto`, `node:fs`, `node:path`) to minimize supply-chain risk and deliver lightning-fast startup times (<50ms).
2. **Deterministic Execution:** Eliminating flaky heuristics in favor of formal parsing models, mathematical guarantees, and structured rule engines.
3. **Dual Execution Interfaces:** Providing a headless, scriptable CLI suitable for CI/CD gates alongside an embedded visual Web Studio.

---

## 2. Core Subsystems

```
┌────────────────────────────────────────────────────────┐
│                   CLI / Public SDK                     │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     Core Processing     │ │   Embedded Web Studio   │
│   (Parsers, Analyzers,  │ │   (HTML5, CSS3 Grid,    │
│    Engines & Heuristics)│ │    REST API & Telemetry)│
└─────────────────────────┘ └─────────────────────────┘
```

---

## 3. Performance & Memory Profile
- **Memory Footprint:** Typically under 30MB heap during active execution.
- **Cold Startup Time:** Under 40ms.
- **Thread Model:** Non-blocking asynchronous event loop with microtask scheduling.
