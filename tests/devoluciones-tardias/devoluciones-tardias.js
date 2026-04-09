/**
 * Tests de Performance - Grupo: devoluciones-tardias
 * Casos de devolución tardía de préstamos con multa Fibonacci
 * Base URL: http://localhost:3000/api/v1
 * 
 * Data Strategy: SETUP_ACTION
 * Cada iteración: 1) POST crea préstamo dinámico (setup), 2) PATCH devuelve tarde (action medido)
 * Usa setupAndReturn() de testDataPresets.js
 */

import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { setupAndReturn } from '../helpers/testDataPresets.js';

// ===== CUSTOM METRICS =====
const TC_HU04_01_duration = new Trend('TC_HU04_01_duration');
const TC_HU04_05_duration = new Trend('TC_HU04_05_duration');

// ===== CONFIGURACIÓN =====
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
  /*
  thresholds: {
    'TC_HU04_01_duration': ['p(95)<500'],
    'TC_HU04_05_duration': ['p(95)<500'],
  }
  */
};

const base_url = 'http://localhost:3000/api/v1';

// ===== FUNCIONES POR CASO =====

/**
 * TC-HU04-01: Devolución tardía con 1 día de mora (Fibonacci semana 1)
 * 
 * Data Strategy: SETUP_ACTION
 * Paso 1 (setup, no medido): POST /loans → crea préstamo con IDs únicos
 * Paso 2 (action, medido):   PATCH /loans → devuelve 1 día después del límite
 * 
 * loan_days=7 → date_limit=hoy+7 → date_return=hoy+8 → 1 día de mora
 * fib(1)=1 → 1 × 2.00 = 2.00
 * 
 * Correlación: TEST_CASES.md → HU-04 → TC-HU04-01
 */
export function TC_HU04_01() {
  const start = Date.now();
  
  // Setup+Action: crea préstamo con IDs únicos y lo devuelve 1 día tarde
  // returnDaysOffset=8: devuelve hoy+8, límite es hoy+7 → 1 día de mora
  // baseFibAmount=2.00: monto base para cálculo Fibonacci
  const { actionRes: res, setupFailed } = setupAndReturn({
    returnDaysOffset: 8,
    baseFibAmount: 2.00,
    actionTag: 'TC_HU04_01',
  });

  // Si el setup falló, no medir el action
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

/**
 * TC-HU04-05: Devolución tardía con 22 días de mora (semana 4)
 * 
 * Data Strategy: SETUP_ACTION
 * Paso 1 (setup, no medido): POST /loans → crea préstamo con IDs únicos
 * Paso 2 (action, medido):   PATCH /loans → devuelve 22 días después del límite
 * 
 * loan_days=7 → date_limit=hoy+7 → date_return=hoy+29 → 22 días de mora
 * semana 4 → fib(4)=7 → 7 × 2.00 = 14.00
 * 
 * Correlación: TEST_CASES.md → HU-04 → TC-HU04-05
 */
export function TC_HU04_05() {
  const start = Date.now();
  
  // Setup+Action: crea préstamo con IDs únicos y lo devuelve 22 días tarde
  // returnDaysOffset=29: devuelve hoy+29, límite es hoy+7 → 22 días de mora
  // baseFibAmount=2.00: monto base para cálculo Fibonacci
  // typeIdReader='DNI': tipo de ID del lector
  const { actionRes: res, setupFailed } = setupAndReturn({
    returnDaysOffset: 29,
    baseFibAmount: 2.00,
    typeIdReader: 'DNI',
    actionTag: 'TC_HU04_05',
  });

  // Si el setup falló, no medir el action
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
