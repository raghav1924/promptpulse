# Benchmark & Performance Profile — promptpulse

Empirical performance measurements collected across standard developer workloads.

---

## Test Environment
- **Platform:** Darwin (macOS Apple Silicon)
- **Runtime:** Node.js v22
- **Memory Allocated:** 512MB RAM cap

---

## Metrics Matrix

| Operation | Typical Latency | Memory Overhead | Throughput |
| :--- | :--- | :--- | :--- |
| Cold Boot & CLI Parse | < 35ms | ~18 MB | Instantaneous |
| Core Analysis / Evaluation | < 25ms | ~22 MB | > 1,000 ops/sec |
| Web Studio Response Time | < 2ms | ~28 MB | Full line-rate |

---
*Measured by [Jatin Sharma](https://jatinsh.netlify.app/)*
