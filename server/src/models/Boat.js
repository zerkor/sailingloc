const mongoose = require('mongoose');

const boatSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    type: { type: String, enum: ['sailboat', 'motorboat', 'catamaran', 'rib'], required: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    port: { type: String, trim: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    length: { type: Number },
    engine: { type: String },
    skipperAvailable: { type: Boolean, default: false },
    equipments: [{ type: String }],
    images: [{ type: String }],
    unavailableDates: [{ type: Date }],
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

boatSchema.index({ status: 1, location: 1, type: 1, pricePerDay: 1, capacity: 1 });
boatSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Boat', boatSchema);
