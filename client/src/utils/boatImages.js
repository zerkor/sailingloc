export const FALLBACK_BOAT_IMAGE = '/images/hero-boat.jpeg';

export const BOAT_IMAGES_BY_TYPE = {
  sailboat: [
    '/images/boats/sailboat/bavaria-cruiser-46.jpg',
    '/images/boats/sailboat/dufour-390.jpg',
    '/images/boats/sailboat/first-36.jpg',
    '/images/boats/sailboat/oceanis-38-1.jpg',
    '/images/boats/sailboat/sun-odyssey-349.jpg',
  ],
  motorboat: [
    '/images/boats/motorboat/beneteau-antares-9.jpg',
    '/images/boats/motorboat/cap-camarat-7-5.jpg',
    '/images/boats/motorboat/jeanneau-leader-30.jpg',
    '/images/boats/motorboat/merry-fisher-895.jpg',
    '/images/boats/motorboat/prestige-420.jpg',
  ],
  catamaran: [
    '/images/boats/catamaran/bali-catspace.jpg',
    '/images/boats/catamaran/fountaine-pajot-isla-40.jpg',
    '/images/boats/catamaran/lagoon-380.jpg',
    '/images/boats/catamaran/lagoon-42.jpg',
    '/images/boats/catamaran/nautitech-46-open.jpg',
  ],
  rib: [
    '/images/boats/rib/bombard-explorer-650.jpg',
    '/images/boats/rib/capelli-tempest-700.jpg',
    '/images/boats/rib/highfield-sport-760.jpg',
    '/images/boats/rib/zar-65-suite.jpg',
    '/images/boats/rib/zodiac-medline-7.jpg',
  ],
};

const hashString = (value = '') => [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 1000003, 7);

const isLegacyDemoImage = (image = '') =>
  image === FALLBACK_BOAT_IMAGE || image.endsWith('/images/hero-boat.jpeg') || image.includes('images.unsplash.com');

const getTypeImages = (type) => BOAT_IMAGES_BY_TYPE[type] || [FALLBACK_BOAT_IMAGE];

const getCategoryImage = (boat, index = 0) => {
  const images = getTypeImages(boat?.type);
  const seed = hashString(`${boat?._id || ''}${boat?.title || ''}${boat?.location || ''}`);
  return images[(seed + index) % images.length];
};

export const getBoatImage = (boat, index = 0) => {
  const image = boat?.images?.[index];
  if (!image || isLegacyDemoImage(image)) return getCategoryImage(boat, index);
  return image;
};

export const getBoatImages = (boat) => {
  const sourceImages = boat?.images?.length ? boat.images : getTypeImages(boat?.type);
  const normalized = sourceImages.map((image, index) =>
    !image || isLegacyDemoImage(image) ? getCategoryImage(boat, index) : image
  );
  return [...new Set(normalized.filter(Boolean))];
};
