import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';
const TYPE_ID_OPTIONS = ['CI', 'DNI'];
const BOOK_TITLES = [
  'Libro K6 Auto', 'Test Performance Book', 'Load Test Novel',
  'Stress Test Manual', 'Spike Test Guide', 'Soak Test Diary',
  'VU Generated Book', 'Dynamic Test Book', 'Parallel Read',
  'Concurrent Volume'
];
const READER_NAMES = [
  'VU Reader Alpha', 'VU Reader Beta', 'VU Reader Gamma',
  'VU Reader Delta', 'VU Reader Epsilon', 'VU Reader Zeta',
  'VU Reader Eta', 'VU Reader Theta', 'VU Reader Iota',
  'VU Reader Kappa'
];


function uniqueSuffix() {
  const sn = exec.scenario.name;
  return `${sn}-${__VU}-${__ITER}`;
}

/**
 * Calcula una fecha ISO (YYYY-MM-DD) relativa a hoy.
 * @param {number} daysOffset - Días a sumar (positivo=futuro, negativo=pasado)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function dateFromToday(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

/**
 * Genera datos únicos para POST /loans (Caso 3: TC-HU02-01)
 * Cada VU+iteración produce un id_book e id_reader distinto.
 * 
 * @param {Object} [overrides] - Campos opcionales para sobreescribir
 * @returns {Object} Payload listo para JSON.stringify
 */
export function generateLoanData(overrides = {}) {
  const suffix = uniqueSuffix();
  const idx = (__VU - 1) % TYPE_ID_OPTIONS.length;
  return {
    id_book: `B-K6-${suffix}`,
    title: BOOK_TITLES[(__VU - 1) % BOOK_TITLES.length] + ` ${__ITER}`,
    type_id_reader: TYPE_ID_OPTIONS[idx],
    id_reader: `R-K6-${suffix}`,
    name_reader: READER_NAMES[(__VU - 1) % READER_NAMES.length],
    loan_days: 7,
    ...overrides,
  };
}


export function generateTC_HU02_01() {
  return generateLoanData();
}


/**
 * Patrón setup→action para devoluciones.
 * 
 * Paso 1 (setup, no medido): POST /loans → crea préstamo con IDs únicos
 * Paso 2 (action, medido):   PATCH /loans → devuelve el préstamo
 * 
 * @param {Object} opts
 * @param {number} opts.returnDaysOffset - Días desde hoy para date_return
 * @param {number} [opts.baseFibAmount]  - Monto base Fibonacci (solo para tardías)
 * @param {string} [opts.typeIdReader]   - Tipo de ID del lector
 * @returns {Object} { setupRes, actionRes, loanData, dateReturn }
 */
export function setupAndReturn(opts) {
  const suffix = uniqueSuffix();
  const idx = (__VU - 1) % TYPE_ID_OPTIONS.length;
  
  const loanData = {
    id_book: `B-K6-${suffix}`,
    title: BOOK_TITLES[(__VU - 1) % BOOK_TITLES.length] + ` ${__ITER}`,
    type_id_reader: opts.typeIdReader || TYPE_ID_OPTIONS[idx],
    id_reader: `R-K6-${suffix}`,
    name_reader: READER_NAMES[(__VU - 1) % READER_NAMES.length],
    loan_days: 7,
  };

  const setupRes = http.post(
    `${BASE_URL}/loans`,
    JSON.stringify(loanData),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'setup_create_loan' },
    }
  );

  const setupOk = check(setupRes, {
    '[setup] préstamo creado (201)': (r) => r.status === 201,
  });

  if (!setupOk) {
    return { setupRes, actionRes: null, loanData, dateReturn: null, setupFailed: true };
  }

  const dateReturn = dateFromToday(opts.returnDaysOffset);
  
  const returnPayload = {
    id_book: loanData.id_book,
    id_reader: loanData.id_reader,
    type_id_reader: loanData.type_id_reader,
    date_return: dateReturn,
  };


  if (opts.baseFibAmount !== undefined) {
    returnPayload.base_fib_amount = opts.baseFibAmount;
  }

  const actionRes = http.patch(
    `${BASE_URL}/loans`,
    JSON.stringify(returnPayload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: opts.actionTag || 'return_loan' },
    }
  );

  return { setupRes, actionRes, loanData, dateReturn, setupFailed: false };
}


/**
 * Cadena completa: Crear préstamo → Devolver tarde → Extraer debt_id → Pagar deuda
 * 
 * Paso 1 (setup): POST /loans → crea préstamo
 * Paso 2 (setup): PATCH /loans → devuelve tarde (genera deuda)
 * Paso 3 (setup): Extractar debt_id del response
 * Paso 4 (action, medido): PATCH /debts/:id → paga la deuda
 * 
 * @param {Object} opts
 * @param {number} opts.lateDays       - Días de retraso (para generar deuda)
 * @param {number} opts.baseFibAmount  - Monto base Fibonacci
 * @returns {Object} { payRes, debtId, setupFailed, loanData }
 */
export function setupLateAndPayDebt(opts) {
  const suffix = uniqueSuffix();
  const idx = (__VU - 1) % TYPE_ID_OPTIONS.length;

  const loanData = {
    id_book: `B-K6D-${suffix}`,
    title: `Debt Test Book ${suffix}`,
    type_id_reader: TYPE_ID_OPTIONS[idx],
    id_reader: `R-K6D-${suffix}`,
    name_reader: `Debt Reader ${suffix}`,
    loan_days: 7,
  };

  const createRes = http.post(
    `${BASE_URL}/loans`,
    JSON.stringify(loanData),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'setup_create_loan_for_debt' },
    }
  );

  if (createRes.status !== 201) {
    return { payRes: null, debtId: null, setupFailed: true, loanData, step: 'create' };
  }

  const dateReturn = dateFromToday(7 + opts.lateDays);

  const returnRes = http.patch(
    `${BASE_URL}/loans`,
    JSON.stringify({
      id_book: loanData.id_book,
      id_reader: loanData.id_reader,
      type_id_reader: loanData.type_id_reader,
      date_return: dateReturn,
      base_fib_amount: opts.baseFibAmount || 2.00,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'setup_late_return_for_debt' },
    }
  );

  if (returnRes.status !== 200) {
    return { payRes: null, debtId: null, setupFailed: true, loanData, step: 'return' };
  }

  let debtId = null;
  try {
    const body = JSON.parse(returnRes.body);
    const data = body.data || body;
    debtId = data.id_debt || data.debt_id || data.debtId
      || (data.debt && (data.debt.id_debt || data.debt.debt_id))
      || null;
  } catch {
  }

  if (!debtId) {
    const debtRes = http.get(
      `${BASE_URL}/debts?id_reader=${loanData.id_reader}`,
      { tags: { name: 'setup_get_debt_id' } }
    );
    try {
      const debtBody = JSON.parse(debtRes.body);
      const debts = debtBody.data || debtBody;
      if (Array.isArray(debts) && debts.length > 0) {
        debtId = debts[0].id_debt || debts[0].debt_id;
      }
    } catch {
    }
  }

  if (!debtId) {
    return { payRes: null, debtId: null, setupFailed: true, loanData, step: 'extract_debt_id' };
  }

  const payRes = http.patch(
    `${BASE_URL}/debts/${debtId}`,
    JSON.stringify({ state_debt: 'PAID' }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'pay_debt' },
    }
  );

  return { payRes, debtId, setupFailed: false, loanData, step: 'complete' };
}

export const SEED_DATA = {
  TC_HU01_01: {
    bookName: 'Don Quijote',
    bookNameEncoded: 'Don%20Quijote',
    expectedId: 'B-0001',
    expectedStatus: 'RETURNED',
  },
  TC_HU01_03: {
    bookName: 'Manual de estanterías invisibles',
    bookNameEncoded: 'Manual%20de%20estanter%C3%ADas%20invisibles',
  },
  TC_HU05_01: {
    expectedVencidos: ['B-2001', 'B-2002'],
  },
};
