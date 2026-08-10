require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Boat = require('../src/models/Boat');

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_TEST;
const siteUrl = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com').replace(
  /\/$/,
  ''
);
const sitemapPath = path.resolve(__dirname, '../../client/public/sitemap.xml');

const staticRoutes = [
  ['/', 'daily', '1.0'],
  ['/boats', 'daily', '0.9'],
  ['/categories', 'monthly', '0.6'],
  ['/products', 'monthly', '0.5'],
  ['/contact', 'monthly', '0.5'],
  ['/legal/mentions-legales', 'yearly', '0.2'],
  ['/legal/cgu', 'yearly', '0.2'],
  ['/legal/cgv', 'yearly', '0.2'],
  ['/legal/privacy', 'yearly', '0.2'],
  ['/legal/cookies', 'yearly', '0.2'],
  ['/mvp-limitations', 'yearly', '0.2'],
];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlBlock = ([route, changefreq, priority]) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const run = async () => {
  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGO_URI_TEST is required');
  }

  await mongoose.connect(mongoUri);
  const boats = await Boat.find({ status: 'approved', slug: { $exists: true, $ne: '' } })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  const boatRoutes = boats.map((boat) => [`/boats/${boat.slug}`, 'weekly', '0.8']);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...boatRoutes].map(urlBlock).join('\n')}
</urlset>
`;

  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`Sitemap generated: ${sitemapPath}`);
  console.log(`- ${staticRoutes.length} static routes`);
  console.log(`- ${boatRoutes.length} boat slug routes`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
