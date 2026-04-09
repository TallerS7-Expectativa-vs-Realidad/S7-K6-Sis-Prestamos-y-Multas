# K6 - Pruebas de Performance y Carga

Proyecto de automatización de pruebas de performance y carga utilizando **K6 Framework** contra la API de [Automation Exercise](https://automationexercise.com/).

## Descripción

Este proyecto implementa pruebas de performance para validar el comportamiento de los siguientes endpoints:

- **API 1**: GET - Obtener lista de productos
- **API 2**: POST - Crear producto
- **API 3**: GET - Obtener lista de marcas
- **API 4**: PUT - Actualizar marca
- **API 5**: POST - Buscar producto
- **API 6**: POST - Buscar producto sin parámetro obligatorio
- **API 8**: POST - Verificar login sin email
- **API 9**: DELETE - Verificar login (método no permitido)
- **API 10**: GET - Crear cuenta de usuario

## Requisitos Previos

- **K6**: Framework de testing de performance
- **Node.js** (opcional, para utilidades adicionales)


## Estructura del Proyecto

```
K6/
├── k6-automation-test.js      ← Script principal de tests
├── k6-tests.md                ← Especificación de casos de prueba
├── mi-primer-test.js          ← Test adicional/alternativo
├── README.md                  ← Este archivo
└── ANÁLISIS_RESULTADOS.md              ← Documento de análisis e interpretación
```

## Ejecución

### Antes de la ejecución

Eliminar todos las tuplas de la DB que tengan una ID generada automáticamente

```bash
DELETE FROM debt_reader WHERE loan_id IN (SELECT loan_id FROM loan_books WHERE id_book LIKE 'B-K6%' OR id_reader LIKE 'R-K6%');

DELETE FROM loan_books WHERE id_book LIKE 'B-K6%' OR id_reader LIKE 'R-K6%';
```

### Comando Básico
```bash
k6 run k6-automation-test.js
```

**Generar reporte en JSON:**
```bash
k6 run k6-automation-test.js -o json=results.json
```

**Generar reporte HTML (en wsl):**
```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run script.js
```

**Última actualización**: Abril 2026
