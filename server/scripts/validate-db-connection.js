require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

const run = async () => {
  if (!uri) {
    console.error('MONGO_URI or MONGO_URI_TEST is required');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    await mongoose.connection.db.admin().ping();
    console.log(`MongoDB connection OK: ${mongoose.connection.host}/${mongoose.connection.name}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

run();
