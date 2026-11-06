# S1 · Ejercicios: tu primera API

Todo el código va en `src/app.ts`. Los datos están en `src/datos.ts`. Arranca la API con
`npm run dev:s01` y pruébala con `curl` o con REST Client mientras trabajas.

## e01 · GET /salud (Bloque 4)

Añade una ruta que diga que la API está viva.

**Hecho cuando:** `GET /salud` responde 200 con el JSON `{"estado":"ok"}`.

```bash
npm run comprobar s01 e01
```

## e02 · Listar las tareas (Bloque 4)

**Hecho cuando:** `GET /tareas` responde 200 con `{ "items": [ ...todas las tareas... ] }`.

Pista: devuelve un objeto con `items`, no el array suelto. Así podrás añadir más campos
(la paginación de S2) sin romper a quien ya usa tu API.

## e03 · Una tarea, o 404 (Bloque 4)

**Hecho cuando:**

- `GET /tareas/2` responde 200 con la tarea 2.
- `GET /tareas/99` responde 404 con `Content-Type: application/problem+json` y un cuerpo
  con `status` y `title`.

Pista: `req.params.id` llega como texto.

## e04 · Reto: un segundo recurso (si acabas antes)

**Hecho cuando:**

- `GET /etiquetas` y `GET /etiquetas/:id` funcionan como las tareas.
- Cualquier ruta que no existe responde 404 con `application/problem+json`, no con la
  página HTML de Express.
