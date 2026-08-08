import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com';
const vus = Number(__ENV.VUS || 20);
const duration = __ENV.DURATION || '5m';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus,
      duration,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const home = http.get(`${baseUrl}/`);
  check(home, { 'home ok': (r) => r.status < 400 });
  const boats = http.get(`${baseUrl}/api/boats`);
  check(boats, { 'boats api ok': (r) => r.status === 200 });
  sleep(1);
}

// Academic target example, not local default:
// k6 run -e BASE_URL=https://... -e VUS=10000 -e DURATION=24h load-tests/constant-load.js
