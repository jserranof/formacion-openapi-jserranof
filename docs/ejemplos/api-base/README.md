# api-base

Plantilla de partida del curso: Node 22, TypeScript, Express 5 y un contrato OpenAPI 3.1
servido con Swagger UI. El recurso `tareas` es provisional y se sustituye por el del caso
práctico.

```bash
# desde docs/ejemplos/api-base
npm install
npm run dev          # http://localhost:3000 · documentación en /docs
npm run typecheck
```

| Fichero | Qué es |
|---|---|
| `openapi.yaml` | El contrato |
| `src/server.ts` | Arranca el servidor |
| `src/app.ts` | Monta Express: JSON, `/docs`, rutas y errores |
| `src/tareas/` | El recurso: modelo, repositorio en memoria y rutas |
| `peticiones/tareas.http` | Peticiones de prueba para REST Client |
