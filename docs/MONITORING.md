# Observability & Monitoring Guide — PromptPulse

## Health Probes
- **Liveness Probe:** `GET http://localhost:6060/` returns HTTP 200 within 50ms.
- **Readiness Probe:** Process responds immediately with zero pending event loop backlog.

## Telemetry Metrics
- **Heap Allocation:** Typically < 30MB resident memory.
- **Event Loop Latency:** Evaluated under 2ms.
- **Exit Codes:** Non-zero exit codes signal automated CI/CD SLA or security threshold breaches.

---
*Authored by [Jatin Sharma](https://jatinsh.netlify.app/)*
