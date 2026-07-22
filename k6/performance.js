import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '15s',
  thresholds: {
    http_req_duration: ['p(95)<250'],
    http_req_failed: ['rate<0.01']
  }
};

export default function () {
  const response = http.get('http://127.0.0.1:5173');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'body has Payme': (r) => r.body.includes('Payme')
  });
  sleep(1);
}
