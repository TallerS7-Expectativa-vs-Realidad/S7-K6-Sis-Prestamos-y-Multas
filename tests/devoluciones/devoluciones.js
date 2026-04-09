import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { setupAndReturn } from '../helpers/testDataPresets.js';

const TC_HU03_01_duration = new Trend('TC_HU03_01_duration');

const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    TC_HU03_01: {
      ...optionsGeneral,
      exec: 'TC_HU03_01',
      startTime: '0s'
    },
  },
};

const base_url = 'http://localhost:3000/api/v1';


export function TC_HU03_01() {
  const start = Date.now();
  
  // Setup+Action: crea préstamo con IDs únicos y lo devuelve antes del plazo
  // returnDaysOffset=5: devuelve hoy+5, límite es hoy+7 → 2 días antes
  const { actionRes: res, setupFailed } = setupAndReturn({
    returnDaysOffset: 5,
    actionTag: 'TC_HU03_01',
  });

  // Si el setup falló, no medir el action
  if (setupFailed || !res) {
    check(null, {
      '(TC_HU03_01)-----------------------------------------------': () => true === true,
      '(TC_HU03_01) [SKIP] setup falló - préstamo no creado': () => false,
    });
    return;
  }
  
  TC_HU03_01_duration.add(Date.now() - start);
  
  // DEBUG: Ver qué devuelve la API (quitar después de diagnosticar)
  // if (__ITER < 3) {
  //   console.warn(`[TC_HU03_01] VU=${__VU} ITER=${__ITER} status=${res.status} body=${res.body}`);
  // }

  check(res, {
    '(TC_HU03_01)-----------------------------------------------': () => true === true,
    '(TC_HU03_01) status is 200': (r) => r.status === 200,
    '(TC_HU03_01) response contains loan data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.loan;
      } catch {
        return false;
      }
    },
    '(TC_HU03_01) loan state is RETURNED': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.loan.state === 'RETURNED';
      } catch {
        return false;
      }
    },
    '(TC_HU03_01) date_return is set': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.loan.date_return !== null && body.data.loan.date_return !== undefined;
      } catch {
        return false;
      }
    },
    '(TC_HU03_01) days_late is 0': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.days_late === 0;
      } catch {
        return false;
      }
    },
    '(TC_HU03_01) no debt created': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.debt === null;
      } catch {
        return false;
      }
    },
    '(TC_HU03_01) response time < 500ms': (r) => r.timings.duration < 500,
  });
}
