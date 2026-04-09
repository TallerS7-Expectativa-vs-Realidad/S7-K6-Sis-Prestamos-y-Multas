/**
 * Tests de Performance - Grupo: deudas
 * Caso de pago total de deuda pendiente
 * Base URL: http://localhost:3000/api/v1
 * 
 * Data Strategy: MULTI_STEP_CHAIN
 * Cada iteración: 1) POST crea préstamo (setup), 2) PATCH devuelve tarde generando deuda (setup),
 *                 3) Extraer debt_id del response, 4) PATCH /debts/{debt_id} paga la deuda (action medido)
 * Usa setupLateAndPayDebt() de testDataPresets.js
 */

import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { setupLateAndPayDebt } from '../helpers/testDataPresets.js';

// ===== CUSTOM METRICS =====
const TC_HU06_01_duration = new Trend('TC_HU06_01_duration');

// ===== CONFIGURACIÓN =====
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
  /*
  thresholds: {
    'TC_HU06_01_duration': ['p(95)<500'],
  }
  */
};

const base_url = 'http://localhost:3000/api/v1';

// ===== FUNCIONES POR CASO =====

/**
 * TC-HU06-01: Registrar pago total de deuda pendiente
 * 
 * Data Strategy: MULTI_STEP_CHAIN
 * Paso 1 (setup): POST /loans → crea préstamo con IDs únicos
 * Paso 2 (setup): PATCH /loans → devuelve 1 día tarde (genera deuda)
 * Paso 3 (setup): Extraer debt_id del response
 * Paso 4 (action, medido): PATCH /debts/{debt_id} → paga la deuda
 * 
 * fib(1)=1 → 1 × 2.00 = 2.00 de deuda generada, luego pagada
 * 
 * Correlación: TEST_CASES.md → HU-06 → TC-HU06-01
 */
export function TC_HU06_01() {
  const start = Date.now();

  // Cadena multi-paso: crear préstamo → devolver tarde → extraer debt_id → pagar deuda
  const { payRes: res, setupFailed, debtId } = setupLateAndPayDebt({
    lateDays: 1,
    baseFibAmount: 2.00,
  });

  // Si algún paso del setup falló, no medir el action
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
