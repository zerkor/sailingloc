const { execFile } = require('child_process');
const path = require('path');
const express = require('express');

const router = express.Router();

const runDemoSeed = () =>
  new Promise((resolve, reject) => {
    const seedPath = path.resolve(__dirname, '../seed/seed.js');
    const serverRoot = path.resolve(__dirname, '../..');

    execFile(process.execPath, [seedPath], { cwd: serverRoot, timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });
  });

const seedDemo = async (req, res, next) => {
  try {
    const expectedToken = process.env.DEMO_SEED_TOKEN;
    const providedToken = req.query.token || req.headers['x-demo-seed-token'];

    if (!expectedToken) {
      res.status(404);
      throw new Error('Demo seed endpoint is disabled');
    }

    if (providedToken !== expectedToken) {
      res.status(403);
      throw new Error('Invalid demo seed token');
    }

    const result = await runDemoSeed();

    res.json({
      message: 'Demo database seeded successfully',
      accounts: {
        admin: 'admin@sailingloc.fr / Admin123!',
        owner: 'owner1@sailingloc.fr / Owner123!',
        tenant: 'tenant1@sailingloc.fr / Tenant123!',
      },
      output: result.stdout,
    });
  } catch (error) {
    next(error);
  }
};

router.get('/seed', seedDemo);
router.post('/seed', seedDemo);

module.exports = router;
