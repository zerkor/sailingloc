export const FALLBACK_BOAT_IMAGE = '/images/hero-boat.jpeg';

const isUnreliableRemoteImage = (url = '') => url.includes('images.unsplash.com') || url.includes('source.unsplash.com');

export const getBoatImage = (boat, index = 0) => {
  const image = boat?.images?.[index];
  if (!image || isUnreliableRemoteImage(image)) return FALLBACK_BOAT_IMAGE;
  return image;
};

export const getBoatImages = (boat) => {
  const images = boat?.images?.length ? boat.images : [FALLBACK_BOAT_IMAGE];
  const normalized = images.map((image) => (isUnreliableRemoteImage(image) ? FALLBACK_BOAT_IMAGE : image));
  return [...new Set(normalized)];
};
