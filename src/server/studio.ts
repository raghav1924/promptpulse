import http from 'node:http';
import { URL } from 'node:url';
import { TestSuite, SuiteExecutionResult } from '../core/types.js';
import { PromptEvaluator } from '../core/evaluator.js';
import { PromptComparator } from '../core/diff.js';
import { log, colors } from '../utils/logger.js';

export class StudioServer {
  public static serve(initialSuite: TestSuite, port: number = 6060): void {
    let currentSuite = initialSuite;
    let currentResult: SuiteExecutionResult = PromptEvaluator.evaluateSuite(currentSuite);

    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;
      const method = (req.method || 'GET').toUpperCase();

      // Global CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // REST API: Get current suite & results
      if (pathname === '/api/studio/suite' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ suite: currentSuite, results: currentResult }));
        return;
      }

      // REST API: Run evaluation on updated suite
      if (pathname === '/api/studio/run' && method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            if (data.systemPrompt && data.cases) {
              currentSuite = data;
              currentResult = PromptEvaluator.evaluateSuite(currentSuite);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, results: currentResult }));
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Missing systemPrompt or cases' }));
            }
          } catch (e: any) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
          }
        });
        return;
      }

      // REST API: Compare candidate prompt with current baseline
      if (pathname === '/api/studio/compare' && method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const candidatePrompt = data.candidatePrompt || '';
            const comparison = PromptComparator.compare(currentSuite, candidatePrompt, data.candidateName);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(comparison));
          } catch (e: any) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Comparison error' }));
          }
        });
        return;
      }

      // Serve HTML Studio
      if (pathname === '/' || pathname === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(this.renderHtml(currentSuite, currentResult));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    server.listen(port, () => {
      log.success(`PromptPulse Web Studio live at ${colors.magenta}http://localhost:${port}${colors.reset}`);
    });
  }

  public static renderHtml(suite: TestSuite, result: SuiteExecutionResult): string {
    const serialized = JSON.stringify({ suite, results: result }).replace(/</g, '\\u003c');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromptPulse ⚡ Prompt Regression & Evaluation Studio</title>
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --border: #1f2937;
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.2);
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.5;
    }
    header {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand h1 {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #a78bfa, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
    }
    .badge-author {
      background: #1e1b4b;
      color: #c4b5fd;
      border: 1px solid #4338ca;
      text-decoration: none;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      padding: 1.5rem 2rem;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
    }
    .main-container {
      padding: 0 2rem 2rem 2rem;
    }
    .nav-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1.5rem;
    }
    .nav-tab {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.75rem 1.25rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }
    .nav-tab:hover { color: var(--text); }
    .nav-tab.active {
      color: var(--accent);
      border-bottom: 2px solid var(--accent);
    }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .table-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    th {
      background: #1a2234;
      padding: 0.85rem 1rem;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .pill {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .pill-pass { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .pill-fail { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .assertion-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.5rem;
    }
    .assertion-item {
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .assertion-item.passed { color: #34d399; }
    .assertion-item.failed { color: #f87171; }
    .code-preview {
      background: #090d16;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.8rem;
      max-height: 120px;
      overflow-y: auto;
      white-space: pre-wrap;
    }
    .diff-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .diff-panel {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .btn:hover { background: #7c3aed; }
    textarea {
      width: 100%;
      background: #090d16;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.75rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      resize: vertical;
      min-height: 140px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <h1>▲ PromptPulse</h1>
      <span class="badge" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd;">v1.0.0</span>
      <a href="https://jatinsh.netlify.app/" target="_blank" class="badge badge-author">Built by Jatin Sharma</a>
    </div>
    <div style="display: flex; gap: 0.5rem;">
      <a href="https://github.com/raghav1924/promptpulse" target="_blank" class="btn" style="background: #1f2937; text-decoration: none; font-size: 0.85rem;">GitHub Repo</a>
    </div>
  </header>

  <div class="stats-row">
    <div class="stat-card">
      <span class="stat-label">Prompt Quality Score</span>
      <span class="stat-value" id="score-val" style="color: ${result.score >= 80 ? 'var(--success)' : 'var(--danger)'};">${result.score}%</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Test Cases Passed</span>
      <span class="stat-value" id="passed-val">${result.passedCases} / ${result.totalCases}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Estimated Token Usage</span>
      <span class="stat-value" id="tokens-val">${result.totalTokens.toLocaleString()} tokens</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Estimated Cost / Run</span>
      <span class="stat-value" id="cost-val">$${result.totalCostEstimate.toFixed(5)}</span>
    </div>
  </div>

  <div class="main-container">
    <div class="nav-tabs">
      <button class="nav-tab active" onclick="switchTab('matrix')">Evaluation Matrix</button>
      <button class="nav-tab" onclick="switchTab('diff')">Prompt Version Diff</button>
      <button class="nav-tab" onclick="switchTab('prompt')">System Prompt Inspector</button>
    </div>

    <!-- Tab 1: Matrix -->
    <div id="tab-matrix" class="tab-content active">
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Test Case Name</th>
              <th>Input Variables</th>
              <th>Assertions & Diagnostics</th>
              <th>Model Output</th>
              <th>Tokens / Cost</th>
            </tr>
          </thead>
          <tbody id="matrix-tbody">
            ${result.results.map(r => `
              <tr>
                <td>
                  <span class="pill ${r.passed ? 'pill-pass' : 'pill-fail'}">${r.passed ? 'PASS' : 'FAIL'}</span>
                </td>
                <td style="font-weight: 600;">${r.testCase.name}</td>
                <td>
                  <div class="code-preview">${JSON.stringify(r.testCase.variables, null, 2)}</div>
                </td>
                <td>
                  <div class="assertion-list">
                    ${r.assertionResults.map(a => `
                      <div class="assertion-item ${a.passed ? 'passed' : 'failed'}">
                        <span>${a.passed ? '✔' : '✖'}</span>
                        <strong>${a.assertion.type}</strong>: 
                        ${a.passed ? 'Passed' : `<span style="color:#f87171;">${a.reason}</span>`}
                      </div>
                    `).join('')}
                  </div>
                </td>
                <td>
                  <div class="code-preview">${escapeHtml(r.output)}</div>
                </td>
                <td style="white-space: nowrap;">
                  <div>${r.tokenCount} tkns</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">$${r.estimatedCostUsd.toFixed(6)}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Diff -->
    <div id="tab-diff" class="tab-content">
      <div class="diff-grid">
        <div class="diff-panel">
          <h3 style="margin-bottom: 0.75rem; color: #a78bfa;">Baseline System Prompt (v1)</h3>
          <textarea id="base-prompt-text" readonly>${escapeHtml(suite.systemPrompt)}</textarea>
        </div>
        <div class="diff-panel">
          <h3 style="margin-bottom: 0.75rem; color: #ec4899;">Candidate Prompt (v2)</h3>
          <textarea id="candidate-prompt-text" placeholder="Paste your candidate prompt update here to test for regressions..."></textarea>
          <div style="margin-top: 1rem;">
            <button class="btn" onclick="runComparison()">⚡ Compare & Detect Regressions</button>
          </div>
        </div>
      </div>
      <div id="diff-results" style="margin-top: 1.5rem; display: none;">
        <!-- Filled dynamically -->
      </div>
    </div>

    <!-- Tab 3: System Prompt -->
    <div id="tab-prompt" class="tab-content">
      <div class="diff-panel">
        <h3 style="margin-bottom: 0.75rem;">Active System Prompt</h3>
        <textarea id="active-prompt-edit" style="min-height: 250px;">${escapeHtml(suite.systemPrompt)}</textarea>
        <div style="margin-top: 1rem;">
          <button class="btn" onclick="saveActivePrompt()">Save & Re-evaluate Suite</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const state = ${serialized};

    function switchTab(tabId) {
      document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');
    }

    async function runComparison() {
      const candidate = document.getElementById('candidate-prompt-text').value;
      if (!candidate.trim()) {
        alert('Please enter a candidate prompt to compare!');
        return;
      }

      const res = await fetch('/api/studio/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidatePrompt: candidate, candidateName: 'Candidate v2' })
      });
      const data = await res.json();
      
      const diffContainer = document.getElementById('diff-results');
      diffContainer.style.display = 'block';

      const hasRegressions = data.regressions && data.regressions.length > 0;

      diffContainer.innerHTML = \`
        <div class="stat-card" style="border: 1px solid \${hasRegressions ? 'var(--danger)' : 'var(--success)'};">
          <h3 style="margin-bottom: 0.5rem;">Comparison Metrics</h3>
          <p><strong>Baseline Score:</strong> \${data.scoreA}% ➜ <strong>Candidate Score:</strong> \${data.scoreB}% (Delta: \${data.scoreDelta > 0 ? '+' : ''}\${data.scoreDelta}%)</p>
          <p><strong>Token Delta:</strong> \${data.tokenDeltaPercent}% | <strong>Cost Delta:</strong> \${data.costDeltaPercent}%</p>
          \${hasRegressions ? \`
            <div style="margin-top: 0.75rem; color: #f87171;">
              <strong>⚠️ Regressions Detected (\${data.regressions.length}):</strong>
              <ul>
                \${data.regressions.map(r => \`<li><strong>\${r.caseName}:</strong> \${r.reason}</li>\`).join('')}
              </ul>
            </div>
          \` : \`
            <div style="margin-top: 0.75rem; color: #34d399;">
              <strong>✔ Zero Regressions Detected! Candidate prompt is safe.</strong>
            </div>
          \`}
        </div>
      \`;
    }

    async function saveActivePrompt() {
      const updatedPrompt = document.getElementById('active-prompt-edit').value;
      state.suite.systemPrompt = updatedPrompt;
      const res = await fetch('/api/studio/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.suite)
      });
      if (res.ok) {
        window.location.reload();
      }
    }
  </script>
</body>
</html>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
