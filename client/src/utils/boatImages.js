export const FALLBACK_BOAT_IMAGE = '/images/hero-boat.jpeg';

export const getBoatImage = (boat, index = 0) => {
  const image = boat?.images?.[index];
  return image || FALLBACK_BOAT_IMAGE;
};

export const getBoatImages = (boat) => {
  const images = boat?.images?.length ? boat.images : [FALLBACK_BOAT_IMAGE];
  return [...new Set(images.filter(Boolean))];
};
