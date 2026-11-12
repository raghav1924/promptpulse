import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TestSuite } from './core/types.js';
import { PromptEvaluator } from './core/evaluator.js';
import { PromptComparator } from './core/diff.js';
import { StudioServer } from './server/studio.js';
import { log, colors } from './utils/logger.js';

interface CliOptions {
  command: string;
  suitePath?: string;
  candidatePath?: string;
  minScore?: number;
  port: number;
  exportHtml?: string;
  jsonOutput: boolean;
  help: boolean;
  version: boolean;
}

export function parseArgs(args: string[]): CliOptions {
  const opts: CliOptions = {
    command: 'studio',
    port: 6060,
    jsonOutput: false,
    help: false,
    version: false,
  };

  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--version' || arg === '-v') {
      opts.version = true;
    } else if (arg === '--json') {
      opts.jsonOutput = true;
    } else if ((arg === '--port' || arg === '-p') && i + 1 < args.length) {
      opts.port = parseInt(args[++i], 10) || 6060;
    } else if ((arg === '--min-score' || arg === '-m') && i + 1 < args.length) {
      opts.minScore = parseInt(args[++i], 10);
    } else if ((arg === '--export' || arg === '-e') && i + 1 < args.length) {
      opts.exportHtml = args[++i];
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    opts.command = positional[0].toLowerCase();
    if (positional.length > 1) {
      opts.suitePath = positional[1];
    }
    if (positional.length > 2) {
      opts.candidatePath = positional[2];
    }
  }

  return opts;
}

function printBanner(): void {
  console.log(`
${colors.magenta}  ▲ PromptPulse v1.0.0${colors.reset}
  ${colors.dim}Deterministic Prompt Regression Tester & Visual Evaluation Studio${colors.reset}
  ${colors.dim}Built by Jatin Sharma (${colors.underline}https://jatinsh.netlify.app/${colors.reset}${colors.dim})${colors.reset}
`);
}

function printHelp(): void {
  printBanner();
  console.log(`
${colors.bold}USAGE:${colors.reset}
  $ promptpulse [command] [options]

${colors.bold}COMMANDS:${colors.reset}
  run <suite.json>          Execute prompt assertion test suite and score reliability
  compare <suite> <prompt>  Compare baseline prompt vs candidate prompt for regressions
  studio [suite.json]       Launch interactive dark-mode Web Studio (default port 6060)
  init                      Scaffold an example prompt evaluation suite and prompt files
  help                      Show this help guide

${colors.bold}OPTIONS:${colors.reset}
  -m, --min-score <n>       Minimum required score (0-100) for CI/CD pipeline pass
  -e, --export <file.html>  Export standalone HTML visual report
  -p, --port <number>       Port for Web Studio (default: 6060)
  --json                    Output machine-readable JSON result
  -h, --help                Show help menu
  -v, --version             Show version number

${colors.bold}EXAMPLES:${colors.reset}
  $ promptpulse run examples/suite.json --min-score 90
  $ promptpulse compare examples/suite.json examples/prompt_v2.txt
  $ promptpulse studio examples/suite.json --port 6060
  $ promptpulse run examples/suite.json --export report.html
`);
}

export function loadSuite(filePath?: string): TestSuite {
  const defaultSuitePath = resolve(process.cwd(), 'examples/suite.json');
  const targetPath = filePath ? resolve(process.cwd(), filePath) : defaultSuitePath;

  if (!existsSync(targetPath)) {
    // If not found, look in relative examples
    const altPath = resolve(process.cwd(), 'examples/suite.json');
    if (existsSync(altPath)) {
      return JSON.parse(readFileSync(altPath, 'utf-8'));
    }
    throw new Error(`Test suite file not found at: ${targetPath}`);
  }

  const content = readFileSync(targetPath, 'utf-8');
  return JSON.parse(content);
}

export async function runCli(rawArgs: string[]): Promise<void> {
  const opts = parseArgs(rawArgs.slice(2));

  if (opts.help || opts.command === 'help') {
    printHelp();
    return;
  }

  if (opts.version || opts.command === 'version') {
    console.log('promptpulse v1.0.0');
    return;
  }

  if (opts.command === 'init') {
    printBanner();
    const dest = resolve(process.cwd(), 'promptpulse-suite.json');
    const defaultData = {
      name: 'Agent Prompt Evaluation Suite',
      systemPrompt: 'You are an AI assistant. Given {{user_query}}, produce a structured answer.',
      model: 'gpt-4o',
      cases: [
        {
          id: 'CASE-01',
          name: 'Basic query test',
          variables: { user_query: 'Explain quantum computing in one sentence.' },
          mockOutput: 'Quantum computing uses quantum mechanics to process complex data exponentially faster than classical computers.',
          assertions: [
            { type: 'contains', value: 'quantum' },
            { type: 'forbidden_words' },
            { type: 'max_tokens', threshold: 50 }
          ]
        }
      ]
    };
    writeFileSync(dest, JSON.stringify(defaultData, null, 2), 'utf-8');
    log.success(`Scaffolded new prompt evaluation suite: ${dest}`);
    return;
  }

  if (opts.command === 'compare') {
    printBanner();
    if (!opts.suitePath || !opts.candidatePath) {
      log.error('Usage: promptpulse compare <suite.json> <candidate_prompt.txt>');
      process.exit(1);
    }

    const suite = loadSuite(opts.suitePath);
    const candidateFile = resolve(process.cwd(), opts.candidatePath);
    if (!existsSync(candidateFile)) {
      log.error(`Candidate prompt file not found: ${candidateFile}`);
      process.exit(1);
    }
    const candidatePrompt = readFileSync(candidateFile, 'utf-8');

    log.info(`Comparing Baseline Prompt vs Candidate Prompt: ${opts.candidatePath}`);
    const comparison = PromptComparator.compare(suite, candidatePrompt, opts.candidatePath);

    console.log(`\n${colors.bold}Comparison Summary:${colors.reset}`);
    console.log(`• Baseline Score:  ${colors.cyan}${comparison.scoreA}%${colors.reset}`);
    console.log(`• Candidate Score: ${comparison.scoreB >= comparison.scoreA ? colors.green : colors.red}${comparison.scoreB}%${colors.reset} (Delta: ${comparison.scoreDelta > 0 ? '+' : ''}${comparison.scoreDelta}%)`);
    console.log(`• Token Usage:     ${comparison.tokensA} ➜ ${comparison.tokensB} (${comparison.tokenDeltaPercent > 0 ? '+' : ''}${comparison.tokenDeltaPercent}%)`);
    console.log(`• Estimated Cost:  $${comparison.costA.toFixed(5)} ➜ $${comparison.costB.toFixed(5)} (${comparison.costDeltaPercent > 0 ? '+' : ''}${comparison.costDeltaPercent}%)\n`);

    if (comparison.regressions.length > 0) {
      console.log(`${colors.red}${colors.bold}⚠️ Regressions Detected (${comparison.regressions.length}):${colors.reset}`);
      for (const reg of comparison.regressions) {
        console.log(`  ${colors.red}✖ [${reg.caseId}] ${reg.caseName}:${colors.reset} ${reg.reason}`);
      }
      process.exit(1);
    } else {
      log.success('Zero regressions detected! Candidate prompt satisfies all baseline test cases.');
    }
    return;
  }

  if (opts.command === 'run') {
    const suite = loadSuite(opts.suitePath);
    const results = PromptEvaluator.evaluateSuite(suite);

    if (opts.jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    printBanner();
    log.info(`Running Evaluation Suite: ${colors.bold}${suite.name}${colors.reset}`);
    console.log(`${colors.dim}Cases: ${suite.cases.length} | Model: ${suite.model || 'gpt-4o'}${colors.reset}\n`);

    for (const r of results.results) {
      const statusPill = r.passed ? `${colors.green}[PASS]${colors.reset}` : `${colors.red}[FAIL]${colors.reset}`;
      console.log(`${statusPill} ${colors.bold}${r.testCase.name}${colors.reset} (${r.tokenCount} tkns, $${r.estimatedCostUsd.toFixed(6)})`);
      for (const a of r.assertionResults) {
        const mark = a.passed ? `${colors.green}✔${colors.reset}` : `${colors.red}✖${colors.reset}`;
        const desc = a.passed ? 'passed' : `${colors.red}${a.reason}${colors.reset}`;
        console.log(`    ${mark} ${a.assertion.type}: ${desc}`);
      }
      console.log('');
    }

    console.log(`${colors.bold}Suite Summary:${colors.reset}`);
    console.log(`• Quality Score:   ${results.score >= 80 ? colors.green : colors.red}${results.score}%${colors.reset}`);
    console.log(`• Test Cases:      ${results.passedCases} passed, ${results.failedCases} failed (Total: ${results.totalCases})`);
    console.log(`• Total Tokens:    ${results.totalTokens}`);
    console.log(`• Estimated Cost:  $${results.totalCostEstimate.toFixed(5)}\n`);

    if (opts.exportHtml) {
      const outPath = resolve(process.cwd(), opts.exportHtml);
      const htmlContent = StudioServer.renderHtml(suite, results);
      writeFileSync(outPath, htmlContent, 'utf-8');
      log.success(`HTML report exported to: ${outPath}`);
    }

    if (opts.minScore !== undefined && results.score < opts.minScore) {
      log.error(`Evaluation failed: Score (${results.score}%) is below minimum required score (${opts.minScore}%)`);
      process.exit(1);
    }
    return;
  }

  // Default: Studio
  printBanner();
  const suite = loadSuite(opts.suitePath);
  StudioServer.serve(suite, opts.port);
}
