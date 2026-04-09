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
Notas: Prioridad Crítica. Libro disponible + lector sin deuda + plazo válido (7 días).
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
    "id_book": "B-1101",
    "id_reader": "R-2101",
    "type_id_reader": "CI",
    "date_return": "2026-04-08"
  }
Response Code: 200
Response JSON:
  - state=RETURNED
  - date_return=2026-04-08
  - days_late=0 o equivalente
  - No se crea deuda nueva en debt_reader
Headers: Content-Type: application/json
Timing duration: 500ms
Test Type: SMOKE
Notas: Préstamo activo con date_limit=2026-04-10. Devolución 2 días antes.
Status: NOT_IMPLEMENTED

---

## Caso 5
id: TC-HU04-01
título: Devolución tardía con 1 día de mora (Fibonacci semana 1)
Group: devoluciones-tardias
API URL: /loans
Request Method: PATCH
Request Body:
  {
    "id_book": "B-1201",
    "id_reader": "R-2201",
    "type_id_reader": "CI",
    "date_return": "2026-04-11",
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
Notas: Prioridad Crítica. date_limit=2026-04-10. 1 día mora → semana 1 → fib(1)=1 → 1×2.00=2.00.
Status: NOT_IMPLEMENTED

## Caso 6
id: TC-HU04-05
título: Devolución tardía con 22 días de mora (semana 4)
Group: devoluciones-tardias
API URL: /loans
Request Method: PATCH
Request Body:
  {
    "id_book": "B-1205",
    "id_reader": "R-2205",
    "type_id_reader": "TI",
    "date_return": "2026-05-02",
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
Notas: date_limit=2026-04-10. 22 días mora → semana 4 → fib(4)=7 → 7×2.00=14.00.
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
  - data contiene al menos L-5001 y L-5002
  - count=2 o equivalente
  - Cada elemento expone loan_id, id_book, title, state=ON_LOAN, id_reader, name_reader, date_limit, date_return=null
Timing duration: 500ms
Test Type: SMOKE
Notas: Prioridad Crítica. Solo se listan préstamos con state=ON_LOAN y date_limit vencida. Sin body ni query params.
Status: NOT_IMPLEMENTED

---

## Caso 8
id: TC-HU06-01
título: Registrar pago total de deuda pendiente
Group: deudas
API URL: /debts/D-6001
Request Method: PATCH
Request Body:
  {
    "state_debt": "PAID"
  }
Response Code: 200
Response JSON:
  - success=true
  - data.id_debt=D-6001
  - data.state_debt=PAID
  - amount_debt se conserva como valor histórico
  - El lector deja de figurar bloqueado
Headers: Content-Type: application/json
Timing duration: 500ms
Test Type: SMOKE
Notas: Deuda PENDING → PAID. El lector queda rehabilitado.
Status: NOT_IMPLEMENTED

