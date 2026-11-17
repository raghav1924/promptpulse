#!/usr/bin/env node

/**
 * Self-contained health verification script for promptpulse
 * Author: Jatin Sharma (https://jatinsh.netlify.app/)
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

console.log('🔍 Executing health verification for promptpulse...');

// 1. Verify Node version
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18) {
  console.error(`❌ Node.js version >= 18 required. Current: ${process.version}`);
  process.exit(1);
}
console.log(`✔ Node.js runtime compatible (${process.version})`);

// 2. Verify package.json
const pkgPath = join(root, 'package.json');
if (!existsSync(pkgPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
console.log(`✔ Package manifest valid: ${pkg.name} v${pkg.version}`);

console.log('🎉 Health check PASSED: promptpulse is in ready state.');
