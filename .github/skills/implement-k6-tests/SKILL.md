---
name: implement-k6-tests
description: Genera archivos .js ejecutables con K6 Framework desde cualquier fuente de API (URL de docs, Swagger/OpenAPI, definición manual, Postman). Versión standalone independiente de proyectos. Soporta REST, GraphQL, WebSocket y test types SMOKE, LOAD, STRESS, SPIKE, SOAK.
argument-hint: "[--case <número>] [--status NOT_IMPLEMENTED|IMPLEMENTED|ALL] [--force] [--skip-update] [--type smoke|load|stress|spike|soak]"
---

# Implement K6 Tests (Standalone)

Genera archivos `.js` ejecutables por grupo funcional desde cualquier fuente de información de API. No requiere setup previo de proyecto. Solo necesita K6 instalado.

## ⚠️ PASO 0: Verificación previa — OBLIGATORIO


## Lógica de resolución de input

```
¿Qué proporcionó el usuario?
├─ URL de documentación → hacer fetch, parsear HTML, extraer endpoints
├─ Archivo Swagger/OpenAPI (.json/.yaml) → parsear contrato, extraer endpoints + schemas
├─ Archivo local (.md/.json/.txt) → leer y parsear, extraer endpoints
├─ Definición manual en chat → estructurar la información del usuario
├─ Colección Postman (.json) → parsear colección, extraer requests
└─ Nada (sin fuente explícita) → buscar archivo por defecto:
         ├─ ¿Existe k6-tests.md en la raíz? → leer y parsear
         ├─ ¿Existe api-definition.md en la raíz? → leer y parsear
         └─ No existe ninguno → preguntar al usuario qué API quiere testear
```

## Archivo de definición por defecto: `k6-tests.md`

Cuando el usuario no especifica fuente, el agente busca `k6-tests.md` en la raíz del proyecto. Este archivo usa un formato markdown flexible que el agente parsea automáticamente.

### Formato mínimo

Cada caso de test se define como un bloque `##` con campos clave-valor. El agente reconoce los siguientes campos (case-insensitive, orden libre):

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `Status` / `estado` | No | Estado del caso: `NOT_IMPLEMENTED`, `IMPLEMENTED` (default: `NOT_IMPLEMENTED`) |
| `Group` / `grupo` | No | Grupo funcional para agrupación: "products", "auth", "brands", etc. (ej: "products") |
| `título` / `title` | Sí | Nombre descriptivo del caso |
| `API URL` / `url` / `endpoint` | Sí | URL completa o path relativo |
| `Request Method` / `method` | Sí | GET, POST, PUT, DELETE, PATCH |
| `Response Code` / `status` | Sí | Código HTTP esperado |
| `Response JSON` / `response` | No | Descripción o estructura de la respuesta |
| `Request Body` / `body` | No | JSON del body (para POST/PUT/PATCH) |
| `Headers` | No | Headers adicionales requeridos |
| `Params` / `Query Params` | No | Parámetros de query string |
| `Auth` / `Authorization` | No | Tipo de autenticación requerida |
| `Test Type` / `tipo` | No | SMOKE (default), LOAD, STRESS, SPIKE, SOAK |
| `Data Strategy` | No | Estrategia de datos para estrés: `READ_ONLY`, `DYNAMIC_IDS`, `SETUP_ACTION`, `MULTI_STEP_CHAIN` |
| `Notas` / `notes` | No | Información adicional para el agente |

### Ejemplo de `k6-tests.md`

```markdown
# Tests de Performance — Automation Exercise

Base URL: https://automationexercise.com

## Caso 1
título: GET All Products List
API URL: /api/productsList
Request Method: GET
Response Code: 200
Response JSON: Array de productos
Test Type: SMOKE
Status: NOT_IMPLEMENTED

## Caso 2
título: POST Create Account
API URL: /api/createAccount
Request Method: POST
Request Body:
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "pass123"
  }
Response Code: 200
Test Type: LOAD
Status: NOT_IMPLEMENTED

## Caso 3
título: POST Search Product
API URL: /api/searchProduct
Request Method: POST
Request Body: { "search_product": "top" }
Response Code: 200
Test Type: SMOKE
Status: NOT_IMPLEMENTED
```

### Reglas de parsing

1. **`# Título principal`** (h1): nombre del grupo / suite. Si incluye `Base URL:` en esta sección, se usa como baseUrl en config.js.
2. **`## Caso N`** (h2): cada h2 delimita un caso de test independiente.
3. **Campos clave-valor**: el agente busca `campo:` seguido del valor. Acepta variantes en español e inglés.
4. **Request Body multilínea**: si el body ocupa varias líneas, se parsea como JSON hasta el siguiente campo o bloque `##`.
5. **Campos no reconocidos**: se ignoran sin error (el formato es extensible).
6. **Base URL**: si se define en el h1, el agente actualiza `config/config.js`. Si cada caso tiene URL completa, el agente extrae el dominio común como baseUrl.

### Agrupación automática

El agente agrupa los casos por dominio funcional basándose en:
- **Campo `Group`**: si se especifica en k6-tests.md, se usa directamente (ej: "products", "auth", "brands")
- **Prefijo de path común**: `/api/productsList`, `/api/searchProduct` → grupo "products"
- **Palabras clave en el título**: "Products", "Account", "Brand" → un grupo por cada una
- **Test Type**: si especifican tipos distintos, se generan archivos separados por tipo
- **Fallback**: si no puede agrupar, los tests van en un grupo "general"

**Ejemplo de agrupación automática:**
```
Products:
  - API1: GET /api/productsList
  - API2: POST /api/productsList
  - API5: POST /api/searchProduct
  - API6: POST /api/searchProduct (sin param)

Brands:
  - API3: GET /api/brandsList
  - API4: PUT /api/brandsList

Auth:
  - API8: POST /api/verifyLogin
  - API9: DELETE /api/verifyLogin
  - API10: POST /api/verifyLogin (invalid details)
```

## Campo DATA STRATEGY — Estrategia de datos para estrés

Cuando los tests se ejecutan con múltiples VUs e iteraciones (ej: 10 VUs × 10 iter = 100 ejecuciones), las operaciones de escritura (POST, PATCH) necesitan datos únicos para evitar conflictos de duplicados. El campo `Data Strategy` indica al agente qué patrón usar.

| Estrategia | Descripción | Cuándo usar |
|------------|-------------|-------------|
| `READ_ONLY` | Sin datos dinámicos. Lectura idempotente | GET endpoints que no mutan estado |
| `DYNAMIC_IDS` | Generar IDs únicos por VU+iteración | POST que crean registros nuevos |
| `SETUP_ACTION` | Cada iteración: 1) POST crea dato (setup), 2) PATCH lo muta (action medido) | PATCH/PUT que necesitan un registro previo |
| `MULTI_STEP_CHAIN` | Cadena de N pasos setup → acción final medida | Flujos que dependen de múltiples pasos previos |

### Lógica de implementación por estrategia

**READ_ONLY:** Implementar normalmente. Usar datos del seed o URLs estáticas.

**DYNAMIC_IDS:**
```javascript
import { generateLoanData } from '../helpers/testDataPresets.js';

export function TC_CASE() {
  const data = generateLoanData(); // IDs únicos: B-K6-{VU}-{ITER}
  const res = http.post(url, JSON.stringify(data), { headers, tags });
  // checks sobre res...
}
```

**SETUP_ACTION:**
```javascript
import { setupAndReturn } from '../helpers/testDataPresets.js';

export function TC_CASE() {
  const start = Date.now();
  // Setup (POST) + Action (PATCH) en una sola llamada
  const { actionRes: res, setupFailed } = setupAndReturn({
    returnDaysOffset: 5,      // Días desde hoy para date_return
    baseFibAmount: 2.00,      // Solo para devoluciones tardías
    typeIdReader: 'CI',       // Opcional
    actionTag: 'TC_CASE',     // Tag para métricas
  });
  if (setupFailed || !res) {
    check(null, { '[SKIP] setup falló': () => false });
    sleep(1); return;
  }
  customMetric.add(Date.now() - start);
  // checks sobre res...
}
```

**MULTI_STEP_CHAIN:**
```javascript
import { setupLateAndPayDebt } from '../helpers/testDataPresets.js';

export function TC_CASE() {
  const start = Date.now();
  // POST → PATCH late → extract debt_id → PATCH pay
  const { payRes: res, setupFailed, debtId } = setupLateAndPayDebt({
    lateDays: 1,
    baseFibAmount: 2.00,
  });
  if (setupFailed || !res) {
    check(null, { '[SKIP] setup chain falló': () => false });
    sleep(1); return;
  }
  customMetric.add(Date.now() - start);
  // checks sobre res...
}
```

### Reglas del campo Data Strategy

1. Si el campo NO está presente → asumir `READ_ONLY` para GET, `DYNAMIC_IDS` para POST/PUT/DELETE/PATCH
2. Si está presente → **OBLIGATORIO** usar el patrón indicado
3. Las funciones helper están en `tests/helpers/testDataPresets.js`
4. El campo `Request Body` con valores `(dinámico)` indica que los datos se generan en runtime
5. Las `Notas` del caso contienen el nombre exacto de la función helper y sus parámetros

## Campo STATUS

El agente respeta el estado de cada caso para decidir si implementarlo:

| Estado | Comportamiento |
|--------|----------------|
| `NOT_IMPLEMENTED` | Se implementa por defecto |
| `IMPLEMENTED` | Se omite por defecto (no se sobrescribe) |

### Lógica de decisión

```
FOR cada caso en k6-tests.md:
  READ status = case.STATUS (default: NOT_IMPLEMENTED)
  
  IF status == IMPLEMENTED:
    SKIP - No generar, no sobrescribir
  ELSE:
    GENERATE .js normalmente
    UPDATE k6-tests.md: Status = IMPLEMENTED
```

### Flags de control

| Flag | Propósito | Ejemplo |
|------|-----------|---------|
| `--case <número>` | Implementar solo un caso | `--case 1` |
| `--status ALL` | Implementar todos sin importar estado | `--status ALL` |
| `--force` | Sobrescribir casos IMPLEMENTED | `--force` |
| `--skip-update` | No actualizar el STATUS en k6-tests.md | `--skip-update` |
| `--type <tipo>` | Generar solo un tipo de test | `--type load` (solo load tests) |

### Ejemplos de uso

**Implementar solo NOT_IMPLEMENTED (default):**
```
Implementa los tests del k6-tests.md
```

**Implementar caso específico:**
```
Implementa el caso 1 del k6-tests.md
```

**Implementar solo SMOKE tests:**
```
Implementa los tests del k6-tests.md --type smoke
```

**Implementar todos sin importar estado:**
```
Implementa los tests del k6-tests.md --status ALL
```

**Sobrescribir un caso ya implementado:**
```
Implementa el caso 2 --force
```

**Mostrar estado actual:**
```
Muestra el status de los tests del k6-tests.md
```

## Proceso de generación

### Paso 1: Descubrir endpoints

Según la fuente, extraer para cada endpoint:
- **URL / path**: `/api/productsList`
- **Método HTTP**: GET, POST, PUT, DELETE, PATCH
- **Request body** (si aplica): campos, tipos, required/optional
- **Response esperada**: status code, estructura JSON
- **Headers requeridos**: autenticación, content-type
- **Parámetros**: path params, query params

#### Parsing de URL de documentación

Cuando la fuente es una URL:
1. Hacer `fetch` de la URL
2. Parsear el HTML para extraer tablas o listas de APIs
3. Buscar patrones como:
   - "API URL:", "Request Method:", "Response Code:"
   - Tablas con columnas de endpoint, método, descripción
   - Bloques de código con curl o request examples
4. Si la página no es parseable, pedir al usuario que copie la información

#### Parsing de Swagger/OpenAPI

Cuando la fuente es un archivo OpenAPI:
1. Leer el archivo `.json` o `.yaml`
2. Extraer `paths` con sus operaciones
3. Extraer `schemas` / `definitions` para request/response bodies
4. Extraer `securityDefinitions` para autenticación
5. Mapear `tags` a grupos funcionales

### Paso 2: Agrupar por dominio

Organizar los endpoints en grupos funcionales:
- Por recurso: todos los endpoints de `/api/products*` → grupo "products"
- Por tag (si Swagger): usar los tags definidos
- Por prefijo de path: `/users/*`, `/orders/*`, etc.

### Paso 3: Generar archivos .js organizados por grupo funcional

✅ **IMPORTANTE:** Los tests se generan en **MÚLTIPLES ARCHIVOS** organizados por grupo funcional:

```
tests/
├── products/
│   ├── products.js           # API1, API2, API5, API6
│   └── config.js             # configuración reutilizable
├── brands/
│   ├── brands.js             # API3, API4
│   └── config.js
├── auth/
│   ├── auth.js               # API8, API9, API10
│   └── config.js
└── helpers/
    ├── checks.js             # checks reutilizables
    ├── utils.js              # utilidades comunes
    └── auth.js               # helpers de autenticación (si es necesario)

run-all.js                     # Orquestador: ejecuta todos los grupos secuencialmente
k6-tests.md                    # Definición de tests (actualizado con Status)
```

**Ventajas de esta estructura:**
- 📁 **Mantenibilidad**: cada grupo es independiente
- 🔧 **Escalabilidad**: agregar nuevo endpoint es agregar a su grupo
- 🎯 **Ejecución selectiva**: `k6 run tests/products/products.js` solo products
- 📊 **Métricas claras**: cada grupo reporta sus propias métricas
- 🔗 **Config reutilizable**: helpers/config.js para todas las APIs

#### Estructura de cada archivo de grupo (ej: `tests/products/products.js`)

```javascript
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

// ===== CUSTOM METRICS =====
const api1Duration = new Trend('products_api1_duration');
const api2Duration = new Trend('products_api2_duration');
const api5Duration = new Trend('products_api5_duration');
const api6Duration = new Trend('products_api6_duration');

// ===== CONFIGURACIÓN =====
const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    API1: {
      ...optionsGeneral,
      exec: 'API1_GetAllProductsList',
      startTime: '0s'
    },
    API2: {
      ...optionsGeneral,
      exec: 'API2_PostToAllProductsList',
      startTime: '10s'
    },
    API5: {
      ...optionsGeneral,
      exec: 'API5_PostSearchProduct',
      startTime: '20s'
    },
    API6: {
      ...optionsGeneral,
      exec: 'API6_PostSearchProductWithoutParam',
      startTime: '30s'
    },
  },
  // Thresholds comentados por defecto
  /*
  thresholds: {
    'products_api1_duration': ['p(95)<500'],
    'products_api2_duration': ['p(95)<500'],
    'products_api5_duration': ['p(95)<500'],
    'products_api6_duration': ['p(95)<500']
  }
  */
};

const base_url = 'https://automationexercise.com/api';

// ===== FUNCIONES POR CASO =====

export function API1_GetAllProductsList() {
  const start = Date.now();
  const url = `${base_url}/productsList`;
  const res = http.get(url, { tags: { name: 'API1_Products' } });
  
  api1Duration.add(Date.now() - start);
  
  check(res, {
    '(Products/API1)-----------------------------------------------': () => true === true,
    '(Products/API1) status is 200': (r) => r.status === 200,
    '(Products/API1) response includes products': (r) => r.body.includes('"products":'),
    '(Products/API1) products array > 0': (r) => JSON.parse(r.body).products.length > 0,
    '(Products/API1) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}

export function API2_PostToAllProductsList() {
  const start = Date.now();
  const url = `${base_url}/productsList`;
  const res = http.post(url, 'This request method is not supported', {
    tags: { name: 'API2_Products' }
  });
  
  api2Duration.add(Date.now() - start);
  
  check(res, {
    '(Products/API2)-----------------------------------------------': () => true === true,
    '(Products/API2) status is 405': (r) => r.status === 405,
    '(Products/API2) response includes error message': (r) => r.body.includes('This request method is not supported'),
    '(Products/API2) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}

export function API5_PostSearchProduct() {
  const start = Date.now();
  const url = `${base_url}/searchProduct`;
  const payload = 'search_product=top';
  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    tags: { name: 'API5_Products' }
  });
  
  api5Duration.add(Date.now() - start);
  
  check(res, {
    '(Products/API5)-----------------------------------------------': () => true === true,
    '(Products/API5) status is 200': (r) => r.status === 200,
    '(Products/API5) response includes products': (r) => r.body.includes('products'),
    '(Products/API5) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}

export function API6_PostSearchProductWithoutParam() {
  const start = Date.now();
  const url = `${base_url}/searchProduct`;
  const res = http.post(url, '', {
    tags: { name: 'API6_Products' }
  });
  
  api6Duration.add(Date.now() - start);
  
  check(res, {
    '(Products/API6)-----------------------------------------------': () => true === true,
    '(Products/API6) status is 400': (r) => r.status === 400,
    '(Products/API6) response includes error': (r) => r.body.includes('error'),
    '(Products/API6) response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Ejecución de un grupo específico:**
```bash
# Solo tests de Products
k6 run tests/products/products.js

# Solo tests de Auth
k6 run tests/auth/auth.js

# Solo tests de Brands
k6 run tests/brands/brands.js
```

#### Archivo orquestador: `run-all.js` (en la raíz)

⚠️ **PATRÓN SIN DUPLICACIÓN:** El orquestador IMPORTA funciones de los archivos de grupo, en lugar de duplicarlas.

```javascript
/**
 * Orquestador central — importa tests desde archivos separados
 * SIN DUPLICACIÓN: single source of truth
 */

// ===== PASO 1: IMPORTAR funciones desde los archivos de grupo =====
import {
  API1_GetAllProductsList,
  API2_PostToAllProductsList,
  API5_PostSearchProduct,
  API6_PostSearchProductWithoutParam
} from './tests/products/products.js';

import {
  API3_GetAllBrandsList,
  API4_PutBrandsList
} from './tests/brands/brands.js';

import {
  API8_PostVerifyLoginWithoutEmail,
  API9_DeleteToVerifyLogin,
  API10_PostToVerifyLoginWithInvalidDetails
} from './tests/auth/auth.js';

// ===== PASO 2: CONFIGURAR scenarios que las ejecutan =====
const optionsGeneral = {
  executor: 'constant-vus',
  vus: 10,
  duration: '10s',
};

export const options = {
  scenarios: {
    // Scenarios que ejecutan las funciones IMPORTADAS (sin duplicar código)
    ProductsAPI1: { ...optionsGeneral, exec: 'ProductsAPI1_GetAllProductsList', startTime: '0s' },
    ProductsAPI2: { ...optionsGeneral, exec: 'ProductsAPI2_PostToAllProductsList', startTime: '10s' },
    ProductsAPI5: { ...optionsGeneral, exec: 'ProductsAPI5_PostSearchProduct', startTime: '20s' },
    ProductsAPI6: { ...optionsGeneral, exec: 'ProductsAPI6_PostSearchProductWithoutParam', startTime: '30s' },
    
    BrandsAPI3: { ...optionsGeneral, exec: 'BrandsAPI3_GetAllBrandsList', startTime: '40s' },
    BrandsAPI4: { ...optionsGeneral, exec: 'BrandsAPI4_PutBrandsList', startTime: '50s' },
    
    AuthAPI8: { ...optionsGeneral, exec: 'AuthAPI8_PostVerifyLoginWithoutEmail', startTime: '60s' },
    AuthAPI9: { ...optionsGeneral, exec: 'AuthAPI9_DeleteToVerifyLogin', startTime: '70s' },
    AuthAPI10: { ...optionsGeneral, exec: 'AuthAPI10_PostToVerifyLoginWithInvalidDetails', startTime: '80s' },
  },
};

// ===== PASO 3: RE-EXPORTAR con alias para que los scenario names coincidan =====
// K6 necesita que los nombres de funciones exportadas coincidan con el nombre en 'exec'
export {
  API1_GetAllProductsList as ProductsAPI1_GetAllProductsList,
  API2_PostToAllProductsList as ProductsAPI2_PostToAllProductsList,
  API5_PostSearchProduct as ProductsAPI5_PostSearchProduct,
  API6_PostSearchProductWithoutParam as ProductsAPI6_PostSearchProductWithoutParam,
  
  API3_GetAllBrandsList as BrandsAPI3_GetAllBrandsList,
  API4_PutBrandsList as BrandsAPI4_PutBrandsList,
  
  API8_PostVerifyLoginWithoutEmail as AuthAPI8_PostVerifyLoginWithoutEmail,
  API9_DeleteToVerifyLogin as AuthAPI9_DeleteToVerifyLogin,
  API10_PostToVerifyLoginWithInvalidDetails as AuthAPI10_PostToVerifyLoginWithInvalidDetails
};
```

**Ventajas de este patrón (SIN duplicación):**
- ✅ **DRY**: Una sola fuente de verdad (cambios solo en `tests/<grupo>/<grupo>.js`)
- ✅ **Sincronizado**: Editar en `tests/products/products.js` se refleja automáticamente
- ✅ **Menor tamaño**: `run-all.js` es ~50 líneas en lugar de 500+
- ✅ **Mantenible**: No hay código duplicado que mantener
- ✅ **Consolidado**: K6 reporta todas las métricas en un solo output

**Comparación:**

| Aspecto | ❌ Con duplicación | ✅ Sin duplicación |
|--------|---|---|
| Líneas en run-all.js | 500+ | ~50 |
| Fuentes de verdad | 3 (run-all.js + grupo) | 1 (grupo) |
| Cambios sincronizados | Manual | Automático |
| Riesgo de inconsistencia | Alto | Bajo |

**Ejecución del orquestador:**
```bash
# Ejecutar TODOS los grupos (90 segundos total: 9 APIs × 10s cada una)
k6 run run-all.js

# Con parámetros custom
k6 run run-all.js --vus 20 --duration 15s

# Ver métricas de cada grupo:
# ✓ products_api1_duration: avg=150ms, p(95)=250ms
# ✓ products_api2_duration: avg=120ms, p(95)=200ms
# ✓ brands_api3_duration: avg=180ms, p(95)=300ms
# ✓ auth_api8_duration: avg=200ms, p(95)=350ms
```

**Estructura final de la solución:**
```
K6/
├── tests/
│   ├── products/
│   │   └── products.js            # Exporta funciones (source of truth)
│   ├── brands/
│   │   └── brands.js              # Exporta funciones (source of truth)
│   ├── auth/
│   │   └── auth.js                # Exporta funciones (source of truth)
│   ├── helpers/
│   │   └── checks.js              # Checks reutilizables
│   └── config.js                  # Configuración compartida
├── run-all.js                      # Orquestador (IMPORTA del source)
├── k6-tests.md                     # Definición (actualizado con Status)
├── results.json                    # Resultados de ejecución
└── html-report.html                # Reporte visual
```

### ⚠️ PASO CRÍTICO — ACTUALIZAR run-all.js (OBLIGATORIO)

**Cada vez que se generan nuevos archivos de grupo o se agreguen nuevos casos, el orquestador `run-all.js` DEBE ser actualizado.**

**Algoritmo de actualización:**

1. **Descubrir nuevos grupos**: Listar carpetas en `tests/` que contienen `.js`
2. **Extraer funciones**: Leer cada archivo `.js` y extraer nombres de funciones exportadas
3. **Actualizar imports**: Agregar/actualizar imports para grupos nuevos
   ```javascript
   import { TC_HU02_01, TC_HU02_02 } from './tests/loans-registro/loans-registro.js';
   ```
4. **Agregar scenarios**: Crear scenarios con `startTime` incremental (10s por caso anterior)
   ```javascript
   LoansRegistroCase1: { ...optionsGeneral, exec: 'LoansRegistroCase1_TC_HU02_01', startTime: '20s' }
   ```
5. **Actualizar re-exports**: Que nombres en `export` coincidan con `exec` en scenarios
   ```javascript
   export { TC_HU02_01 as LoansRegistroCase1_TC_HU02_01 }
   ```
6. **Validar**: Todos los scenarios tienen un re-export correspondiente

**Impacto de NO actualizar run-all.js:**
- ❌ Los nuevos tests NO se ejecutan
- ❌ run-all.js queda inconsistente con los archivos de grupo
- ❌ Ejecución aislada (`k6 run tests/grupo/grupo.js`) funciona, pero orquestador falla

**Resultado esperado después de actualizar:**
- ✅ Los nombres en `exec` coinciden con funciones re-exportadas
- ✅ `startTime` está distribuido secuencialmente (0s, 10s, 20s, ...)
- ✅ Ejecución: `k6 run run-all.js` funciona perfectamente
- ✅ Todas las métricas se reportan consolidadas

### Paso 4: Generar archivos de configuración


#### `config/config.js`

```javascript
export const config = {
  baseUrl: __ENV.BASE_URL || 'https://api.example.com',
  apiTimeout: 30000,
  email: __ENV.TEST_EMAIL || 'testuser@example.com',
  password: __ENV.TEST_PASSWORD,
  apiKey: __ENV.API_KEY,
  connectTimeout: 10000,
  maxRedirects: 5,
};
```

### Paso 5: Generar helpers reutilizables

#### `helpers/auth.js` — si la API requiere autenticación

```javascript
import http from 'k6/http';
import { check, fail } from 'k6';
import { config } from '../config/config.js';

export function login(email, password) {
  const res = http.post(
    `${config.baseUrl}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!check(res, { 'Login OK': (r) => r.status === 200 })) {
    fail(`Login failed: ${res.status}`);
  }
  
  return res.json().token;
}

export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}
```

#### `helpers/utils.js` — funciones reutilizables

```javascript
export function generateRandomEmail() {
  return `user_${Date.now()}@test.com`;
}

export function generateTestData() {
  return {
    name: `Test ${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
}
```

#### `helpers/checks.js` — checks reutilizables

```javascript
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
```

## Patrones de scripts .js

### Patrón estándar: Funciones separadas por caso

**Estructura recomendada:** Cada caso es una función distinta llamada desde `default()`.

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 2,
  duration: '10s',
};

const base_url = __ENV.BASE_URL || 'https://api.example.com';

export default function () {
  // Llamar cada caso como función separada
  API1_GetProductsList();
  API2_PostProductsSearch();
}

// Función para Caso 1
function API1_GetProductsList() {
  const url = `${base_url}/api/products`;
  const res = http.get(url);
  check(res, {
    'API1 - status 200': (r) => r.status === 200,
    'API1 - response not empty': (r) => r.body.length > 0,
    'API1 - has products field': (r) => r.body.includes('products'),
    'API1 - response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}

// Función para Caso 2
function API2_PostProductsSearch() {
  const url = `${base_url}/api/products/search`;
  const payload = JSON.stringify({ search: 'notebook' });
  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'API2 - status 200': (r) => r.status === 200,
    'API2 - response not empty': (r) => r.body.length > 0,
    'API2 - response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Reglas del patrón:**
- Cada función se nombra: `API<número>_<Descripción>()`
- La función `default()` solo llama a las funciones de los casos
- Cada función contiene su propia lógica (http.get, http.post, etc.)
- Cada función incluye `check()` con validaciones específicas
- Cada función termina con `sleep()` para simular comportamiento humano
- El prefijo "API<número>" facilita la identificación

### Con autenticación (setup)

Para tests que requieren autenticación, se puede agregar `setup()`:

```javascript
import http from 'k6/http';
import { check, sleep, fail } from 'k6';

export const options = {
  vus: 10,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const base_url = __ENV.BASE_URL || 'https://api.example.com';

// Setup: se ejecuta una sola vez al inicio
export function setup() {
  const loginRes = http.post(`${base_url}/auth/login`, 
    JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (loginRes.status !== 200) {
    fail(`Login failed with status ${loginRes.status}`);
  }
  
  return { token: loginRes.json().token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };
  
  // Llamar funciones de cada caso
  API1_GetUserProfile(headers);
  API2_UpdateUserProfile(headers);
}

function API1_GetUserProfile(headers) {
  const url = `${base_url}/api/users/profile`;
  const res = http.get(url, { headers });
  check(res, {
    'API1 - status 200': (r) => r.status === 200,
    'API1 - has user data': (r) => 'user' in r.json(),
    'API1 - response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}

function API2_UpdateUserProfile(headers) {
  const url = `${base_url}/api/users/profile`;
  const payload = JSON.stringify({ name: 'Updated Name' });
  const res = http.put(url, payload, { headers });
  check(res, {
    'API2 - status 200': (r) => r.status === 200,
    'API2 - has updated data': (r) => 'user' in r.json(),
    'API2 - response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}

export function teardown(data) {
  console.log('Test completed');
}

### Con parámetros data-driven

Para tests con múltiples variantes de datos, se pueden parametrizar dentro de cada función:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
};

const base_url = __ENV.BASE_URL || 'https://api.example.com';

export default function () {
  // Llamar con diferentes parámetros
  API1_SearchProduct('notebook');
  API1_SearchProduct('tablet');
  API1_SearchProduct('headphones');
  
  API2_GetUserById(1);
  API2_GetUserById(2);
}

function API1_SearchProduct(searchTerm) {
  const url = `${base_url}/api/products/search`;
  const payload = JSON.stringify({ search: searchTerm });
  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    [`API1 - Search "${searchTerm}" - status 200`]: (r) => r.status === 200,
    [`API1 - Search "${searchTerm}" - has results`]: (r) => JSON.parse(r.body).results.length > 0,
  });
  sleep(1);
}

function API2_GetUserById(userId) {
  const url = `${base_url}/api/users/${userId}`;
  const res = http.get(url);
  check(res, {
    [`API2 - User ${userId} - status 200`]: (r) => r.status === 200,
    [`API2 - User ${userId} - has data`]: (r) => 'user' in r.json(),
  });
  sleep(1);
}
```

## Detectar y mapear tipos de API

### REST (por defecto)
```javascript
// Todos los endpoints HTTP estándar: GET, POST, PUT, DELETE, PATCH
http.get(), http.post(), http.put(), http.delete(), http.patch()
```

### GraphQL (si se detecta "graphql" o "query" en la fuente)
```javascript
const query = `
  query GetUsers {
    users { id name email }
  }
`;
const res = http.post(config.baseUrl + '/graphql', 
  JSON.stringify({ query }),
  { headers: { 'Content-Type': 'application/json' } }
);
```

### WebSocket (si se detecta "ws://" o "wss://")
```javascript
import ws from 'k6/ws';

const url = 'wss://echo.websocket.org';
const res = ws.connect(url, function(socket) {
  socket.on('open', () => {
    socket.send('Hello');
  });
  socket.on('message', (data) => {
    check(data, { 'message received': (msg) => msg.length > 0 });
  });
});
```

## Estructura de archivos generada

```
tests/
  └── k6-automation-test.js       ← Archivo ÚNICO con todos los casos

config/
  └── config.js                   ← URLs, timeouts, credenciales

data/
  ├── crear-producto.json
  ├── usuario.json
  └── buscar.json (opcional)

helpers/
  ├── auth.js                     ← Funciones de autenticación
  ├── utils.js                    ← Utilidades generales
  └── checks.js                   ← Checks reutilizables

results/                          ← Directorio para reportes (opcional)
  └── (vacío al inicio)
```

## Ejecución

El archivo consolidado se ejecuta de la siguiente forma:

```bash
# Ejecutar con configuración por defecto (SMOKE: 2 VUs, 10s)
k6 run tests/k6-automation-test.js

# Ejecutar como LOAD test (modificar options en el archivo o pasar parámetros)
k6 run tests/k6-automation-test.js --vus 10 --duration 60s

# Ejecutar como STRESS test (ramping VUs)
k6 run tests/k6-automation-test.js --executor ramping-vus --vus 1 --stages '30s:50,60s:100,30s:0'

# Con salida JSON
k6 run tests/k6-automation-test.js -o json=results/automation-test.json

# Con variable de entorno
k6 run tests/k6-automation-test.js -e BASE_URL=https://staging.api.com -e API_TOKEN=xyz

# Ver archivos locales (compilar tipos IntelliSense)
npm init -y
npm install --save-dev @types/k6
```

**Nota:** El usuario puede modificar la sección `export const options` en el archivo para cambiar entre SMOKE, LOAD, STRESS, SPIKE, o SOAK según sus necesidades.

## Restricciones

**Estructura obligatoria (Scenarios + Custom Metrics + Ejecución SECUENCIAL):**

- ✅ **Importar Metrics**: `import { Trend } from 'k6/metrics'`
- ✅ **Crear Trend POR CADA API**: `const api1Duration = new Trend('api1_duration')` (en minúscula)
- ✅ **Cada API = función `export`**: `export function API1_GetAllProductsList()` (API + número)
- ✅ **Configuración reutilizable**: 
  ```javascript
  const optionsGeneral = {
    executor: 'constant-vus',     // ⚠️ OBLIGATORIO: constant-vus (NO per-vu-iterations)
    vus: 10,
    duration: '10s',              // ⚠️ OBLIGATORIO: 10 segundos
  };
  ```
- ✅ **Scenarios con `startTime` (EJECUCIÓN SECUENCIAL)**:
  ```javascript
  export const options = {
    scenarios: {
      API1: { ...optionsGeneral, exec: 'API1_GetAllProductsList', startTime: '0s' },
      API2: { ...optionsGeneral, exec: 'API2_PostToAllProductsList', startTime: '10s' },
      API3: { ...optionsGeneral, exec: 'API3_GetAllBrandsList', startTime: '20s' },
      // ...cada API comienza 10 segundos después de la anterior
    },
    // thresholds COMENTADOS por defecto (bloque con /* */ o // antes de cada línea)
  };
  ```
- ✅ **Ejecución SECUENCIAL = no paralela**: cada scenario espera su `startTime` antes de comenzar
- ✅ **Thresholds comentados por defecto**: 
  ```javascript
  /*
  thresholds: {
    'api1_duration': ['p(95)<500'],
    'api2_duration': ['p(95)<500'],
    // ...
  }
  */
  ```
- ✅ **Tags en requests**: `tags: { name: 'API1' }` (número del API en mayúscula)
- ✅ **Registrar tiempo en métrica**: `api1Duration.add(Date.now() - start)`
- ✅ **Separator check line OBLIGATORIO** (primera línea de cada check):
  ```javascript
  check(res, {
    '(API1)----------------------------------------': () => true === true,  // SEPARADOR
    '(API1) status is 200': (res) => res.status === 200,
    // ... más checks con prefijo (API#)
  });
  ```
- ✅ **Todos los checks con prefijo**: `'(API#) descripción'` en mayúsculas A y número
- ✅ **Cada función termina con `sleep(1)`** para simular comportamiento humano
- ✅ **Spread operator** para reutilizar config: `{ ...optionsGeneral, ... }`
- ✅ **NO hay `default()`** — cada función es ejecutada por su scenario
- ✅ **NO hay `default export`** — todas las funciones son `export function`
- ✅ **Archivo final**: `k6-automation-test.js` en **RAÍZ** (no en tests/, no en carpetas)

**Números de API DEBEN ser CONSISTENTES:**
- Nombre función: `API1_GetAllProductsList` (API + número)
- Variable métrica: `api1Duration` (api + número en minúscula)
- Métrica Trend: `new Trend('api1_duration')` (api + número + _duration)
- Scenario: `API1: { ... }` (API + número)
- Tag: `{ name: 'API1' }` (API + número)
- Prefix de checks: `'(API1) ...'` (API + número en mayúscula)

**Patrones de números permitidos:**
- Secuencial: 1, 2, 3, 4, 5, 6 (NO saltar)
- O con gaps: 1, 2, 3, 4, 5, 6, **8** (si falta 7, está bien) — documentar en comentario
- ✅ Si hay gap (ej. API7 no existe), NO crear métrica `api7Duration`

**Otros:**
- Solo crear archivos en `config/`, `data/`, `helpers/` — nunca modificar código del usuario
- No hardcodear URLs — usar constante `const base_url = 'https://automationexercise.com/api'`
- Cada función debe ser independiente
- Respetos del `Status` en k6-tests.md — no sobrescribir IMPLEMENTED sin `--force`
- Si falta información, generar con `// TODO:` y preguntar al usuario
- NO inventar endpoints
