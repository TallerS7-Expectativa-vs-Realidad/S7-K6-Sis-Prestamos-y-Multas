/**
 * Orquestrador central — ejecuta todos los grupos de tests
 * Importa funciones desde archivos separados (SIN DUPLICACIÓN)
 * 
 * Ejecutar con: k6 run run-all.js
 */

// ===== PASO 1: IMPORTAR funciones desde los archivos de grupo =====
import { TC_HU01_01, TC_HU01_03 } from './tests/loans-consulta/loans-consulta.js';
import { TC_HU02_01 } from './tests/loans-registro/loans-registro.js';

// ===== PASO 2: CONFIGURAR scenarios que las ejecutan =====
const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    // Loans Consulta: 0-20s
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
    
    // Loans Registro: 20-30s
    TC_HU02_01: {
      ...optionsGeneral,
      exec: 'TC_HU02_01',
      startTime: '20s'
    },
  },
};

// ===== PASO 3: RE-EXPORTAR funciones importadas =====
export { TC_HU01_01, TC_HU01_03, TC_HU02_01 };
