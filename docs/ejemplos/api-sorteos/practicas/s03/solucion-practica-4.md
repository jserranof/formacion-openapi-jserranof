# Sesión 3 · Práctica 4 · Una solución

Es una solución posible, con la lista de requisitos de referencia (`requisitos-referencia.md`).
Vuestros identificadores y vuestro orden pueden ser otros: lo que cuenta es que estén los
mismos grupos, los mismos límites y un caso por cada código que declara el contrato.

Resultados obtenidos contra las dos versiones de la API. Todas las apuestas, con el token de
ana y en el sorteo 4 salvo que se diga otra cosa.

## Batería de casos

### `POST /apuestas` (guiado)

| ID | Título | Requisito | Tipo | Entrada | Esperado | Estable | Candidata |
|---|---|---|---|---|---|---|---|
| CP-05 | Apuesta válida | REQ-13 a REQ-19 | positivo | `[3, 12, 21, 30, 39, 48]` | 201, cabecera `Location`, estado `activa`, importe 0.5 | Pasa | **Falla**: sin `Location` |
| CP-06 | Cinco números | REQ-13 | límite | `[1, 2, 3, 4, 5]` | 400 | Pasa | Pasa |
| CP-07 | Siete números | REQ-13 | límite | `[1, 2, 3, 4, 5, 6, 7]` | 400 | Pasa | Pasa |
| CP-08 | Número repetido | REQ-14 | negativo | `[1, 1, 2, 3, 4, 5]` | 400 | Pasa | **Falla**: 201 |
| CP-09 | Límites dentro: 1 y 49 | REQ-15 | límite | `[1, 2, 3, 4, 5, 49]` | 201 | Pasa | Pasa |
| CP-10 | Número 0 | REQ-15 | límite | `[0, 2, 3, 4, 5, 6]` | 400 | Pasa | **Falla**: 500 |
| CP-11 | Número 50 | REQ-15 | límite | `[1, 2, 3, 4, 5, 50]` | 400 | Pasa | **Falla**: 500 |
| CP-12 | Sorteo cerrado | REQ-16 | negativo | `sorteoId: 3` | 409 | Pasa | **Falla**: 201 |
| CP-13 | Sorteo que no existe | REQ-16 | negativo | `sorteoId: 99` | 404 | Pasa | Pasa |
| CP-26 | Sorteo celebrado | REQ-16 | negativo | `sorteoId: 1` | 409 | Pasa | **Falla**: 201 |
| CP-14 | Sin permiso de escritura | REQ-17 | seguridad | Token de luis | 403 | Pasa | Pasa |
| CP-15 | Sin token | REQ-11 | seguridad | Sin cabecera `Authorization` | 401 | Pasa | Pasa |

### `GET /sorteos/{id}` (tú solo)

| ID | Título | Requisito | Tipo | Entrada | Esperado | Estable | Candidata |
|---|---|---|---|---|---|---|---|
| CP-01 | Sorteo existente | REQ-06 | positivo | `GET /sorteos/5` | 200, campos obligatorios, `precioApuesta` número | Pasa | **Falla**: precio en texto |
| CP-17 | Id 1, límite dentro | REQ-08 | límite | `GET /sorteos/1` | 200 | Pasa | Pasa |
| CP-04 | Id 0, límite fuera | REQ-08 | límite | `GET /sorteos/0` | 400 | Pasa | Pasa |
| CP-18 | Id negativo | REQ-08 | negativo | `GET /sorteos/-1` | 400 | Pasa | Pasa |
| CP-03 | Id que no es número | REQ-08 | negativo | `GET /sorteos/abc` | 400 | Pasa | Pasa |
| CP-02 | Sorteo que no existe | REQ-07 | negativo | `GET /sorteos/99` | 404 `problem+json` | Pasa | **Falla**: 200 con `{}` |

### `DELETE /apuestas/{id}` (tú solo)

Anular cambia los datos: para repetir los casos, reinicia la API (Ctrl+C y `./arrancar.sh`).

| ID | Título | Requisito | Tipo | Entrada | Esperado | Estable | Candidata |
|---|---|---|---|---|---|---|---|
| CP-19 | Anular la propia, sorteo abierto | REQ-20 | positivo | ana, apuesta 2 | 204 | Pasa | Pasa |
| CP-20 | Anular dos veces | REQ-20 | negativo | Repetir CP-19 | 204 (DELETE es idempotente) | Pasa | Pasa |
| CP-21 | Anular en un sorteo celebrado | REQ-20 | negativo | ana, apuesta 1 | 409 | Pasa | Pasa |
| CP-22 | Anular la de otro usuario | REQ-12 | seguridad | ana, apuesta 3 (de luis) | 404 | Pasa | **Falla**: 204 |
| CP-16 | Ver la de otro usuario | REQ-12 | seguridad | ana, `GET /apuestas/3` | 404 | Pasa | **Falla**: 200 |
| CP-23 | Anular sin permiso | REQ-17 | seguridad | luis, apuesta 3 | 403 | Pasa | Pasa |
| CP-24 | Anular sin token | REQ-11 | seguridad | Sin cabecera `Authorization` | 401 | Pasa | Pasa |
| CP-25 | Anular el id 0 | REQ-08 | límite | apuesta 0 | 400 | Pasa | Pasa |

## Matriz requisito → caso

| Requisito | Casos | Positivos | Negativos | Límite | Seguridad | ¿Cubierto? |
|---|---|---|---|---|---|---|
| REQ-01 | — | 0 | 0 | 0 | 0 | **No** |
| REQ-02 | — | 0 | 0 | 0 | 0 | **No** |
| REQ-03 | — | 0 | 0 | 0 | 0 | **No** |
| REQ-04 | — | 0 | 0 | 0 | 0 | **No** |
| REQ-05 | — | 0 | 0 | 0 | 0 | **No** |
| REQ-06 | CP-01 | 1 | 0 | 0 | 0 | Sí |
| REQ-07 | CP-02 | 0 | 1 | 0 | 0 | Sí |
| REQ-08 | CP-03, CP-04, CP-17, CP-18, CP-25 | 0 | 2 | 3 | 0 | Sí |
| REQ-09 | — | 0 | 0 | 0 | 0 | **No** |
| REQ-10 | — | 0 | 0 | 0 | 0 | **No** |
| REQ-11 | CP-15, CP-24 | 0 | 0 | 0 | 2 | Sí |
| REQ-12 | CP-16, CP-22 | 0 | 0 | 0 | 2 | Sí |
| REQ-13 | CP-05, CP-06, CP-07 | 1 | 0 | 2 | 0 | Sí |
| REQ-14 | CP-05, CP-08 | 1 | 1 | 0 | 0 | Sí |
| REQ-15 | CP-05, CP-09, CP-10, CP-11 | 1 | 0 | 3 | 0 | Sí |
| REQ-16 | CP-05, CP-12, CP-13, CP-26 | 1 | 3 | 0 | 0 | Sí |
| REQ-17 | CP-05, CP-14, CP-23 | 1 | 0 | 0 | 2 | Sí |
| REQ-18 | CP-05 | 1 | 0 | 0 | 0 | Sí |
| REQ-19 | CP-05 | 1 | 0 | 0 | 0 | Sí |
| REQ-20 | CP-19, CP-20, CP-21 | 1 | 2 | 0 | 0 | Sí |

**Huecos:** REQ-01 a REQ-05, REQ-09 y REQ-10. La práctica no pedía esas operaciones; estos
casos los cerrarían:

| Requisito | Caso que falta | Esperado |
|---|---|---|
| REQ-01 | `GET /salud` | 200 con `estado` y `version` |
| REQ-02 | `POST /auth/token` con ana / ana-practicas | 200 con `access_token` |
| REQ-03 | `POST /auth/token` con una clave incorrecta | 401 |
| REQ-04 | `GET /sorteos` | 200 con `items` y `total` |
| REQ-05 | `GET /sorteos?estado=otro` (con la URL o curl: Swagger UI no deja elegirlo) | 400 |
| REQ-09 | `GET /sorteos/1/resultado` | 200 con 6 números y el complementario |
| REQ-10 | `GET /sorteos/4/resultado` | 404 |

REQ-06 y REQ-18 tienen un solo caso, y en los dos falla la candidata: sin esos casos, el precio
en texto y la cabecera `Location` que falta no se habrían detectado.
