import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const options = {
  scenarios: {
    progressive_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 15 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1200'],
    checks: ['rate>0.95'],
  },
};

const BASE_URL = (__ENV.BASE_URL || 'https://sailingloc-uwvo.onrender.com').replace(/\/$/, '');
const boatListLatency = new Trend('boat_list_latency');
const apiFailureRate = new Rate('api_failure_rate');

export default function () {
  const pages = [
    ['home', `${BASE_URL}/`],
    ['boats_page', `${BASE_URL}/boats`],
    ['health', `${BASE_URL}/api/health`],
    ['boats_api', `${BASE_URL}/api/boats?limit=6`],
  ];

  for (const [name, url] of pages) {
    const res = http.get(url, {
      tags: { page: name },
      timeout: '10s',
    });

    if (name === 'boats_api') boatListLatency.add(res.timings.duration);

    const ok = check(res, {
      [`${name}: status is 200`]: (r) => r.status === 200,
      [`${name}: response under 1200ms`]: (r) => r.timings.duration < 1200,
    });

    apiFailureRate.add(!ok);
    sleep(0.5);
  }
}
