import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = (process.env.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com').replace(/\/$/, '');
const outputDir = path.resolve('docs/reports/screenshots');

const pages = [
  ['01-accueil-desktop', '/', { width: 1440, height: 900 }],
  ['02-accueil-mobile', '/', { width: 390, height: 844 }],
  ['03-catalogue-desktop', '/boats', { width: 1440, height: 900 }],
  ['04-catalogue-mobile', '/boats', { width: 390, height: 844 }],
  ['05-connexion', '/login', { width: 1440, height: 900 }],
  ['06-limites-mvp', '/mvp-limitations', { width: 1440, height: 900 }],
  ['07-admin-dashboard-demo-local', '/admin/dashboard?demoRole=admin', { width: 1440, height: 900 }],
  ['08-owner-dashboard-demo-local', '/owner/dashboard?demoRole=owner', { width: 1440, height: 900 }],
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();

for (const [name, route, viewport] of pages) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: true,
  });
  await page.close();
  console.log(`Captured ${name}`);
}

await browser.close();
console.log(`Screenshots saved in ${outputDir}`);
