# S3 · Referencia rápida — OpenAPI: el contrato primero y las pruebas

> Antes de empezar: tu codespace abierto (o el repositorio en local con Node 22.12 o
> superior). Hoy se trabaja en `ejercicios/s03`, que ya trae la API de S2 terminada (con
> el 405, el id validado, la cabecera `Link` y el registro). Cada sección trae todo lo que
> hace falta: cópiala tal cual.

| § | Dónde | Qué |
|---|---|---|
| 0 | `ejercicios` | Arrancar la sesión: `npm run comprobar s03` y la API de hoy |
| 1 | `ejercicios/s03/carta.yaml` | Cómo se lee un contrato: `info`, `paths`, `components` y `$ref` |
| 2 | `s03/openapi.yaml` | `GET /tareas/{id}` y el esquema `Tarea` (en directo) |
| 3 | `ejercicios` | Tu turno 1 (e01–e03): leer un contrato, el de `/tareas` y reutilizar |
| 4 | `s03/src/app.ts` | Publicar el contrato: `/openapi.json` y Swagger UI en `/docs` |
| 5 | `s03/src/app.ts` y `errores.ts` | Validar contra el contrato con `express-openapi-validator` |
| 6 | Terminal | El bug del día: «todo en verde y la documentación está mal». El lint |
| 7 | Terminal | Tipos de TypeScript generados desde el contrato |
| 8 | `ejercicios` | Tu turno 2 (e04–e06): publicar, validar y el lint |
| 9 | `s03/mis-pruebas/tareas.test.ts` | Tus pruebas con Vitest y Supertest (en directo) |
| 10 | `s03/mis-pruebas/contrato.test.ts` | Pruebas contra el contrato: `cumpleContrato` |
| 11 | `ejercicios` | Tu turno 3 (e07–e09): tus pruebas, contra el contrato y la cobertura |
| 12 | `s03/openapi.yaml` | ¿Lo entendería un agente de IA? La lista de comprobación |
| 13 | `s03/openapi.yaml` y `src/proyectos` | Un recurso nuevo: contrato → tipos → código → prueba |
| 14 | `ejercicios` | Tu turno 4 (e10–e12): la revisión, proyectos y sus pruebas |
| 15 | Terminal | Guardar tu trabajo en GitHub |
| R1–R6 | | Demos de reserva |

## §0 · Arrancar la sesión

**Terminal:**

```bash
# desde la raíz del repositorio
cd ejercicios
npm run comprobar s03
```

**Comprobar:** termina con `0 de 8 ejercicios superados · retos: 0 de 4.` Es lo esperado:
los vas a resolver hoy. Todos empiezan igual en `s03`, aunque no terminaran S2.

```bash
# desde ejercicios, en una terminal (déjala abierta: es el servidor)
npm run dev:s03

# en otra terminal
curl -s "localhost:3000/tareas?limite=2"
```

Respuesta: `{"items":[{"id":1,…},{"id":2,…}],"total":12,"pagina":1,"limite":2}`. Es la API
de S2, entera.

| Ejercicio | Bloque | Dónde | Para quién |
|---|---|---|---|
| e01 · Lee un contrato | 1 | `src/respuestas/contrato.ts` | Todos |
| e02 · El contrato de /tareas | 1 | `openapi.yaml` | Todos |
| e03 · Reto: escríbelo una vez | 1 | `openapi.yaml` | Si acabas antes |
| e04 · Publica el contrato | 2 | `src/app.ts` | Todos |
| e05 · La API cumple el contrato | 2 | `src/app.ts` y `errores.ts` | Todos |
| e06 · Reto: el lint y tu regla | 2 | `openapi.yaml` y `redocly.yaml` | Si acabas antes |
| e07 · Tus propias pruebas | 3 | `mis-pruebas/tareas.test.ts` | Todos |
| e08 · Pruebas contra el contrato | 3 | `mis-pruebas/contrato.test.ts` | Todos |
| e09 · Reto: recorre todo el contrato | 3 | `mis-pruebas/` | Si acabas antes |
| e10 · ¿Lo entendería un agente? | 4 | `openapi.yaml` | Todos |
| e11 · Proyectos, del contrato al código | 4 | `openapi.yaml`, `src/proyectos/rutas.ts` y `app.ts` | Todos |
| e12 · Reto: las pruebas de proyectos | 4 | `mis-pruebas/proyectos.test.ts` | Si acabas antes |

Enunciados en `ejercicios/s03/README.md`; las pruebas, de solo lectura, en
`ejercicios/s03/pruebas/`. Hoy hay cuatro órdenes nuevas:

| Orden (desde `ejercicios`) | Qué hace |
|---|---|
| `npm run lint:s03` | Revisa el contrato con las reglas de `s03/redocly.yaml` |
| `npm run tipos:s03` | Genera `s03/src/tipos/api.d.ts` desde el contrato |
| `npm run pruebas:s03` | Pasa **tus** pruebas (`s03/mis-pruebas`) contra tu API |
| `npm run pruebas:s03 -- tareas` | Solo las de `tareas.test.ts` |

## §1 · Cómo se lee un contrato

**Fichero:** `ejercicios/s03/carta.yaml` (ya está; léelo, no lo cambies)

```yaml
openapi: 3.1.0                      # la versión de OpenAPI
info:                               # qué API es
  title: Carta del restaurante
  version: 1.0.0
paths:                              # las rutas, y dentro, los verbos
  /platos/{id}:
    get:
      operationId: obtenerPlato     # el nombre único de la operación
      summary: Obtiene un plato
      parameters:
        - $ref: "#/components/parameters/IdPlato"
      responses:                    # una por código
        "200":
          description: El plato
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Plato" }
        "404": { $ref: "#/components/responses/NoEncontrado" }
components:                         # lo que se escribe una vez y se reutiliza
  schemas:
    Plato:
      type: object
      required: [id, nombre, precio]
      properties:
        id: { type: integer }
        nombre: { type: string }
        precio: { type: number, minimum: 0 }
```

| Sección | Qué lleva | En el restaurante |
|---|---|---|
| `info` | Nombre, versión y descripción de la API | El nombre del restaurante |
| `paths` | Cada ruta y sus verbos: parámetros, cuerpo y respuestas | Los platos de la carta |
| `components` | Esquemas, parámetros y respuestas reutilizables | Los ingredientes, descritos una vez |
| `$ref` | «La definición está allí»: se escribe una vez y se usa en muchos sitios | «Ver alérgenos al final» |

1. Una **operación** es un verbo dentro de una ruta: `get` en `/platos/{id}`.
2. `required` dice qué campos son obligatorios; `minimum`, `maximum`, `enum` y
   `additionalProperties: false` dicen qué valores valen.
3. Las respuestas se ordenan por código, como texto: `"200"`, `"404"`.

**Comprobar:** en VS Code, abre `carta.yaml` y pulsa el icono de vista previa de la
extensión OpenAPI (arriba a la derecha): ves la carta como documentación.

## §2 · `GET /tareas/{id}` y el esquema `Tarea` (en directo)

**Fichero:** `ejercicios/s03/openapi.yaml`, dentro de `paths:`, justo después de `/salud`
(con dos espacios de sangría, como `/salud`):

```yaml
  /tareas/{id}:
    get:
      operationId: obtenerTarea
      summary: Obtiene una tarea
      description: Devuelve una tarea por su id. Si no existe, responde 404.
      parameters:
        - name: id
          in: path
          required: true
          description: Id de la tarea
          schema: { type: integer, minimum: 1 }
      responses:
        "200":
          description: La tarea
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Tarea" }
        "404": { $ref: "#/components/responses/NoEncontrado" }
```

**Fichero:** el mismo, dentro de `components:` → `schemas:`, bajo `# Ejercicio 2`:

```yaml
    Prioridad:
      type: string
      enum: [baja, media, alta]
      description: Lo urgente que es la tarea
    Tarea:
      type: object
      required: [id, titulo, completada, prioridad]
      properties:
        id: { type: integer, description: Lo asigna el servidor, example: 3 }
        titulo: { type: string, description: Qué hay que hacer, example: Leer el contrato }
        completada: { type: boolean, description: Si ya está hecha }
        prioridad: { $ref: "#/components/schemas/Prioridad" }
```

1. En YAML, **la sangría es la estructura**: dos espacios por nivel, nunca tabuladores.
2. `{id}` en la ruta y `in: path` en el parámetro: es el `:id` de Express.
3. La prioridad es un `enum`: el contrato dice qué valores valen, como `PRIORIDADES`.

**Comprobar:**

```bash
# desde ejercicios
npm run comprobar s03 e02
```

Da `[FALTA] s03 · e02-contrato  (3/7)`: ya pasan «es un OpenAPI 3.1 válido», el
`operationId` y el esquema `Tarea`. Lo que falta es tu Tu turno.

## §3 · Tu turno 1: leer un contrato, el de /tareas y reutilizar (25 min) · e01, e02 y e03

**Para todos:**

1. **e01 (10 min).** Abre `s03/carta.yaml` y contesta en `s03/src/respuestas/contrato.ts`.
   Los textos van entre comillas (`"paths"`); los números y `true`/`false`, sin ellas.
2. **e02 (15 min).** Completa `openapi.yaml` con las otras cinco operaciones:
   `GET /tareas` y `POST /tareas`; `PUT`, `PATCH` y `DELETE` en `/tareas/{id}`. Y los
   esquemas `TareaNueva`, `CambiosTarea` y `PaginaTareas`.

Lo que dice la API de S2, para pasarlo al contrato:

| Operación | Cuerpo | Éxito | Errores |
|---|---|---|---|
| `GET /tareas` | — | 200 `PaginaTareas` | 400 |
| `POST /tareas` | `TareaNueva` (`titulo` obligatorio) | 201 `Tarea` + cabecera `Location` | 400 |
| `GET /tareas/{id}` | — | 200 `Tarea` | 400, 404 |
| `PUT /tareas/{id}` | `TareaNueva` | 200 `Tarea` | 400, 404 |
| `PATCH /tareas/{id}` | `CambiosTarea` (ninguno obligatorio, al menos uno) | 200 `Tarea` | 400, 404 |
| `DELETE /tareas/{id}` | — | 204 sin cuerpo | 400, 404 |

Los parámetros de `GET /tareas`, con `in: query`:

| Nombre | Esquema |
|---|---|
| `prioridad` | `$ref: "#/components/schemas/Prioridad"` |
| `completada` | `type: boolean` |
| `orden` | `type: string`, `enum: [id, -id, titulo, -titulo, prioridad, -prioridad]`, `default: id` |
| `pagina` | `type: integer`, `minimum: 1`, `default: 1` |
| `limite` | `type: integer`, `minimum: 1`, `maximum: 100`, `default: 10` |

Un cuerpo y una respuesta 201 con cabecera, para copiar:

```yaml
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/TareaNueva" }
            example: { titulo: Preparar la demo, prioridad: alta }
      responses:
        "201":
          description: Tarea creada
          headers:
            Location:
              description: URL de la tarea nueva
              schema: { type: string, example: /tareas/13 }
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Tarea" }
        "400": { $ref: "#/components/responses/PeticionNoValida" }
```

Y un esquema de cuerpo que no admite campos de más:

```yaml
    TareaNueva:
      type: object
      required: [titulo]
      additionalProperties: false
      properties:
        titulo: { type: string, minLength: 1, maxLength: 120, description: Qué hay que hacer }
        completada: { type: boolean, default: false, description: Si ya está hecha }
        prioridad: { $ref: "#/components/schemas/Prioridad" }
```

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s03 e01      # [ OK ] s03 · e01-lectura  (7/7)
npm run comprobar s03 e02      # [ OK ] s03 · e02-contrato  (7/7)
```

**Si acabas antes, e03 (reto):** pasa `pagina`, `limite` e `id` a `components.parameters`
y úsalos con `$ref`; que todos los 4xx de `/tareas` sean `$ref` a `components/responses`;
y declara la cabecera `Link` en el 200 de `GET /tareas`. Un parámetro reutilizable:

```yaml
components:
  parameters:
    Limite:
      name: limite
      in: query
      description: Tareas por página, como mucho 100
      schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
```

Y en la operación: `- $ref: "#/components/parameters/Limite"`. `npm run comprobar s03 e03`.

## §4 · Publicar el contrato: `/openapi.json` y Swagger UI

**Fichero:** `ejercicios/s03/src/app.ts`. Arriba, con los demás `import`:

```ts
import { readFileSync } from "node:fs";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
```

Dentro de `crearApp`, bajo `// Ejercicio 4`, **antes** de `app.get("/salud", …)`:

```ts
// El contrato, publicado: para personas en /docs y para programas en /openapi.json
const rutaContrato = new URL("../openapi.yaml", import.meta.url).pathname;
const contrato = parse(readFileSync(rutaContrato, "utf8"));
app.get("/openapi.json", (_req, res) => {
	res.json(contrato);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(contrato));
```

1. `new URL("../openapi.yaml", import.meta.url)`: la ruta del contrato **relativa a este
   fichero**, arranques la API desde donde la arranques.
2. `parse` convierte el YAML en un objeto; `res.json` lo devuelve en JSON.
3. `swaggerUi.setup(contrato)` pinta la documentación de **ese** contrato.

**Comprobar:**

```bash
curl -s localhost:3000/openapi.json | head -c 120; echo
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" localhost:3000/docs/
```

El primero empieza por `{"openapi":"3.1.0","info":{"title":"API de tareas del curso",…`; el
segundo da `200 text/html; charset=utf-8`. En el navegador (en Codespaces, la pestaña
**Puertos** → el 3000 → el globo): `/docs`. `npm run comprobar s03 e04`.

## §5 · Validar contra el contrato con `express-openapi-validator`

**Fichero:** `ejercicios/s03/src/app.ts`. Arriba:

```ts
import * as OpenApiValidator from "express-openapi-validator";
```

Dentro de `crearApp`, bajo `// Ejercicio 5`, **después** de `/docs` y **antes** de las rutas:

```ts
// Lo que no cumpla el contrato no llega a las rutas
app.use(
	OpenApiValidator.middleware({
		apiSpec: rutaContrato,
		validateRequests: true,
		validateResponses: true,
		ignorePaths: /^\/(docs|openapi\.json|fallo-de-prueba)/,
	}),
);
```

1. `validateRequests`: parámetros, consulta y cuerpo, contra el contrato. Lo que no
   cumple, no llega a la ruta.
2. `validateResponses`: también lo que **contesta** la API (R3).
3. `ignorePaths`: lo que no está en el contrato a propósito.

**Comprobar** (paso 1, sin tocar `errores.ts`):

```bash
curl -s -i "localhost:3000/tareas?inventado=1"
```

Da `HTTP/1.1 500 Internal Server Error` y `"title":"Error interno"`, y en la terminal del
servidor: `Bad Request: Unknown query parameter 'inventado'` con `status: 400` y
`errors: [{ path: '/query/inventado', … }]`. **El validador funciona; el error se cuenta
mal**: el manejador no lo conoce y lo trata como un fallo inesperado.

**Fichero:** `ejercicios/s03/src/errores.ts`, en `manejadorErrores`, bajo `// Ejercicio 5`
(antes del `console.error` del 500):

```ts
// Los errores del validador del contrato traen status y una lista de fallos
const e = err as { status?: number; message?: string; errors?: { path: string; message: string }[] };
if (typeof e.status === "number" && e.status >= 400 && e.status < 500 && Array.isArray(e.errors)) {
	const errores = e.errors.map((x) => ({ campo: x.path.replace(/^\/(body|query|params)\/?/, "") || "(cuerpo)", mensaje: x.message }));
	const titulos: Record<number, string> = { 400: "Petición no válida", 404: "No encontrado", 405: "Método no permitido", 415: "Tipo de contenido no admitido" };
	return problema(res, e.status, titulos[e.status] ?? "Petición no válida", "La petición no cumple el contrato OpenAPI", errores);
}
if (typeof e.status === "number" && e.status >= 500 && Array.isArray(e.errors)) {
	console.error(`[${res.locals.idPeticion}] La respuesta no cumple el contrato:`, e.errors);
}
```

**Comprobar** (paso 2):

```bash
curl -s "localhost:3000/tareas?inventado=1"; echo
curl -s localhost:3000/tareas/abc; echo
curl -s -X POST localhost:3000/tareas -H "Content-Type: text/plain" -d hola; echo
curl -s -X POST localhost:3000/tareas -H "Content-Type: application/json" -d '{"titulo":"Válida","propietario":"otro"}'; echo
```

| Petición | Código | `errors` |
|---|---|---|
| `?inventado=1` | 400 | `[{"campo":"inventado","mensaje":"Unknown query parameter 'inventado'"}]` |
| `/tareas/abc` | 400 | `[{"campo":"id","mensaje":"must be integer"}]` |
| Cuerpo `text/plain` | 415 | `[{"campo":"/tareas","mensaje":"unsupported media type text/plain"}]` |
| Campo `propietario` | 400 | `[{"campo":"propietario","mensaje":"must NOT have additional properties"}]` |

Todas en `application/problem+json`, con `"detail":"La petición no cumple el contrato
OpenAPI"`. Los mensajes del validador vienen en inglés; los de Zod (que sigue detrás) los
escribimos en español.

## §6 · El bug del día: todo en verde y la documentación está mal

**Fichero:** `ejercicios/s03/openapi.yaml`, en `PaginaTareas`, una descripción con una coma:

```yaml
        total: { type: integer, description: Tareas que cumplen los filtros, en todas las páginas }
```

**Terminal:**

```bash
# desde ejercicios
npm run comprobar s03 e02      # [ OK ]
npm run comprobar s03 e05      # [ OK ]
npm run lint:s03
```

**Comprobar:** las pruebas pasan, y el lint dice:

```
s03/openapi.yaml:
  267:78  error    struct  Property `en todas las páginas` is not expected here.

1 errores y 0 avisos en s03/openapi.yaml.
```

(El número de línea depende de tu contrato.)

1. Dentro de `{ … }`, **la coma separa campos**. El YAML ha leído `description: Tareas
   que cumplen los filtros` y un campo nuevo llamado `en todas las páginas`, vacío.
2. El validador lo ignora; Swagger UI enseña la descripción cortada.
3. Arreglo: el texto entre comillas,
   `description: "Tareas que cumplen los filtros, en todas las páginas"`, o en bloque.

El lint es la **ortografía del contrato**: reglas que se pasan solas antes de que lo lea
nadie. `npm run lint:s03` usa las reglas de `s03/redocly.yaml` (las recomendadas de
Redocly, con tres apagadas y el motivo al lado).

## §7 · Tipos de TypeScript generados desde el contrato

**Terminal:**

```bash
# desde ejercicios
npm run tipos:s03
```

**Comprobar:** la última línea es `s03/openapi.yaml → s03/src/tipos/api.d.ts`. Ábrelo: cada esquema es un
tipo, con su `description` como comentario. Se usa así:

```ts
import type { components } from "../tipos/api.js";

type Tarea = components["schemas"]["Tarea"];
// { id: number; titulo: string; completada: boolean; prioridad: "baja" | "media" | "alta" }
```

1. **Nunca se edita a mano**: si cambia el contrato, se vuelve a generar.
2. Si el contrato quita un campo que el código usa, `npm run typecheck` falla. El
   compilador vigila que código y contrato no se separen.
3. Es lo que harás con proyectos en el bloque 4 (e11).

## §8 · Tu turno 2: publicar, validar y el lint (25 min) · e04, e05 y e06

**Para todos:**

1. **e04.** `/openapi.json` y Swagger UI en `/docs` (§4).
2. **e05.** El validador y la conversión de sus errores en `errores.ts` (§5). Necesita el
   e02 terminado: lo que el contrato no declara, **el validador lo rechaza**.

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s03 e04      # [ OK ] s03 · e04-publicar  (3/3)
npm run comprobar s03 e05      # [ OK ] s03 · e05-validar  (6/6)
```

Para pensar: rompe el contrato a propósito (quita `titulo` de `required` en `TareaNueva`,
o baja `limite` a `maximum: 50`) y mira qué pruebas fallan y qué dice el error (R1).

**Si acabas antes, e06 (reto):** `npm run lint:s03` sin errores ni avisos, y una regla
tuya en `s03/redocly.yaml`. Una regla propia tiene esta forma:

```yaml
rules:
  rule/operationid-con-verbo:
    subject:
      type: Operation
      property: operationId
    assertions:
      pattern: /^[a-z]+(ar|er|ir)[A-Z]/
    message: El operationId empieza por un verbo en infinitivo, como listarTareas
    severity: error
```

Para el aviso `operation-4xx-response` de `/salud`: ¿qué 4xx puede dar? El límite de
peticiones (429) vale para todas las rutas. `npm run comprobar s03 e06`.

## §9 · Tus pruebas con Vitest y Supertest (en directo)

**Fichero:** `ejercicios/s03/mis-pruebas/tareas.test.ts` (ya trae una; añade estas dentro
del `describe`)

```ts
it("POST /tareas sin título responde 400 en problem+json", async () => {
	const res = await request(crearApp()).post("/tareas").send({ prioridad: "alta" });
	expect(res.status).toBe(400);
	expect(res.headers["content-type"]).toMatch(/problem\+json/);
});

it("GET /tareas/999 responde 404", async () => {
	expect((await request(crearApp()).get("/tareas/999")).status).toBe(404);
});
```

1. `request(crearApp())`: Supertest llama a la API **en memoria**, sin puerto ni servidor
   encendido. Cada prueba, una API nueva con los datos de partida.
2. `it("…")`: una prueba, con su frase. `expect(valor).toBe(esperado)`: la comprobación.
3. Una prueba que nunca falla no prueba nada: la buena prueba **falla si la API se rompe**.

**Terminal:**

```bash
# desde ejercicios
npm run pruebas:s03 -- tareas
```

**Comprobar:** `Test Files  1 passed (1)` y `Tests  3 passed (3)`. Para ver que sirven,
rompe la API a propósito (en `servicio.ts`, cambia el 404 de `obtener` por un 200) y
vuelve a pasarlas: la del 404 falla. Deshazlo.

## §10 · Pruebas contra el contrato: `cumpleContrato`

**Fichero:** `ejercicios/s03/mis-pruebas/contrato.test.ts` (ya trae la de `/salud`)

```ts
it("GET /tareas/{id}", async () => {
	const res = await request(crearApp()).get("/tareas/3");
	expect(res.status).toBe(200);
	expect(cumpleContrato(res)).toEqual([]);
});
```

1. `cumpleContrato(res)` (en `mis-pruebas/cumple-contrato.ts`, ya hecho) busca en
   `openapi.yaml` la operación y el código de la respuesta, y comprueba el `Content-Type`
   y el **cuerpo entero** contra su esquema.
2. Devuelve la lista de fallos: `[]` es «la cumple».
3. Un código que el contrato no declara también es un fallo.

**Comprobar:** `npm run pruebas:s03 -- contrato` en verde. Para verlas fallar, pásalas
contra la versión rota que usa `comprobar` (da los códigos buenos, pero tareas sin
`completada` y con una prioridad inventada):

```bash
# desde ejercicios
MUTANTE=respuesta-rota npm run pruebas:s03 -- contrato
```

El fallo dice exactamente qué no cumple:

```
GET /tareas/3 → 200: (cuerpo) no trae el campo obligatorio «completada»
GET /tareas/3 → 200: /prioridad tendría que ser uno de: baja, media, alta
```

¿Por qué no lo para `validateResponses`? La versión rota cambia la respuesta después del
validador. Y en producción, muchas APIs lo tienen apagado: tus pruebas son la red.

| Prueba | Qué comprueba | Qué se le escapa |
|---|---|---|
| `expect(res.status).toBe(200)` | El código | Un cuerpo con la forma equivocada |
| `expect(res.body.titulo).toBe("…")` | Un campo concreto | El resto de campos |
| `expect(cumpleContrato(res)).toEqual([])` | Código, tipo y cuerpo, según el contrato | Que el valor sea **el correcto** (eso, las otras) |

## §11 · Tu turno 3: tus pruebas, contra el contrato y la cobertura (25 min) · e07, e08 y e09

**Para todos:**

1. **e07.** Al menos 5 pruebas en `mis-pruebas/tareas.test.ts` (§9). Entre ellas, una
   que compruebe un 400 y otra un 404.
2. **e08.** Al menos 3 pruebas con `cumpleContrato` en `mis-pruebas/contrato.test.ts`
   (§10): listar, obtener una y crear.

`comprobar` pasa tus pruebas contra la API buena y contra **versiones rotas** que tenemos
preparadas:

| Versión rota | Qué hace mal | La detecta… |
|---|---|---|
| `sin-validacion` | Acepta un `POST` sin título (201 en lugar de 400) | Una prueba del 400 |
| `404-como-200` | Responde 200 a lo que no existe | Una prueba del 404 |
| `respuesta-rota` | Códigos buenos, pero tareas que no cumplen el esquema | `cumpleContrato` en el cuerpo de una tarea |

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s03 e07      # [ OK ] s03 · e07-mis-pruebas  (4/4)
npm run comprobar s03 e08      # [ OK ] s03 · e08-contra-el-contrato  (3/3)
```

**Si acabas antes, e09 (reto):** que tus pruebas (todas las de `mis-pruebas/`) llamen a
las seis operaciones de `/tareas`, cada una con un caso que va bien y otro de error.
Ideas: `?limite=0` (400), `PUT` y `PATCH` sobre la 999 (404), borrar dos veces (204 y
404). `npm run comprobar s03 e09`.

## §12 · ¿Lo entendería un agente de IA? La lista de comprobación

Un agente de IA (un asistente que llama a APIs por su cuenta) no lee tu código ni te
pregunta: lee el contrato y decide con él **qué** llamar y **cómo**. Lo que le sirve a él
le sirve igual a una persona nueva en el equipo.

| # | Comprueba | Mal | Bien |
|---|---|---|---|
| 1 | `operationId` con verbo, en camelCase | `tareasGet`, `op2` | `listarTareas` |
| 2 | `description` que dice **cuándo** usarla | «Tareas» | «Úsala para marcar una tarea como completada: cambia solo los campos que se mandan» |
| 3 | Cada parámetro, con `description` | `limite` sin más | «Tareas por página, como mucho 100» |
| 4 | Cada campo, con `description` | `completada: boolean` | «Si ya está hecha» |
| 5 | Valores cerrados en `enum`, no texto libre | `prioridad: string` | `enum: [baja, media, alta]` |
| 6 | Un `example` en cada cuerpo | — | `example: { completada: true }` |
| 7 | Errores que dicen cómo corregir | `400` sin cuerpo | `problem+json` con `errors: [{ campo, mensaje }]` |

**Revisión cruzada (10 min):** pásale tu `openapi.yaml` a otra pareja (o comparte
pantalla). Ella revisa con la tabla y apunta **tres cosas** que un agente no entendería.
Tú arreglas las tuyas.

**Comprobar:** `npm run comprobar s03 e10` mira 1, 2, 3, 4 y 6.

## §13 · Un recurso nuevo: contrato → tipos → código → prueba

**Paso 1 · El contrato.** `ejercicios/s03/openapi.yaml`, en `paths:`:

```yaml
  /proyectos:
    get:
      operationId: listarProyectos
      tags: [proyectos]
      summary: Lista los proyectos
      description: Devuelve todos los proyectos. Úsala para conocer el id de un proyecto antes de consultarlo.
      responses:
        "200":
          description: Todos los proyectos
          content:
            application/json:
              schema:
                type: object
                required: [items]
                properties:
                  items:
                    type: array
                    description: Todos los proyectos
                    items: { $ref: "#/components/schemas/Proyecto" }
```

En `components.schemas`:

```yaml
    Proyecto:
      type: object
      required: [id, nombre]
      properties:
        id: { type: integer, description: Lo asigna el servidor, example: 1 }
        nombre: { type: string, description: Nombre corto del proyecto, example: Curso de APIs }
        descripcion: { type: string, description: Para qué es el proyecto, example: Material y ejercicios }
    ProyectoNuevo:
      type: object
      required: [nombre]
      additionalProperties: false
      properties:
        nombre: { type: string, minLength: 1, maxLength: 80, description: Nombre corto del proyecto }
        descripcion: { type: string, maxLength: 500, description: Para qué es el proyecto }
```

`POST /proyectos` (201 + `Location`, 400) y `GET /proyectos/{id}` (200, 400, 404) se
escriben como los de tareas (§3).

**Paso 2 · Los tipos.** `npm run tipos:s03`.

**Paso 3 · El código.** `ejercicios/s03/src/proyectos/rutas.ts` (fichero nuevo):

```ts
import { Router } from "express";
import { ErrorApi } from "../errores.js";
import type { components } from "../tipos/api.js";

// Tipos generados desde el contrato con `npm run tipos:s03`: si cambia el contrato, el compilador avisa
type Proyecto = components["schemas"]["Proyecto"];
type ProyectoNuevo = components["schemas"]["ProyectoNuevo"];

// Aquí no hay Zod: el validador del contrato ya ha comprobado el cuerpo antes de llegar
export function crearRutasProyectos() {
	const proyectos: Proyecto[] = [{ id: 1, nombre: "Curso de APIs", descripcion: "Material y ejercicios" }];
	const rutas = Router();

	rutas.get("/", (_req, res) => {
		res.json({ items: proyectos });
	});

	rutas.get("/:id", (req, res) => {
		const proyecto = proyectos.find((p) => p.id === Number(req.params.id));
		if (!proyecto) throw new ErrorApi(404, "Proyecto no encontrado", `No hay ningún proyecto con id ${req.params.id}`);
		res.json(proyecto);
	});

	rutas.post("/", (req, res) => {
		const datos = req.body as ProyectoNuevo;
		const proyecto: Proyecto = { id: proyectos.length + 1, ...datos };
		proyectos.push(proyecto);
		res.status(201).location(`/proyectos/${proyecto.id}`).json(proyecto);
	});

	return rutas;
}
```

En `app.ts`: `import { crearRutasProyectos } from "./proyectos/rutas.js";` y, bajo
`// Ejercicio 11`, `app.use("/proyectos", crearRutasProyectos());`.

**Paso 4 · La prueba.** `ejercicios/s03/mis-pruebas/proyectos.test.ts` (e12).

**Comprobar:**

```bash
curl -s -i -X POST localhost:3000/proyectos -H "Content-Type: application/json" \
  -d '{"nombre":"Formación","descripcion":"Cursos del trimestre"}'
curl -s -X POST localhost:3000/proyectos -H "Content-Type: application/json" -d '{"descripcion":"Sin nombre"}'; echo
```

El primero: `HTTP/1.1 201 Created`, `Location: /proyectos/2` y
`{"id":2,"nombre":"Formación","descripcion":"Cursos del trimestre"}`. El segundo: 400 con
`"errors":[{"campo":"nombre","mensaje":"must have required property 'nombre'"}]`, **sin
una línea de validación en `rutas.ts`**: la ha hecho el contrato.

## §14 · Tu turno 4: la revisión, proyectos y sus pruebas (25 min) · e10, e11 y e12

**Para todos:**

1. **e10 (10 min).** La lista del §12 sobre tu contrato de tareas, con la revisión
   cruzada de otra pareja.
2. **e11 (15 min).** Proyectos, contract-first (§13): primero el contrato **revisado**,
   después los tipos, después el código.

**Hecho cuando:**

```bash
# desde ejercicios
npm run comprobar s03 e10      # [ OK ] s03 · e10-agente  (5/5)
npm run comprobar s03 e11      # [ OK ] s03 · e11-proyectos  (7/7)
npm run comprobar s03          # 8 de 8 ejercicios superados · retos: …
```

**Si acabas antes, e12 (reto):** al menos 3 pruebas en `mis-pruebas/proyectos.test.ts`
que detecten un `POST` sin nombre aceptado y un proyecto que no existe con 200.
`npm run comprobar s03 e12`.

## §15 · Guardar tu trabajo en GitHub

**Terminal:**

```bash
# desde la raíz del repositorio
git branch --show-current                  # alumno/<tu-nombre>, no main
git add -A
git commit -m "s03: ejercicios"
git push
```

**Comprobar:** en GitHub, pestaña **Actions**, «Comprobar ejercicios» con tu commit. Su
resumen muestra lo mismo que `npm run comprobar`.

Al terminar: para el codespace (github.com/codespaces → `…` → **Stop codespace**).

**Si te sobra tiempo:** empieza la práctica 3 (`docs/prácticas/practica-03.pdf`): el
contrato de los comentarios, primero, y la API que lo cumple. Apunta tus dudas: mañana
empezamos por ellas.

## Demos de reserva

### R1 · Romper el contrato a propósito y leer qué pasa

Sobre la API con el e05 hecho, cambia una cosa del contrato y repite:

| Cambio en `openapi.yaml` | Qué pasa | Cómo se ve |
|---|---|---|
| Quitar `titulo` de `required` en `TareaNueva` (`required: []`) | El validador deja pasar `{}`, pero Zod lo para detrás | `POST {}`: 400 con `«titulo» es obligatorio`, en español; `comprobar s03 e02`: 6/7 |
| `limite` con `maximum: 50` | El contrato es más estricto que el código | `?limite=80`: 400 `must be <= 50`, aunque Zod admite 100 |
| Quitar el `delete` de `/tareas/{id}` | El validador ya no conoce el verbo | `DELETE /tareas/3`: 405 `DELETE method not allowed`, sin llegar a la ruta |

La lección: hay **dos fuentes de verdad** (el contrato y Zod) y pueden separarse. El lint,
las pruebas contra el contrato y los tipos generados existen para que no pase.

Las tres filas, probadas el 15/11.

### R2 · Todo el día con REST Client

**Fichero:** `ejercicios/s03/tareas.http` (ya está en el repositorio)

1. Arranca la API (`npm run dev:s03`) y abre el fichero.
2. **Send Request** en orden: el contrato, lo que cumple, el parámetro inventado, el
   límite de 500, el id `abc`, el `text/plain`, el campo que sobra, crear, el `PATCH`
   vacío, la ruta que no existe y los proyectos.

**Comprobar:** cada petición da el código de su comentario (probado el 15/11 con la
solución).

### R3 · La API que miente: `validateResponses`

**Fichero:** `ejercicios/s03/src/tareas/rutas.ts`, en `rutas.get("/:id", …)`, cambia la
respuesta por una que no cumple el contrato:

```ts
res.json({ ...servicio.obtener(idDe(req)), completada: "sí" });
```

**Comprobar:** `curl -s -i localhost:3000/tareas/3` da `500 Internal Server Error` con
`"title":"Error interno"`, y en la terminal del servidor:

```
[f1278861-…] La respuesta no cumple el contrato: [
  { path: '/response/completada', message: 'must be boolean', … }
]
```

Mejor un 500 en tu log que un dato equivocado en el cliente. En producción hay quien lo
apaga para no pagar la comprobación en cada respuesta y lo deja en las pruebas. Deshazlo.

### R4 · Probar desde Swagger UI: «Try it out»

1. Abre `/docs` y despliega `POST /tareas`.
2. **Try it out**: el ejemplo del contrato ya viene escrito. **Execute**.
3. Mira la respuesta (201 y `Location`) y el `curl` que Swagger UI ha generado.
4. Bórrale el título al ejemplo y **Execute**: 400 en `problem+json`.

> ⚠️ POR VERIFICAR en un Codespace: la página carga por la URL reenviada
> (`https://…-3000.app.github.dev/docs`) y `helmet` no bloquea sus ficheros; si «Execute»
> llama a `http://localhost:3000` (el `servers` del contrato), elige en el desplegable
> **Servers** la URL del codespace o quita `servers`.

### R5 · El contrato de vuestro mundo

Sin código: el recurso principal de vuestra empresa (el de la R6 de S2) escrito como
contrato. Una operación de lectura y una de escritura, con su esquema, sus `enum`, sus
errores y una `description` que diga cuándo usarla. Pasadle la lista del §12.

### R6 · Anexo de la sesión

Si sobra más de media hora: `docs/sesiones/anexos/s03-anexo-slides.md` y su referencia.
Tres bloques: una guía de estilo con reglas de lint propias, un cliente tipado generado
desde el contrato, y el camino contrario (code-first: el contrato sale de los esquemas
de Zod).

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| `Error: listen EADDRINUSE: address already in use :::3000` | Sigue arrancada otra API (la de `s02`…) | `Ctrl+C` en su terminal, o `PORT=3001 npm run dev:s03` |
| `comprobar s03 e02`: «el contrato tiene errores de estructura» | Sangría mal (tabuladores, o un nivel de más o de menos) | Dos espacios por nivel; compara con el §2. La vista previa de VS Code marca la línea |
| `YAMLParseError: Nested mappings are not allowed… at line N` al arrancar | Un texto con `: ` dentro (`summary: Obtiene: una tarea`), o comillas sin cerrar | Mira la línea N; los textos con `: ` o ` #`, entre comillas |
| Una `description` sale cortada en Swagger UI | Una coma dentro de `{ … }` parte el campo (§6) | El texto entre comillas. `npm run lint:s03` lo encuentra |
| Todo da 500 y el log habla de un `$ref`; el lint dice `no-unresolved-refs  Can't resolve $ref` | Falta `#/` delante, o el nombre no coincide (`tarea` no es `Tarea`) | `"#/components/schemas/Tarea"`, entre comillas |
| `/docs` da 404 | `app.use("/docs", …)` está después de `noEncontrado`, o falta | Antes de las rutas y del 404 (§4) |
| Con el validador, **todo** da 500 «Error interno» | Falta convertir sus errores en `errores.ts` (§5) | El `if (typeof e.status === "number" …)` del §5 |
| Con el validador, `GET /tareas` da 404 «not found» | La ruta no está en el contrato: lo que no declara, no existe | Termina el e02 |
| Con el validador, `GET /tareas?prioridad=alta` da 400 | Falta el parámetro en el contrato | Decláralo en `parameters` de `GET /tareas` |
| `POST /tareas` da 415 | Falta `-H "Content-Type: application/json"` | Añádelo al `curl` |
| Todas las respuestas dan 500 «La respuesta no cumple el contrato» | El esquema de la respuesta no coincide con lo que devuelve la API | Mira la terminal del servidor: dice qué campo (R3) |
| `npm run tipos:s03` no incluye `Proyecto` | El contrato no tiene el esquema, o no lo has guardado | Guarda y vuelve a generar |
| `TS2307: Cannot find module '../tipos/api.js'` | No has generado los tipos | `npm run tipos:s03` |
| `npm run pruebas:s03`: `No test files found` | Escribes el filtro mal o el fichero no acaba en `.test.ts` | `npm run pruebas:s03 -- tareas` |
| e07/e08: «tus pruebas tienen que pasar con la API buena» | Una prueba tuya espera algo que la API no hace | `npm run pruebas:s03` y lee cuál falla |
| e07: «prueba que un POST no válido responde 400» | Tus pruebas solo miran caminos que van bien | Una prueba de `POST` sin título que espere 400 |
| e08: «la versión rota da los mismos códigos…» | Miras códigos, no cuerpos | `cumpleContrato` sobre `GET /tareas/3` |
| e06: `operation-4xx-response` en `/salud` | `/salud` no declara ningún 4xx | Un 429 (`DemasiadasPeticiones`), o apaga la regla y explica por qué |
| `No he podido ejecutar las pruebas` | Faltan dependencias | `cd ejercicios && npm ci` |
| Los retos (e03, e06, e09, e12) en `[FALTA]` | Son opcionales: se cuentan aparte | Hazlos si acabas antes |

## Antes de irte: guarda todo en GitHub

Lo último del día, aunque ya hicieras commit en el cierre: guarda **todo** lo que hayas
tocado después (ejercicios, práctica, demos de reserva o pruebas sueltas).

**Terminal:**

```bash
# desde la raíz del repositorio
git branch --show-current                  # alumno/<tu-nombre>, no main
git add -A                                 # todo lo que has cambiado o creado
git commit -m "s03: fin de la sesión"
git push
git status                                 # nothing to commit, working tree clean
```

**Comprobar:** `git status` dice `nothing to commit, working tree clean` y en GitHub, en
tu rama, está tu último commit. Si `git commit` dice `nothing to commit`, ya lo tenías
todo guardado: no pasa nada.

Después, para el codespace (github.com/codespaces → `…` → **Stop codespace**). No lo
borres.
