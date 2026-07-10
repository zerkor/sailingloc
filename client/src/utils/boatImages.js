export const FALLBACK_BOAT_IMAGE = '/images/hero-boat.jpeg';

const hashString = (value = '') =>
  [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 1000003, 7);

const palettes = [
  ['#075985', '#06b6d4', '#ecfeff'],
  ['#064e3b', '#2dd4bf', '#f0fdfa'],
  ['#1e3a8a', '#38bdf8', '#eff6ff'],
  ['#312e81', '#818cf8', '#eef2ff'],
  ['#7c2d12', '#fb923c', '#fff7ed'],
  ['#164e63', '#22d3ee', '#f8fafc'],
];

const typeLabels = {
  sailboat: 'Voilier',
  motorboat: 'Moteur',
  catamaran: 'Catamaran',
  rib: 'Semi-rigide',
};

const buildDemoSvg = (boat, index = 0) => {
  const seed = hashString(`${boat?._id || ''}${boat?.title || ''}${boat?.location || ''}${index}`);
  const [deep, accent, foam] = palettes[seed % palettes.length];
  const title = (boat?.title || typeLabels[boat?.type] || 'SailingLoc').slice(0, 28);
  const label = typeLabels[boat?.type] || 'Bateau';
  const sailOffset = seed % 70;
  const sunX = 650 + (seed % 130);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${foam}"/>
          <stop offset="0.55" stop-color="${accent}"/>
          <stop offset="1" stop-color="${deep}"/>
        </linearGradient>
        <linearGradient id="sea" x1="0" x2="1">
          <stop offset="0" stop-color="${deep}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="900" height="560" fill="url(#sky)"/>
      <circle cx="${sunX}" cy="120" r="54" fill="#fde68a" opacity="0.9"/>
      <path d="M0 300 C140 255 260 330 410 292 C560 255 660 315 900 275 L900 560 L0 560 Z" fill="url(#sea)" opacity="0.96"/>
      <path d="M0 388 C150 360 285 404 430 377 C590 347 710 395 900 365" fill="none" stroke="#ecfeff" stroke-width="8" opacity="0.65"/>
      <path d="M95 450 C240 500 520 498 705 448 C650 510 245 530 130 470 Z" fill="#f8fafc"/>
      <path d="M165 450 C295 482 535 476 680 440 C662 466 614 488 540 499 C380 522 210 502 132 466 Z" fill="#cbd5e1"/>
      <path d="M430 160 L430 432" stroke="#0f172a" stroke-width="10" stroke-linecap="round"/>
      <path d="M438 178 L640 ${320 - sailOffset * 0.25} L438 365 Z" fill="#ffffff" opacity="0.96"/>
      <path d="M420 190 L235 ${350 + sailOffset * 0.2} L420 365 Z" fill="#e0f2fe" opacity="0.97"/>
      <path d="M250 438 L690 438" stroke="#0f172a" stroke-width="9" stroke-linecap="round"/>
      <text x="48" y="72" fill="#07192e" font-size="34" font-family="Arial, sans-serif" font-weight="800">${label}</text>
      <text x="48" y="114" fill="#07192e" font-size="24" font-family="Arial, sans-serif" opacity="0.78">${title}</text>
    </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const getDemoImage = (boat, index = 0) => {
  return buildDemoSvg(boat, index);
};

const isDemoSeedImage = (image = '') =>
  image === FALLBACK_BOAT_IMAGE || image.endsWith('/images/hero-boat.jpeg') || image.includes('images.unsplash.com');

export const getBoatImage = (boat, index = 0) => {
  const image = boat?.images?.[index];
  if (!image || isDemoSeedImage(image)) return getDemoImage(boat, index);
  return image;
};

export const getBoatImages = (boat) => {
  const images = boat?.images?.length ? boat.images : [FALLBACK_BOAT_IMAGE];
  const normalized = images.map((image, index) => (isDemoSeedImage(image) ? getDemoImage(boat, index) : image));
  return [...new Set(normalized.filter(Boolean))];
};
