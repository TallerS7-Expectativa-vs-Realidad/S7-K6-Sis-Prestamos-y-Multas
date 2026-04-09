# Tests de Performance y Carga — Sistema de Préstamos y Multas

Base URL: http://localhost:3000/api/v1

---

## Caso 1
id: TC-HU01-01
título: Consultar libro disponible por historial (RETURNED)
Group: loans-consulta
API URL: /loans/Don%20Quijote
Request Method: GET
Response Code: 200
Response JSON:
  - success=true
  - message="Consulta realizada correctamente."
  - data contiene al menos un resultado con id=B-0001, name=Don Quijote, status=RETURNED
Timing duration: 500ms
Test Type: SMOKE
Notas: Libro con último estado RETURNED → interpretable como disponible. Path param es el nombre del libro URL-encoded.
Status: IMPLEMENTED

## Caso 2
id: TC-HU01-03
título: Consultar libro sin historial de préstamo
Group: loans-consulta
API URL: /loans/Manual%20de%20estanter%C3%ADas%20invisibles
Request Method: GET
Response Code: 200
Response JSON:
  - success=true
  - data=[]
  - message="El libro no registra historial de préstamo y se considera disponible para préstamo."
Timing duration: 500ms
Test Type: SMOKE
Notas: Sin coincidencias en loan_books. La respuesta NO afirma que el libro no exista; solo informa ausencia de historial.
Status: IMPLEMENTED

---

## Caso 3
id: TC-HU02-01
título: Registrar préstamo exitoso
Group: loans-registro
API URL: /loans
Request Method: POST
Request Body:
  {
    "id_book": "B-1001",
    "title": "Cien años de soledad",
    "type_id_reader": "CI",
    "id_reader": "R-2001",
    "name_reader": "Ana Torres",
    "loan_days": 7
  }
Response Code: 201
Response JSON:
  - Se crea registro con state=ON_LOAN, date_return=null, loan_days=7
  - date_limit = fecha de registro + 7 días
Headers: Content-Type: application/json
Timing duration: 500ms
Test Type: SMOKE
Data Strategy: DYNAMIC_IDS
Notas: Prioridad Crítica. Libro disponible + lector sin deuda + plazo válido (7 días). STRESS: Usar generateLoanData() de testDataPresets.js para generar id_book=B-K6-{VU}-{ITER} e id_reader=R-K6-{VU}-{ITER} únicos por iteración. El body del k6-tests.md es referencia; el test real usa datos dinámicos.
Status: IMPLEMENTED

---

## Caso 4
id: TC-HU03-01
título: Devolución antes del plazo límite
Group: devoluciones
API URL: /loans
Request Method: PATCH
Request Body:
  {
    "id_book": "(dinámico)",
    "id_reader": "(dinámico)",
    "type_id_reader": "CI",
    "date_return": "(hoy + 5 días, antes del límite)"
  }
Response Code: 200
Response JSON:
  - state=RETURNED
  - date_return=(fecha enviada)
  - days_late=0 o equivalente
  - No se crea deuda nueva en debt_reader
Headers: Content-Type: application/json
Timing duration: 500ms
Test Type: SMOKE
Data Strategy: SETUP_ACTION
Notas: Patrón setup→action. Cada iteración: 1) POST /loans crea préstamo con IDs únicos (setup, no medido), 2) PATCH /loans devuelve antes del plazo (action, medido). Usar setupAndReturn({ returnDaysOffset: 5 }) de testDataPresets.js. loan_days=7 → date_limit=hoy+7 → devolver hoy+5 = 2 días antes.
Status: IMPLEMENTED

---

## Caso 5
id: TC-HU04-01
título: Devolución tardía con 1 día de mora (Fibonacci semana 1)
Group: devoluciones-tardias
API URL: /loans
Request Method: PATCH
Request Body:
  {
    "id_book": "(dinámico)",
    "id_reader": "(dinámico)",
    "type_id_reader": "CI",
    "date_return": "(hoy + 8 días, 1 día después del límite)",
    "base_fib_amount": 2.00
  }
Response Code: 200
Response JSON:
  - state=RETURNED
  - days_late=1
  - units_fib=1
  - amount_debt=2.00
  - Deuda queda en PENDING trazable al loan_id
Headers: Content-Type: application/json
Timing duration: 500ms
Test Type: SMOKE
Data Strategy: SETUP_ACTION
Notas: Prioridad Crítica. Patrón setup→action. Cada iteración: 1) POST /loans crea préstamo (setup), 2) PATCH devuelve 1 día tarde (action). Usar setupAndReturn({ returnDaysOffset: 8, baseFibAmount: 2.00 }). loan_days=7 → limit=hoy+7 → return=hoy+8 → 1 día mora → fib(1)=1 → 1×2.00=2.00.
Status: IMPLEMENTED

## Caso 6
id: TC-HU04-05
título: Devolución tardía con 22 días de mora (semana 4)
Group: devoluciones-tardias
API URL: /loans
Request Method: PATCH
Request Body:
  {
    "id_book": "(dinámico)",
    "id_reader": "(dinámico)",
    "type_id_reader": "DNI",
    "date_return": "(hoy + 29 días, 22 días después del límite)",
    "base_fib_amount": 2.00
  }
Response Code: 200
Response JSON:
  - days_late=22
  - weeks=4
  - units_fib=7
  - amount_debt=14.00
Headers: Content-Type: application/json
Timing duration: 500ms
Test Type: SMOKE
Data Strategy: SETUP_ACTION
Notas: Patrón setup→action. Cada iteración: 1) POST /loans crea préstamo (setup), 2) PATCH devuelve 22 días tarde (action). Usar setupAndReturn({ returnDaysOffset: 29, baseFibAmount: 2.00, typeIdReader: 'TI' }). loan_days=7 → limit=hoy+7 → return=hoy+29 → 22 días mora → semana 4 → fib(4)=7 → 7×2.00=14.00.
Status: NOT_IMPLEMENTED

---

## Caso 7
id: TC-HU05-01
título: Consultar préstamos vencidos con resultados
Group: loans-vencidos
API URL: /loans/outTime
Request Method: GET
Response Code: 200
Response JSON:
  - success=true
  - data contiene al menos los libros vencidos del seed (B-2001, B-2002 u otros con state=ON_LOAN y date_limit vencida)
  - Cada elemento expone loan_id, id_book, title, state=ON_LOAN, id_reader, name_reader, date_limit, date_return=null
Timing duration: 500ms
Test Type: SMOKE
Data Strategy: READ_ONLY
Notas: Prioridad Crítica. Lectura idempotente — sin conflictos con múltiples VUs. Solo se listan préstamos con state=ON_LOAN y date_limit < hoy. El seed proporciona B-2001 y B-2002 como vencidos. Validar que data sea array con length >= 2 y que cada elemento tenga state=ON_LOAN y date_return=null.
Status: NOT_IMPLEMENTED

---

## Caso 8
id: TC-HU06-01
título: Registrar pago total de deuda pendiente
Group: deudas
API URL: /debts/{debt_id}
Request Method: PATCH
Request Body:
  {
    "state_debt": "PAID"
  }
Response Code: 200
Response JSON:
  - success=true
  - data.state_debt=PAID
  - amount_debt se conserva como valor histórico
  - El lector deja de figurar bloqueado
Headers: Content-Type: application/json
Timing duration: 500ms
Test Type: SMOKE
Data Strategy: MULTI_STEP_CHAIN
Notas: Cadena multi-paso. Cada iteración: 1) POST /loans crea préstamo (setup), 2) PATCH /loans devuelve tarde generando deuda (setup), 3) Extraer debt_id del response, 4) PATCH /debts/{debt_id} paga la deuda (action, medido). Usar setupLateAndPayDebt({ lateDays: 1, baseFibAmount: 2.00 }) de testDataPresets.js. El debt_id es dinámico — no se puede usar un ID fijo porque cada iteración genera una deuda nueva.
Status: NOT_IMPLEMENTED

