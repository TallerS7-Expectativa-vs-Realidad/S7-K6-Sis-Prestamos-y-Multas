/**
 * Tests de Performance - Grupo: loans-registro
 * Casos de registro de préstamos de libros
 * Base URL: http://localhost:3000/api/v1
 * 
 * IMPORTANTE: Los datos se generan dinámicamente para evitar conflictos
 * cuando múltiples VUs ejecutan en paralelo. Ver helpers/testDataPresets.js
 */

import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';
import { generateTC_HU02_01 } from '../helpers/testDataPresets.js';

// ===== CUSTOM METRICS =====
const TC_HU02_01_duration = new Trend('TC_HU02_01_duration');

// ===== CONFIGURACIÓN =====
const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    TC_HU02_01: {
      ...optionsGeneral,
      exec: 'TC_HU02_01',
      startTime: '0s'
    },
  },
  /*
  thresholds: {
    'TC_HU02_01_duration': ['p(95)<500'],
  }
  */
};

const base_url = 'http://localhost:3000/api/v1';

// ===== FUNCIONES POR CASO =====

/**
 * TC-HU02-01: Registrar préstamo exitoso
 * Verifica que se cree un registro de préstamo exitosamente con los datos esperados
 * 
 * Endpoint: POST /loans
 * Request Body: { id_book, title, type_id_reader, id_reader, name_reader, loan_days }
 * Response: 201 Created con estado ON_LOAN, sin fecha de retorno, plazo de 7 días
 * 
 * Datos dinámicos: Cada VU + iteración genera IDs únicos para evitar conflictos
 * Correlación: TEST_CASES.md → HU-02 → TC-HU02-01
 * 
 * Precondiciones (pre-seed):
 * - Libro disponible (sin préstamo activo)
 * - Lector sin deuda pendiente
 * 
 * Parámetros:
 * - VUs: 10 usuarios virtuales en paralelo
 * - Duración: 10 segundos por VU
 * - Cada iteración crea un préstamo único
 */
export function TC_HU02_01() {
  const start = Date.now();
  const url = `${base_url}/loans`;
  
  // IMPORTANTE: Generar datos dinámicos para cada VU + iteración
  // Evita conflictos de duplicate key cuando múltiples VUs crean préstamos
  const loanData = generateTC_HU02_01();
  
  const payload = JSON.stringify({
    id_book: loanData.id_book,
    title: loanData.title,
    type_id_reader: loanData.type_id_reader,
    id_reader: loanData.id_reader,
    name_reader: loanData.name_reader,
    loan_days: loanData.loan_days
  });
  
  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'TC_HU02_01' },
  });
  
  // DEBUG: Ver qué responde la API cuando falla (quitar después de diagnosticar)
  if (res.status !== 201) {
    console.warn(`[TC_HU02_01] VU=${__VU} ITER=${__ITER} status=${res.status} body=${res.body}`);
  }

  TC_HU02_01_duration.add(Date.now() - start);
  
  check(res, {
    '(TC_HU02_01)-----------------------------------------------': () => true === true,
    '(TC_HU02_01) status is 201': (r) => r.status === 201,
    '(TC_HU02_01) response contains loan record': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'data' in body || 'loans' in body || 'loan' in body || Object.keys(body).length > 0;
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) loan state is ON_LOAN': (r) => {
      try {
        const body = JSON.parse(r.body);
        const resultData = body.data || body.loan || body;
        return resultData && (resultData.state === 'ON_LOAN' || resultData.status === 'ON_LOAN');
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) date_return is null': (r) => {
      try {
        const body = JSON.parse(r.body);
        const resultData = body.data || body.loan || body;
        return resultData && resultData.date_return === null;
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) loan_days is 7': (r) => {
      try {
        const body = JSON.parse(r.body);
        const resultData = body.data || body.loan || body;
        return resultData && resultData.loan_days === 7;
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) date_limit is set (fecha registro + 7 días)': (r) => {
      try {
        const body = JSON.parse(r.body);
        const resultData = body.data || body.loan || body;
        return resultData && ('date_limit' in resultData || 'limit_date' in resultData || 'return_date' in resultData);
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) response includes book information': (r) => {
      try {
        const body = JSON.parse(r.body);
        const resultData = body.data || body.loan || body;
        return resultData && ('id_book' in resultData || 'book_id' in resultData);
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) response includes reader information': (r) => {
      try {
        const body = JSON.parse(r.body);
        const resultData = body.data || body.loan || body;
        return resultData && ('id_reader' in resultData || 'reader_id' in resultData);
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) response time < 500ms': (r) => r.timings.duration < 500,
  });
}
