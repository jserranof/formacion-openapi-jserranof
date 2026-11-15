# Anexo S2 · La API, lista para producción

Código de los tres bloques del anexo de S2. Los pasos están en
[`docs/sesiones/anexos/s02-anexo-referencia-rapida.md`](../../sesiones/anexos/s02-anexo-referencia-rapida.md).

| Fichero | Bloque | Qué es | Dónde se usa |
|---|---|---|---|
| `servidor-ordenado.ts` | A | Servidor con `/listo` y parada ordenada (`SIGTERM`/`SIGINT`) | Se copia a `ejercicios/s02/src/` |
| `repositorio-sqlite.ts` | B | El repositorio de tareas en SQLite (`node:sqlite`) | Se copia a `ejercicios/s02/src/tareas/` |
| `cors.html` | C | Una página que llama a la API desde el navegador | La sirve `servir.mjs` |
| `servir.mjs` | C | Sirve `cors.html` en el puerto que le digas | `node docs/ejemplos/anexo-s02/servir.mjs 5173` |

Antes de copiar nada, haz commit de tus ejercicios. Al terminar, borra lo copiado y
`git restore ejercicios/s02/src/app.ts ejercicios/s02/src/tareas/servicio.ts`.
