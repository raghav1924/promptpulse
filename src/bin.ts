#!/usr/bin/env node
import { runCli } from './cli.js';

runCli(process.argv).catch((err) => {
  console.error('PromptPulse Fatal Error:', err);
  process.exit(1);
});
