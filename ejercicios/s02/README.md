# S2 · Ejercicios: CRUD, validación, errores y middleware

La API ya viene en capas, y cada capa hace una sola cosa:

| Fichero | Capa | Qué hace |
|---|---|---|
| `src/tareas/rutas.ts` | Rutas | Traduce HTTP a llamadas al servicio |
| `src/tareas/servicio.ts` | Servicio | Las reglas: qué se puede hacer y qué error dar |
| `src/tareas/repositorio.ts` | Repositorio | Guarda las tareas (en memoria; ya está hecho) |
| `src/tareas/esquemas.ts` | — | Qué forma tienen los datos que llegan (Zod) |
| `src/errores.ts` | — | Cómo se ve un error: `application/problem+json` |
| `src/middleware.ts` | — | Lo que pasa a todas las peticiones antes de llegar a las rutas |

```bash
# desde ejercicios/
npm run dev:s02
npm run comprobar s02 e01
```

## e01 · El CRUD completo (Bloque 1)

**Hecho cuando:**

- `POST /tareas` responde **201**, con la tarea creada y la cabecera `Location: /tareas/<id>`.
- `PUT /tareas/:id` reemplaza la tarea entera; `PATCH /tareas/:id` cambia solo lo que se manda.
- `DELETE /tareas/:id` responde **204** sin cuerpo.
- Sobre una tarea que no existe, los tres responden **404**.

## e02 · Validación y errores (Bloque 2)

**Hecho cuando:**

- Un `POST` sin `titulo`, con `titulo` vacío o con una `prioridad` que no es `baja`,
  `media` o `alta` responde **400**, con `errors: [{ campo, mensaje }]`.
- Un `POST` con solo `titulo` se crea con `prioridad: "media"` y `completada: false`.
- Un `PATCH` con `completada: "sí"` responde 400. Un `PATCH` con `id` no cambia el id.
- Un JSON mal formado responde 400, y todos los errores llevan
  `Content-Type: application/problem+json`.

Pista: con Express 5, lo que se lanza en una ruta (`TareaNueva.parse(req.body)`) llega
solo al manejador de errores.

## e03 · Filtrar, ordenar y paginar (Bloque 3)

**Hecho cuando** `GET /tareas` acepta:

| Parámetro | Valores | Por defecto |
|---|---|---|
| `prioridad` | `baja`, `media`, `alta` | todas |
| `completada` | `true`, `false` | todas |
| `orden` | `id`, `titulo`, `prioridad`, con `-` delante para descendente | `id` |
| `pagina` | 1 o más | 1 |
| `limite` | de 1 a 100 | 10 |

La respuesta es `{ items, total, pagina, limite }`, y un valor no válido responde 400.

## e04 · La cadena de middleware (Bloque 4)

**Hecho cuando:**

- Cada respuesta lleva `X-Request-Id` (el que llega o uno nuevo).
- Lleva las cabeceras de `helmet` y no lleva `X-Powered-By`.
- CORS solo da permiso a los orígenes de `crearApp({ origenes })`.
- Un cuerpo de más de 100 kB responde **413**, y pasado el límite por minuto, **429**
  con `Retry-After` o `RateLimit`. Los dos con problem+json.

## e05 · Reto: un 500 que no cuenta secretos (si acabas antes)

`GET /fallo-de-prueba` lanza un error con datos internos. **Hecho cuando** responde 500
con problem+json, sin la traza ni el mensaje interno, con el `requestId` de la petición en
el cuerpo, y el error sí queda en el log (`console.error`).

Para pensar: ¿qué pasa si pones `limitePeticiones` después de las rutas? ¿Y `idPeticion`
después de `helmet`? Muévelos y vuelve a pasar las pruebas.
