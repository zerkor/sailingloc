import { mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const resultDir = path.join(root, 'load-tests', 'results');
const baseUrl = (process.env.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com').replace(/\/$/, '');
const vus = process.env.VUS || '20';
const duration = process.env.DURATION || '2m';

mkdirSync(resultDir, { recursive: true });

const tests = [
  {
    label: 'Ancien smoke progressif',
    script: 'load-tests/k6/sailingloc-smoke.js',
    output: path.join(resultDir, 'baseline-smoke.json'),
    env: { BASE_URL: baseUrl },
  },
  {
    label: 'Nouveau constant load',
    script: 'load-tests/constant-load.js',
    output: path.join(resultDir, 'optimized-constant.json'),
    env: { BASE_URL: baseUrl, VUS: vus, DURATION: duration },
  },
];

const runK6 = ({ label, script, output, env }) => {
  console.log(`\n=== ${label} ===`);
  console.log(`URL: ${baseUrl}`);
  console.log(`Script: ${script}`);
  const result = spawnSync('k6', ['run', '--summary-export', output, script], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.log(`\n${label} termine avec un code ${result.status}. Le resume est quand meme lu si k6 l'a genere.`);
  }
};

const percent = (value) => `${(Number(value || 0) * 100).toFixed(2)}%`;
const ms = (value) => `${Number(value || 0).toFixed(0)} ms`;

const readSummary = ({ label, output }) => {
  const summary = JSON.parse(readFileSync(output, 'utf8'));
  const metrics = summary.metrics || {};
  return {
    test: label,
    requests: Math.round(metrics.http_reqs?.values?.count || 0),
    avg: ms(metrics.http_req_duration?.values?.avg),
    p90: ms(metrics.http_req_duration?.values?.['p(90)']),
    p95: ms(metrics.http_req_duration?.values?.['p(95)']),
    max: ms(metrics.http_req_duration?.values?.max),
    failureRate: percent(metrics.http_req_failed?.values?.rate),
    checksRate: percent(metrics.checks?.values?.rate),
  };
};

for (const test of tests) {
  runK6(test);
}

const rows = tests.map(readSummary);

console.log('\n=== Comparaison k6 SailingLoc ===');
console.table(rows);
console.log(`JSON generes dans: ${resultDir}`);
console.log('\nLecture rapide: p95 bas = mieux, failureRate bas = mieux, checksRate proche de 100% = mieux.');
