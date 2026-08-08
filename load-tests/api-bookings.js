import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com';

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || '2m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const boats = http.get(`${baseUrl}/api/boats`);
  check(boats, { 'boats listed': (r) => r.status === 200 });
  const data = boats.json();
  const boat = data.boats?.[0];
  if (boat?.slug || boat?._id) {
    const detail = http.get(`${baseUrl}/api/boats/slug/${boat.slug || boat._id}`);
    check(detail, { 'boat detail ok': (r) => r.status === 200 });
  }
  sleep(1);
}
