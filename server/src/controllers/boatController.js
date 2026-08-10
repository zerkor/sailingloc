const asyncHandler = require('../utils/asyncHandler');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const { buildBoatSlug } = require('../utils/slugify');
const { ensureUniqueBoatSlug } = require('../utils/ensureUniqueSlug');

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));
const ACTIVE_BOOKING_STATUSES = ['pending', 'accepted', 'confirmed'];
const boatListCache = new Map();
const BOAT_LIST_CACHE_TTL_MS = Number(process.env.BOAT_LIST_CACHE_TTL_MS || 30_000);
const BOAT_LIST_CACHE_ENABLED = process.env.NODE_ENV === 'production';
const PUBLIC_BOAT_FIELDS =
  'owner title slug type description location port pricePerDay capacity length engine skipperAvailable equipments images unavailableDates status averageRating createdAt';

const clearBoatListCache = () => {
  boatListCache.clear();
};

const toDateOnly = (date) => {
  const value = new Date(date);
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
};

const expandDateRange = (startDate, endDate) => {
  const dates = [];
  const cursor = toDateOnly(startDate);
  const end = toDateOnly(endDate);

  while (cursor < end) {
    dates.push(cursor.toISOString());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
};

const withBookedUnavailableDates = async (boat) => {
  const plainBoat = typeof boat.toObject === 'function' ? boat.toObject() : boat;
  const bookings = await Booking.find({
    boat: plainBoat._id,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    endDate: { $gt: new Date() },
  })
    .select('startDate endDate')
    .lean();

  const unavailableDates = new Set((plainBoat.unavailableDates || []).map((date) => new Date(date).toISOString()));
  bookings.forEach((booking) => {
    expandDateRange(booking.startDate, booking.endDate).forEach((date) => unavailableDates.add(date));
  });

  return {
    ...plainBoat,
    unavailableDates: [...unavailableDates],
  };
};

const generateUniqueBoatSlug = ({ title, location, currentBoatId }) =>
  ensureUniqueBoatSlug(buildBoatSlug(title, location), currentBoatId);

const ensureBoatHasSlug = async (boat) => {
  if (!boat || boat.slug) return boat;

  const slug = await generateUniqueBoatSlug({
    title: boat.title,
    location: boat.location,
    currentBoatId: boat._id,
  });

  await Boat.updateOne({ _id: boat._id, $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] }, { slug });

  if (typeof boat.toObject === 'function') {
    boat.slug = slug;
    return boat;
  }

  return { ...boat, slug };
};

const getBoats = asyncHandler(async (req, res) => {
  const {
    location,
    type,
    minPrice,
    maxPrice,
    capacity,
    skipperAvailable,
    startDate,
    endDate,
    page = 1,
    limit = 12,
  } = req.query;
  const cacheKey = JSON.stringify(req.query || {});
  const cached = BOAT_LIST_CACHE_ENABLED ? boatListCache.get(cacheKey) : null;
  if (cached && cached.expiresAt > Date.now()) {
    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return res.json(cached.payload);
  }

  const filter = { status: 'approved' };
  const numericPage = Math.max(Number(page) || 1, 1);
  const numericLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (type) filter.type = type;
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }
  if (capacity) filter.capacity = { $gte: Number(capacity) };
  if (skipperAvailable === 'true') filter.skipperAvailable = true;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
      const bookedBoatIds = await Booking.distinct('boat', {
        status: { $in: ['pending', 'accepted', 'confirmed'] },
        startDate: { $lt: end },
        endDate: { $gt: start },
      });
      filter._id = { $nin: bookedBoatIds };
      filter.unavailableDates = { $not: { $elemMatch: { $gte: start, $lt: end } } };
    }
  }

  const [total, boats] = await Promise.all([
    Boat.countDocuments(filter),
    Boat.find(filter)
      .select(PUBLIC_BOAT_FIELDS)
      .populate('owner', 'firstName lastName')
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const boatsWithSlugs = await Promise.all(boats.map((boat) => ensureBoatHasSlug(boat)));
  const payload = { boats: boatsWithSlugs, total, page: numericPage, pages: Math.ceil(total / numericLimit) };
  if (BOAT_LIST_CACHE_ENABLED) {
    boatListCache.set(cacheKey, { payload, expiresAt: Date.now() + BOAT_LIST_CACHE_TTL_MS });
  }
  res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  res.json(payload);
});

const getBoatByIdentifier = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier || req.params.slug || req.params.id;
  const boat = await Boat.findOne(isMongoId(identifier) ? { _id: identifier } : { slug: identifier }).populate(
    'owner',
    'firstName lastName'
  );

  if (!boat) {
    res.status(404);
    throw new Error('Boat not found');
  }
  if (boat.status !== 'approved') {
    const isOwner = req.user && boat.owner && req.user._id.toString() === boat.owner._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(404);
      throw new Error('Boat not found');
    }
  }
  const boatWithSlug = await ensureBoatHasSlug(boat);
  res.json(await withBookedUnavailableDates(boatWithSlug));
});

const createBoat = asyncHandler(async (req, res) => {
  const {
    title,
    type,
    description,
    location,
    port,
    pricePerDay,
    capacity,
    length,
    engine,
    skipperAvailable,
    equipments,
    images,
  } = req.body;
  const boat = await Boat.create({
    owner: req.user._id,
    title,
    slug: await generateUniqueBoatSlug({ title, location }),
    type,
    description,
    location,
    port,
    pricePerDay,
    capacity,
    length,
    engine,
    skipperAvailable,
    equipments,
    images,
    status: 'pending',
  });
  clearBoatListCache();
  res.status(201).json(boat);
});

const updateBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) {
    res.status(404);
    throw new Error('Boat not found');
  }
  if (boat.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this boat');
  }
  const fields = [
    'title',
    'type',
    'description',
    'location',
    'port',
    'pricePerDay',
    'capacity',
    'length',
    'engine',
    'skipperAvailable',
    'equipments',
    'images',
    'unavailableDates',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) boat[f] = req.body[f];
  });
  if (req.body.title !== undefined || req.body.location !== undefined || !boat.slug) {
    boat.slug = await generateUniqueBoatSlug({
      title: boat.title,
      location: boat.location,
      currentBoatId: boat._id,
    });
  }
  if (boat.status === 'rejected' && req.user.role !== 'admin') boat.status = 'pending';
  const updated = await boat.save();
  clearBoatListCache();
  res.json(updated);
});

const deleteBoat = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id);
  if (!boat) {
    res.status(404);
    throw new Error('Boat not found');
  }
  if (boat.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this boat');
  }
  await boat.deleteOne();
  clearBoatListCache();
  res.json({ message: 'Boat removed' });
});

const getOwnerBoats = asyncHandler(async (req, res) => {
  const boats = await Boat.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(boats);
});

module.exports = {
  getBoats,
  getBoatById: getBoatByIdentifier,
  getBoatBySlug: getBoatByIdentifier,
  getBoatByIdentifier,
  createBoat,
  updateBoat,
  deleteBoat,
  getOwnerBoats,
};
