import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.post('http://localhost:3000/auth/login',
    '{"email":"demo@datashare.com","password":"password123"}',
    { headers: { 'Content-Type': 'application/json' } }
  );
 
  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
 
  sleep(1);
}
