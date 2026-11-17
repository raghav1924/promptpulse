# Contributing to promptpulse

Thank you for your interest in contributing to **promptpulse**! We welcome bug fixes, documentation improvements, and feature proposals.

## Development Workflow

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Install dependencies and ensure strict type-checking passes:
   ```bash
   npm run build
   ```
3. Run test suites:
   ```bash
   npm test
   ```
4. Commit your changes using Conventional Commits:
   - `feat:` for new capabilities
   - `fix:` for bug fixes
   - `docs:` for documentation updates
   - `test:` for test additions

## Code Quality Standards
- Pure TypeScript with strict mode enabled.
- Zero external runtime npm dependencies whenever feasible.
- Comprehensive test coverage for all parsing, calculations, and execution paths.

---
*Maintained by [Jatin Sharma](https://jatinsh.netlify.app/)*
