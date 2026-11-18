# Security Hardening & Threat Mitigation — PromptPulse

## Defense in Depth Strategies

1. **Non-Root Execution:** The Docker container runs explicitly under user `node` (UID 1000).
2. **Zero Runtime Dependencies:** Zero external npm packages minimizes supply-chain and prototype pollution attack surfaces.
3. **Input Sanitization:** All CLI flags, HTTP parameters, and file inputs undergo strict lexical type checks.
4. **Sandboxed Evaluation:** Unit tests and virtual transports run in-memory without unconstrained socket permissions.

---
*Authored by [Jatin Sharma](https://jatinsh.netlify.app/)*
