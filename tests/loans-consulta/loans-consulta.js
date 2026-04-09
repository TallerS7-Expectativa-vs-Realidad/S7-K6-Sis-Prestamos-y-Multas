import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

const TC_HU01_01_duration = new Trend('TC_HU01_01_duration');
const TC_HU01_03_duration = new Trend('TC_HU01_03_duration');

const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    TC_HU01_01: {
      ...optionsGeneral,
      exec: 'TC_HU01_01',
      startTime: '0s'
    },
    TC_HU01_03: {
      ...optionsGeneral,
      exec: 'TC_HU01_03',
      startTime: '10s'
    },
  },
};

const base_url = 'http://localhost:3000/api/v1';

export function TC_HU01_01() {
  const start = Date.now();
  const url = `${base_url}/loans/Don%20Quijote`;
  
  const res = http.get(url, {
    tags: { name: 'TC_HU01_01' },
  });
  
  TC_HU01_01_duration.add(Date.now() - start);
  
  check(res, {
    '(TC_HU01_01)-----------------------------------------------': () => true === true,
    '(TC_HU01_01) status is 200': (r) => r.status === 200,
    '(TC_HU01_01) response contains success field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'success' in body && body.success === true;
      } catch {
        return false;
      }
    },
    '(TC_HU01_01) response contains message': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'message' in body && typeof body.message === 'string';
      } catch {
        return false;
      }
    },
    '(TC_HU01_01) response contains data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'data' in body;
      } catch {
        return false;
      }
    },
    '(TC_HU01_01) data contains at least one result': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data) && body.data.length > 0;
      } catch {
        return false;
      }
    },
    '(TC_HU01_01) result includes Don Quijote book (B-0001)': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.some((item) => item.id === 'B-0001' && item.name === 'Don Quijote');
      } catch {
        return false;
      }
    },
    '(TC_HU01_01) book status is RETURNED': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.some((item) => item.id === 'B-0001' && item.status === 'RETURNED');
      } catch {
        return false;
      }
    },
    '(TC_HU01_01) response time < 500ms': (r) => r.timings.duration < 500,
  });
}

export function TC_HU01_03() {
  const start = Date.now();
  const url = `${base_url}/loans/Manual%20de%20estanter%C3%ADas%20invisibles`;
  
  const res = http.get(url, {
    tags: { name: 'TC_HU01_03' },
  });
  
  TC_HU01_03_duration.add(Date.now() - start);
  
  check(res, {
    '(TC_HU01_03)-----------------------------------------------': () => true === true,
    '(TC_HU01_03) status is 200': (r) => r.status === 200,
    '(TC_HU01_03) response contains success field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'success' in body && body.success === true;
      } catch {
        return false;
      }
    },
    '(TC_HU01_03) response contains message': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'message' in body && typeof body.message === 'string';
      } catch {
        return false;
      }
    },
    '(TC_HU01_03) data is empty array (no loan history)': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data) && body.data.length === 0;
      } catch {
        return false;
      }
    },
    '(TC_HU01_03) message indicates book is available for loan': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.message && body.message.toLowerCase().includes('disponible');
      } catch {
        return false;
      }
    },
    '(TC_HU01_03) response time < 500ms': (r) => r.timings.duration < 500,
  });
}
