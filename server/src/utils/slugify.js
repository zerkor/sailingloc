const slugify = (value) => {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'bateau';
};

const buildBoatSlug = (title, location) => slugify(`${title || ''} ${location || ''}`);

module.exports = slugify;
module.exports.slugify = slugify;
module.exports.buildBoatSlug = buildBoatSlug;
