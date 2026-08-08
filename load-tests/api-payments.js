import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com';

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const health = http.get(`${baseUrl}/api/health`);
  check(health, { 'api available before payment scenario': (r) => r.status === 200 });
  sleep(1);
}

// Payment mutation tests require a prepared accepted booking and auth token.
// Use API/E2E tests for correctness, then scale this scenario with AUTH_TOKEN and BOOKING_ID fixtures.
