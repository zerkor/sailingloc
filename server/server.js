const { execFileSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./src/app');
const connectDB = require('./src/config/db');
const Boat = require('./src/models/Boat');
const User = require('./src/models/User');

const PORT = process.env.PORT || 5000;

const runDemoSeedIfNeeded = async () => {
  const forceSeed = process.env.DEMO_FORCE_SEED === 'true';
  const seedIfEmpty = process.env.DEMO_SEED_IF_EMPTY !== 'false';

  if (!forceSeed && !seedIfEmpty) return;

  const [adminExists, approvedBoatCount] = await Promise.all([
    User.exists({ email: 'admin@sailingloc.fr', role: 'admin', isActive: true }),
    Boat.countDocuments({ status: 'approved' }),
  ]);

  const shouldSeed = forceSeed || !adminExists || approvedBoatCount === 0;
  if (!shouldSeed) {
    console.log('Demo seed skipped: demo admin and approved boats already exist');
    return;
  }

  console.log(forceSeed ? 'Demo seed forced by DEMO_FORCE_SEED=true' : 'Demo seed required: missing demo data');
  execFileSync(process.execPath, [path.join(__dirname, 'src/seed/seed.js')], {
    cwd: __dirname,
    stdio: 'inherit',
    timeout: 180000,
  });
};

connectDB().then(async () => {
  await runDemoSeedIfNeeded();

  app.listen(PORT, () => {
    console.log(`SailingLoc server running on port ${PORT}`);
  });
});
