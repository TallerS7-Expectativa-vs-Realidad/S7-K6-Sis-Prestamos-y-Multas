import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { setupAndReturn } from '../helpers/testDataPresets.js';

const TC_HU04_01_duration = new Trend('TC_HU04_01_duration');
const TC_HU04_05_duration = new Trend('TC_HU04_05_duration');

const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    TC_HU04_01: {
      ...optionsGeneral,
      exec: 'TC_HU04_01',
      startTime: '0s'
    },
    TC_HU04_05: {
      ...optionsGeneral,
      exec: 'TC_HU04_05',
      startTime: '10s'
    },
  },
};

const base_url = 'http://localhost:3000/api/v1';

export function TC_HU04_01() {
  const start = Date.now();

  const { actionRes: res, setupFailed } = setupAndReturn({
    returnDaysOffset: 8,
    baseFibAmount: 2.00,
    actionTag: 'TC_HU04_01',
  });


  if (setupFailed || !res) {
    check(null, {
      '(TC_HU04_01)-----------------------------------------------': () => true === true,
      '(TC_HU04_01) [SKIP] setup falló - préstamo no creado': () => false,
    });
    sleep(1);
    return;
  }
  
  TC_HU04_01_duration.add(Date.now() - start);
  
  check(res, {
    '(TC_HU04_01)-----------------------------------------------': () => true === true,
    '(TC_HU04_01) status is 200': (r) => r.status === 200,
    '(TC_HU04_01) state is RETURNED': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.loan.state === 'RETURNED';
      } catch {
        return false;
      }
    },
    '(TC_HU04_01) days_late is 1': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.days_late === 1;
      } catch {
        return false;
      }
    },
    '(TC_HU04_01) units_fib is 1': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.debt.units_fib === 1;
      } catch {
        return false;
      }
    },
    '(TC_HU04_01) amount_debt is 2.00': (r) => {
      try {
        const body = JSON.parse(r.body);
        return parseFloat(body.data.debt.amount_debt) === 2.00;
      } catch {
        return false;
      }
    },
    '(TC_HU04_01) debt state is PENDING': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.debt && body.data.debt.state_debt === 'PENDING';
      } catch {
        return false;
      }
    },
    '(TC_HU04_01) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}


export function TC_HU04_05() {
  const start = Date.now();
  
  const { actionRes: res, setupFailed } = setupAndReturn({
    returnDaysOffset: 29,
    baseFibAmount: 2.00,
    typeIdReader: 'DNI',
    actionTag: 'TC_HU04_05',
  });

  if (setupFailed || !res) {
    check(null, {
      '(TC_HU04_05)-----------------------------------------------': () => true === true,
      '(TC_HU04_05) [SKIP] setup falló - préstamo no creado': () => false,
    });
    sleep(1);
    return;
  }
  
  TC_HU04_05_duration.add(Date.now() - start);
  
  check(res, {
    '(TC_HU04_05)-----------------------------------------------': () => true === true,
    '(TC_HU04_05) status is 200': (r) => r.status === 200,
    '(TC_HU04_05) days_late is 22': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.days_late === 22;
      } catch {
        return false;
      }
    },
    '(TC_HU04_05) units_fib is 7': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.debt.units_fib === 7;
      } catch {
        return false;
      }
    },
    '(TC_HU04_05) amount_debt is 14.00': (r) => {
      try {
        const body = JSON.parse(r.body);
        return parseFloat(body.data.debt.amount_debt) === 14.00;
      } catch {
        return false;
      }
    },
    '(TC_HU04_05) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
