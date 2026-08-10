import http from 'k6/http';
import { check, group, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com').replace(/\/$/, '');
const vus = Number(__ENV.VUS || 8);
const duration = __ENV.DURATION || '90s';

export const options = {
  scenarios: {
    oral_demo_public_journey: {
      executor: 'constant-vus',
      vus,
      duration,
      gracefulStop: '15s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.08'],
    'http_req_duration{endpoint:home}': ['p(95)<1800'],
    'http_req_duration{endpoint:boats_api}': ['p(95)<1800'],
    'http_req_duration{endpoint:health}': ['p(95)<900'],
    checks: ['rate>0.92'],
  },
};

export default function () {
  group('Public discovery journey', () => {
    const home = http.get(`${baseUrl}/`, { tags: { endpoint: 'home' } });
    check(home, {
      'home returns 200': (response) => response.status === 200,
      'home has html': (response) => String(response.headers['Content-Type'] || '').includes('text/html'),
    });

    const boats = http.get(`${baseUrl}/api/boats?limit=6`, { tags: { endpoint: 'boats_api' } });
    check(boats, {
      'boats api returns 200': (response) => response.status === 200,
      'boats api has payload': (response) => {
        try {
          const body = response.json();
          return Array.isArray(body.boats) || Array.isArray(body);
        } catch {
          return false;
        }
      },
    });

    const health = http.get(`${baseUrl}/api/health`, { tags: { endpoint: 'health' } });
    check(health, {
      'health returns 200': (response) => response.status === 200,
    });
  });

  sleep(1);
}
