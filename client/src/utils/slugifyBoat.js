export const slugify = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

export const buildBoatSlug = (boat) => {
  const base = slugify(`${boat.title || 'bateau'} ${boat.location || ''}`);
  return `${base}-${boat._id}`;
};
