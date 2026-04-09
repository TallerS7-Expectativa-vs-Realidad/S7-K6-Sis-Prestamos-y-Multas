/**
 * Tests de Performance - Grupo: loans-vencidos
 * Casos de consulta de préstamos vencidos
 * Base URL: http://localhost:3000/api/v1
 */

import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

// ===== CUSTOM METRICS =====
const TC_HU05_01_duration = new Trend('TC_HU05_01_duration');

// ===== CONFIGURACIÓN =====
const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    TC_HU05_01: {
      ...optionsGeneral,
      exec: 'TC_HU05_01',
      startTime: '0s'
    },
  },
  /*
  thresholds: {
    'TC_HU05_01_duration': ['p(95)<500'],
  }
  */
};

const base_url = 'http://localhost:3000/api/v1';

// ===== FUNCIONES POR CASO =====

/**
 * TC-HU05-01: Consultar préstamos vencidos con resultados
 * Verifica que el endpoint retorna los préstamos con state=ON_LOAN y date_limit vencida
 * 
 * Endpoint: GET /loans/outTime
 * Response: 200 OK con success=true, data con préstamos vencidos del seed (B-2001, B-2002)
 * Data Strategy: READ_ONLY — lectura idempotente, sin conflictos con múltiples VUs
 */
export function TC_HU05_01() {
  const start = Date.now();
  const url = `${base_url}/loans/outTime`;

  const res = http.get(url, {
    tags: { name: 'TC_HU05_01' },
  });

  TC_HU05_01_duration.add(Date.now() - start);

  check(res, {
    '(TC_HU05_01)-----------------------------------------------': () => true === true,
    '(TC_HU05_01) status is 200': (r) => r.status === 200,
    '(TC_HU05_01) response is valid JSON with data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'data' in body;
      } catch {
        return false;
      }
    },
    '(TC_HU05_01) data is an array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch {
        return false;
      }
    },
    '(TC_HU05_01) data contains at least 2 overdue loans': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data) && body.data.length >= 2;
      } catch {
        return false;
      }
    },
    '(TC_HU05_01) all items have state=ON_LOAN': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.every((item) => item.state === 'ON_LOAN');
      } catch {
        return false;
      }
    },
    '(TC_HU05_01) all items have date_return=null': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data.every((item) => item.date_return === null);
      } catch {
        return false;
      }
    },
    '(TC_HU05_01) items expose required fields': (r) => {
      try {
        const body = JSON.parse(r.body);
        const requiredFields = ['loan_id', 'id_book', 'title', 'state', 'id_reader', 'name_reader', 'date_limit', 'date_return'];
        return body.data.every((item) =>
          requiredFields.every((field) => field in item)
        );
      } catch {
        return false;
      }
    },
    '(TC_HU05_01) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
