# K6 - Pruebas de Performance y Carga: Sistema de Préstamos y Multas

Proyecto de automatización de pruebas de performance y carga utilizando **K6 Framework** contra la API del Sistema de Préstamos y Multas (`http://localhost:3000/api/v1`).

Conclusión de resultados => [conclusiones.md](./conclusiones.md)

Reporte HTML => [html-report.html](./html-report.html)

## Descripción

Este proyecto implementa pruebas de performance para validar el comportamiento de los siguientes casos de prueba:

| Caso | ID | Descripción | Método | Endpoint |
|------|----|-------------|--------|----------|
| 1 | TC-HU01-01 | Consultar libro disponible por historial (RETURNED) | GET | `/loans/{bookName}` |
| 2 | TC-HU01-03 | Consultar libro sin historial de préstamo | GET | `/loans/{bookName}` |
| 3 | TC-HU02-01 | Registrar préstamo exitoso | POST | `/loans` |
| 4 | TC-HU03-01 | Devolución antes del plazo límite | PATCH | `/loans` |
| 5 | TC-HU04-01 | Devolución tardía con 1 día de mora (Fibonacci semana 1) | PATCH | `/loans` |
| 6 | TC-HU04-05 | Devolución tardía con 22 días de mora (semana 4) | PATCH | `/loans` |
| 7 | TC-HU05-01 | Consultar préstamos vencidos con resultados | GET | `/loans/outTime` |
| 8 | TC-HU06-01 | Registrar pago total de deuda pendiente | PATCH | `/debts/{debt_id}` |

## Versiones de Tecnologías

- **K6**: v0.55.0 ([releases](https://github.com/grafana/k6/releases))
- **Sistema Operativo**: Windows 10/11, Linux Ubuntu 20.04+ o macOS 12+
- Para el sistema operativo Windows, utilizar **WSL** (Windows Subsystem for Linux) para la generación del reporte HTML

## Estructura del Proyecto

```
S7-K6-Sis-Prestamos-y-Multas/
├── run-all.js                              ← Orquestador central (ejecuta todos los tests)
├── k6-tests.md                             ← Especificación de casos de prueba
├── html-report.html                        ← Reporte HTML generado por K6
├── README.md                               ← Este archivo
└── tests/
    ├── helpers/
    │   └── testDataPresets.js              ← Generadores de datos dinámicos
    ├── loans-consulta/
    │   └── loans-consulta.js               ← TC-HU01-01, TC-HU01-03
    ├── loans-registro/
    │   └── loans-registro.js               ← TC-HU02-01
    ├── devoluciones/
    │   └── devoluciones.js                 ← TC-HU03-01
    ├── devoluciones-tardias/
    │   └── devoluciones-tardias.js         ← TC-HU04-01, TC-HU04-05
    ├── loans-vencidos/
    │   └── loans-vencidos.js               ← TC-HU05-01
    └── deudas/
        └── deudas.js                       ← TC-HU06-01
```

## Paso a Paso de Ejecución

### Paso 1 — Instalar K6

**Windows:**
```bash
winget install k6 --source winget
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] \
  https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

### Paso 2 — Verificar instalación

```bash
k6 version
```
Debe mostrar: `k6 v0.55.x` (o superior)

### Paso 3 — Clonar o descargar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd S7-K6-Sis-Prestamos-y-Multas
```

### Paso 4 — Preparar la base de datos

Asegurarse de que el servidor de la API esté corriendo en `http://localhost:3000` y que la BD tenga los datos semilla cargados (ver `z-documentos de ayuda/seed-data-validated.sql`).

**Limpiar datos generados por K6 de ejecuciones anteriores:**
```sql
DELETE FROM debt_reader WHERE loan_id IN (SELECT loan_id FROM loan_books WHERE id_book LIKE 'B-K6%' OR id_reader LIKE 'R-K6%');

DELETE FROM loan_books WHERE id_book LIKE 'B-K6%' OR id_reader LIKE 'R-K6%';
```

### Paso 5 — Ejecutar las pruebas de carga

**Ejecutar todos los tests (orquestador):**
```bash
k6 run run-all.js
```

**Generar reporte HTML (ejecutar en WSL):**
```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run run-all.js
```

**Ejecutar un test individual:**
```bash
k6 run tests/loans-consulta/loans-consulta.js
k6 run tests/loans-registro/loans-registro.js
k6 run tests/devoluciones/devoluciones.js
k6 run tests/devoluciones-tardias/devoluciones-tardias.js
k6 run tests/loans-vencidos/loans-vencidos.js
k6 run tests/deudas/deudas.js
```

## Configuración de Escenarios

El orquestador (`run-all.js`) ejecuta los 8 escenarios de forma secuencial con la siguiente configuración:

| Escenario | VUs | Duración | Inicio |
|-----------|-----|----------|--------|
| TC_HU01_01 | 10 | 10s | 0s |
| TC_HU01_03 | 10 | 10s | 10s |
| TC_HU02_01 | 10 | 10s | 20s |
| TC_HU03_01 | 10 | 10s | 30s |
| TC_HU04_01 | 10 | 10s | 40s |
| TC_HU04_05 | 10 | 10s | 50s |
| TC_HU05_01 | 10 | 10s | 60s |
| TC_HU06_01 | 10 | 10s | 70s |

**Duración total**: ~80s | **Max VUs**: 40

## Notas Importantes

- Los tests que crean datos (préstamos, devoluciones, pagos) generan IDs únicos con el prefijo `B-K6-` y `R-K6-` para evitar colisiones entre VUs e iteraciones.
- Los escenarios de devolución y pago de deuda usan un patrón **setup→action**: primero crean un préstamo (setup, no medido) y luego ejecutan la acción principal (action, medida).
- El cálculo de multas sigue la secuencia de Fibonacci por semana de mora.
- Es necesario limpiar los datos generados por K6 antes de cada ejecución (ver Paso 4).

**Última actualización**: Abril 2026
