# S2 · Referencia rápida — CRUD completo, validación y errores

> Antes de empezar: tu codespace abierto (o el repositorio en local con Node 22.12 o
> superior). Hoy se trabaja en `ejercicios/s02`, que ya trae la API de ayer terminada y
> reorganizada en capas. Cada sección trae todo lo que hace falta: cópiala tal cual.

| § | Dónde | Qué |
|---|---|---|
| 0 | `ejercicios` | Arrancar la sesión: la API de hoy y `npm run comprobar s02` |
| 1 | `ejercicios/s02/src` | La API por dentro: rutas, servicio y repositorio |
| 2 | `s02/src/tareas/servicio.ts` y `rutas.ts` | Crear con `POST`: 201 y `Location` (en directo) |
| 3 | `ejercicios` | Tu turno 1 (e01–e03): arreglar un diseño, el CRUD y el 405 |
| 4 | `s02/src/tareas/esquemas.ts` y `rutas.ts` | Lo que llega sin validar, y Zod en tres líneas |
| 5 | `docs/ejemplos/api-base` | El bug del día: «esto devuelve una página HTML, ¿por qué?» |
| 6 | `ejercicios` | Tu turno 2 (e04–e06): el manejador de errores, validar y el id |
| 7 | `s02/src/tareas` | La consulta llega como texto: el esquema `Consulta` (en directo) |
| 8 | `ejercicios` | Tu turno 3 (e07–e09): filtrar, ordenar y paginar, y `Link` |
| 9 | `s02/src/middleware.ts` y `app.ts` | La cadena de middleware: `X-Request-Id` (en directo) |
| 10 | Terminal | `helmet` y CORS, vistos con `curl` |
| 11 | Terminal | Límites (413 y 429) y una línea de registro por petición |
| 12 | `ejercicios` | Tu turno 4 (e10–e12): la cadena, límites y registro, y el 500 |
| 13 | Terminal | Guardar tu trabajo en GitHub |
| R1–R6 | | Demos de reserva |

## §0 · Arrancar la sesión

**Terminal:**

```bash
# desde la raíz del repositorio
cd ejercicios
npm run comprobar s02
```

**Comprobar:** termina con `0 de 8 ejercicios superados · retos: 0 de 4.` Es lo esperado:
los vas a resolver hoy. Ayer acabaste en `s01`; hoy todos empiezan igual en `s02`, aunque
ayer no terminaras.

```bash
# desde ejercicios, en una terminal (déjala abierta: es el servidor)
npm run dev:s02

# en otra terminal
curl -s localhost:3000/tareas
```

Respuesta: `{"items":[{"id":1,"titulo":"Instalar Node","completada":true,"prioridad":"alta"},…]}`
con **doce** tareas, todas con `prioridad`. Las etiquetas y el resumen de ayer se quedan en
`s01`.

| Ejercicio | Bloque | Dónde | Para quién |
|---|---|---|---|
| e01 · Arregla un diseño | 1 | `src/respuestas/diseno.ts` | Todos |
| e02 · El CRUD completo | 1 | `src/tareas/rutas.ts` y `servicio.ts` | Todos |
| e03 · Reto: 405 y `Allow` | 1 | `src/tareas/rutas.ts` | Si acabas antes |
| e04 · Manejador de errores | 2 | `src/errores.ts` | Todos |
| e05 · Validar con Zod | 2 | `src/tareas/esquemas.ts` y `rutas.ts` | Todos |
| e06 · Reto: el id | 2 | `esquemas.ts` y `rutas.ts` | Si acabas antes |
| e07 · Filtrar | 3 | `esquemas.ts`, `servicio.ts`, `rutas.ts` | Todos |
| e08 · Ordenar y paginar | 3 | `esquemas.ts` y `servicio.ts` | Todos |
| e09 · Reto: `Link` | 3 | `src/tareas/rutas.ts` | Si acabas antes |
| e10 · La cadena | 4 | `src/middleware.ts` y `app.ts` | Todos |
| e11 · Límites y registro | 4 | `middleware.ts`, `app.ts`, `errores.ts` | Todos |
| e12 · Reto: el 500 | 4 | `src/errores.ts` | Si acabas antes |

Enunciados en `ejercicios/s02/README.md`; las pruebas, de solo lectura, en
`ejercicios/s02/pruebas/`.

## §1 · La API por dentro: rutas, servicio y repositorio

**Fichero:** `ejercicios/s02/src/tareas/rutas.ts` (ya está así; léelo)

```ts
export function crearRutasTareas(servicio: ServicioTareas) {
	const rutas = Router();

	rutas.get("/:id", (req, res) => {
		res.json(servicio.obtener(Number(req.params.id)));
	});

	return rutas;
}
```

**Fichero:** `ejercicios/s02/src/tareas/servicio.ts`

```ts
obtener(id: number): Tarea {
	const tarea = this.repo.buscar(id);
	if (!tarea) throw new ErrorApi(404, "Tarea no encontrada", `No hay ninguna tarea con id ${id}`);
	return tarea;
}
```

| Capa | Fichero | Qué hace | Sabe de HTTP |
|---|---|---|---|
| Rutas | `tareas/rutas.ts` | Lee la petición, llama al servicio y contesta | Sí: `req`, `res`, códigos |
| Servicio | `tareas/servicio.ts` | Las reglas: si existe, qué se puede hacer | Solo los errores que lanza |
| Repositorio | `tareas/repositorio.ts` | Guarda y busca. Hoy en memoria | No |

1. `app.use("/tareas", crearRutasTareas(…))` en `app.ts` monta las rutas bajo `/tareas`:
   dentro de `rutas.ts`, `"/"` es `/tareas` y `"/:id"` es `/tareas/:id`.
2. Si la tarea no existe, el servicio **lanza** un `ErrorApi`. Express 5 lo recoge solo y
   se lo pasa al manejador de errores: la ruta no tiene ni un `if`.
3. Cambiar la memoria por una base de datos solo toca el repositorio (anexo, bloque B).

**Comprobar:** `curl -i localhost:3000/tareas/3` da 200 con la tarea 3, y
`curl -i localhost:3000/tareas/99` da 404… con una página HTML. El manejador de errores
aún no hace nada: es el ejercicio 4.

## §2 · Crear con `POST`: 201 y `Location` (en directo)

**Fichero:** `ejercicios/s02/src/tareas/servicio.ts` (dentro de la clase, bajo `// Ejercicio 2`)

```ts
crear(datos: Omit<Tarea, "id">): Tarea {
	return this.repo.crear(datos);
}
```

**Fichero:** `ejercicios/s02/src/tareas/rutas.ts` (bajo `// Ejercicio 2`)

```ts
rutas.post("/", (req, res) => {
	const tarea = servicio.crear(req.body);
	res.status(201).location(`/tareas/${tarea.id}`).json(tarea);
});
```

1. `res.status(201)`: «creado». `res.location(…)`: la cabecera que dice dónde está.
2. `Omit<Tarea, "id">`: una tarea sin `id`. El `id` lo pone el servidor, nunca el cliente.

**Terminal:**

```bash
# en la segunda terminal, con npm run dev:s02 arrancado
curl -i -X POST localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Preparar la demo"}'

curl -s -X POST localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -d '{"nada":"de nada","completada":"sí"}'
```

**Comprobar:** el primero da `HTTP/1.1 201 Created`, `Location: /tareas/13` y
`{"id":13,"titulo":"Preparar la demo"}` (sin `prioridad` ni `completada`). El segundo
**también da 201** y guarda `{"id":14,"nada":"de nada","completada":"sí"}`. `req.body` es
lo que el cliente quiera mandar: hay que validarlo (bloque 2).

## §3 · Tu turno 1: arreglar un diseño y el CRUD (25 min) · e01, e02 y e03

**Para todos:**

1. **e01 (10 min).** En `ejercicios/s02/src/respuestas/diseno.ts`, para cada ruta mal
   diseñada, escribe el verbo y la ruta que usarías tú. Después, las cuatro preguntas.

   | # | Mal diseñada | Qué hace |
   |---|---|---|
   | 1 | `GET /obtenerTareas` | Ver todas las tareas |
   | 2 | `GET /tarea?id=7` | Ver la tarea 7 |
   | 3 | `POST /tareas/borrar/7` | Borrar la tarea 7 |
   | 4 | `GET /tareas/7/eliminar` | Borrar la tarea 7, con un GET |
   | 5 | `POST /actualizarTitulo/7` | Cambiar solo el título de la tarea 7 |
   | 6 | `POST /tareas/7` con la tarea entera | Sustituir la tarea 7 |
   | 7 | `POST /proyectos/3/nuevaTarea` | Crear una tarea en el proyecto 3 |
   | 8 | `GET /Proyectos/3/ListaTareas` | Ver las tareas del proyecto 3 |

2. **e02 (15 min).** Completa el CRUD: `PUT /tareas/:id`, `PATCH /tareas/:id` y
   `DELETE /tareas/:id`, con su método en el servicio. Por dónde empezar:

```ts
// servicio.ts: el servicio comprueba que existe (obtener lanza el 404) y el repositorio guarda
reemplazar(id: number, datos: Omit<Tarea, "id">): Tarea {
	this.obtener(id);
	return this.repo.guardar({ id, ...datos });
}
// cambiar(id, cambios): mezcla la tarea que hay con los cambios: { ...this.obtener(id), ...cambios }
// borrar(id): this.repo.borrar(id) devuelve false si no existía → ErrorApi(404, …)
```

```ts
// rutas.ts: un DELETE bien hecho contesta 204 y nada más
rutas.delete("/:id", (req, res) => {
	servicio.borrar(Number(req.params.id));
	res.status(204).end();
});
```

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s02 e01      # [ OK ] s02 · e01-diseno  (10/10)
npm run comprobar s02 e02      # [ OK ] s02 · e02-crud  (7/7)
```

**Si acabas antes, e03 (reto):** que `DELETE /tareas`, `PUT /tareas` y `POST /tareas/3`
respondan **405** con `problem+json` y la cabecera `Allow` con los verbos que sí valen.
Pista: `rutas.all("/", …)` y `rutas.all("/:id", …)` **al final**, con
`res.set("Allow", "GET, POST")` y la función `problema` de `errores.ts`.
`npm run comprobar s02 e03`.

## §4 · Lo que llega sin validar, y Zod en tres líneas

**Fichero:** `ejercicios/s02/src/tareas/esquemas.ts` (sustituye todo el fichero)

```ts
import { z } from "zod";
import { PRIORIDADES } from "../datos.js";

// POST y PUT: la tarea entera. strict(): un campo desconocido es un error
export const TareaNueva = z
	.object({
		titulo: z.string().trim().min(1),
		completada: z.boolean().default(false),
		prioridad: z.enum(PRIORIDADES).default("media"),
	})
	.strict();

export type TareaNueva = z.infer<typeof TareaNueva>;
```

**Fichero:** `ejercicios/s02/src/tareas/rutas.ts`

```ts
import { TareaNueva } from "./esquemas.js";
// …
const tarea = servicio.crear(TareaNueva.parse(req.body));
```

1. `z.object({…})` describe la forma; `.parse(dato)` la comprueba y devuelve el dato limpio
   (con `trim` y los valores por defecto). Si no cumple, **lanza** un `ZodError`.
2. `z.infer<typeof TareaNueva>`: el tipo de TypeScript sale del esquema. Una sola fuente.
3. `.strict()`: `{"nada":"de nada"}` ya no se cuela, y tampoco un `id` puesto por el cliente.

**Terminal:**

```bash
# en la segunda terminal, con npm run dev:s02 arrancado
curl -s -X POST localhost:3000/tareas -H "Content-Type: application/json" -d '{"titulo":"Preparar la demo"}'
curl -i -X POST localhost:3000/tareas -H "Content-Type: application/json" -d '{"nada":"de nada"}'
```

**Comprobar:** el primero da `{"id":13,"titulo":"Preparar la demo","completada":false,"prioridad":"media"}`.
El segundo da `HTTP/1.1 500 Internal Server Error` y una página HTML que empieza por
`<pre>ZodError: [` con la traza y las rutas de tu disco. La validación funciona, pero el
error se cuenta fatal: ni es un 400, ni es JSON, y enseña tripas. Lo arregla el ejercicio 4.

| Zod | Qué comprueba |
|---|---|
| `z.string().trim().min(1)` | Texto, sin espacios alrededor, no vacío |
| `z.boolean().default(false)` | `true` o `false`; si no llega, `false` |
| `z.enum(PRIORIDADES)` | Solo `"baja"`, `"media"` o `"alta"` |
| `.optional()` | Puede no llegar |
| `.partial()` | Todos los campos opcionales (para el `PATCH`) |
| `z.coerce.number()` | Convierte texto a número (para la query string) |

## §5 · El bug del día: «esto devuelve una página HTML, ¿por qué?»

**Fichero:** `docs/ejemplos/api-base/src/app.ts` (el manejador de errores, al final). El
editor marca `_next` como «no se usa»; alguien lo borra para que no se queje:

```ts
// antes: (err: Error, _req: Request, res: Response, _next: NextFunction)
app.use((err: Error, _req: Request, res: Response) => {
```

**Terminal:**

```bash
# desde docs/ejemplos/api-base (para antes la API de s02: usan el mismo puerto)
npm run dev

# en otra terminal. Ojo a la coma antes de }
curl -i -X POST localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Con una coma de más",}'
```

**Comprobar:** vuelve `Content-Type: text/html` y una página con
`<pre>SyntaxError: Expected double-quoted property name…` y las rutas de tus ficheros.

1. Express sabe que una función es un **manejador de errores** porque tiene **cuatro**
   parámetros. Con tres, la toma por una ruta normal y no la llama nunca para un error.
2. Sin manejador propio, contesta el de Express: HTML, con la traza (fuera de producción).
3. Arreglo: vuelve a poner `_next: NextFunction`, aunque no se use. Y deshaz el cambio:
   `git checkout -- docs/ejemplos/api-base/src/app.ts`.

## §6 · Tu turno 2: el manejador de errores y validar (25 min) · e04, e05 y e06

**Para todos, e04:** que `manejadorErrores` (en `ejercicios/s02/src/errores.ts`) responda
siempre con `problem+json`. Por dónde empezar:

```ts
export function manejadorErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	if (err instanceof ErrorApi) return problema(res, err.status, err.titulo, err.detalle, err.errores);
	const tipo = (err as { type?: string }).type;
	if (tipo === "entity.parse.failed") return problema(res, 400, "JSON mal formado", "El cuerpo no es un JSON válido");
	// …y lo que no sepas qué es, de momento, un 500
}
```

**Para todos, e05 (necesita e04):** valida el `POST`, el `PUT` y el `PATCH` con Zod.

1. En `esquemas.ts`, `TareaNueva` (el del §4) y `CambiosTarea` para el `PATCH`: los mismos
   campos, todos opcionales y sin valores por defecto.
2. En `rutas.ts`, `TareaNueva.parse(req.body)` en `POST` y `PUT`; `CambiosTarea.parse(req.body)`
   en `PATCH`.
3. En el manejador, un `ZodError` es un 400 con la lista de fallos:

```ts
import { ZodError } from "zod";
// …dentro de manejadorErrores
if (err instanceof ZodError) {
	const errores = err.issues.map((i) => ({ campo: i.path.join(".") || "(cuerpo)", mensaje: i.message }));
	return problema(res, 400, "Petición no válida", "Revisa los campos de «errors»", errores);
}
```

4. Mensajes que digan cómo corregir: `z.string({ error: "«titulo» tiene que ser un texto" })`,
   `.min(1, "«titulo» no puede estar vacío")`.

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s02 e04      # [ OK ] s02 · e04-errores  (4/4)
npm run comprobar s02 e05      # [ OK ] s02 · e05-validacion  (7/7)
curl -s -X POST localhost:3000/tareas -H "Content-Type: application/json" -d '{}'
```

El `curl` devuelve `400` con
`{"type":"about:blank","title":"Petición no válida","status":400,"detail":"Revisa los campos de «errors»","errors":[{"campo":"titulo","mensaje":"«titulo» es obligatorio"}]}`
(el texto del mensaje es el que tú escribas).

**Si acabas antes, e06 (reto):** `GET /tareas/abc` da hoy 404. Haz que `GET`, `PATCH` y
`DELETE` sobre `/tareas/abc`, `/tareas/0` o `/tareas/2.5` respondan **400** con el campo
`id` en `errors`, y que `/tareas/99` siga siendo 404. Pista:

```ts
export const IdRuta = z.object({ id: z.coerce.number().int().min(1) });
// en rutas.ts: const id = IdRuta.parse(req.params).id;
```

`npm run comprobar s02 e06`.

## §7 · La consulta llega como texto: el esquema `Consulta` (en directo)

**Fichero:** `ejercicios/s02/src/tareas/esquemas.ts` (al final)

```ts
// GET /tareas?prioridad=alta: lo que llega en la query string, ya validado
export const Consulta = z.object({
	prioridad: z.enum(PRIORIDADES).optional(),
});

export type Consulta = z.infer<typeof Consulta>;
```

**Fichero:** `ejercicios/s02/src/tareas/servicio.ts` (sustituye `listar`, y añade
`import type { Consulta } from "./esquemas.js";` arriba)

```ts
listar(c: Consulta) {
	let items = this.repo.todas();
	if (c.prioridad) items = items.filter((t) => t.prioridad === c.prioridad);
	return { items };
}
```

**Fichero:** `ejercicios/s02/src/tareas/rutas.ts` (la ruta de `GET /`)

```ts
rutas.get("/", (req, res) => {
	res.json(servicio.listar(Consulta.parse(req.query)));
});
```

1. La ruta valida (`Consulta.parse`); el servicio filtra. Cada capa, una cosa.
2. `req.query` es texto: `?limite=5` llega como `"5"`, y `?completada=false` como
   `"false"`, que en JavaScript es **verdadero** (un texto no vacío). Para números,
   `z.coerce.number()`; para el booleano, compara con `"true"` o transforma.

**Terminal:**

```bash
# en la segunda terminal; las comillas hacen falta por el ? y el &
curl -s "localhost:3000/tareas?prioridad=alta"
curl -s "localhost:3000/tareas?prioridad=urgente"
```

**Comprobar:** el primero devuelve las tareas 1, 2, 4 y 5. El segundo, un 400 en
`problem+json` si ya tienes el e05 (si no, la página HTML del §4).

## §8 · Tu turno 3: filtrar, ordenar y paginar (25 min) · e07, e08 y e09

**Para todos, e07:** añade a `Consulta` el filtro `completada` (`true` o `false`) y úsalo
en el servicio. Los dos filtros se combinan, y un valor que no existe responde 400.

```ts
// "true" → true, "false" → false, y cualquier otra cosa, un error
completada: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
```

**Para todos, e08:** ordenar y paginar.

| Parámetro | Valores | Por defecto | Zod |
|---|---|---|---|
| `orden` | `id`, `titulo`, `prioridad`; con `-` delante, descendente | `id` | `z.enum([...]).default("id")` |
| `pagina` | 1 o más | 1 | `z.coerce.number().int().min(1).default(1)` |
| `limite` | de 1 a 100 | 10 | `z.coerce.number().int().min(1).max(100).default(10)` |

```ts
// servicio.ts, al final de listar: total ANTES de cortar la página
const inicio = (c.pagina - 1) * c.limite;
return { items: items.slice(inicio, inicio + c.limite), total: items.length, pagina: c.pagina, limite: c.limite };
```

Para ordenar por prioridad, usa su posición en `PRIORIDADES` (`baja` 0, `media` 1, `alta`
2), no el alfabeto. Ordena una **copia** (`[...items].sort(…)`), no la lista del
repositorio.

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s02 e07      # [ OK ] s02 · e07-filtrar  (5/5)
npm run comprobar s02 e08      # [ OK ] s02 · e08-paginar  (6/6)
curl -s "localhost:3000/tareas?limite=5&pagina=2"
```

El `curl` devuelve las tareas 6 a 10 y `"total":12,"pagina":2,"limite":5`.

**Si acabas antes, e09 (reto):** la cabecera `Link` con la página siguiente y la
anterior, como la API de GitHub:

```
Link: </tareas?limite=5&pagina=3>; rel="next", </tareas?limite=5&pagina=1>; rel="prev"
```

Sin `prev` en la primera página ni `next` en la última, y conservando los filtros y el
orden. Pista: `new URLSearchParams(req.query as Record<string, string>)`, `q.set("pagina", …)`,
y `req.baseUrl` es `/tareas`. `npm run comprobar s02 e09`.

## §9 · La cadena de middleware: `X-Request-Id` (en directo)

**Fichero:** `ejercicios/s02/src/middleware.ts` (sustituye todo el fichero)

```ts
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

// Un identificador por petición: viaja en la respuesta y en los logs, para encontrar un fallo
export function idPeticion(req: Request, res: Response, next: NextFunction) {
	const id = req.get("X-Request-Id") ?? randomUUID();
	res.locals.idPeticion = id;
	res.set("X-Request-Id", id);
	next();
}
```

**Fichero:** `ejercicios/s02/src/app.ts`

```ts
import { idPeticion } from "./middleware.js";
// …dentro de crearApp, la primera de la cadena
app.use(idPeticion);
app.use(express.json());
```

1. Un middleware es una función `(req, res, next)`: hace algo y llama a `next()` para
   pasar a la siguiente. Si no llama a `next()` ni contesta, la petición se queda colgada.
2. `res.locals` es una mochila para esta petición: lo que guardas lo ven las siguientes
   piezas. `problema()` ya lo mete en el cuerpo de los errores como `requestId`.
3. Va la primera: así hasta un error de `express.json()` lleva su identificador.
4. En la solución, el `X-Request-Id` que llega se valida (letras, números y guiones, hasta
   64): nunca te fíes de una cabecera que manda el cliente.

**Comprobar:**

```bash
curl -i localhost:3000/salud
curl -si -H "X-Request-Id: prueba-123" localhost:3000/salud | grep -i request-id
```

El primero trae `X-Request-Id: 30f2b3e2-…` (uno nuevo cada vez); el segundo,
`X-Request-Id: prueba-123`.

## §10 · `helmet` y CORS, vistos con `curl`

**Fichero:** `ejercicios/s02/src/app.ts` y `middleware.ts` (lo que harás en el e10)

```ts
import helmet from "helmet";
import cors from "cors";

app.use(helmet());
app.use(cors({ origin: ["http://localhost:5173"], exposedHeaders: ["Location", "Link", "X-Request-Id"] }));
```

1. `helmet()` pone una docena de cabeceras de seguridad para navegadores y quita
   `X-Powered-By: Express` (no le digas a nadie qué usas).
2. CORS lo aplica **el navegador**: una web de `http://localhost:5173` solo puede leer las
   respuestas de tu API si esta contesta `Access-Control-Allow-Origin` con ese origen. A
   `curl` le da igual: CORS no protege la API, protege a los usuarios de webs ajenas.
3. Nunca `origin: "*"` en una API con datos de usuarios: una lista cerrada.

**Terminal:**

```bash
curl -si -H "Origin: http://localhost:5173" localhost:3000/salud | grep -i "access-control\|x-content-type\|powered"
curl -si -H "Origin: https://malicioso.example" localhost:3000/salud | grep -i "access-control-allow-origin"
```

**Comprobar** (con el e10 hecho): el primero trae
`Access-Control-Allow-Origin: http://localhost:5173` y `X-Content-Type-Options: nosniff`, y
ningún `X-Powered-By`. El segundo no trae `Access-Control-Allow-Origin`: el navegador
bloquearía la respuesta.

## §11 · Límites (413 y 429) y una línea de registro por petición

**Fichero:** `ejercicios/s02/src/middleware.ts` (lo que harás en el e11)

```ts
import { rateLimit } from "express-rate-limit";

export function limitePeticiones(porMinuto: number) {
	return rateLimit({
		windowMs: 60_000,
		limit: porMinuto,
		standardHeaders: "draft-8",
		legacyHeaders: false,
		handler: (_req, res) => problema(res, 429, "Demasiadas peticiones", `El máximo son ${porMinuto} por minuto`),
	});
}

// Una línea por petición, cuando la respuesta ya ha salido: sabe el código y lo que ha tardado
export function registroPeticiones(registro?: (linea: LineaRegistro) => void) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!registro) return next();
		const inicio = performance.now();
		res.on("finish", () => {
			registro({ requestId: res.locals.idPeticion, metodo: req.method, ruta: req.originalUrl, status: res.statusCode, ms: Math.round(performance.now() - inicio) });
		});
		next();
	};
}
```

1. `express.json({ limit: "100kb" })`: un cuerpo mayor es un error con
   `type: "entity.too.large"`; el manejador lo convierte en 413.
2. `rateLimit`: pasado el límite, 429 con `RateLimit` y `RateLimit-Policy` (cuántas
   quedan y cuándo se reinicia la ventana).
3. `res.on("finish")`: se ejecuta cuando la respuesta ya ha salido. `server.ts` ya pasa un
   `registro` que escribe cada línea en JSON en la consola; en las pruebas no se escribe nada.

**Comprobar** (con el e11 hecho), en la terminal del servidor, una línea por petición:

```
{"requestId":"0f63838e-…","metodo":"POST","ruta":"/tareas","status":201,"ms":20}
{"requestId":"d44d626b-…","metodo":"DELETE","ruta":"/tareas","status":405,"ms":0}
{"requestId":"b38390ba-…","metodo":"GET","ruta":"/tareas?limite=3&pagina=2&orden=-titulo","status":200,"ms":4}
```

En producción esto lo hace una librería como `pino`: las mismas líneas JSON, que después
se buscan por `requestId`.

## §12 · Tu turno 4: la cadena, límites y registro (25 min) · e10, e11 y e12

El orden de la cadena, en `crearApp`, **antes** de las rutas:

```ts
app.use(idPeticion);                          // 1. quién es esta petición
app.use(registroPeticiones(registro));        // 2. apuntarla, pase lo que pase después
app.use(helmet());                            // 3. cabeceras de seguridad
app.use(corsConLista(origenes));              // 4. quién puede llamar desde un navegador
app.use(limitePeticiones(limitePorMinuto));   // 5. cuántas veces
app.use(express.json({ limit: "100kb" }));    // 6. leer el cuerpo, con tope
```

**Para todos:**

1. **e10.** `idPeticion` (§9), `helmet()` y `corsConLista(origenes)` (§10). La lista de
   orígenes llega en `crearApp({ origenes })`.
2. **e11.** El límite del cuerpo, `limitePeticiones` y `registroPeticiones` (§11). En el
   manejador, `entity.too.large` → 413. Añade `registro` a lo que recibe `crearApp`.

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s02 e10      # [ OK ] s02 · e10-cadena  (6/6)
npm run comprobar s02 e11      # [ OK ] s02 · e11-limites  (4/4)
npm run comprobar s02          # 8 de 8 ejercicios superados · retos: …
```

**Si acabas antes, e12 (reto):** `GET /fallo-de-prueba` lanza un error con datos internos
(`db-interna:5432`, `admin`). Que responda 500 con `problem+json`, **sin** la traza ni el
mensaje interno, con el `requestId` en el cuerpo, y que el error completo quede en el log
con `console.error`. `npm run comprobar s02 e12`.

Para pensar: mueve `limitePeticiones` después de las rutas, o `idPeticion` después de
`express.json()`, y vuelve a pasar las pruebas y el `curl` del JSON mal formado. ¿Qué se
rompe? (R1).

## §13 · Guardar tu trabajo en GitHub

**Terminal:**

```bash
# desde la raíz del repositorio
git branch --show-current                  # main en tu copia; alumno/<tu-nombre> si eres colaborador
git add -A
git commit -m "s02: ejercicios"
git push
```

**Comprobar:** en GitHub, pestaña **Actions**, «Comprobar ejercicios» con tu commit. Su
resumen muestra lo mismo que `npm run comprobar`.

Al terminar: para el codespace (github.com/codespaces → `…` → **Stop codespace**).

**Si te sobra tiempo:** empieza la práctica 2 (`docs/prácticas/practica-02.pdf`): los
comentarios de una tarea, un recurso anidado. Apunta tus dudas: el lunes empezamos por ellas.

## Demos de reserva

### R1 · Mover un middleware y ver qué se rompe

Sobre la API con el e11 hecho, cambia de sitio una línea de `crearApp` y repite:

| Cambio | Qué se rompe | Cómo se ve |
|---|---|---|
| `limitePeticiones` después de las rutas | El 429 no llega nunca: las rutas contestan antes | `comprobar s02 e11`: «llega 200 y se esperaba 429» |
| `registroPeticiones` después del límite | Los 429 no quedan en el registro | `comprobar s02 e11`: «llega [ 200 ] y se esperaba [ 200, 429 ]» |
| `helmet()` después de las rutas | Las respuestas salen sin cabeceras de seguridad | `comprobar s02 e10`: «falta helmet()» |
| `idPeticion` después de `express.json()` | Un JSON mal formado sale sin `X-Request-Id` ni `requestId`, y su línea de registro, sin `requestId` | Las pruebas pasan; el `curl` del §5 contra tu API lo enseña |

La última es la más traicionera: **todo en verde y aun así está mal**. Las pruebas miden
lo que se les pide.

### R2 · El CRUD entero en un fichero de REST Client

**Fichero:** `ejercicios/s02/tareas.http` (ya está en el repositorio)

1. Arranca la API (`npm run dev:s02`) y abre el fichero.
2. **Send Request** en orden: listar, filtrar, una, crear, crear sin título, sustituir,
   cambiar, borrar, el 405, el id `abc` y el JSON mal formado.

**Comprobar:** cada petición da el código de su comentario.

### R3 · ¿400 o 422?

Algunas APIs contestan **422 Unprocessable Content** cuando el JSON está bien escrito pero
no cumple las reglas (falta `titulo`), y dejan el 400 para lo que ni se puede leer. Las dos
convenciones se ven a diario; lo importante es **elegir una y documentarla** en el contrato
(S3). Para cambiar a 422, una línea en el manejador:

```ts
return problema(res, 422, "Petición no válida", "Revisa los campos de «errors»", errores);
```

Si lo pruebas, `comprobar s02 e05` fallará: las pruebas del curso piden 400. Deshazlo.

### R4 · Las cabeceras de `helmet`, una a una

```bash
curl -sI localhost:3000/salud
```

| Cabecera | Para qué |
|---|---|
| `Content-Security-Policy` | De dónde puede cargar cosas una página |
| `Strict-Transport-Security` | «Háblame siempre por HTTPS» |
| `X-Content-Type-Options: nosniff` | El navegador no adivina el tipo: usa el `Content-Type` |
| `X-Frame-Options: SAMEORIGIN` | Nadie te mete en un `iframe` ajeno |
| `Referrer-Policy: no-referrer` | No contar de qué página vienes |

Para una API que solo devuelve JSON, la mayoría no hacen nada, pero tampoco molestan, y
protegen si algún día sirves HTML (como `/docs` en S3).

### R5 · Dos llamadas, un fallo: buscar por `requestId`

```bash
curl -s -H "X-Request-Id: caso-42" localhost:3000/fallo-de-prueba; echo
```

**Comprobar:** la respuesta lleva `"requestId":"caso-42"` y, en la terminal del servidor,
el error completo empieza por `[caso-42]`. El usuario te da el identificador; tú buscas
en los logs. Sin él, buscas una aguja en un pajar.

### R6 · Anexo de la sesión

Si sobra más de media hora: `docs/sesiones/anexos/s02-anexo-slides.md` y su referencia.
Tres bloques: `/salud` y `/listo` con parada ordenada, cambiar el repositorio por SQLite
sin tocar rutas ni servicio, y CORS en un navegador de verdad.

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| `Error: listen EADDRINUSE: address already in use :::3000` | Sigue arrancada otra API (la de `s01`, la de ejemplo…) | `Ctrl+C` en su terminal, o `PORT=3001 npm run dev:s02` y usa el 3001 |
| `POST` devuelve 404 «No existe POST /tareas» | Aún no has escrito `rutas.post`, o no has guardado | Guarda: `tsx watch` reinicia solo |
| `POST` da 201 pero guarda cualquier cosa | `req.body` sin validar | `TareaNueva.parse(req.body)` (§4) |
| Errores en una página HTML con la traza | El manejador no contesta, o tiene tres parámetros | Cuatro parámetros y `problema(…)` en cada caso (§5, §6) |
| `POST` da 400 con `"campo":"(cuerpo)"` y «expected object, received undefined» | Falta `-H "Content-Type: application/json"`: `express.json()` no lee el cuerpo | Añádelo al `curl` |
| `DELETE` responde 200 con cuerpo vacío, o 204 con cuerpo | `res.json()` o `res.send("")` en lugar de `res.status(204).end()` | `res.status(204).end()` |
| `PATCH` borra los campos que no mandas | Guardas los cambios en lugar de mezclarlos | `{ ...this.obtener(id), ...cambios }` |
| e05: el `PATCH` con `id` cambia el id | El `PATCH` usa `req.body` sin validar | `CambiosTarea.parse(req.body)`; con `.strict()`, además, el `id` es un 400 |
| `?completada=false` devuelve también las completadas | Comparas con el texto `"false"`, que es verdadero | Transfórmalo a booleano en el esquema (§8) |
| `?limite=5` se ignora o da 400 | Sin `z.coerce.number()`, llega el texto `"5"` | `z.coerce.number().int()…` |
| e08: el `total` es 5 en lugar de 12 | Cuentas después de cortar la página | `total: items.length` antes del `slice` |
| e08: ordenar por prioridad sale «alta, baja, media» | Ordenas por el alfabeto | Usa `PRIORIDADES.indexOf(t.prioridad)` |
| `GET /tareas` cambia de orden después de pedirlo ordenado | `sort` ordena la lista del repositorio en su sitio | Ordena una copia: `[...items].sort(…)` |
| e03: `GET /tareas/3` también da 405 | `rutas.all("/:id", …)` está antes que `rutas.get("/:id", …)` | Los `all` van al final |
| e10: `X-Powered-By` sigue saliendo | Falta `helmet()` en la cadena | `app.use(helmet())` antes de las rutas |
| e11: 413 da 500 | El manejador no conoce `entity.too.large` | Un `if` más: 413 |
| e11: el 429 no llega | `limitePeticiones` va después de las rutas | Antes de las rutas (R1) |
| `TS2339: Property 'idPeticion' does not exist` | Usas `req.idPeticion` | Se guarda en `res.locals.idPeticion` |
| `No he podido ejecutar las pruebas` | Faltan dependencias | `cd ejercicios && npm ci` |
| Los retos (e03, e06, e09, e12) en `[FALTA]` | Son opcionales: se cuentan aparte | Hazlos si acabas antes |
