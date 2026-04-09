# Agente K6 — Guía de Uso

El **agente K6 Standalone** genera tests de performance y carga automaticamente desde cualquier fuente de API.

---

## ¿Qué es?

✅ Genera archivos `.js` ejecutables listos para correr con `k6`  
✅ No requiere setup Maven, npm o proyecto predefinido  
✅ Soporta 5 tipos de tests: SMOKE, LOAD, STRESS, SPIKE, SOAK  
✅ Crea automáticamente: `config.js`, helpers, archivos de datos  
✅ Genera desde múltiples fuentes: URL, Swagger, manual, Postman, archivo `k6-tests.md`

---

## Requisito: Instalar K6

**Windows:**
```bash
winget install k6 --source winget
```

**WSL / Linux:**
```bash
sudo apt-get update && sudo apt-get install k6
```

**macOS:**
```bash
brew install k6
```

Verificar:
```bash
k6 version  # Output: k6 v1.7.x (go...)
```

---

## Flujo de Uso (5 pasos)

### Paso 1: Crear archivo de definición (k6-tests.md)

Copia `templates/k6-tests.template.md` a la raíz como `k6-tests.md` y edita con tus APIs:

```markdown
# Tests de mi API

Base URL: https://api.miapp.com

## Caso 1
título: GET Listar Productos
API URL: /api/products
Request Method: GET
Response Code: 200
Test Type: SMOKE
Status: NOT_IMPLEMENTED

## Caso 2
título: POST Crear Producto
API URL: /api/products
Request Method: POST
Request Body: { "name": "Test", "price": 99.99 }
Response Code: 201
Test Type: LOAD
Status: NOT_IMPLEMENTED
```

**Campos soportados:**
- `título` — Nombre descriptivo
- `API URL` — Path o URL completa
- `Request Method` — GET, POST, PUT, DELETE, PATCH
- `Response Code` — Código HTTP esperado
- `Request Body` — JSON (opcional)
- `Test Type` — SMOKE (default) | LOAD | STRESS | SPIKE | SOAK
- `Status` — NOT_IMPLEMENTED (genera) | IMPLEMENTED (salta)

### Paso 2: Pedir al agente que genere

> "Genera los tests del k6-tests.md"

### Paso 3: El agente genera automáticamente

```
✅ tests/productos-smoke.js
✅ tests/productos-load.js
✅ config/config.js
✅ helpers/auth.js, utils.js, checks.js
✅ data/crear-producto.json
✅ k6-tests.md (actualizado con Status: IMPLEMENTED)
```

### Paso 4: Ejecutar los tests

```bash
# Smoke test (verificación rápida)
k6 run tests/productos-smoke.js

# Load test (carga normal)
k6 run tests/productos-load.js

# Con variables de entorno
k6 run tests/productos-load.js -e BASE_URL=https://staging.api.com -e API_TOKEN=xyz

# Con salida JSON
k6 run tests/productos-load.js -o json=results/load-test.json
```

### Paso 5: Revisar resultados

```
Output esperado:
  ✓ status 200
  ✓ response not empty
  ✓ has content-type
  
  http_req_duration: p(50)=150ms p(95)=300ms p(99)=450ms
  checks...................: 100%
  http_reqs.................: 20 20/s
```

---

## Fuentes de Input Soportadas

El agente acepta tests desde:

| Fuente | Comando |
|--------|---------|
| **archivo k6-tests.md** | "Genera los tests del k6-tests.md" |
| **URL de documentación** | "Genera tests K6 para: https://api.example.com/docs" |
| **Swagger/OpenAPI** | "Genera tests desde swagger.json" |
| **Colección Postman** | "Genera tests desde collection.json" |
| **Definición manual** | "Genera test K6 para: GET /api/users → 200" |

---

## Tipos de Tests Generados

| Tipo | Archivo | VUs | Duración | Uso |
|------|---------|-----|----------|-----|
| **SMOKE** | `*-smoke.js` | 2 | 10s | Verificación rápida — CI/CD |
| **LOAD** | `*-load.js` | 10 | 60s | Carga normal — validar rendimiento |
| **STRESS** | `*-stress.js` | 1→100 | 180s | Aumentar carga — encontrar límites |
| **SPIKE** | `*-spike.js` | Picos | 120s | Picos repentinos — comportamiento inesperado |
| **SOAK** | `*-soak.js` | 5 | 3600s | Carga prolongada — detectar memory leaks |

---

## Argumentos Opcionales

Al invocar al agente, puedes usar estos argumentos para controlar la generación:

```bash
# Generar solo un caso específico
"Implementa el caso 1 del k6-tests.md"

# Generar solo un tipo de test
"Implementa los SMOKE tests del k6-tests.md"

# Generar todos (incluyendo IMPLEMENTED)
"Implementa los tests del k6-tests.md --status ALL"

# Sobrescribir un caso ya implementado
"Implementa el caso 2 --force"

# No actualizar el archivo k6-tests.md
"Implementa los tests del k6-tests.md --skip-update"
```

---

## Estructura de Proyecto Generada

```
tests/
  ├── productos-smoke.js              # Verificación rápida
  ├── productos-load.js               # Carga normal
  ├── usuarios-smoke.js
  └── README.md

config/
  └── config.js                        # URLs, timeouts, credenciales

data/
  ├── crear-producto.json             # Request bodies
  └── usuario.json

helpers/
  ├── auth.js                          # Funciones de autenticación
  ├── utils.js                         # Utilidades generales
  └── checks.js                        # Checks reutilizables

results/                               # Reportes (generados tras ejecutar)

k6-tests.md                            # Definición de casos (actualizado)
```

---

## Seguridad: Usar Variables de Entorno

❌ **Nunca hardcodees credenciales:**
```javascript
const token = 'abc123xyz456';  // ❌ NUNCA HAGAS ESTO
```

✅ **Usa variables de entorno:**
```javascript
const token = __ENV.API_TOKEN;  // ✅ BIEN
```

Ejecuta con:
```bash
k6 run tests/productos-load.js -e API_TOKEN=your-actual-token
```

---

## Documentación Completa

- **Instrucciones técnicas:** `instructions/k6.instructions.md`
- **Template de casos:** `templates/k6-tests.template.md`
- **Descriptor del agente:** `agents/k6-standalone.agent.md`
- **Skill de generación:** `skills/implement-k6-tests/SKILL.md`
- **Docs K6 oficiales:** https://grafana.com/docs/k6/latest/

---

**Última actualización:** Abril 2026  
**Versión de K6:** 1.7.x
