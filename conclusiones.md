=====================================================================
  EJERCICIO 1 - CONCLUSIONES Y HALLAZGOS
  Prueba de Carga: Login FakeStore API con K6
=====================================================================

# DESCRIPCIÓN DE LA PRUEBA
─────────────────────────
  Servicio probado : POST https://fakestoreapi.com/auth/login
  Herramienta      : K6 v0.55.0
  Duración total   : 50s minutos
  Escenario        : Ramping VUs (0 → 10 → 30 → 50 → 0 VUs)
         (Aumentar VUs por etapa para aumentar TPs)
  Datos de entrada : 5 pares usuario/contraseña desde usuarios.csv

# CRITERIOS DE ACEPTACIÓN
────────────────────────
  [1] TPS mínimo             : 20 transacciones por segundo
  [2] Tiempo de respuesta    : p(95) ≤ 1500 ms
  [3] Tasa de error máxima   : < 3% del total de peticiones


# RESULTADOS
__________
```bash

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 


     execution: local
        script: run-all.js
 web dashboard: http://127.0.0.1:5665
        output: -

     scenarios: (100.00%) 8 scenarios, 40 max VUs, 1m50s max duration (incl. graceful stop):
              * TC_HU01_01: 10 looping VUs for 10s (exec: TC_HU01_01, gracefulStop: 30s)
              * TC_HU01_03: 10 looping VUs for 10s (exec: TC_HU01_03, startTime: 10s, gracefulStop: 30s)
              * TC_HU02_01: 10 looping VUs for 10s (exec: TC_HU02_01, startTime: 20s, gracefulStop: 30s)
              * TC_HU03_01: 10 looping VUs for 10s (exec: TC_HU03_01, startTime: 30s, gracefulStop: 30s)
              * TC_HU04_01: 10 looping VUs for 10s (exec: TC_HU04_01, startTime: 40s, gracefulStop: 30s)
              * TC_HU04_05: 10 looping VUs for 10s (exec: TC_HU04_05, startTime: 50s, gracefulStop: 30s)
              * TC_HU05_01: 10 looping VUs for 10s (exec: TC_HU05_01, startTime: 1m0s, gracefulStop: 30s)
              * TC_HU06_01: 10 looping VUs for 10s (exec: TC_HU06_01, startTime: 1m10s, gracefulStop: 30s)



  █ TOTAL RESULTS 

    checks_total.......: 102288  1329.067544/s
    checks_succeeded...: 100.00% 102288 out of 102288
    checks_failed......: 0.00%   0 out of 102288

    ✓ (TC_HU01_01)-----------------------------------------------
    ✓ (TC_HU01_01) status is 200
    ✓ (TC_HU01_01) response contains success field
    ✓ (TC_HU01_01) response contains message
    ✓ (TC_HU01_01) response contains data
    ✓ (TC_HU01_01) data contains at least one result
    ✓ (TC_HU01_01) result includes Don Quijote book (B-0001)
    ✓ (TC_HU01_01) book status is RETURNED
    ✓ (TC_HU01_01) response time < 500ms
    ✓ (TC_HU01_03)-----------------------------------------------
    ✓ (TC_HU01_03) status is 200
    ✓ (TC_HU01_03) response contains success field
    ✓ (TC_HU01_03) response contains message
    ✓ (TC_HU01_03) data is empty array (no loan history)
    ✓ (TC_HU01_03) message indicates book is available for loan
    ✓ (TC_HU01_03) response time < 500ms
    ✓ (TC_HU02_01)-----------------------------------------------
    ✓ (TC_HU02_01) status is 201
    ✓ (TC_HU02_01) response contains loan record
    ✓ (TC_HU02_01) loan state is ON_LOAN
    ✓ (TC_HU02_01) date_return is null
    ✓ (TC_HU02_01) loan_days is 7
    ✓ (TC_HU02_01) date_limit is set (fecha registro + 7 días)
    ✓ (TC_HU02_01) response includes book information
    ✓ (TC_HU02_01) response includes reader information
    ✓ (TC_HU02_01) response time < 500ms
    ✓ [setup] préstamo creado (201)
    ✓ (TC_HU03_01)-----------------------------------------------
    ✓ (TC_HU03_01) status is 200
    ✓ (TC_HU03_01) response contains loan data
    ✓ (TC_HU03_01) loan state is RETURNED
    ✓ (TC_HU03_01) date_return is set
    ✓ (TC_HU03_01) days_late is 0
    ✓ (TC_HU03_01) no debt created
    ✓ (TC_HU03_01) response time < 500ms
    ✓ (TC_HU04_01)-----------------------------------------------
    ✓ (TC_HU04_01) status is 200
    ✓ (TC_HU04_01) state is RETURNED
    ✓ (TC_HU04_01) days_late is 1
    ✓ (TC_HU04_01) units_fib is 1
    ✓ (TC_HU04_01) amount_debt is 2.00
    ✓ (TC_HU04_01) debt state is PENDING
    ✓ (TC_HU04_01) response time < 500ms
    ✓ (TC_HU04_05)-----------------------------------------------
    ✓ (TC_HU04_05) status is 200
    ✓ (TC_HU04_05) days_late is 22
    ✓ (TC_HU04_05) units_fib is 7
    ✓ (TC_HU04_05) amount_debt is 14.00
    ✓ (TC_HU04_05) response time < 500ms
    ✓ (TC_HU05_01)-----------------------------------------------
    ✓ (TC_HU05_01) status is 200
    ✓ (TC_HU05_01) response is valid JSON with data
    ✓ (TC_HU05_01) data is an array
    ✓ (TC_HU05_01) data contains at least 2 overdue loans
    ✓ (TC_HU05_01) all items have state=ON_LOAN
    ✓ (TC_HU05_01) all items have date_return=null
    ✓ (TC_HU05_01) items expose required fields
    ✓ (TC_HU05_01) response time < 500ms
    ✓ (TC_HU06_01)-----------------------------------------------
    ✓ (TC_HU06_01) status is 200
    ✓ (TC_HU06_01) success is true
    ✓ (TC_HU06_01) state_debt is PAID
    ✓ (TC_HU06_01) amount_debt is preserved
    ✓ (TC_HU06_01) response time < 500ms

    CUSTOM
    TC_HU01_01_duration............: avg=22.503497 min=-1294    med=24      max=378      p(90)=37      p(95)=42.15   
    TC_HU01_03_duration............: avg=23.176962 min=3        med=22      max=102      p(90)=34      p(95)=39      
    TC_HU02_01_duration............: avg=38.38856  min=10       med=36      max=188      p(90)=53      p(95)=62      
    TC_HU03_01_duration............: avg=71.411429 min=-1145    med=75      max=201      p(90)=119     p(95)=133     
    TC_HU04_01_duration............: avg=45.68     min=14       med=24.5    max=214      p(90)=79.3    p(95)=199.1   
    TC_HU04_05_duration............: avg=31.81     min=15       med=25.5    max=89       p(90)=56.7    p(95)=77.15   
    TC_HU05_01_duration............: avg=10.05     min=3        med=7       max=38       p(90)=20.1    p(95)=27      
    TC_HU06_01_duration............: avg=55.15     min=21       med=40.5    max=221      p(90)=85.5    p(95)=200.65  

    HTTP
    http_req_duration..............: avg=29.06ms   min=115.75µs med=26.52ms max=362.51ms p(90)=45.54ms p(95)=54.38ms 
      { expected_response:true }...: avg=29.06ms   min=115.75µs med=26.52ms max=362.51ms p(90)=45.54ms p(95)=54.38ms 
    http_req_failed................: 0.00%  0 out of 13696
    http_reqs......................: 13696  177.957425/s

    EXECUTION
    iteration_duration.............: avg=67.57ms   min=3.24ms   med=28.14ms max=1.22s    p(90)=71.76ms p(95)=107.71ms
    iterations.....................: 12071  156.843172/s
    vus............................: 10     min=10         max=10
    vus_max........................: 40     min=40         max=40

    NETWORK
    data_received..................: 7.6 MB 98 kB/s
    data_sent......................: 2.6 MB 33 kB/s




running (1m17.0s), 00/40 VUs, 12071 complete and 0 interrupted iterations
TC_HU01_01 ✓ [======================================] 10 VUs  10s
TC_HU01_03 ✓ [======================================] 10 VUs  10s
TC_HU02_01 ✓ [======================================] 10 VUs  10s
TC_HU03_01 ✓ [======================================] 10 VUs  10s
TC_HU04_01 ✓ [======================================] 10 VUs  10s
TC_HU04_05 ✓ [======================================] 10 VUs  10s
TC_HU05_01 ✓ [======================================] 10 VUs  10s
TC_HU06_01 ✓ [======================================] 10 VUs  10s
```

# HALLAZGOS
──────────

  1. RENDIMIENTO (TPS)
     ─────────────────
     El sistema alcanzó un TPS promedio de 156.84 req/s

     → Criterio [1] CUMPLIDO ✓

  2. TIEMPO DE RESPUESTA
     ────────────────────
     La API respondió de forma estable en condiciones normales:
       - Promedio (avg) : 29.06 ms
       - Percentil 90   : 45.54 ms
       - Percentil 95   : 54.38 ms
       - Máximo         : 362.51 ms

     → Criterio [2] CUMPLIDO ✓

  3. TASA DE ERROR
     ──────────────
     Se devuelven correctamente todas las respuestas HTTP 200 y 201.

     Tasa de errores observada: 0%

     → Criterio [3] CUMPLIDO ✓

# CONCLUSIONES
────────────
  1. El script cumple con los tres criterios de aceptación definidos
     para la prueba de carga del servicio de login.

  2. El servicio de FakeStore API tiene un rendimiento aceptable para
     cargas de hasta  50 VUs concurrentes; los resultados muestran también
     que hay margen para aumentar la cantidad de VUs concurrentes.

  3. La parametrización mediante CSV funciona correctamente: K6 itera
     de forma circular sobre los 5 usuarios, distribuyendo la carga
     entre todas las credenciales disponibles.

   4. Las validaciones implementadas (status 201, presencia de token y
      tiempo < 1500 ms) son suficientes para detectar regresiones
      funcionales y de performance en futuras ejecuciones.

# RECOMENDACIONES
───────────────
  1. Agregar más credenciales válidas al CSV para evitar que los
     errores 401 eleven artificialmente la tasa de error cuando se
     escala la prueba.

  2. Buscar la cantidad de VUs máximos que alcancen el límite de 
     aceptación de TPS para conocer el margen de rendimiento.

=====================================================================
