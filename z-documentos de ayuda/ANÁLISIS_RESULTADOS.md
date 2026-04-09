# Análisis e Interpretación de Resultados - K6 Performance Tests

> Documento para documentar y analizar los resultados de las pruebas de performance ejecutadas con K6.

---

## Resultados de Pruebas

Reporte => [html-report.html](./html-report.html)

![parte 1](p1.png)
![parte 2](p2.png)
![parte 3](p3.png)
![parte 4](p4.png)

```bash

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /
   /  \/    \    | |/ /  /   ‾‾\
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/


     execution: local
        script: k6-automation-test.js
        output: json (results.json)

     scenarios: (100.00%) 9 scenarios, 40 max VUs, 2m0s max duration (incl. graceful stop):
              * API1: 10 looping VUs for 10s (exec: API1_GetAllProductsList, gracefulStop: 30s)
              * API2: 10 looping VUs for 10s (exec: API2_PostToAllProductsList, startTime: 10s, gracefulStop: 30s)
              * API3: 10 looping VUs for 10s (exec: API3_GetAllBrandsList, startTime: 20s, gracefulStop: 30s)
              * API4: 10 looping VUs for 10s (exec: API4_PutBrandsList, startTime: 30s, gracefulStop: 30s)
              * API5: 10 looping VUs for 10s (exec: API5_PostSearchProduct, startTime: 40s, gracefulStop: 30s)
              * API6: 10 looping VUs for 10s (exec: API6_PostSearchProductWithoutParam, startTime: 50s, gracefulStop: 30s)
              * API8: 10 looping VUs for 10s (exec: API8_PostVerifyLoginWithoutEmail, startTime: 1m0s, gracefulStop: 30s)
              * API9: 10 looping VUs for 10s (exec: API9_DeleteToVerifyLogin, startTime: 1m10s, gracefulStop: 30s)
              * API10: 10 looping VUs for 10s (exec: API10_PostToVerifyLoginWithInvalidDetails, startTime: 1m20s, gracefulStop: 30s)



  █ TOTAL RESULTS

    checks_total.......: 3319   36.437961/s
    checks_succeeded...: 80.77% 2681 out of 3319
    checks_failed......: 19.22% 638 out of 3319

    ✓ (API1)----------------------------------------
    ✓ (API1) status is 200
    ✓ (API1) Respuesta body incluye products
    ✓ (API1) products > 0
    ✗ (API1) Tiempo de solicitud < 500ms
      ↳  81% — ✓ 59 / ✗ 13
    ✓ (API2)----------------------------------------
    ✗ (API2) status is 405
      ↳  0% — ✓ 0 / ✗ 88
    ✗ (API2) Respuesta body: "This request method is not supported"
      ↳  0% — ✓ 0 / ✗ 88
    ✗ (API2) Tiempo de solicitud < 500ms
      ↳  98% — ✓ 87 / ✗ 1
    ✓ (API3)----------------------------------------
    ✓ (API3) status is 200
    ✓ (API3) Respuesta body incluye brands
    ✓ (API3) brands > 0
    ✓ (API3) Tiempo de solicitud < 500ms
    ✓ (API4)----------------------------------------
    ✗ (API4) status 405
      ↳  0% — ✓ 0 / ✗ 89
    ✓ (API4) response contains error message
    ✓ (API4) response time < 500ms
    ✓ (API5)----------------------------------------
    ✓ (API5) status is 200
    ✓ (API5) Respuesta body incluye products
    ✓ (API5) products > 0
    ✓ (API5) Tiempo de solicitud < 500ms
    ✓ (API6)----------------------------------------
    ✗ (API6) status 400
      ↳  0% — ✓ 0 / ✗ 90
    ✓ (API6) error message present
    ✓ (API6) response time < 500ms
    ✓ (API8)----------------------------------------
    ✗ (API8) status 400
      ↳  0% — ✓ 0 / ✗ 90
    ✓ (API8) error message present
    ✓ (API8) response time < 500ms
    ✓ (API9)----------------------------------------
    ✗ (API9) status 405
      ↳  0% — ✓ 0 / ✗ 90
    ✓ (API9) response message "This request method is not supported"
    ✓ (API9) response time < 500ms
    ✓ (API10)----------------------------------------
    ✗ (API10) status 404
      ↳  0% — ✓ 0 / ✗ 89
    ✓ (API10) response message "User not found!"
    ✓ (API10) response time < 500ms

    CUSTOM
    api1_duration..................: avg=471.902778 min=264      med=294      max=1526  p(90)=1293.6   p(95)=1426.75
    api10_duration.................: avg=228.269663 min=208      med=223      max=495   p(90)=240.2    p(95)=253.4
    api2_duration..................: avg=260.090909 min=197      med=223.5    max=1296  p(90)=334.3    p(95)=383.9
    api3_duration..................: avg=258.707317 min=209      med=223.5    max=451   p(90)=378      p(95)=403.65
    api4_duration..................: avg=236.05618  min=206      med=225      max=477   p(90)=277.8    p(95)=322.2
    api5_duration..................: avg=269.432099 min=231      med=257      max=446   p(90)=303      p(95)=321
    api6_duration..................: avg=220.7      min=198      med=220      max=244   p(90)=232      p(95)=234.65
    api8_duration..................: avg=220.177778 min=206      med=217      max=292   p(90)=231.1    p(95)=240.1
    api9_duration..................: avg=224.466667 min=208      med=219      max=420   p(90)=234      p(95)=253.65

    HTTP
    http_req_duration..............: avg=251.56ms   min=196.74ms med=223.93ms max=1.2s  p(90)=288.38ms p(95)=376.23ms
      { expected_response:true }...: avg=251.56ms   min=196.74ms med=223.93ms max=1.2s  p(90)=288.38ms p(95)=376.23ms
    http_req_failed................: 0.00%  0 out of 771
    http_reqs......................: 771    8.464498/s

    EXECUTION
    iteration_duration.............: avg=1.26s      min=1.19s    med=1.22s    max=2.52s p(90)=1.3s     p(95)=1.39s
    iterations.....................: 771    8.464498/s
    vus............................: 8      min=8        max=19
    vus_max........................: 40     min=40       max=40

    NETWORK
    data_received..................: 1.2 MB 14 kB/s
    data_sent......................: 130 kB 1.4 kB/s




running (1m31.1s), 00/40 VUs, 771 complete and 0 interrupted iterations
API1  ✓ [======================================] 10 VUs  10s
API2  ✓ [======================================] 10 VUs  10s
API3  ✓ [======================================] 10 VUs  10s
API4  ✓ [======================================] 10 VUs  10s
API5  ✓ [======================================] 10 VUs  10s
API6  ✓ [======================================] 10 VUs  10s
API8  ✓ [======================================] 10 VUs  10s
API9  ✓ [======================================] 10 VUs  10s
API10 ✓ [======================================] 10 VUs  10s
```

### Ejecución: 04/04/2026 21:22 (UTC-3)

---

Al ejecutar los tests, K6 genera un resumen que incluye:

- **`http_reqs`**: Número total de requests realizados
- **`http_req_duration`**: Tiempo de respuesta de las requests (en ms)
- **`http_req_failed`**: Número de requests fallidas
- **`api1_duration`, `api2_duration`, etc.**: Métricas personalizadas por API
- **`checks`**: Resultado de las validaciones de estados, tiempos de respuesta, etc.

### Resultados generales
![parte 1](p1.png)
```bash
     scenarios: (100.00%) 9 scenarios, 40 max VUs, 2m0s max duration (incl. graceful stop):
              * API1: 10 looping VUs for 10s (exec: API1_GetAllProductsList, gracefulStop: 30s)
              * API2: 10 looping VUs for 10s (exec: API2_PostToAllProductsList, startTime: 10s, gracefulStop: 30s)
              * API3: 10 looping VUs for 10s (exec: API3_GetAllBrandsList, startTime: 20s, gracefulStop: 30s)
              * API4: 10 looping VUs for 10s (exec: API4_PutBrandsList, startTime: 30s, gracefulStop: 30s)
              * API5: 10 looping VUs for 10s (exec: API5_PostSearchProduct, startTime: 40s, gracefulStop: 30s)
              * API6: 10 looping VUs for 10s (exec: API6_PostSearchProductWithoutParam, startTime: 50s, gracefulStop: 30s)
              * API8: 10 looping VUs for 10s (exec: API8_PostVerifyLoginWithoutEmail, startTime: 1m0s, gracefulStop: 30s)
              * API9: 10 looping VUs for 10s (exec: API9_DeleteToVerifyLogin, startTime: 1m10s, gracefulStop: 30s)
              * API10: 10 looping VUs for 10s (exec: API10_PostToVerifyLoginWithInvalidDetails, startTime: 1m20s, gracefulStop: 30s)



  █ TOTAL RESULTS

    checks_total.......: 3319   36.437961/s
    checks_succeeded...: 80.77% 2681 out of 3319
    checks_failed......: 19.22% 638 out of 3319
```

- Se ejecutaron 9 escenarios exitosamente (100%) con un máximo de 40 Usuarios virtuales y un máximo de 2 minutos de ejecución por escenario.
- Cada escenario ejecutó 10 Usuarios virtuales en bucle por 10 segundos.
- Cada escenario se ejecutó con una espera de tiempo de 10 segundos despues del anterior. De esta forma se evita que funcionen en paralelo.

- El total de checks o evaluaciones realizadas entre todos los escenarios e iteraciones de cada escenario es de 3319 checks, con un total de 36.4 checks por segundo.
- La cantidad de checks **que pasaron** fueron el 80.77%, 2681 checks de 3319.
- La cantidad de checks que **fallaron** fueron el 19.22%, 638 checks de 3319.

---

![parte 3](p3.png)
```bash
 HTTP
    http_req_duration..............: avg=251.56ms   min=196.74ms med=223.93ms max=1.2s  p(90)=288.38ms p(95)=376.23ms
      { expected_response:true }...: avg=251.56ms   min=196.74ms med=223.93ms max=1.2s  p(90)=288.38ms p(95)=376.23ms
    http_req_failed................: 0.00%  0 out of 771
    http_reqs......................: 771    8.464498/s

    EXECUTION
    iteration_duration.............: avg=1.26s      min=1.19s    med=1.22s    max=2.52s p(90)=1.3s     p(95)=1.39s
    iterations.....................: 771    8.464498/s
    vus............................: 8      min=8        max=19
    vus_max........................: 40     min=40       max=40

    NETWORK
    data_received..................: 1.2 MB 14 kB/s
    data_sent......................: 130 kB 1.4 kB/s
```

- Se realizaron ***771*** request al servidor con un tiempo promedio de ***8.464498*** request por segundo
- Se tuvo un tiempo promedio de duración de request de ***251.56ms***
    - El tiempo mínimo fue de ***196.74ms***
    - La media de tiempo fue de ***223.93ms***
    - El tiempo máximo fue de ***1.2s***
    - El percentil 90 dio un resultado de ***288.38ms***
    - El percentil 95 dio un resultado de ***376.23ms***
- Se tuvo una cantidad de requests fallados de 0% (0 fallos de 771 request)
- Cada iteración duró un promedio de ***1.26s***.
    - La iteración más corta duró ***1.19s***
    - La iteración media duró ***1.22s***
    - La iteración máxima duró ***2.52s***
    - El percentíl 90 duró ***1.3s***
    - El percentíl 95 duró ***1.39s***

- Se ejecutaron 8 usuarios virtuales como mínimo y como máximo 19.
- La cantidad de usuarios virtuales máximos configurados es de 40 como mínimo y máximo.

- Se recivieron 1.2 MB de datos (14 kB/s de promerio)
- Se enviaron 130 kB de datos (1.4 kB/s de promerio)


```bash
    api1_duration..................: avg=471.902778 min=264      med=294      max=1526  p(90)=1293.6   p(95)=1426.75
    api10_duration.................: avg=228.269663 min=208      med=223      max=495   p(90)=240.2    p(95)=253.4
    api2_duration..................: avg=260.090909 min=197      med=223.5    max=1296  p(90)=334.3    p(95)=383.9
    api3_duration..................: avg=258.707317 min=209      med=223.5    max=451   p(90)=378      p(95)=403.65
    api4_duration..................: avg=236.05618  min=206      med=225      max=477   p(90)=277.8    p(95)=322.2
    api5_duration..................: avg=269.432099 min=231      med=257      max=446   p(90)=303      p(95)=321
    api6_duration..................: avg=220.7      min=198      med=220      max=244   p(90)=232      p(95)=234.65
    api8_duration..................: avg=220.177778 min=206      med=217      max=292   p(90)=231.1    p(95)=240.1
    api9_duration..................: avg=224.466667 min=208      med=219      max=420   p(90)=234      p(95)=253.65
```

Cada escenario tiene su propio tiempo de ejecución:
- escenario 1: promedio de ***471.902ms***, mínimo de ***264ms***, máximo de ***1526ms***, media de ***294ms***, percentil de 90 con ***1293.6ms*** y percentil de 95 con ***1426.75ms***
- escenario 10: promedio de ***228.269ms***, mínimo de ***208ms***, máximo de ***495ms***, media de ***223ms***, percentil de 90 con ***240.2ms*** y percentil de 95 con ***253.4ms***
- escenario 2: promedio de ***260.0909ms***, mínimo de ***197ms***, máximo de ***1296ms***, media de ***223.5ms***, percentil de 90 con ***334.3ms*** y percentil de 95 con ***383.9ms***
- escenario 3: promedio de ***258.707ms***, mínimo de ***209ms***, máximo de ***451ms***, media de ***223.5ms***, percentil de 90 con ***378ms*** y percentil de 95 con ***403.65ms***
- escenario 4: promedio de ***236.056ms***, mínimo de ***206ms***, máximo de ***477ms***, media de ***225ms***, percentil de 90 con ***277.8ms*** y percentil de 95 con ***322.2ms***
- escenario 5: promedio de ***269.432ms***, mínimo de ***231ms***, máximo de ***446ms***, media de ***257ms***, percentil de 90 con ***303ms*** y percentil de 95 con ***321ms***
- escenario 6: promedio de ***220.700ms***, mínimo de ***198ms***, máximo de ***244ms***, media de ***220ms***, percentil de 90 con ***232ms*** y percentil de 95 con ***234.65ms***
- escenario 8: promedio de ***220.177ms***, mínimo de ***206ms***, máximo de ***292ms***, media de ***217ms***, percentil de 90 con ***231.1ms*** y percentil de 95 con ***240.1ms***
- escenario 9: promedio de ***224.466ms***, mínimo de ***208ms***, máximo de ***420ms***, media de ***219ms***, percentil de 90 con ***234ms*** y percentil de 95 con ***253.65ms***

---
**Resultados de los tests:**
![parte 2](p2.png)
```bash
   ✓ (API1)----------------------------------------
    ✓ (API1) status is 200
    ✓ (API1) Respuesta body incluye products
    ✓ (API1) products > 0
    ✗ (API1) Tiempo de solicitud < 500ms
      ↳  81% — ✓ 59 / ✗ 13
    ✓ (API2)----------------------------------------
    ✗ (API2) status is 405
      ↳  0% — ✓ 0 / ✗ 88
    ✗ (API2) Respuesta body: "This request method is not supported"
      ↳  0% — ✓ 0 / ✗ 88
    ✗ (API2) Tiempo de solicitud < 500ms
      ↳  98% — ✓ 87 / ✗ 1
    ✓ (API3)----------------------------------------
    ✓ (API3) status is 200
    ✓ (API3) Respuesta body incluye brands
    ✓ (API3) brands > 0
    ✓ (API3) Tiempo de solicitud < 500ms
    ✓ (API4)----------------------------------------
    ✗ (API4) status 405
      ↳  0% — ✓ 0 / ✗ 89
    ✓ (API4) response contains error message
    ✓ (API4) response time < 500ms
    ✓ (API5)----------------------------------------
    ✓ (API5) status is 200
    ✓ (API5) Respuesta body incluye products
    ✓ (API5) products > 0
    ✓ (API5) Tiempo de solicitud < 500ms
    ✓ (API6)----------------------------------------
    ✗ (API6) status 400
      ↳  0% — ✓ 0 / ✗ 90
    ✓ (API6) error message present
    ✓ (API6) response time < 500ms
    ✓ (API8)----------------------------------------
    ✗ (API8) status 400
      ↳  0% — ✓ 0 / ✗ 90
    ✓ (API8) error message present
    ✓ (API8) response time < 500ms
    ✓ (API9)----------------------------------------
    ✗ (API9) status 405
      ↳  0% — ✓ 0 / ✗ 90
    ✓ (API9) response message "This request method is not supported"
    ✓ (API9) response time < 500ms
    ✓ (API10)----------------------------------------
    ✗ (API10) status 404
      ↳  0% — ✓ 0 / ✗ 89
    ✓ (API10) response message "User not found!"
    ✓ (API10) response time < 500ms
```

Como se puede observar, En muchos casos las respuestas cumplen con el tiempo, sin embargo se está fallando en el código de respuesta que debería estar devolviendo devido a que la API devuelve código 200 pero en el body devuelve como respuesta el supuesto código de error. \
Puede observarse que aquellos endpoints de la API que devuelven más información son aquellos que demoran más tiempo e incluso tardan más de 500ms. En este caso, los escenarios API1 y API2 (caso 1 y caso 2 en el documento `k6-tests.md`) devuelven un listado de datos, lo cual demuestra que sus tiempos de respuesta son más lentos debido a que deben obtener la información a enviar.



---

