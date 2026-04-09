import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { setupLateAndPayDebt } from '../helpers/testDataPresets.js';

const TC_HU06_01_duration = new Trend('TC_HU06_01_duration');

const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    TC_HU06_01: {
      ...optionsGeneral,
      exec: 'TC_HU06_01',
      startTime: '0s'
    },
  },
};

const base_url = 'http://localhost:3000/api/v1';

export function TC_HU06_01() {
  const start = Date.now();

  const { payRes: res, setupFailed, debtId } = setupLateAndPayDebt({
    lateDays: 1,
    baseFibAmount: 2.00,
  });

  if (setupFailed || !res) {
    check(null, {
      '(TC_HU06_01)-----------------------------------------------': () => true === true,
      '(TC_HU06_01) [SKIP] setup chain falló': () => false,
    });
    sleep(1);
    return;
  }

  TC_HU06_01_duration.add(Date.now() - start);

  check(res, {
    '(TC_HU06_01)-----------------------------------------------': () => true === true,
    '(TC_HU06_01) status is 200': (r) => r.status === 200,
    '(TC_HU06_01) success is true': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch {
        return false;
      }
    },
    '(TC_HU06_01) state_debt is PAID': (r) => {
      try {
        const body = JSON.parse(r.body);
        const data = body.data || body;
        return data.state_debt === 'PAID';
      } catch {
        return false;
      }
    },
    '(TC_HU06_01) amount_debt is preserved': (r) => {
      try {
        const body = JSON.parse(r.body);
        const data = body.data || body;
        return parseFloat(data.amount_debt) > 0;
      } catch {
        return false;
      }
    },
    '(TC_HU06_01) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
