#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

if (!pkg.name || !pkg.version) {
  console.error('Invalid package manifest');
  process.exit(1);
}
console.log(`✔ Validated ${pkg.name} v${pkg.version} manifest structure`);
