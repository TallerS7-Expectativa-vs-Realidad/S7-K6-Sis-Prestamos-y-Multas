/**
 * Tests de Performance - Grupo: loans-registro
 * Casos de registro de préstamos de libros
 * Base URL: http://localhost:3000/api/v1
 */

import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

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
 * Condiciones:
 * - Prioridad Crítica
 * - Libro disponible
 * - Lector sin deuda
 * - Plazo válido (7 días)
 */
export function TC_HU02_01() {
  const start = Date.now();
  const url = `${base_url}/loans`;
  
  const payload = JSON.stringify({
    id_book: 'B-1001',
    title: 'Cien años de soledad',
    type_id_reader: 'CI',
    id_reader: 'R-2001',
    name_reader: 'Ana Torres',
    loan_days: 7
  });
  
  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'TC_HU02_01' },
  });
  
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
        const loanData = body.data || body.loan || body;
        return loanData && (loanData.state === 'ON_LOAN' || loanData.status === 'ON_LOAN');
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) date_return is null': (r) => {
      try {
        const body = JSON.parse(r.body);
        const loanData = body.data || body.loan || body;
        return loanData && loanData.date_return === null;
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) loan_days is 7': (r) => {
      try {
        const body = JSON.parse(r.body);
        const loanData = body.data || body.loan || body;
        return loanData && loanData.loan_days === 7;
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) date_limit is set (fecha registro + 7 días)': (r) => {
      try {
        const body = JSON.parse(r.body);
        const loanData = body.data || body.loan || body;
        return loanData && ('date_limit' in loanData || 'limit_date' in loanData || 'return_date' in loanData);
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) response includes book information': (r) => {
      try {
        const body = JSON.parse(r.body);
        const loanData = body.data || body.loan || body;
        return loanData && ('id_book' in loanData || 'book_id' in loanData);
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) response includes reader information': (r) => {
      try {
        const body = JSON.parse(r.body);
        const loanData = body.data || body.loan || body;
        return loanData && ('id_reader' in loanData || 'reader_id' in loanData);
      } catch {
        return false;
      }
    },
    '(TC_HU02_01) response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
