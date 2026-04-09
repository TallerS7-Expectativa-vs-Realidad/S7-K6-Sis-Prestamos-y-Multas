/**
 * Configuración global para tests K6
 * Sistema de Préstamos y Multas
 */

export const config = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:3000/api/v1',
  apiTimeout: 30000,
  connectTimeout: 10000,
  maxRedirects: 5,
};
