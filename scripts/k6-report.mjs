import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const input = process.argv[2] || path.join(root, 'load-tests', 'results', 'oral-demo.json');
const output = process.argv[3] || path.join(root, 'load-tests', 'results', 'oral-demo-report.md');

const summary = JSON.parse(readFileSync(input, 'utf8'));
const metrics = summary.metrics || {};
const now = new Date().toISOString();

const value = (metric, key, fallback = 0) => metrics[metric]?.values?.[key] ?? fallback;
const count = (metric) => Math.round(value(metric, 'count'));
const ms = (number) => `${Number(number || 0).toFixed(0)} ms`;
const percent = (number) => `${(Number(number || 0) * 100).toFixed(2)}%`;

const failedRate = value('http_req_failed', 'rate');
const checksRate = value('checks', 'rate');
const p95 = value('http_req_duration', 'p(95)');
const avg = value('http_req_duration', 'avg');

const status =
  failedRate < 0.08 && checksRate > 0.92
    ? 'Acceptable pour une demo MVP sur hebergement gratuit'
    : 'A surveiller: limites atteintes sur hebergement gratuit';

const report = `# Rapport k6 SailingLoc - Demo oral

Date: ${now}

## Objectif

Verifier que les pages publiques et endpoints critiques restent accessibles sous une charge moderee compatible avec Render gratuit.

## Resultats

| Indicateur | Valeur |
| --- | ---: |
| Requetes HTTP | ${count('http_reqs')} |
| Duree moyenne | ${ms(avg)} |
| P95 global | ${ms(p95)} |
| Taux erreurs HTTP | ${percent(failedRate)} |
| Checks reussis | ${percent(checksRate)} |

## Conclusion

${status}.

## Lecture soutenance

Ce test ne valide pas 10 000 utilisateurs pendant 24h. Il valide un parcours public realistement testable sur une infrastructure gratuite. Les tests lourds doivent etre executes sur une infrastructure dediee avec quotas reseau et base de donnees adaptes.
`;

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, report, 'utf8');
console.log(`Rapport k6 genere: ${output}`);
