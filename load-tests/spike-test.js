import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com';

export const options = {
  stages: [
    { duration: __ENV.RAMP_1 || '1m', target: Number(__ENV.PEAK_1 || 50) },
    { duration: __ENV.HOLD || '2m', target: Number(__ENV.PEAK_2 || 100) },
    { duration: __ENV.RAMP_DOWN || '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/api/health`);
  check(response, { 'health ok': (r) => r.status === 200 });
  sleep(1);
}

// Academic stress profile example:
// k6 run -e PEAK_1=1000 -e PEAK_2=50000 -e RAMP_1=30m -e HOLD=2h load-tests/spike-test.js
