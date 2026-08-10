import { existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const resultDir = path.join(root, 'load-tests', 'results');
const summaryPath = path.join(resultDir, 'oral-demo.json');

mkdirSync(resultDir, { recursive: true });

const k6 = spawnSync('k6', ['run', '--summary-export', summaryPath, 'load-tests/oral-demo.js'], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (existsSync(summaryPath)) {
  spawnSync('node', ['scripts/k6-report.mjs', summaryPath], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
} else {
  console.log('Aucun resume k6 genere. Verifie la connectivite reseau ou relance depuis ton terminal local.');
}

process.exitCode = k6.status || 0;
