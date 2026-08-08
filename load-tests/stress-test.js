import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com';

export const options = {
  stages: [
    { duration: '2m', target: Number(__ENV.STEP_1 || 25) },
    { duration: '2m', target: Number(__ENV.STEP_2 || 75) },
    { duration: '2m', target: Number(__ENV.STEP_3 || 150) },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/api/boats`);
  check(response, { 'boats ok': (r) => r.status === 200 });
  sleep(1);
}
