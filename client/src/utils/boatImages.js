export const FALLBACK_BOAT_IMAGE = '/images/hero-boat.jpeg';

const DEMO_BOAT_IMAGES = {
  sailboat: [
    'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=900&q=85&auto=format&fit=crop',
  ],
  motorboat: [
    'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=85&auto=format&fit=crop',
  ],
  catamaran: [
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588401667987-e06480c453b9?w=900&q=85&auto=format&fit=crop',
  ],
  rib: [
    'https://images.unsplash.com/photo-1524932558893-59ebaffc7d58?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564762861003-b1d22a3e1369?w=900&q=85&auto=format&fit=crop',
  ],
};

const hashString = (value = '') =>
  [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 1000003, 7);

const getDemoImage = (boat, index = 0) => {
  const pool = DEMO_BOAT_IMAGES[boat?.type] || Object.values(DEMO_BOAT_IMAGES).flat();
  const seed = hashString(`${boat?._id || ''}${boat?.title || ''}${boat?.location || ''}`);
  return pool[(seed + index) % pool.length] || FALLBACK_BOAT_IMAGE;
};

const isGenericSeedImage = (image = '') => image === FALLBACK_BOAT_IMAGE || image.endsWith('/images/hero-boat.jpeg');

export const getBoatImage = (boat, index = 0) => {
  const image = boat?.images?.[index];
  if (!image || isGenericSeedImage(image)) return getDemoImage(boat, index);
  return image;
};

export const getBoatImages = (boat) => {
  const images = boat?.images?.length ? boat.images : [FALLBACK_BOAT_IMAGE];
  const normalized = images.map((image, index) => (isGenericSeedImage(image) ? getDemoImage(boat, index) : image));
  return [...new Set(normalized.filter(Boolean))];
};
