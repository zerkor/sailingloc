const baseUrl = (process.env.SERVER_URL || process.env.CLIENT_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com').replace(
  /\/$/,
  ''
);

const checks = [
  ['Frontend', `${baseUrl}/`],
  ['Health API', `${baseUrl}/api/health`],
  ['Boats API', `${baseUrl}/api/boats`],
  ['Swagger', `${baseUrl}/api-docs`],
];

const run = async () => {
  let failed = false;

  for (const [label, url] of checks) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      const ok = response.status >= 200 && response.status < 400;
      console.log(`${ok ? 'OK' : 'FAIL'} ${label}: ${response.status} ${url}`);
      if (!ok) failed = true;
    } catch (error) {
      failed = true;
      console.log(`FAIL ${label}: ${error.message} ${url}`);
    }
  }

  process.exit(failed ? 1 : 0);
};

run();
