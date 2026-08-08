const asyncHandler = require('../utils/asyncHandler');
const Boat = require('../models/Boat');
const Booking = require('../models/Booking');
const slugify = require('../utils/slugify');

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

const generateUniqueBoatSlug = async ({ title, location, currentBoatId }) => {
  const baseSlug = slugify(`${title} ${location}`) || `bateau-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 2;

  while (await Boat.exists({ slug: candidate, ...(currentBoatId ? { _id: { $ne: currentBoatId } } : {}) })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
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
  const filter = { status: 'approved' };
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

  const total = await Boat.countDocuments(filter);
  const boats = await Boat.find(filter)
    .populate('owner', 'firstName lastName')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({ boats, total, page: Number(page), pages: Math.ceil(total / limit) });
});

const getBoatById = asyncHandler(async (req, res) => {
  const boat = await Boat.findById(req.params.id).populate('owner', 'firstName lastName');
  if (!boat) {
    res.status(404);
    throw new Error('Boat not found');
  }
  if (boat.status !== 'approved') {
    const isOwner = req.user && req.user._id.toString() === boat.owner._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(404);
      throw new Error('Boat not found');
    }
  }
  res.json(boat);
});

const getBoatBySlug = asyncHandler(async (req, res) => {
  const identifier = req.params.slug;
  const boat = await Boat.findOne(isMongoId(identifier) ? { _id: identifier } : { slug: identifier }).populate(
    'owner',
    'firstName lastName'
  );

  if (!boat) {
    res.status(404);
    throw new Error('Boat not found');
  }
  if (boat.status !== 'approved') {
    const isOwner = req.user && req.user._id.toString() === boat.owner._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(404);
      throw new Error('Boat not found');
    }
  }
  res.json(boat);
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
  res.json({ message: 'Boat removed' });
});

const getOwnerBoats = asyncHandler(async (req, res) => {
  const boats = await Boat.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json(boats);
});

module.exports = { getBoats, getBoatById, getBoatBySlug, createBoat, updateBoat, deleteBoat, getOwnerBoats };
