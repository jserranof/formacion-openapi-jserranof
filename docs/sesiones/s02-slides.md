# S2 — CRUD completo, validación y errores · diapositivas

> Fuente de la presentación `presentaciones/s02-presentacion.pptx`.
>
> Patrón: cada idea va seguida de su «En el código» (o «En la terminal»), que remite a la
> referencia rápida (§N). Las diapositivas de base (explican cada palabra desde cero) se
> pueden saltar si el grupo ya la conoce: la lista está en el guion.

@pie CRUD completo, validación y errores

---

## @portada Curso APIs REST y OpenAPI con Node y TypeScript
### Sesión 2 · CRUD completo, validación y errores

Martes 17 de noviembre de 2026

Alejandro Muñoz · Julditec

---

## Primero, vuestras dudas

La **práctica 1**: los proyectos de solo lectura, su 404 y el paso 6 (verbo y código).

> ¿Qué os ha costado? ¿Qué no ha salido? Escribidlo en el chat.

---

## Tres preguntas de repaso

1. ¿Qué código devuelve un `POST` que crea, y qué cabecera lo acompaña?
2. En `/tareas/2`, ¿`req.params.id` es un número o un texto?
3. ¿Qué `Content-Type` lleva un error bien contado?

> Contesta en el chat. Treinta segundos cada una.

---

## Dónde estamos

@diagrama ruta
S1 · HTTP y primera API > S2 · CRUD, validación y errores > S3 · OpenAPI y pruebas > S4 · Seguridad y agentes de IA

Ayer, una API que **lee**. Hoy, una API que **escribe**, y que no se deja engañar.

---

## Hoy

@diagrama flujo
Diseño y CRUD -> Validar y errores -> Filtrar y paginar -> Middleware!

A las 14:00: una API que crea, cambia y borra, **rechaza lo que no tiene sentido**
y lleva la cadena de piezas de cualquier API en producción.

---

## Hoy empiezas en s02

- `ejercicios/s02` trae la API de ayer **terminada**, aunque no la acabaras
- Reorganizada en **capas**, y con doce tareas para que la paginación tenga sentido
- `npm run comprobar s02`: **ocho ejercicios y cuatro retos**, tres por bloque
- Arranca con `npm run dev:s02`

![FOTO 1] npm run comprobar s02 al empezar: 0 de 8 y las pistas en español

Referencia rápida · §0

---

## @seccion Diseño REST y el CRUD completo

---

## Recursos, no acciones

| Mal | Bien | Por qué |
|---|---|---|
| `GET /obtenerTareas` | `GET /tareas` | El verbo ya dice «obtener» |
| `POST /tareas/borrar/7` | `DELETE /tareas/7` | La acción va en el verbo |
| `GET /tarea?id=7` | `GET /tareas/7` | Cada cosa, su dirección |
| `GET /Proyectos/3/ListaTareas` | `GET /proyectos/3/tareas` | Minúsculas; una colección ya es una lista |

> Sustantivos en plural y en minúsculas. Los verbos, los de HTTP.

---

## Las relaciones se leen como carpetas

@diagrama entidades
Proyecto (el contenedor) -1:N-> Tarea (lo que hay dentro)

| Ruta | Qué es |
|---|---|
| `/proyectos/3/tareas` | Las tareas del proyecto 3 |
| `POST /proyectos/3/tareas` | Crear una tarea dentro del proyecto 3 |
| `/tareas?proyecto=3` | Lo mismo, como filtro: también vale |

Un nivel de anidamiento, como mucho dos. Más, y la ruta se vuelve un laberinto.

---

## Qué es una relación

Una tarea **pertenece** a un proyecto, y un proyecto **tiene** muchas tareas.

- En los datos: la tarea guarda el `id` de su proyecto
- En la API: la ruta lo cuenta, `/proyectos/3/tareas`
- Si el proyecto 3 no existe, `GET /proyectos/3/tareas` es **404**

> Como las carpetas de tu ordenador: la ruta dice dónde está cada cosa.

---

## El modelo de madurez de Richardson

@diagrama capas
Nivel 3 · Enlaces | La respuesta dice adónde ir después (HATEOAS)
Nivel 2 · Verbos y códigos* | GET, POST, PUT, PATCH, DELETE; 201, 404…
Nivel 1 · Recursos | /tareas, /tareas/7, pero todo con POST
Nivel 0 · Un solo punto | POST /api con {"accion":"listarTareas"}

Casi todas las APIs buenas están en el **nivel 2**. Ahí acabamos hoy.

---

## HATEOAS, solo para saber qué es

La respuesta lleva **enlaces** a lo siguiente que puedes hacer, como una web.

`Link: </tareas?pagina=3>; rel="next"`

- Lo verás en la paginación de GitHub, y en el reto de hoy (e09)
- Pocas APIs lo llevan entero: los clientes casi nunca lo siguen solos

> Si alguien dice «REST de verdad», suele hablar de esto.

---

## Las capas de la API

@diagrama capas
Rutas* | Traducen HTTP: leen req, contestan con res y un código
Servicio | Las reglas: ¿existe?, ¿se puede?, qué error dar
Repositorio | Guarda y busca. Hoy en memoria; mañana, una base de datos

Cada capa **hace una sola cosa**. Cambiar la base de datos solo toca el repositorio.

Referencia rápida · §1

---

## Por qué capas

Imagina una cocina donde el camarero también cocina y friega.

- Funciona con tres mesas; con treinta, es un caos
- En capas, cada uno sabe **qué le toca** y se puede cambiar sin tocar a los demás
- Y se prueba por partes: el servicio, sin HTTP; las rutas, sin base de datos

> Camarero, cocinero y despensa: rutas, servicio y repositorio.

---

## Un error que viaja solo

@diagrama flujo
GET /tareas/99 -> Ruta -> Servicio lanza ErrorApi(404) -> Manejador de errores -> 404 problem+json!

La ruta no tiene ni un `if`: **lanza**, y Express 5 lo lleva al manejador de errores.

---

## Crear: 201 y Location

@diagrama flujo
POST /tareas -> servicio.crear(datos) -> repositorio pone el id -> 201 + Location: /tareas/13!

`res.status(201).location("/tareas/13").json(tarea)`

El `id` lo pone **el servidor**, nunca el cliente.

---

## En el código: el POST

1. En el servicio, `crear(datos)`: el repositorio pone el `id`
2. En las rutas, `rutas.post("/", …)` con `201` y `Location`
3. `curl -i -X POST` con un título: `201 Created`
4. Otro `POST` con `{"nada":"de nada"}`: **también 201**

![FOTO 2] curl -i -X POST: 201 Created, Location y la tarea; y un segundo POST que guarda basura

Referencia rápida · §2

---

## PUT, PATCH y DELETE

| Verbo | Qué manda el cliente | Si va bien | Si no existe |
|---|---|---|---|
| `PUT /tareas/3` | La tarea **entera** | 200 con la tarea | 404 |
| `PATCH /tareas/3` | **Solo** lo que cambia | 200 con la tarea | 404 |
| `DELETE /tareas/3` | Nada | 204, **sin cuerpo** | 404 |

> Borrar dos veces: la primera 204, la segunda 404. Y la tarea, igual de borrada.

---

## PATCH: mezclar, no sustituir

`{ ...tareaQueHay, ...cambios }`

1. Tienes `{ id: 3, titulo: "Leer el contrato", completada: false, prioridad: "media" }`
2. Llega `{ "completada": true }`
3. Queda `{ id: 3, titulo: "Leer el contrato", completada: true, prioridad: "media" }`

> Los tres puntos copian los campos; lo que viene después, gana.

---

## Tu turno 1: arregla un diseño y el CRUD

1. **e01:** ocho rutas mal diseñadas → verbo y ruta buenos, en `respuestas/diseno.ts`
2. **e02:** `PUT`, `PATCH` y `DELETE` (204), con 404 si la tarea no existe

> **Lo tienes si** `npm run comprobar s02 e01` y `e02` dan `[ OK ]`.

**Si acabas antes, e03:** `DELETE /tareas` → **405** con la cabecera `Allow`. Referencia rápida · §3

---

## 405: el recurso existe, el verbo no

`DELETE /tareas` → `405 Method Not Allowed` · `Allow: GET, POST`

- Ayer, `DELETE /tareas/1` daba 404 en la API de ejemplo: lo apuntamos
- 404 dice «no existe»; 405 dice «existe, pero eso no se puede hacer aquí»
- `Allow` le dice al cliente qué verbos sí valen

---

## @seccion Validar lo que llega y contar bien los errores

---

## Nunca te fíes de lo que llega

Quien llama a tu API puede mandar **cualquier cosa**:

- Un campo que falta, o uno que no existe (`"nada": "de nada"`)
- Un tipo equivocado: `"completada": "sí"`
- Un `id` puesto por él, para pisar otra tarea
- Un JSON mal escrito, o de 50 MB

> Validar es la primera línea de defensa. Y el primer servicio al cliente: decirle qué corregir.

---

## Qué es validar

Comprobar que lo que llega **tiene la forma y el sentido** que esperas, antes de usarlo.

| Llega | ¿Vale? | Qué contestar |
|---|---|---|
| `{"titulo":"Preparar la demo"}` | Sí | 201 |
| `{}` | No: falta el título | 400: «titulo es obligatorio» |
| `{"titulo":"x","prioridad":"urgente"}` | No: esa prioridad no existe | 400: «baja, media o alta» |

---

## Zod: una sola fuente para tipos y validación

@diagrama abanico
Un esquema de Zod:
Valida en ejecución (lo que llega por la API)
Da el tipo de TypeScript (z.infer)
Limpia el dato (trim, valores por defecto)

Ayer el tipo era una `interface` que solo veía el editor. Hoy, el esquema **también vigila la puerta**.

---

## Leer un esquema

`z.object({ titulo: z.string().trim().min(1), prioridad: z.enum(PRIORIDADES).default("media") }).strict()`

1. `z.object({…})`: un objeto con estos campos
2. `z.string().trim().min(1)`: texto, sin espacios alrededor, no vacío
3. `z.enum(PRIORIDADES).default("media")`: uno de la lista; si no llega, `"media"`
4. `.strict()`: un campo que no está en la lista es un error

---

## En el código: Zod en tres líneas

1. `TareaNueva` en `esquemas.ts`
2. `TareaNueva.parse(req.body)` en el `POST`
3. Con un título: 201, con `prioridad` y `completada` rellenas
4. Con `{"nada":"de nada"}`: **500 y una página HTML**

![FOTO 3] Un ZodError sin manejador: 500, página HTML con la traza y las rutas del disco

Referencia rápida · §4

---

## La validación funciona; el error, no

Lo que acabamos de ver tiene **tres fallos**:

- Es un **500**, y la culpa es del cliente: debería ser **400**
- Es **HTML**, y quien llama espera JSON
- **Enseña tripas**: la traza y las rutas de tu disco

> Un error dice qué ha pasado y cómo arreglarlo. Nada más.

---

## Un manejador central de errores

@diagrama flujo
Ruta o servicio lanza -> Express 5 lo recoge -> manejadorErrores(err, req, res, next) -> problem+json!

| Si llega… | Contesta |
|---|---|
| `ErrorApi` | Su status, título y detalle |
| `ZodError` | 400 con `errors: [{ campo, mensaje }]` |
| JSON mal formado | 400 |
| Cualquier otra cosa | 500, **sin contar nada interno** |

---

## Un error bien contado

`400 · Content-Type: application/problem+json`

`{ "title": "Petición no válida", "status": 400, "errors": [{ "campo": "titulo", "mensaje": "«titulo» es obligatorio" }] }`

1. `title` y `status`: lo de siempre (RFC 9457)
2. `errors`: un campo nuestro, **uno por fallo**, para corregirlos todos de una vez
3. `requestId`: para encontrarlo en los logs (bloque 4)

---

## El bug del día: esto devuelve HTML, ¿por qué?

1. El editor dice que `_next` no se usa, y alguien lo borra
2. `POST` con una coma de más: **una página HTML con la traza**
3. Express reconoce un manejador de errores **por sus cuatro parámetros**
4. Con tres, es una ruta normal: nunca lo llama para un error

![FOTO 4] El manejador con tres parámetros: Express contesta con su página HTML y la traza

Referencia rápida · §5

---

## Por qué importa el número de parámetros

| Función | Para Express es… |
|---|---|
| `(req, res)` | Una ruta o un middleware que contesta |
| `(req, res, next)` | Un middleware que pasa la petición |
| `(err, req, res, next)` | **Un manejador de errores** |

> Cuatro parámetros, aunque no uses el último. Es la regla más rara de Express.

---

## 400 o 404: ¿y /tareas/abc?

@diagrama comparacion
404 · No encontrado | /tareas/99 | Está bien escrita: esa tarea no existe
400 · Petición no válida | /tareas/abc | «abc» no puede ser el id de nada

Ayer lo dejamos abierto. Con Zod, se decide: **primero se valida, después se busca**.

---

## Tu turno 2: el manejador y la validación

1. **e04:** `manejadorErrores` contesta siempre con `problem+json`: `ErrorApi` y JSON mal formado
2. **e05:** valida `POST`, `PUT` y `PATCH` con Zod; el `ZodError`, un 400 con `errors`

> **Lo tienes si** `npm run comprobar s02 e04` y `e05` dan `[ OK ]`.

**Si acabas antes, e06:** `/tareas/abc` → **400** con el campo `id`. Referencia rápida · §6

---

## Así se ve cuando está bien

![FOTO 5] POST con {} y con una prioridad inventada: 400 en problem+json con la lista de errores

Un **400**, en JSON, que dice **qué campo** falla y **cómo corregirlo**.

---

## @seccion Filtrar, ordenar y paginar

---

## Tres cosas que se piden en la URL

| Para… | Parámetro | Ejemplo |
|---|---|---|
| Filtrar | El nombre del campo | `?prioridad=alta&completada=false` |
| Ordenar | `orden`, con `-` para descendente | `?orden=-titulo` |
| Paginar | `pagina` y `limite` | `?pagina=2&limite=5` |

Todo en la **consulta**, después del `?`: la ruta sigue siendo `/tareas`.

---

## Paginar: por qué

Hoy tenemos doce tareas. ¿Y si fueran **cien mil**?

- Devolverlas todas: lento para el servidor, la red y el móvil que las recibe
- Con páginas: **diez cada vez**, y el total para saber cuántas hay

`{ "items": [ …10… ], "total": 12, "pagina": 1, "limite": 10 }`

> Por eso ayer `items` iba dentro de un objeto: hoy le añadimos campos sin romper a nadie.

---

## La consulta llega como texto

| Llega | Es | Cuidado |
|---|---|---|
| `?limite=5` | `"5"` | `z.coerce.number()` lo convierte |
| `?completada=false` | `"false"` | Un texto no vacío es **verdadero** en JavaScript |
| `?pagina=abc` | `"abc"` | Tiene que ser un 400, no un `NaN` |

---

## En el código: el esquema de la consulta

1. `Consulta` en `esquemas.ts`, con `prioridad` opcional
2. `servicio.listar(c)` filtra por prioridad
3. La ruta: `servicio.listar(Consulta.parse(req.query))`
4. `?prioridad=alta` → cuatro tareas; `?prioridad=urgente` → 400

Referencia rápida · §7

---

## Cada capa, su parte de la consulta

@diagrama flujo
GET /tareas?prioridad=alta&pagina=2 -> Ruta: Consulta.parse(req.query) -> Servicio: filtra, ordena, corta -> { items, total, pagina, limite }!

La ruta **valida**; el servicio **decide**. El repositorio solo da la lista.

---

## Ordenar y cortar la página

1. **Filtra** primero
2. **Cuenta**: `total = items.length` (todas las que cumplen, no las de la página)
3. **Ordena** una copia: `[...items].sort(…)`
4. **Corta**: desde `inicio` (lo que ocupan las páginas anteriores), `limite` tareas

> La prioridad se ordena por su posición (baja, media, alta), no por el alfabeto.

---

## Tu turno 3: filtrar, ordenar y paginar

1. **e07:** `?completada=` y `?prioridad=`, solos o juntos; un valor que no existe, 400
2. **e08:** `?orden=`, `?pagina=` y `?limite=` (de 1 a 100, por defecto 10), con `total`

> **Lo tienes si** `npm run comprobar s02 e07` y `e08` dan `[ OK ]`.

**Si acabas antes, e09:** la cabecera `Link` con `rel="next"` y `rel="prev"`. Referencia rápida · §8

---

## Así se ve una página

![FOTO 6] GET /tareas?limite=3&pagina=2&orden=-titulo: la página, el total y la cabecera Link

`total` cuenta todas; `items`, solo las de esta página. `Link` dice dónde está la siguiente.

---

## @seccion La cadena de middleware

---

## Qué es un middleware

Una función que ve **todas** las peticiones antes de que lleguen a las rutas.

`(req, res, next) => { …haz algo…; next(); }`

- Hace algo: apunta, comprueba, añade una cabecera
- Y llama a `next()` para pasar a la siguiente pieza, o contesta y corta

> Como el control de un aeropuerto: cada puesto mira una cosa y te deja pasar, o no.

---

## La cadena, en orden

@diagrama capas
idPeticion* | Le pone un identificador a la petición
registroPeticiones | La apunta, pase lo que pase después
helmet | Cabeceras de seguridad
CORS | Qué webs pueden llamar desde el navegador
limitePeticiones | Cuántas por minuto
express.json | Lee el cuerpo, con tope de 100 kB

Después, las rutas; al final, el 404 y el manejador de errores.

---

## El orden importa

Cada pieza ve la petición **después** de las de arriba.

- Si el límite va después de las rutas, **nunca llega**: las rutas ya han contestado
- Si el registro va después del límite, los 429 **no quedan apuntados**
- Si el identificador va después de `express.json()`, un JSON mal formado **sale sin él**

> Lo que corta la petición, pronto. Lo que tiene que verlo todo, antes aún.

---

## Un identificador por petición

`X-Request-Id: 0f63838e-8d12-45ef-80cf-62d2535a087a`

1. Si llega uno (de otro servicio), se usa ese; si no, uno nuevo
2. Viaja en la respuesta, en el cuerpo de los errores y en cada línea del log
3. El usuario te lo da; tú lo buscas en los logs

---

## En el código: X-Request-Id

1. `idPeticion` en `middleware.ts`: `randomUUID()` y `res.locals`
2. `app.use(idPeticion)`, la primera de la cadena
3. `curl -i /salud`: un identificador nuevo cada vez
4. Con `-H "X-Request-Id: prueba-123"`: vuelve el mismo

Referencia rápida · §9

---

## helmet y CORS

@diagrama comparacion
helmet | Una docena de cabeceras de seguridad | Quita X-Powered-By: Express | Una línea: app.use(helmet())
CORS | Qué webs pueden leer tus respuestas | Lo aplica el navegador, no curl | Lista cerrada, nunca «*»

Referencia rápida · §10

---

## Qué es CORS, sin tecnicismos

Una web de `malicioso.example` intenta llamar a tu API **desde el navegador de tu usuario**.

- El navegador pregunta a tu API: «¿esta web puede leer tu respuesta?»
- Si tu API no dice que sí (`Access-Control-Allow-Origin`), el navegador la **bloquea**
- `curl` y otros servidores no preguntan: CORS protege a usuarios, no a la API

> La API se protege con autenticación (S4). CORS evita que otra web use la sesión de tu usuario.

---

## Límites: 413 y 429

| Límite | Si se pasa | Cabeceras |
|---|---|---|
| Cuerpo de 100 kB | `413 Content Too Large` | |
| 100 peticiones por minuto | `429 Too Many Requests` | `RateLimit`, `RateLimit-Policy` |

> Sin límites, un cliente con un bucle mal hecho tumba la API para todos.

---

## Una línea por petición

`{"requestId":"0f63…","metodo":"POST","ruta":"/tareas","status":201,"ms":20}`

1. Se escribe en `res.on("finish")`: la respuesta ya ha salido y se sabe el código
2. En JSON: se busca y se filtra con herramientas, no a ojo
3. En producción lo hace una librería, como `pino`

![FOTO 7] curl -i con helmet, CORS y X-Request-Id; en la terminal del servidor, una línea JSON por petición

Referencia rápida · §11

---

## Tu turno 4: la cadena

1. **e10:** `idPeticion`, `helmet()` y CORS con la lista de `crearApp({ origenes })`
2. **e11:** cuerpo de 100 kB (413), límite por minuto (429) y `registroPeticiones`

> **Lo tienes si** `npm run comprobar s02` da **8 de 8**.

**Si acabas antes, e12:** un 500 que no cuenta secretos, con su `requestId`. Referencia rápida · §12

---

## Un 500 que no cuenta secretos

@diagrama comparacion
Al cliente | 500, problem+json | «Algo ha fallado. Avisa con el requestId» | Nada de trazas, rutas ni contraseñas
Al log | console.error con el requestId | El error completo, con la traza | Solo lo ve quien opera la API

Lo que el error tiene dentro (`db-interna:5432`, `admin`) **nunca sale de la API**.

---

## Así se ve cuando está bien

![FOTO 8] npm run comprobar s02 con todo hecho: 8 de 8 ejercicios y 4 de 4 retos

`npm run comprobar s02` → **8 de 8 ejercicios superados**, y los retos aparte.

---

## @seccion Cierre

---

## Lo que hemos hecho hoy

@diagrama flujo
Diseño REST y CRUD -> Zod y problem+json -> Filtrar y paginar -> Cadena de middleware!

Una API que **escribe**, que **rechaza lo que no tiene sentido** y que **se puede operar**.

---

## La lista de hoy

- Recursos en plural, la acción en el verbo, 201 + `Location`, 204 sin cuerpo
- Todo lo que llega, validado; el `id`, siempre del servidor
- Un solo sitio decide cómo se ve un error: `problem+json`, sin tripas
- Listas paginadas con `total`; la consulta llega como texto
- La cadena en orden: identificador, registro, seguridad, límites, cuerpo

---

## Cuestionario

Diez preguntas, en el chat o en `docs/cuestionarios/cuestionario-sesion-02.pdf`.

> Treinta segundos por pregunta. Contesta con la letra.

---

## Guarda tu trabajo

1. `git add -A`
2. `git commit -m "s02: ejercicios"`
3. `git push`
4. Para el codespace: **Stop**, no lo borres

Referencia rápida · §13

---

## Si te sobra tiempo: la práctica 2

`docs/prácticas/practica-02.pdf` · una hora

Un recurso **anidado**: los comentarios de una tarea,
`/tareas/:id/comentarios`, con su esquema, sus errores y su paginación.

> Lo que no termines, en casa. **El lunes empezamos con vuestras dudas**.

---

## El lunes, en S3

@diagrama rejilla
El contrato primero* | OpenAPI 3.1: la carta del restaurante
Swagger UI | La documentación, sacada del contrato
Validar contra el contrato | Lo que no cumple, no entra
Pruebas | Vitest y Supertest: escribes las tuyas

Empezamos con **las dudas de la práctica 2**, en `ejercicios/s03`.

---

## @fin Gracias

¿Dudas?

---

## @seccion Reserva

---

## Mueve un middleware: ¿qué se rompe?

| Cambio | Qué pasa |
|---|---|
| El límite, después de las rutas | El 429 no llega nunca |
| El registro, después del límite | Los 429 no se apuntan |
| `helmet`, después de las rutas | Respuestas sin cabeceras de seguridad |
| El identificador, después de `express.json()` | **Todo en verde**, y aun así está mal |

Referencia rápida · R1

---

## ¿400 o 422?

@diagrama comparacion
400 para todo | Más simple | Es lo que usamos en el curso
422 para las reglas | 400 si no se puede leer; 422 si se lee pero no vale | También muy habitual

Lo importante: **elegir una y documentarla** en el contrato (S3). Referencia rápida · R3

---

## Buscar un fallo por su requestId

1. `curl -H "X-Request-Id: caso-42" /fallo-de-prueba`
2. La respuesta: `"requestId":"caso-42"`, y nada más
3. En la terminal del servidor: `[caso-42] Error: …` con la traza

> El usuario te da el identificador; tú encuentras la aguja en el pajar.

Referencia rápida · R5

---

## El anexo de hoy

@diagrama rejilla
A · Salud y parada ordenada* | /salud, /listo y apagar sin cortar a nadie
B · Otra despensa | El repositorio en SQLite, sin tocar rutas ni servicio
C · CORS de verdad | Una web en otro puerto, y el navegador que bloquea

`docs/sesiones/anexos/s02-anexo-slides.md` · Referencia rápida · R6
