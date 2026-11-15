# S1 · Ejercicios: tu primera API

Nueve ejercicios, dos o tres por bloque. Cada uno se comprueba con:

```bash
# desde ejercicios
npm run comprobar s01 e01      # un ejercicio
npm run comprobar s01          # toda la sesión
```

| Ejercicio | Bloque | Dónde | Para quién |
|---|---|---|---|
| e01 · Explorar la API de ejemplo | 1 | `src/respuestas/explorar.ts` | Todos |
| e02 · ¿Qué verbo y qué código? | 2 | `src/respuestas/verbos.ts` | Todos |
| e03 · `GET /salud` | 3 | `src/app.ts` | Todos (lo hacemos juntos) |
| e04 · Listar las tareas | 3 | `src/app.ts` | Todos |
| e05 · La prioridad, tipada | 3 | `src/datos.ts` | Todos |
| e06 · Reto: filtrar | 3 | `src/app.ts` | Si acabas antes |
| e07 · Una tarea, o 404 | 4 | `src/app.ts` | Todos |
| e08 · El resumen | 4 | `src/app.ts` | Si acabas e07 |
| e09 · Reto: un segundo recurso | 4 | `src/app.ts` | Si acabas antes |

Para los ejercicios de código, arranca tu API con `npm run dev:s01` y pruébala con
`curl` o con REST Client mientras trabajas. Los datos están en `src/datos.ts`.

Si terminas todo lo tuyo antes que el resto: la práctica 1
(`docs/prácticas/practica-01.pdf`).

## e01 · Explorar la API de ejemplo (Bloque 1)

Arranca la API de ejemplo (`cd docs/ejemplos/api-base && npm run dev`), haz las
peticiones con `curl -i` o REST Client y contesta en `src/respuestas/explorar.ts`:
cambia cada `null` por tu respuesta. El editor te propone las opciones válidas.

**Hecho cuando:** `npm run comprobar s01 e01` da `[ OK ]`. Si una respuesta está mal, te
dice cuál y te da una pista, pero no la solución.

## e02 · ¿Qué verbo y qué código? (Bloque 2)

En `src/respuestas/verbos.ts`, para cada una de las diez situaciones, rellena el verbo, la
ruta y el código de respuesta.

**Hecho cuando:** `npm run comprobar s01 e02` da `[ OK ]`. Cuando hay más de una respuesta
razonable (por ejemplo, 200 o 204), se aceptan las dos.

## e03 · GET /salud (Bloque 3, en directo)

Añade una ruta que diga que la API está viva.

**Hecho cuando:** `GET /salud` responde 200 con el JSON `{"estado":"ok"}`.

## e04 · Listar las tareas (Bloque 3)

**Hecho cuando:** `GET /tareas` responde 200 con `{ "items": [ ...todas las tareas... ] }`.

Pista: devuelve un objeto con `items`, no el array suelto. Así podrás añadir más campos
(la paginación de S2) sin romper a quien ya usa tu API.

## e05 · La prioridad, tipada (Bloque 3)

En `src/datos.ts`, añade a la `interface Tarea` un campo opcional
`prioridad?: "alta" | "media" | "baja"` y pon `prioridad: "alta"` a la tarea 2. Después
prueba `"urgente"` y lee el error de `npm run typecheck`.

**Hecho cuando:** la tarea 2 tiene prioridad `"alta"`, las demás no tienen, y
`npm run typecheck` sale limpio.

## e06 · Reto: filtrar (Bloque 3, si acabas antes)

**Hecho cuando:** `GET /tareas?completada=true` devuelve solo las completadas,
`?completada=false` solo las pendientes, y sin el parámetro, todas.

Pista: `req.query.completada` llega como texto: `"true"`, no `true`.

## e07 · Una tarea, o 404 (Bloque 4)

**Hecho cuando:**

- `GET /tareas/2` responde 200 con la tarea 2.
- `GET /tareas/99` responde 404 con `Content-Type: application/problem+json` y un cuerpo
  con `status` y `title`.

Pista: `req.params.id` llega como texto.

## e08 · El resumen (Bloque 4, si acabas e07)

**Hecho cuando:** `GET /tareas/resumen` responde 200 con
`{ "total": 3, "completadas": 1, "pendientes": 2 }`, calculado a partir de la lista (si
cambias los datos, cambia solo), y `GET /tareas/2` sigue funcionando.

Pista: Express prueba las rutas en orden. Si `/tareas/:id` va antes, «resumen» se toma
por un id.

## e09 · Reto: un segundo recurso (Bloque 4, si acabas antes)

**Hecho cuando:**

- `GET /etiquetas` y `GET /etiquetas/:id` funcionan como las tareas.
- Cualquier ruta que no existe responde 404 con `application/problem+json`, no con la
  página HTML de Express.
