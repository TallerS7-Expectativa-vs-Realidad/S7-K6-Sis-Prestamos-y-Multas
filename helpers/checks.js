/**
 * Checks reutilizables para validación de respuestas
 */

export const commonChecks = {
  status200: (res) => res.status === 200,
  status201: (res) => res.status === 201,
  status204: (res) => res.status === 204,
  hasBody: (res) => res.body && res.body.length > 0,
  hasContentType: (res) => 'content-type' in res.headers,
};

export function validateResponse(res, expectedStatus = 200) {
  return {
    [`Status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'Content-Type present': (r) => 'content-type' in r.headers,
    'Response body not empty': (r) => r.body && r.body.length > 0,
  };
}

export function validateJsonResponse(res, expectedStatus = 200) {
  return {
    [`Status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'Content-Type is JSON': (r) => r.headers['content-type'] && r.headers['content-type'].includes('application/json'),
    'Response body not empty': (r) => r.body && r.body.length > 0,
    'Valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  };
}
