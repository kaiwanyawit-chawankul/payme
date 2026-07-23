import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '15s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:5173';

export default function () {
  const response = http.get(TARGET_URL, { timeout: '5s' });
  const body = response.body || '';

  check(response, {
    'status is 200': (r) => r.status === 200,
    'body has Payme': (r) => (r.body || '').includes('Payme')
  });

  sleep(1);
}
