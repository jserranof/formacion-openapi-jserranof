# S1 · Referencia rápida — HTTP y REST desde cero; primera API

> Antes de empezar: tu codespace abierto (o el repositorio en local con Node 22.12 o
> superior). Todo se hace en la terminal de VS Code. Cada sección trae todo lo que hace
> falta: cópiala tal cual.

| § | Dónde | Qué |
|---|---|---|
| 0 | Terminal | Comprobar el entorno |
| 1 | `docs/ejemplos/api-base` | Arrancar la API de ejemplo |
| 2 | Terminal | Leer una petición y una respuesta con `curl` |
| 3 | VS Code | Las mismas peticiones con REST Client |
| 4 | Terminal y `ejercicios` | Tu turno 1 (e01): explorar la API de ejemplo |
| 5 | Terminal | Crear con `POST`: 201 y `Location` |
| 6 | Terminal | Seguro e idempotente, en la práctica |
| 7 | Terminal | El bug del día: «esto devuelve 500, ¿por qué?» |
| 8 | `ejercicios` | Tu turno 2 (e02): ¿qué verbo y qué código? |
| 9 | `ejercicios` | Los ejercicios de hoy y `npm run comprobar` |
| 10 | `ejercicios/s01/src/datos.ts` | TypeScript lo justo: tipos e interfaces |
| 11 | `ejercicios` | El proyecto: `package.json`, `tsconfig.json` y `tsx watch` |
| 12 | `ejercicios/s01/src/app.ts` | Express: la primera ruta, `GET /salud` |
| 13 | `ejercicios` | Tu turno 3 (e04–e06): listar, tipar la prioridad y filtrar |
| 14 | `ejercicios/s01/src/app.ts` | Parámetros de ruta: `req.params.id` llega como texto |
| 15 | `ejercicios/s01/src/app.ts` | Un 404 que explica el error: `application/problem+json` |
| 16 | `ejercicios` | Tu turno 4 (e07–e09): una tarea o 404, el resumen y las etiquetas |
| 17 | Terminal | Guardar tu trabajo en GitHub |
| R1–R6 | | Demos de reserva |

## §0 · Comprobar el entorno

**Terminal:**

```bash
# desde la raíz del repositorio
node --version        # v24.x (vale v22.12 o superior)
npm --version
git branch --show-current
```

**Comprobar:** `node --version` empieza por `v24` o `v22`. Si te han añadido como
colaborador, la rama es `alumno/<tu-nombre>`, no `main` (ver §17).

## §1 · Arrancar la API de ejemplo

**Terminal:**

```bash
# desde la raíz del repositorio
cd docs/ejemplos/api-base
npm run dev
```

1. Deja esta terminal abierta: es el servidor. Verás
   `API en http://localhost:3000 · documentación en http://localhost:3000/docs`.
2. Abre una **segunda terminal** (icono `+` del panel de terminal) para las peticiones.
3. En Codespaces, la pestaña **Puertos** muestra el 3000 con una dirección
   `https://…-3000.app.github.dev`: es la misma API, vista desde tu navegador.

**Comprobar:**

```bash
# en la segunda terminal, desde cualquier carpeta
curl localhost:3000/salud
```

Respuesta: `{"estado":"ok"}`

## §2 · Leer una petición y una respuesta con `curl`

**Terminal:**

```bash
# en la segunda terminal
curl -i localhost:3000/tareas          # -i: enseña también la línea de estado y las cabeceras
curl -v localhost:3000/salud           # -v: enseña además la petición que sale (líneas con >)
curl -I localhost:3000/tareas          # -I: solo cabeceras (verbo HEAD)
```

**Comprobar:** con `-i`, la respuesta empieza así:

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 197
ETag: W/"c5-…"

{"items":[{"id":1,"titulo":"Instalar Node 22","completada":true,…}]}
```

Cómo se lee: **línea de estado** (versión, código y frase), **cabeceras** (`Nombre: valor`),
una línea en blanco y el **cuerpo**. Con `-v`, las líneas `>` son la petición: verbo, ruta
y versión (`GET /salud HTTP/1.1`), y las cabeceras que manda `curl` (`Host`, `User-Agent`,
`Accept`).

## §3 · Las mismas peticiones con REST Client

**Fichero:** `docs/ejemplos/api-base/peticiones/tareas.http`

```http
### Extensión REST Client de VS Code: pulsa «Send Request» encima de cada petición

@base = http://localhost:3000

### Salud
GET {{base}}/salud

### Listar
GET {{base}}/tareas

### Una
GET {{base}}/tareas/1

### No existe
GET {{base}}/tareas/99

### Crear
POST {{base}}/tareas
Content-Type: application/json

{ "titulo": "Leer el contrato OpenAPI" }
```

1. Abre el fichero en VS Code.
2. Pulsa **Send Request** encima de `GET {{base}}/salud`.
3. La respuesta sale en un panel a la derecha, con el JSON formateado.

**Comprobar:** «No existe» devuelve `HTTP/1.1 404 Not Found` y «Crear», `HTTP/1.1 201 Created`.

## §4 · Tu turno 1: explorar la API de ejemplo (25 min) · ejercicio e01

Con la API de §1 arrancada, contesta en el fichero `ejercicios/s01/src/respuestas/explorar.ts`:
cambia cada `null` por tu respuesta (el editor te propone las opciones válidas). Usa
`curl -i` o REST Client, lo que prefieras.

1. `GET /tareas`: ¿qué código vuelve? ¿Qué dice la cabecera `Content-Type`?
2. `GET /tareas/1` y `GET /tareas/99`: ¿qué cambia en la línea de estado, en el
   `Content-Type` y en el cuerpo?
3. `GET /tareas/abc`: ¿qué pasa? ¿Te parece correcto?
4. Crea una tarea con el `POST` de §3. ¿Qué código vuelve? ¿Qué cabecera nueva aparece?
5. Repite `GET /tareas`: ¿está la tarea nueva? ¿Qué `id` le ha dado el servidor?
6. Manda el `POST` con el cuerpo `{}`. ¿Qué código y qué mensaje vuelven?
7. Para el servidor (`Ctrl+C`), arráncalo otra vez y repite `GET /tareas`. ¿Dónde está tu
   tarea?
8. Abre `/docs` en el navegador (pestaña **Puertos** → icono del globo en el 3000). ¿Qué
   es esa página?

**Comprobar** (en una tercera terminal; la API de ejemplo puede seguir arrancada):

```bash
# desde la raíz del repositorio
cd ejercicios
npm run comprobar s01 e01
```

**Hecho cuando** sale `[ OK ] s01 · e01-explorar  (8/8)` y sabes señalar, en una
respuesta de `curl -i`, la línea de estado, las cabeceras y el cuerpo. Si una respuesta
está mal, `comprobar` te dice cuál y te da una pista, pero no la solución.

**Si acabas antes:** una API pública de verdad, la de GitHub (sin registrarte):

```bash
# desde cualquier carpeta
curl -i https://api.github.com/repos/nodejs/node
curl -i https://api.github.com/repos/nodejs/no-existe
```

¿Qué cabeceras `x-ratelimit-*` trae? ¿Cuántas peticiones por hora te deja hacer sin
identificarte? ¿Qué devuelve el repositorio que no existe?

## §5 · Crear con `POST`: 201 y `Location`

**Terminal:**

```bash
# en la segunda terminal, con la API de §1 arrancada
curl -i -X POST localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Leer el contrato OpenAPI"}'
```

1. `-X POST` es el verbo; `-H` añade una cabecera; `-d` es el cuerpo.
2. Sin `-H "Content-Type: application/json"`, el servidor no sabe que el cuerpo es JSON.

**Comprobar:**

```
HTTP/1.1 201 Created
Location: /tareas/3
Content-Type: application/json; charset=utf-8

{"id":3,"titulo":"Leer el contrato OpenAPI","completada":false,"creadaEn":"2026-11-16T…"}
```

`201` dice «creado» y `Location` dice dónde está lo nuevo: `curl localhost:3000/tareas/3`.

## §6 · Seguro e idempotente, en la práctica

**Terminal:**

```bash
# en la segunda terminal, con la API de §1 arrancada
curl -s localhost:3000/tareas/1; echo
curl -s localhost:3000/tareas/1; echo                     # GET: seguro, nada cambia

curl -s -X POST localhost:3000/tareas -H "Content-Type: application/json" -d '{"titulo":"Repetida"}'; echo
curl -s -X POST localhost:3000/tareas -H "Content-Type: application/json" -d '{"titulo":"Repetida"}'; echo

curl -i -X DELETE localhost:3000/tareas/1                 # esta API aún no sabe borrar
```

**Comprobar:**

- Los dos `GET` devuelven lo mismo: leer no cambia nada (**seguro**).
- Los dos `POST` crean **dos** tareas con `id` distinto: `POST` **no es idempotente**.
- El `DELETE` devuelve `404` con `"detail":"No existe DELETE /tareas/1"`. El recurso sí
  existe; lo que no existe es ese verbo. El código correcto sería `405 Method Not
  Allowed`. Lo arreglamos en S2.

| Verbo | Para qué | Seguro | Idempotente |
|---|---|---|---|
| `GET` | Leer | Sí | Sí |
| `POST` | Crear (o una acción) | No | No |
| `PUT` | Sustituir entero | No | Sí |
| `PATCH` | Cambiar una parte | No | No necesariamente |
| `DELETE` | Borrar | No | Sí |

## §7 · El bug del día: «esto devuelve 500, ¿por qué?»

**Terminal:**

```bash
# en la segunda terminal, con la API de §1 arrancada. Ojo a la coma antes de }
curl -i -X POST localhost:3000/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Con una coma de más",}'
```

**Comprobar:** vuelve `500 Internal Server Error` con `{"title":"Error interno","status":500}`.

1. Mira la **primera terminal** (la del servidor): sale
   `SyntaxError: Expected double-quoted property name in JSON…` y, más abajo,
   `status: 400` y `type: 'entity.parse.failed'`.
2. La culpa es del cliente (JSON mal escrito), así que debería ser un `400`. El
   manejador de errores de `src/app.ts` contesta 500 a todo, sin mirar `err.status`.

**Fichero:** `docs/ejemplos/api-base/src/app.ts` (el manejador de errores, al final)

```ts
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
	const status = err.status ?? 500;
	if (status >= 500) console.error(err);
	res.status(status).type("application/problem+json").json({
		title: status >= 500 ? "Error interno" : "Petición no válida",
		status,
	});
});
```

**Comprobar:** el mismo `curl` devuelve ahora `400 Bad Request` con
`{"title":"Petición no válida","status":400}`. Un `5xx` es «se ha roto el servidor»; un
`4xx`, «revisa lo que has mandado».

## §8 · Tu turno 2: ¿qué verbo y qué código? (25 min) · ejercicio e02

Para cada situación, rellena **verbo, ruta y código de respuesta** en
`ejercicios/s01/src/respuestas/verbos.ts`. El recurso son las tareas de un equipo
(`/tareas`) y sus proyectos (`/proyectos`).

```ts
completar: { verbo: "…", ruta: "/…", codigo: … },
```

1. Ver todas las tareas.
2. Ver la tarea 7, que existe.
3. Ver la tarea 700, que no existe.
4. Crear una tarea nueva, y todo va bien.
5. Crear una tarea sin título (el título es obligatorio).
6. Marcar la tarea 7 como completada, sin tocar nada más.
7. Sustituir la tarea 7 entera por otra versión.
8. Borrar la tarea 7, y no hay nada que devolver.
9. Ver las tareas del proyecto 3.
10. Crear una tarea sin haberte identificado, en una API que lo exige.

**Hecho cuando** `npm run comprobar s01 e02` (desde `ejercicios`) da `[ OK ]` y, para
tres de ellas (1, 3 y 5), lo has comprobado contra la API de §1 con `curl -i`. Cuando hay
más de una respuesta razonable (200 o 204, 400 o 422), se aceptan las dos.

**Si acabas antes:** diseña las rutas (verbo y dirección, sin código) para gestionar
**comentarios** de una tarea: listarlos, añadir uno, borrar uno. ¿Qué código devolverías
si alguien intenta comentar una tarea que no existe?

## §9 · Los ejercicios de hoy y `npm run comprobar`

**Terminal:**

```bash
# primero para la API de ejemplo con Ctrl+C: los ejercicios usan también el puerto 3000
# desde la raíz del repositorio
cd ejercicios
npm run comprobar s01
```

**Comprobar:** e01 y e02 en `[ OK ]` (si los terminaste) y el resto en `[FALTA]`:
termina con `2 de 9 ejercicios superados.` Es lo esperado: los demás los vas a resolver
hoy. Cada `[FALTA]` dice qué comprobación falla y una pista.

| Ejercicio | Bloque | Dónde | Para quién |
|---|---|---|---|
| e01 · Explorar la API | 1 | `src/respuestas/explorar.ts` | Todos |
| e02 · Verbo y código | 2 | `src/respuestas/verbos.ts` | Todos |
| e03 · `GET /salud` | 3 | `src/app.ts` | Todos (en directo) |
| e04 · Listar | 3 | `src/app.ts` | Todos |
| e05 · Prioridad | 3 | `src/datos.ts` | Todos |
| e06 · Reto: filtrar | 3 | `src/app.ts` | Si acabas antes |
| e07 · Una, o 404 | 4 | `src/app.ts` | Todos |
| e08 · Resumen | 4 | `src/app.ts` | Si acabas e07 |
| e09 · Reto: etiquetas | 4 | `src/app.ts` | Si acabas antes |

Enunciados en `ejercicios/s01/README.md`; las pruebas, de solo lectura, en
`ejercicios/s01/pruebas/`.

## §10 · TypeScript lo justo: tipos e interfaces

**Fichero:** `ejercicios/s01/src/datos.ts` (ya está así; léelo)

```ts
export interface Tarea {
	id: number;
	titulo: string;
	completada: boolean;
}

export const tareas: Tarea[] = [
	{ id: 1, titulo: "Instalar Node", completada: true },
	{ id: 2, titulo: "Arrancar la API", completada: false },
	{ id: 3, titulo: "Leer el contrato", completada: false },
];
```

1. `interface Tarea` describe la forma de una tarea: qué campos y de qué tipo.
2. `Tarea[]` es «una lista de tareas». `export` deja usarlo desde otro fichero.
3. Para probar: cambia `completada: true` por `completada: "sí"` en la tarea 1 y ejecuta
   el `typecheck`. Después, deshaz el cambio.

**Terminal:**

```bash
# desde ejercicios
npm run typecheck
```

**Comprobar:** con el cambio, sale
`error TS2322: Type 'string' is not assignable to type 'boolean'.` con el fichero y la
línea. Sin el cambio, no sale nada: **nada es buena noticia**.

| TypeScript | Qué es |
|---|---|
| `string`, `number`, `boolean` | Texto, número, verdadero o falso |
| `Tarea[]` | Lista de tareas |
| `campo?: string` | Campo opcional |
| `"alta" \| "media" \| "baja"` | Solo uno de estos tres textos |
| `const x = 3` | Tipo deducido: TypeScript ya sabe que es `number` |

## §11 · El proyecto: `package.json`, `tsconfig.json` y `tsx watch`

**Fichero:** `ejercicios/package.json` (lo importante)

```json
{
	"type": "module",
	"scripts": {
		"comprobar": "tsx comprobar.ts",
		"dev:s01": "tsx watch s01/src/server.ts",
		"typecheck": "tsc --noEmit"
	}
}
```

1. `"type": "module"`: módulos modernos (`import`/`export`). Por eso los `import` entre
   ficheros propios llevan `.js` al final aunque el fichero sea `.ts`.
2. `tsx watch`: ejecuta TypeScript directamente y **reinicia al guardar**.
3. `tsc --noEmit`: solo comprueba los tipos; no genera nada. `tsx` no comprueba tipos:
   por eso hay que pasar el `typecheck`.
4. `tsconfig.json` lleva `"strict": true`: el modo exigente, el que se usa en proyectos
   reales.

## §12 · Express: la primera ruta, `GET /salud`

**Fichero:** `ejercicios/s01/src/app.ts`

```ts
import express from "express";
import { etiquetas, tareas } from "./datos.js";

export function crearApp() {
	const app = express();
	app.use(express.json());

	// Ejercicio 3: GET /salud
	app.get("/salud", (_req, res) => {
		res.json({ estado: "ok" });
	});

	// Ejercicio 4: GET /tareas
	// ...
	return app;
}
```

1. Quita el `//` de la línea del `import` de los datos.
2. Bajo `// Ejercicio 3`, `app.get(ruta, (req, res) => …)`: «cuando llegue un `GET` a esta ruta, ejecuta esto».
3. `res.json(…)`: responde con JSON y pone el `Content-Type` solo. El código es 200 si no
   dices otro.
4. `crearApp()` monta la aplicación; `server.ts` la arranca en el puerto. Separadas, las
   pruebas usan la aplicación sin abrir ningún puerto.

**Terminal:**

```bash
# desde ejercicios, en una terminal
npm run dev:s01

# en otra terminal
curl -i localhost:3000/salud

# desde ejercicios
npm run comprobar s01 e03
```

**Comprobar:** `curl` da `200` con `{"estado":"ok"}` y `comprobar` da
`[ OK ] s01 · e03-salud  (3/3)`.

## §13 · Tu turno 3: listar las tareas y tipar la prioridad (25 min)

**Para todos:**

1. **e04.** `GET /tareas` responde 200 con `{ "items": [ …todas las tareas… ] }`. Pista:
   un objeto con `items`, no el array suelto.
2. **e05, el modelo.** En `datos.ts`, añade a `Tarea` un campo opcional
   `prioridad?: "alta" | "media" | "baja"` y pon `prioridad: "alta"` a la tarea 2.
   Después prueba `prioridad: "urgente"` y lee el error del `typecheck`.

**Hecho cuando:**

```bash
# desde ejercicios
npm run typecheck              # sin errores (con "alta")
npm run comprobar s01 e04      # [ OK ] s01 · e04-listar  (3/3)
npm run comprobar s01 e05      # [ OK ] s01 · e05-prioridad  (3/3)
curl localhost:3000/tareas     # la tarea 2 sale con "prioridad":"alta"
```

**Si acabas antes, e06 (reto):** que `GET /tareas?completada=true` devuelva solo las
completadas y `?completada=false` solo las pendientes. Sin el parámetro, todas. Pista:
`req.query`, y llega como texto. `npm run comprobar s01 e06`.

## §14 · Parámetros de ruta: `req.params.id` llega como texto

**Fichero:** `ejercicios/s01/src/app.ts` (dentro de `crearApp`)

```ts
// Ejercicio 7: GET /tareas/:id
app.get("/tareas/:id", (req, res) => {
	const tarea = tareas.find((t) => t.id === req.params.id);   // ← no compila
	res.json(tarea);
});
```

**Terminal:**

```bash
# desde ejercicios
npm run typecheck
```

**Comprobar:** sale `error TS2367: This comparison appears to be unintentional because
the types 'number' and 'string' have no overlap.` Todo lo que llega en la URL es texto:
`"2"` no es `2`. El arreglo:

```ts
const tarea = tareas.find((t) => t.id === Number(req.params.id));
```

## §15 · Un 404 que explica el error: `application/problem+json`

**Fichero:** `ejercicios/s01/src/app.ts`

```ts
import express, { type Response } from "express";

function noEncontrado(res: Response, detail: string) {
	res.status(404).type("application/problem+json").json({ title: "No encontrado", status: 404, detail });
}
```

1. Pon la función encima de `crearApp`, y cambia la primera línea del fichero por la del
   `import` de arriba.
2. Úsala así: `noEncontrado(res, "No hay ninguna tarea con id 99"); return;`
3. `return` corta: sin él, Express intentaría responder dos veces.

**Comprobar:** `curl -i localhost:3000/tareas/99` devuelve:

```
HTTP/1.1 404 Not Found
Content-Type: application/problem+json; charset=utf-8

{"title":"No encontrado","status":404,"detail":"No hay ninguna tarea con id 99"}
```

`application/problem+json` es el formato estándar de errores de las APIs HTTP
(RFC 9457): `title` (qué pasa, corto), `status` (el código) y `detail` (este caso).

## §16 · Tu turno 4: una tarea, o 404, el resumen y el reto (25 min)

**Para todos, e07:**

- `GET /tareas/2` responde 200 con la tarea 2.
- `GET /tareas/99` responde 404 con `Content-Type: application/problem+json` y un cuerpo
  con `status` y `title`.

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s01 e07      # [ OK ] s01 · e07-una  (4/4)
```

**Si acabas e07, e08:** `GET /tareas/resumen` responde 200 con
`{ "total": 3, "completadas": 1, "pendientes": 2 }`, calculado a partir de la lista. Y
`GET /tareas/2` tiene que seguir funcionando.

```ts
// ojo: ANTES de app.get("/tareas/:id", …)
app.get("/tareas/resumen", (_req, res) => {
	const completadas = tareas.filter((t) => t.completada).length;
	// …y responde con total, completadas y pendientes
});
```

Si la pones después de `/tareas/:id`, Express toma «resumen» por un id y contesta 404.
`npm run comprobar s01 e08`.

**Si acabas antes, e09 (reto):** `GET /etiquetas` y `GET /etiquetas/:id` funcionan como
las tareas, y cualquier ruta que no existe responde 404 con `application/problem+json`,
no con la página HTML de Express. Pista: un `app.use((req, res) => …)` **al final**, justo
antes de `return app`.

```bash
# desde ejercicios
npm run comprobar s01          # 9 de 9 ejercicios superados.
```

## §17 · Guardar tu trabajo en GitHub

**Terminal:**

```bash
# desde la raíz del repositorio
git branch --show-current                  # main en tu copia; alumno/<tu-nombre> si eres colaborador
git add -A
git commit -m "s01: ejercicios"
git push
```

**Comprobar:** en GitHub, pestaña **Actions**, aparece «Comprobar ejercicios» con tu
commit. En su resumen sale lo mismo que `npm run comprobar`.

Si eres colaborador y aún no tienes tu rama, créala una vez antes del commit:

```bash
# desde la raíz del repositorio
git switch -c alumno/<tu-nombre>
git push -u origin alumno/<tu-nombre>
```

Al terminar: para el codespace (github.com/codespaces → `…` → **Stop codespace**). No lo
borres: mañana seguimos en el mismo.

**Si te sobra tiempo:** empieza la práctica 1 (`docs/prácticas/practica-01.pdf`). Lo que
no termines, en casa. Apunta tus dudas: mañana empezamos por ellas.

## Demos de reserva

### R1 · HTTP a mano: es solo texto

```bash
# con una API arrancada en el 3000
printf 'GET /salud HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' | nc localhost 3000
```

**Comprobar:** vuelve la respuesta entera en texto plano: `HTTP/1.1 200 OK`, las
cabeceras, una línea en blanco y `{"estado":"ok"}`. Una petición HTTP/1.1 es eso: líneas
de texto.

### R2 · La caché de HTTP: `ETag` y `304`

```bash
# desde cualquier carpeta
curl -sI https://api.github.com/repos/nodejs/node | grep -i etag
curl -i https://api.github.com/repos/nodejs/node -H 'If-None-Match: W/"<el etag de arriba>"'
```

**Comprobar:** la segunda petición devuelve `HTTP/2 304` sin cuerpo: «lo que tienes sigue
valiendo». Sin identificarte, GitHub deja 60 peticiones por hora (`x-ratelimit-limit: 60`).

### R3 · La pestaña Red del navegador

1. Abre cualquier web en el navegador → `F12` → pestaña **Red** → filtro **Fetch/XHR**.
2. Recarga la página.
3. Clic en una petición: **Encabezados** (verbo, código, cabeceras) y **Respuesta** (JSON).

**Comprobar:** las páginas que usas a diario hacen decenas de peticiones a sus APIs.

### R4 · Cómo es una prueba por dentro

**Fichero:** `ejercicios/s01/pruebas/e03-salud.test.ts`

```ts
it("responde 200", async () => {
	const res = await request(crearApp()).get("/salud");
	expect(res.status, "GET /salud debería devolver 200").toBe(200);
});
```

`request(crearApp())` hace la petición sin abrir puerto; `expect(…).toBe(…)` compara lo
que llega con lo esperado; el texto del segundo argumento es la pista que imprime
`npm run comprobar`. Lo trabajamos en S3.

### R5 · El contrato y Swagger UI (adelanto de S3)

```bash
# desde docs/ejemplos/api-base
npm run dev
curl -s localhost:3000/openapi.json | head -c 300; echo
```

Abre `/docs` en el navegador → `POST /tareas` → **Try it out** → **Execute**.

**Comprobar:** Swagger UI hace la misma petición que el `curl` de §5 y enseña el `201`.
La página sale de `openapi.yaml`: el contrato.

### R6 · Filtrar con `req.query` (la solución de e06)

**Fichero:** `ejercicios/s01/src/app.ts` (en lugar de la ruta de `GET /tareas`)

```ts
app.get("/tareas", (req, res) => {
	const { completada } = req.query;
	const items = completada === undefined ? tareas : tareas.filter((t) => String(t.completada) === completada);
	res.json({ items });
});
```

**Comprobar:** `curl "localhost:3000/tareas?completada=true"` devuelve solo la tarea 1, y
`npm run comprobar s01 e04` y `e06` dan `[ OK ]`. Las comillas en el `curl` hacen falta: sin
ellas, la terminal se come el `?`.

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| `Error: listen EADDRINUSE: address already in use :::3000` | Otra API sigue arrancada en el 3000 (la de ejemplo o la de los ejercicios) | `Ctrl+C` en su terminal. Si no la encuentras: `PORT=3001 npm run dev:s01` y usa el 3001 |
| `curl: (7) Failed to connect to localhost port 3000` | El servidor no está arrancado, o se ha parado por un error | Mira la terminal del servidor y vuelve a `npm run dev` |
| `Cannot GET /salud` en HTML | La ruta no existe: está mal escrita, falta la `/` o no has guardado | Guarda (`tsx watch` reinicia solo) y revisa la ruta |
| `ReferenceError: tareas is not defined` (o `TS2304: Cannot find name 'tareas'`) | Sigue comentado el `import` de `datos.js` | Quita el `//` de la segunda línea de `app.ts` |
| `typecheck`: `error TS2835: Relative import paths need explicit file extensions` | El `import` no lleva `.js` (la API arranca igual, pero el `typecheck` falla) | `from "./datos.js"` (con `.js`, aunque el fichero sea `.ts`) |
| `GET /tareas/2` da 404 aunque existe | Comparas el `id` (número) con `req.params.id` (texto) | `Number(req.params.id)` |
| `Cannot set headers after they are sent to the client` | Respondes dos veces: falta el `return` después del 404 | `noEncontrado(…); return;` |
| `POST` devuelve 400 «El campo titulo es obligatorio» aunque lo mandas | Falta la cabecera `Content-Type: application/json` | Añade `-H "Content-Type: application/json"` |
| e01 o e02: `[FALTA]` y una pista, pero no la respuesta | Es a propósito: son preguntas | Repite la petición que dice la pista y mira la línea de estado o la cabecera |
| e08: `GET /tareas/resumen` da 404 | `/tareas/resumen` está después de `/tareas/:id` | Muévela antes: Express usa la primera ruta que encaja |
| `comprobar` dice `[FALTA]` pero en `curl` funciona | La prueba mira algo más: el `Content-Type`, `items`… | Lee la pista que imprime debajo de cada `-` |
| `No he podido ejecutar las pruebas` | Faltan dependencias | `cd ejercicios && npm ci` |
| En Windows (local), el `curl` con `-d '{…}'` falla | PowerShell trata las comillas de otra forma | Usa Git Bash, o el codespace |
| El navegador no abre `localhost:3000` en Codespaces | El codespace está en la nube, no en tu equipo | Pestaña **Puertos** → globo del 3000 |
