# Tests de Performance y Carga — [Nombre del Proyecto]

Base URL: https://api.example.com
API Docs: https://docs.example.com/api

<!-- 
  Archivo de definición de casos de test para el agente K6 Standalone.
  
  Formato:
  - Cada ## define un caso de test independiente
  - Campos soportados: título, API URL, Request Method, Response Code,
    Response JSON, Request Body, Headers, Params, Auth, Test Type, Status, Notas
  - Los campos son case-insensitive y el orden es libre
  - Request Body puede ser multilínea (JSON)
  - Status: NOT_IMPLEMENTED (default) | IMPLEMENTED
    * NOT_IMPLEMENTED: el agente generará los .js
    * IMPLEMENTED: el agente saltará este caso (no sobrescribe)
  - Test Type: SMOKE (default) | LOAD | STRESS | SPIKE | SOAK
    * SMOKE: Test rápido para verificación básica (2 VUs, 10s)
    * LOAD: Test de carga normal (10-20 VUs, 60s)
    * STRESS: Test de stress con aumento de VUs (1-100 VUs, 180s)
    * SPIKE: Test de picos repentinos (50 VUs en spike, 120s)
    * SOAK: Test prolongado (5 VUs, 3600s)
  - Si se define "Base URL" en el h1, se usa en los scripts generados
  
  Controles para el agente:
  - Implementar solo NOT_IMPLEMENTADOS (default):
    Implementa los tests del k6-tests.md
  - Implementar caso específico:
    Implementa el caso 1 del k6-tests.md
  - Implementar un tipo específico:
    Implementa los tests SMOKE del k6-tests.md
  - Implementar todos (incluyendo IMPLEMENTED):
    Implementa los tests del k6-tests.md --status ALL
  - Sobrescribir caso ya implementado:
    Implementa el caso 2 --force
-->

## Caso 1
título: GET Obtener Lista de Productos
API URL: /api/products
Request Method: GET
Response Code: 200
Response JSON: 
  - Array de productos con campos: id, name, price, description, stock
  - Cada producto debe tener al menos: id (número), name (string), price (número)
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token} (si aplica auth)
Test Type: SMOKE
Status: NOT_IMPLEMENTED
Notas: Test básico para verificar que el endpoint responde con lista de productos

## Caso 2
título: GET Obtener Producto por ID
API URL: /api/products/{productId}
Request Method: GET
Response Code: 200
Response JSON: Producto individual con id, name, price, description, stock
Headers:
  - Content-Type: application/json
Test Type: SMOKE
Status: NOT_IMPLEMENTED
Notas: Validar que el producto existe y contiene todos los campos esperados

## Caso 3
título: POST Crear Nuevo Producto
API URL: /api/products
Request Method: POST
Request Body:
  {
    "name": "New Product",
    "price": 99.99,
    "description": "Product description",
    "stock": 100
  }
Response Code: 201
Response JSON: Producto creado con id generado automáticamente
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token} (admin token)
Test Type: LOAD
Status: NOT_IMPLEMENTED
Notas: Requiere autenticación con rol admin. Validar ID generado.

## Caso 4
título: PUT Actualizar Producto
API URL: /api/products/{productId}
Request Method: PUT
Request Body:
  {
    "name": "Updated Product",
    "price": 149.99,
    "description": "Updated description",
    "stock": 50
  }
Response Code: 200
Response JSON: Producto actualizado con nuevos valores
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token} (admin token)
Test Type: LOAD
Status: NOT_IMPLEMENTED
Notas: Validar que todos los campos se actualizaron correctamente

## Caso 5
título: DELETE Eliminar Producto
API URL: /api/products/{productId}
Request Method: DELETE
Response Code: 204
Headers:
  - Authorization: Bearer {token} (admin token)
Test Type: LOAD
Status: NOT_IMPLEMENTED
Notas: Después de eliminar, GET al mismo ID debe retornar 404

## Caso 6
título: GET Buscar Productos por Nombre
API URL: /api/products/search
Request Method: GET
Params:
  - q: string (término de búsqueda)
  - limit: number (opcional, default 20)
  - offset: number (opcional, default 0)
Response Code: 200
Response JSON: Array de productos coincidentes con score de relevancia
Headers:
  - Content-Type: application/json
Test Type: SMOKE
Status: NOT_IMPLEMENTED
Notas: Test con múltiples parámetros de búsqueda

## Caso 7
título: GET Listar Productos con Paginación
API URL: /api/products
Request Method: GET
Params:
  - page: number (número de página)
  - limit: number (elementos por página)
Response Code: 200
Response JSON:
  - data: Array de productos
  - pagination: { page, limit, total, pages }
Headers:
  - Content-Type: application/json
Test Type: LOAD
Status: NOT_IMPLEMENTED
Notas: Validar que la paginación funciona correctamente

## Caso 8
título: GET Obtener Productos sin Autenticación
API URL: /api/products
Request Method: GET
Response Code: 401
Headers: (sin Authorization)
Test Type: SMOKE
Status: NOT_IMPLEMENTED
Notas: Test negativo - verificar que requiere autenticación

## Caso 9
título: POST Crear Producto sin Campos Requeridos
API URL: /api/products
Request Method: POST
Request Body:
  {
    "name": "Incomplete"
  }
Response Code: 400
Response JSON: Error message indicando campos faltantes
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token} (admin token)
Test Type: SMOKE
Status: NOT_IMPLEMENTED
Notas: Test negativo - validación de campos requeridos

## Caso 10
título: GET Productos bajo Carga Prolongada
API URL: /api/products
Request Method: GET
Response Code: 200
Headers:
  - Content-Type: application/json
Test Type: SOAK
Status: NOT_IMPLEMENTED
Notas: Test de 1 hora para detectar memory leaks en lectura continuada

---

## Notas adicionales

**Variables de entorno requeridas:**
- `BASE_URL`: URL base de la API (default: https://api.example.com)
- `API_TOKEN`: Token JWT para autenticación (obtenido en setup)
- `ADMIN_TOKEN`: Token con permisos de admin (para operaciones de escritura)
- `DEBUG`: para activar logs detallados (default: false)

**Thresholds esperados:**
- http_req_duration: p(99) < 1000ms (en smoke/load)
- http_req_failed: rate < 1% (en smoke/load), < 5% (en stress/spike)
- checks: rate > 95% (en todos)

**Grupos funcionales detectados:**
- Products API (casos 1-10)

**Flujo de dependencias:**
1. Setup: Autenticación → obtener token
2. Smoke tests: GET (lectura)
3. Load tests: POST, PUT, DELETE (escritura)
4. Stress tests: Aumentar carga de way sostenida
5. Soak test: Verificar estabilidad a largo plazo
