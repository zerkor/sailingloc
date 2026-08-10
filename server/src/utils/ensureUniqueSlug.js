const Boat = require('../models/Boat');

const ensureUniqueBoatSlug = async (baseSlug, excludeBoatId = null) => {
  const rootSlug = baseSlug || 'bateau';
  let candidate = rootSlug;
  let suffix = 2;

  while (
    await Boat.exists({
      slug: candidate,
      ...(excludeBoatId ? { _id: { $ne: excludeBoatId } } : {}),
    })
  ) {
    candidate = `${rootSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

module.exports = { ensureUniqueBoatSlug };
