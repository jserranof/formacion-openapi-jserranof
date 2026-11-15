# S3 · Anexo · Referencia rápida — El contrato, más allá de la API

> Material de ampliación de S3. Parte de `ejercicios/s03` con los ejercicios hechos (al
> menos e02, e04 y e05; para el bloque A, también e06 y e10). El código está en `docs/ejemplos/anexo-s03/`: se copia a `ejercicios/s03` y se quita al
> final (§0).
>
> Tres bloques independientes: **A** (la guía de estilo como reglas de lint), **B** (un
> cliente tipado con el contrato) y **C** (code-first: el contrato que sale de Zod).

| § | Dónde | Qué |
|---|---|---|
| 0 | Terminal | Antes y después: guardar tu trabajo y dejarlo como estaba |
| A1 | Chat | Una guía de estilo que se comprueba sola |
| A2 | `ejercicios/s03/estilo.yaml` | Cinco reglas propias |
| A3 | Terminal | Pasarla a un contrato malo y al tuyo |
| A4 | `.github/workflows` | En cada `push` |
| B1 | Chat | El otro lado del contrato: quien llama |
| B2 | `ejercicios/s03/src/cliente.ts` | El cliente, con `openapi-fetch` |
| B3 | Terminal | Probarlo, y la trampa del `default` |
| C1 | Chat | Code-first, con lo que ya tenemos |
| C2 | `ejercicios/s03/src/code-first.ts` | El esquema que sale de Zod, comparado con el contrato |
| C3 | `ejercicios/s03/openapi.yaml` | Arreglar la diferencia |

## §0 · Antes y después

**Antes de empezar**, guarda tus ejercicios:

```bash
# desde la raíz del repositorio
git add -A && git commit -m "s03: ejercicios" && git push
```

Y copia el código del anexo:

```bash
# desde la raíz del repositorio
cp docs/ejemplos/anexo-s03/estilo.yaml docs/ejemplos/anexo-s03/lint-estilo.ts docs/ejemplos/anexo-s03/contrato-malo.yaml ejercicios/s03/
cp docs/ejemplos/anexo-s03/cliente.ts docs/ejemplos/anexo-s03/code-first.ts ejercicios/s03/src/
```

**Al terminar**, deja `s03` como estaba (solo toca lo del anexo):

```bash
# desde la raíz del repositorio
rm -f ejercicios/s03/estilo.yaml ejercicios/s03/lint-estilo.ts ejercicios/s03/contrato-malo.yaml
rm -f ejercicios/s03/src/cliente.ts ejercicios/s03/src/code-first.ts
git restore ejercicios/s03/openapi.yaml
cd ejercicios && npm run tipos:s03
```

**Comprobar:** `git status` no lista nada nuevo bajo `ejercicios/s03` y
`npm run comprobar s03` da lo mismo que antes del anexo.

---

# A · La guía de estilo, como reglas de lint

## §A1 · Una guía de estilo que se comprueba sola

Muchas empresas tienen una guía de estilo de APIs (la de Zalando es la más conocida):
«rutas en plural y minúsculas», «errores en problem+json»… Escrita en un PDF, cada
revisor la recuerda a su manera. Escrita como reglas de lint, se comprueba sola en cada
cambio, y la revisión humana se dedica a lo que una regla no ve: si el diseño tiene
sentido.

## §A2 · Cinco reglas propias

**Fichero:** `ejercicios/s03/estilo.yaml` (copiado en el §0). Las cinco reglas:

| Regla | Qué exige | Cómo |
|---|---|---|
| `rule/operationid-con-verbo` | `listarTareas`, no `notasGet` | `pattern` sobre `Operation.operationId` |
| `rule/description-que-explique` | Una `description` de 30 caracteres o más | `defined` y `minLength` sobre `Operation.description` |
| `rule/rutas-en-minusculas` | `/tareas/{id}`, no `/Notas/{id}` ni `/getNotas` | `pattern` sobre las claves de `Paths` |
| `rule/errores-con-cuerpo` y `rule/errores-problem-json` | Cada 4xx y 5xx con cuerpo en `application/problem+json` | `filterInParentKeys` con los códigos, y `where` |
| `rule/cuerpo-con-ejemplo` | Un `example` en cada cuerpo de petición (aviso) | `where` con `RequestBody` |

Una de ellas, entera:

```yaml
  rule/rutas-en-minusculas:
    subject:
      type: Paths
    assertions:
      pattern: /^(\/([a-z]+|\{[a-zA-Z]+\}))+$/
    message: Las rutas van en minúsculas, con el recurso en plural y los parámetros entre llaves
    severity: error
```

1. `subject`: a qué parte del contrato se aplica. Sin `property`, a las claves (aquí, las
   rutas).
2. `assertions`: qué tiene que cumplir (`pattern`, `defined`, `minLength`, `required`…).
3. `severity`: `error` para el CI; `warn` para lo que se recomienda.

## §A3 · Pasarla a un contrato malo y al tuyo

**Terminal:**

```bash
# desde ejercicios
npx tsx s03/lint-estilo.ts s03/contrato-malo.yaml
npx tsx s03/lint-estilo.ts s03/openapi.yaml
```

**Comprobar:** el contrato malo da `9 errores y 1 avisos`: las dos rutas, los dos
`operationId`, las dos `description`, el 400 en `application/json`, el 404 sin cuerpo y
la falta de `servers` (esta, de las recomendadas); el aviso, el `PUT` sin ejemplo. El
tuyo, si tienes hechos el e06 y el e10, dice `s03/openapi.yaml cumple la guía de estilo.`

```
  7:3    error    rule/rutas-en-minusculas       Las rutas van en minúsculas, con el recurso en plural…
  9:20   error    rule/operationid-con-verbo     El operationId empieza por un verbo en infinitivo…
  19:11  error    rule/errores-problem-json      Los errores se describen con application/problem+json
  39:16  error    rule/errores-con-cuerpo        Cada error lleva un cuerpo que diga qué ha pasado…
```

## §A4 · En cada `push`

**Fichero:** `.github/workflows/comprobar.yml`, un paso más, después de instalar:

```yaml
      - name: Lint del contrato
        run: npm run lint:s03
        working-directory: ejercicios
```

`lint.ts` termina con código 1 si hay errores: el paso se pone en rojo y el cambio no
pasa la revisión.

> ⚠️ POR VERIFICAR: no está probado en GitHub Actions. Si lo pruebas, mira que el nombre
> del trabajo y la carpeta coinciden con los de `comprobar.yml`. Para la guía de estilo
> del anexo, el paso sería `npx tsx s03/lint-estilo.ts s03/openapi.yaml`.

---

# B · Un cliente tipado con el contrato

## §B1 · El otro lado del contrato: quien llama

Hasta ahora, el contrato ha servido al **servidor**: documentarlo, validarlo, tiparlo. Pero
el contrato es de los dos lados. Con los mismos tipos generados, quien **llama** a la API
sabe qué rutas hay, qué mandar y qué le van a contestar, y el compilador le avisa si se
equivoca. Es lo que hace el equipo de la app móvil del caso de contract-first.

## §B2 · El cliente, con `openapi-fetch`

**Fichero:** `ejercicios/s03/src/cliente.ts` (copiado en el §0)

```ts
import createClient from "openapi-fetch";
import type { paths } from "./tipos/api.js";

// paths sale de «npm run tipos:s03»: el cliente sabe qué rutas, parámetros y respuestas hay
const api = createClient<paths>({ baseUrl: process.env.API ?? "http://localhost:3000" });

// 1. Listar: la consulta y la respuesta, comprobadas por TypeScript
const { data: pagina } = await api.GET("/tareas", { params: { query: { prioridad: "alta", limite: 3 } } });
console.log("Prioridad alta:", pagina?.items.map((t) => t.titulo));

// 2. Crear: el cuerpo tiene que ser una TareaNueva
const { data: creada, response } = await api.POST("/tareas", { body: { titulo: "Desde el cliente tipado", prioridad: "baja" } });
console.log("Creada:", response.status, response.headers.get("location"), creada);

// 3. Un error: data viene vacío y error trae el problem+json
const { data: ninguna, error } = await api.GET("/tareas/{id}", { params: { path: { id: 999 } } });
console.log("La 999:", ninguna, error?.title, error?.status);
```

1. `createClient<paths>`: un cliente que conoce el contrato entero. `openapi-fetch` (de los
   autores de `openapi-typescript`) ocupa unos pocos kilobytes y usa el `fetch` de Node.
2. Escribe `api.GET("/` y el editor te ofrece las rutas del contrato. Prueba
   `prioridad: "urgente"`: el editor lo marca en rojo.
3. Cada llamada devuelve `data` (si ha ido bien) o `error` (el `problem+json`), nunca los
   dos.

## §B3 · Probarlo, y la trampa del `default`

**Terminal:**

```bash
# desde ejercicios, con npm run dev:s03 arrancado en otra terminal
npm run tipos:s03 && npm run typecheck
```

**Comprobar:** el `typecheck` **falla**:

```
s03/src/cliente.ts(15,64): error TS2322: Type '{ titulo: string; prioridad: "baja"; }' is not assignable to type
'{ titulo: string; completada: boolean; prioridad?: … }'.
  Property 'completada' is missing in type '{ titulo: string; prioridad: "baja"; }' but required …
```

`openapi-typescript` trata un campo con `default` como **siempre presente**: verdad en una
respuesta (el servidor lo rellena), falso en una petición (el cliente lo puede omitir).
`TareaNueva.completada` tiene `default: false`, así que el tipo la pide. Se genera sin esa
regla:

```bash
# desde ejercicios
npx openapi-typescript s03/openapi.yaml -o s03/src/tipos/api.d.ts --default-non-nullable false
npm run typecheck && npx tsx s03/src/cliente.ts
```

**Comprobar:**

```
Prioridad alta: [ 'Instalar Node', 'Arrancar la API', 'Diseñar las rutas' ]
Creada: 201 /tareas/13 { id: 13, titulo: 'Desde el cliente tipado', completada: false, prioridad: 'baja' }
La 999: undefined Tarea no encontrada 404
```

La lección: los tipos generados son tan buenos como el generador entiende el contrato.
Mira siempre cómo trata `default`, `nullable` y `readOnly` la herramienta que uses.

---

# C · Code-first, con lo que ya tenemos

## §C1 · Code-first, con lo que ya tenemos

En la sesión hicimos contract-first. El camino contrario: el código manda y el contrato
sale de él. No hace falta otra librería: desde Zod 4, `z.toJSONSchema()` convierte un
esquema de Zod en JSON Schema, que es lo que usa OpenAPI 3.1 para sus esquemas. Librerías
como `@asteasolutions/zod-to-openapi` generan el contrato entero (rutas incluidas) a partir
de ahí.

## §C2 · El esquema que sale de Zod, comparado con el contrato

**Fichero:** `ejercicios/s03/src/code-first.ts` (copiado en el §0). Lo esencial:

```ts
import { z } from "zod";
import { CambiosTarea, TareaNueva } from "./tareas/esquemas.js";

// io: "input": lo que el cliente puede mandar (con los valores por defecto, opcional)
const generado = z.toJSONSchema(TareaNueva, { io: "input" });
```

El resto del fichero lee `openapi.yaml` y compara, campo a campo, los obligatorios, los
campos de más, el tipo, las longitudes, el `enum` y el `default`.

**Terminal:**

```bash
# desde ejercicios
npx tsx s03/src/code-first.ts
```

**Comprobar:**

```
TareaNueva, generado desde Zod:
{"titulo":{"type":"string","minLength":1,"maxLength":120},"completada":{"default":false,"type":"boolean"},"prioridad":{"default":"media","type":"string","enum":["baja","media","alta"]}}
  obligatorios   Zod: ["titulo"]   contrato: ["titulo"]
  campos de más  Zod: false   contrato: false
  prioridad: distinto en default (Zod "media", contrato undefined)
CambiosTarea, generado desde Zod:
…
```

**Una diferencia de verdad**: el código pone `prioridad: "media"` si no llega, y el
contrato no lo dice (solo lo cuenta en la `description` del `POST`). Lo que Zod no puede
pasar al contrato: el `trim()` del título (un título de tres espacios cumple
`minLength: 1`) y los mensajes en español.

## §C3 · Arreglar la diferencia

**Fichero:** `ejercicios/s03/openapi.yaml`, en `TareaNueva`, la prioridad con su valor por
defecto (en OpenAPI 3.1 se puede poner al lado de un `$ref`):

```yaml
        prioridad: { $ref: "#/components/schemas/Prioridad", default: media }
```

**Comprobar:** `npx tsx s03/src/code-first.ts` ya no da ninguna línea «distinto», y
`npm run lint:s03` y `npm run comprobar s03 e02` siguen en verde.

| | Contract-first | Code-first |
|---|---|---|
| La fuente de verdad | `openapi.yaml` | El código (Zod) |
| Lo que se revisa antes de programar | El contrato | Nada: el diseño llega con el código |
| Lo que se puede separar | El código del contrato (lo vigilan validador, pruebas y tipos) | El contrato de lo que el código no sabe decir (`trim`, mensajes, reglas de negocio) |
| Cuándo encaja | APIs públicas, varios equipos, agentes de IA | Un solo equipo, API interna que cambia cada día |

---

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| `Error: Transform failed with 2 errors` (o `Cannot find package …`) | Ejecutas el fichero desde `docs/ejemplos/anexo-s03`, fuera del proyecto de `ejercicios` | Cópialo a `ejercicios/s03` (§0) y ejecútalo desde `ejercicios` |
| `Error parsing config file at '…/estilo.yaml': ENOENT` | `lint-estilo.ts` busca `estilo.yaml` a su lado | Copia los dos a `ejercicios/s03/` |
| Una regla propia no salta | El `subject` no es el nivel donde está el dato | Mira la tabla del §A2; para los códigos de respuesta, `filterInParentKeys` en `Response` |
| `TS2307: Cannot find module './tipos/api.js'` | No has generado los tipos | `npm run tipos:s03` |
| `TS2322 … Property 'completada' is missing` | La trampa del `default` (§B3) | `--default-non-nullable false` al generar |
| `cliente.ts`: `TypeError: fetch failed` | La API no está arrancada | `npm run dev:s03` en otra terminal |
| `z.toJSONSchema is not a function` | Zod 3 | El curso usa Zod 4 (`npm ls zod` en `ejercicios`) |
| `comprobar s03` cambia después del anexo | Se ha quedado el `default` del §C3 o los tipos regenerados | `git restore ejercicios/s03/openapi.yaml` y `npm run tipos:s03` (§0) |
