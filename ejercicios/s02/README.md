# S2 · Ejercicios: CRUD, validación, errores y middleware

Doce ejercicios, tres por bloque: dos para todos y un reto. Cada uno se comprueba con:

```bash
# desde ejercicios
npm run comprobar s02 e02      # un ejercicio
npm run comprobar s02          # toda la sesión
```

| Ejercicio | Bloque | Dónde | Para quién |
|---|---|---|---|
| e01 · Arregla un diseño | 1 | `src/respuestas/diseno.ts` | Todos |
| e02 · El CRUD completo | 1 | `src/tareas/rutas.ts` y `servicio.ts` | Todos (el `POST`, en directo) |
| e03 · Reto: 405 y `Allow` | 1 | `src/tareas/rutas.ts` | Si acabas antes |
| e04 · Un manejador central de errores | 2 | `src/errores.ts` | Todos |
| e05 · Validar con Zod | 2 | `src/tareas/esquemas.ts` y `rutas.ts` | Todos (necesita e04) |
| e06 · Reto: un id que no es un id | 2 | `src/tareas/esquemas.ts` y `rutas.ts` | Si acabas antes |
| e07 · Filtrar | 3 | `esquemas.ts`, `servicio.ts` y `rutas.ts` | Todos |
| e08 · Ordenar y paginar | 3 | `esquemas.ts` y `servicio.ts` | Todos |
| e09 · Reto: enlaces en `Link` | 3 | `src/tareas/rutas.ts` | Si acabas antes |
| e10 · La cadena: identificador, helmet y CORS | 4 | `src/middleware.ts` y `app.ts` | Todos |
| e11 · Límites y registro | 4 | `src/middleware.ts`, `app.ts` y `errores.ts` | Todos |
| e12 · Reto: un 500 que no cuenta secretos | 4 | `src/errores.ts` | Si acabas antes |

Los retos (e03, e06, e09 y e12) se cuentan aparte: `npm run comprobar s02` termina con
`8 de 8 ejercicios superados · retos: 0 de 4.` y eso ya es el día completo.

La API ya viene en capas, y cada capa hace una sola cosa:

| Fichero | Capa | Qué hace |
|---|---|---|
| `src/tareas/rutas.ts` | Rutas | Traduce HTTP a llamadas al servicio |
| `src/tareas/servicio.ts` | Servicio | Las reglas: qué se puede hacer y qué error dar |
| `src/tareas/repositorio.ts` | Repositorio | Guarda las tareas (en memoria; ya está hecho) |
| `src/tareas/esquemas.ts` | — | Qué forma tienen los datos que llegan (Zod) |
| `src/errores.ts` | — | Cómo se ve un error: `application/problem+json` |
| `src/middleware.ts` | — | Lo que pasa a todas las peticiones antes de llegar a las rutas |

Arranca tu API con `npm run dev:s02` y pruébala con `curl` o con REST Client
(`s02/tareas.http`) mientras trabajas. Los datos están en `src/datos.ts`: doce tareas,
para que la paginación tenga sentido.

Si terminas todo lo tuyo antes que el resto: práctica 2 (`docs/prácticas/practica-02.pdf`).

## e01 · Arregla un diseño (Bloque 1)

En `src/respuestas/diseno.ts` hay ocho rutas mal diseñadas. Para cada una, escribe el verbo
y la ruta que usarías tú. Después, cuatro preguntas: por qué un `GET` no puede borrar, los
niveles de Richardson y la cabecera de un `201`.

**Hecho cuando:** `npm run comprobar s02 e01` da `[ OK ]`. Si una respuesta está mal, te
dice cuál y te da una pista, pero no la solución.

## e02 · El CRUD completo (Bloque 1)

**Hecho cuando:**

- `POST /tareas` responde **201**, con la tarea creada y la cabecera `Location: /tareas/<id>`.
- `PUT /tareas/:id` reemplaza la tarea entera; `PATCH /tareas/:id` cambia solo lo que se manda.
- `DELETE /tareas/:id` responde **204** sin cuerpo.
- Sobre una tarea que no existe, `PUT`, `PATCH` y `DELETE` responden **404**.

Pista: el repositorio ya sabe crear, guardar y borrar. El servicio decide si la tarea
existe (lanza `ErrorApi(404, …)`); la ruta solo traduce a HTTP.

## e03 · Reto: 405 y `Allow` (Bloque 1, si acabas antes)

**Hecho cuando** `DELETE /tareas`, `PUT /tareas` o `POST /tareas/3` responden **405** con
`problem+json` y la cabecera `Allow` con los verbos que sí valen (`GET, POST` en la
colección; `GET, PUT, PATCH, DELETE` en una tarea).

Pista: `rutas.all("/", …)` y `rutas.all("/:id", …)`, **después** de las rutas de verdad.

## e04 · Un manejador central de errores (Bloque 2)

**Hecho cuando** `manejadorErrores` (en `src/errores.ts`) responde siempre con
`problem+json`:

- Un `ErrorApi` (el 404 de una tarea que no existe) sale con su status, título y detalle.
- Un JSON mal formado (`err.type === "entity.parse.failed"`) responde **400**, no una página HTML.

Pista: Express reconoce un manejador de errores porque tiene **cuatro** parámetros. Si
le quitas uno, deja de serlo.

## e05 · Validar con Zod (Bloque 2, necesita e04)

**Hecho cuando:**

- Un `POST` sin `titulo`, con `titulo` vacío o con una `prioridad` que no es `baja`,
  `media` o `alta` responde **400**, con `errors: [{ campo, mensaje }]`.
- Un `POST` con solo `titulo` se crea con `prioridad: "media"` y `completada: false`.
- Un `PUT` sin `titulo` responde 400: sustituir pide la tarea entera.
- Un `PATCH` con `completada: "sí"` responde 400. Un `PATCH` con `id` no cambia el id.

Pista: con Express 5, lo que se lanza en una ruta (`TareaNueva.parse(req.body)`) llega
solo al manejador de errores. Ahí, un `ZodError` se convierte en el 400.

## e06 · Reto: un id que no es un id (Bloque 2, si acabas antes)

Ayer, `GET /tareas/abc` daba 404. ¿Es lo correcto? «abc» no puede ser el id de nada: la
petición está mal escrita.

**Hecho cuando** `GET`, `PATCH` y `DELETE` sobre `/tareas/abc`, `/tareas/0` o
`/tareas/2.5` responden **400** con un error en el campo `id`, y `/tareas/99` sigue
siendo 404.

Pista: valida `req.params` con un esquema `{ id: z.coerce.number().int().min(1) }`.

## e07 · Filtrar (Bloque 3)

**Hecho cuando** `GET /tareas` acepta `prioridad` (`baja`, `media`, `alta`) y
`completada` (`true`, `false`), solos o combinados, y un valor que no existe responde 400.

Pista: todo lo que llega en la query string es texto: `"false"` no es `false`.

## e08 · Ordenar y paginar (Bloque 3)

**Hecho cuando** `GET /tareas` acepta:

| Parámetro | Valores | Por defecto |
|---|---|---|
| `orden` | `id`, `titulo`, `prioridad`, con `-` delante para descendente | `id` |
| `pagina` | 1 o más | 1 |
| `limite` | de 1 a 100 | 10 |

La respuesta es `{ items, total, pagina, limite }`; una página más allá del final
devuelve `items: []`, y un valor no válido responde 400. La prioridad se ordena de baja a
alta, no por el alfabeto.

## e09 · Reto: enlaces en `Link` (Bloque 3, si acabas antes)

**Hecho cuando** `GET /tareas?limite=5&pagina=2` responde con la cabecera
`Link: </tareas?…&pagina=3>; rel="next", </tareas?…&pagina=1>; rel="prev"`, sin `prev`
en la primera página ni `next` en la última, y los enlaces conservan los filtros y el
orden. Es lo que hace la API de GitHub.

## e10 · La cadena: identificador, helmet y CORS (Bloque 4)

**Hecho cuando:**

- Cada respuesta lleva `X-Request-Id` (el que llega o uno nuevo).
- Lleva las cabeceras de `helmet` y no lleva `X-Powered-By`.
- CORS solo da permiso a los orígenes de `crearApp({ origenes })`.

## e11 · Límites y registro (Bloque 4)

**Hecho cuando:**

- Un cuerpo de más de 100 kB responde **413**, y pasado el límite por minuto, **429**
  con `Retry-After` o `RateLimit`. Los dos con problem+json.
- Con `crearApp({ registro })`, cada petición (también las rechazadas con 429) llama una
  vez a `registro({ requestId, metodo, ruta, status, ms })`.

Pista: el registro se apunta en `res.on("finish", …)`, cuando la respuesta ya ha salido
y se sabe el código.

## e12 · Reto: un 500 que no cuenta secretos (Bloque 4, si acabas antes)

`GET /fallo-de-prueba` lanza un error con datos internos. **Hecho cuando** responde 500
con problem+json, sin la traza ni el mensaje interno, con el `requestId` de la petición en
el cuerpo, y el error sí queda en el log (`console.error`).

Para pensar: ¿qué pasa si pones `limitePeticiones` después de las rutas? ¿Y `idPeticion`
después de `express.json()`? Muévelos y vuelve a pasar las pruebas y un `curl`.
