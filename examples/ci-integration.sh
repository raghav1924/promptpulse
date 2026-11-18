#!/usr/bin/env bash
set -euo pipefail

echo "⚡ Running PromptPulse CI validation pipeline..."
node dist/bin.js --version
echo "✔ PromptPulse executable verified."
