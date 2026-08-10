require('dotenv').config();
const mongoose = require('mongoose');
const Boat = require('../src/models/Boat');
const { buildBoatSlug } = require('../src/utils/slugify');
const { ensureUniqueBoatSlug } = require('../src/utils/ensureUniqueSlug');

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_TEST;

const run = async () => {
  if (!mongoUri) {
    throw new Error('MONGO_URI or MONGO_URI_TEST is required');
  }

  await mongoose.connect(mongoUri);
  const boats = await Boat.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });

  let created = 0;
  let errors = 0;

  for (const boat of boats) {
    try {
      boat.slug = await ensureUniqueBoatSlug(buildBoatSlug(boat.title, boat.location), boat._id);
      await boat.save();
      created += 1;
    } catch (error) {
      errors += 1;
      console.error(`Slug error for boat ${boat._id}: ${error.message}`);
    }
  }

  console.log('Backfill boat slugs completed:');
  console.log(`- ${boats.length} boats checked`);
  console.log(`- ${created} slugs created`);
  console.log(`- ${errors} errors`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
