# S3 — OpenAPI: el contrato primero y las pruebas · diapositivas

> Fuente de la presentación `presentaciones/s03-presentacion.pptx`.
>
> Patrón: cada idea va seguida de su «En el código» (o «En la terminal»), que remite a la
> referencia rápida (§N). Las diapositivas de base (explican cada palabra desde cero) se
> pueden saltar si el grupo ya la conoce: la lista está en el guion.

@pie OpenAPI: el contrato primero y las pruebas

---

## @portada Curso APIs REST y OpenAPI con Node y TypeScript
### Sesión 3 · OpenAPI: el contrato primero y las pruebas

Lunes 23 de noviembre de 2026

Alejandro Muñoz · Julditec

---

## Primero, vuestras dudas

La **práctica 2**: los comentarios de una tarea, un recurso dentro de otro.

> ¿Qué os ha costado? ¿Qué no ha salido? Escribidlo en el chat.

---

## La práctica 2, en una tabla

| Petición | Código |
|---|---|
| `GET /tareas/3/comentarios` | 200 con `items` y `total` |
| `POST /tareas/3/comentarios` | 201 + `Location: /tareas/3/comentarios/3` |
| `GET /tareas/99/comentarios` | 404: la tarea no existe |
| `GET /tareas/abc/comentarios` | 400: el id no es un número |
| `DELETE /tareas/3/comentarios/1` de otra tarea | 404 |

> El truco: `Router({ mergeParams: true })`, o el id de la tarea no llega.

---

## Tres preguntas de repaso

1. ¿Qué código devuelve `GET /tareas/abc`? ¿Y `GET /tareas/99`?
2. ¿Qué `Content-Type` lleva un error bien contado?
3. Un cliente manda un campo que no existe. ¿Qué hace la API de S2?

> Contesta en el chat. Treinta segundos cada una.

---

## Dónde estamos

@diagrama ruta
S1 · HTTP y primera API > S2 · CRUD, validación y errores > S3 · OpenAPI y pruebas > S4 · Seguridad y agentes de IA

La API ya funciona. Hoy, **la escribimos en un contrato** y demostramos que lo cumple.

---

## Hoy

@diagrama flujo
El contrato -> Publicar y validar -> Pruebas -> Contrato primero!

A las 14:00: una API con su **contrato**, su **documentación**, que **rechaza** lo que no
cumple el contrato, y **pruebas** que lo demuestran.

---

## Hoy empiezas en s03

- `ejercicios/s03` trae la API de S2 **terminada**, aunque no la acabaras
- `npm run comprobar s03`: **ocho ejercicios y cuatro retos**, tres por bloque
- Órdenes nuevas: `lint:s03`, `tipos:s03` y `pruebas:s03`

![FOTO 1] npm run comprobar s03 al empezar: e02 con sus pistas y 0 de 8

Referencia rápida · §0

---

## @seccion El contrato: OpenAPI 3.1

---

## Un contrato es una promesa por escrito

@diagrama comparacion
Sin contrato | «Mira el código» | Cada cliente adivina | Los cambios rompen sin avisar
Con contrato | Un fichero que describe la API entera | Lo leen personas y programas | Si cambia, se ve

> En el restaurante, la carta: qué hay, cómo se pide y qué te traen.

---

## Qué es OpenAPI

Un **formato estándar** para describir una API HTTP, en YAML o JSON.

- Rutas, verbos, parámetros, cuerpos, respuestas y errores
- Lo entienden cientos de herramientas: documentación, validadores, generadores, agentes de IA
- Versión de hoy: **3.1** (compatible con JSON Schema)

> Antes se llamaba Swagger. Swagger hoy es el nombre de las herramientas.

---

## Qué es YAML

Una forma de escribir datos **pensada para leerla**.

| JSON | YAML |
|---|---|
| `{"titulo": "A", "hecha": true}` | `titulo: A` y debajo `hecha: true` |
| Llaves y comas | **La sangría es la estructura** |
| Comillas siempre | Comillas solo si hace falta |

> Dos espacios por nivel, nunca tabuladores.

---

## Las partes de un contrato

@diagrama capas
info | Qué API es: nombre, versión, descripción
paths* | Cada ruta, y dentro, sus verbos: parámetros, cuerpo, respuestas
components | Lo que se escribe una vez: esquemas, parámetros, respuestas

Una **operación** es un verbo dentro de una ruta: `get` en `/platos/{id}`.

---

## Una operación, por dentro

@diagrama abanico
GET /platos/{id}:
operationId (su nombre único)
parameters (el id, en la ruta)
responses (200 y 404)
description (cuándo usarla)

`responses` va **por código**: lo que pasa si va bien y lo que pasa si no.

---

## $ref: escríbelo una vez

`schema: { $ref: "#/components/schemas/Plato" }`

1. `#` es «este mismo fichero»
2. `/components/schemas/Plato` es el camino hasta la definición
3. Se usa en el 200 de un plato, en la lista de platos, en el pedido…

> Cambias el plato en un sitio y cambia en todos.

---

## Leer un esquema

`PedidoNuevo: required [mesa, platos] · additionalProperties: false`

1. `type: object`: un objeto con campos
2. `required`: los que **tienen** que venir
3. `mesa: { type: integer, minimum: 1, maximum: 30 }`: un número entero, de 1 a 30
4. `additionalProperties: false`: un campo que no está en la lista es un error

> Es la misma idea que el esquema de Zod de S2, escrita en el contrato.

---

## En el código: leer la carta

1. Abre `ejercicios/s03/carta.yaml`
2. La vista previa de la extensión OpenAPI: la carta como documentación
3. Busca `paths`, `components` y un `$ref`
4. ¿Qué pasa si pides un plato que no existe?

Referencia rápida · §1

---

## Contract-first o code-first

@diagrama comparacion
Contract-first | Primero el contrato, se revisa | Cliente y servidor programan a la vez | Lo de hoy
Code-first | Primero el código | El contrato se genera de él | Rápido, pero el diseño llega tarde

> Las dos funcionan. Lo que no funciona es no tener contrato.

---

## Por qué el contrato primero

- Se **revisa el diseño** antes de escribir una línea: cambiarlo cuesta minutos
- El equipo de la app empieza **sin esperar** al servidor
- Las pruebas, los tipos y la documentación **salen del contrato**
- En S4, un agente de IA lo leerá para saber qué llamar

---

## En el código: GET /tareas/{id} y Tarea

1. En `openapi.yaml`, bajo `paths`: `/tareas/{id}` con su `get`
2. El parámetro `id`: `in: path`, entero desde 1
3. En `components.schemas`: `Prioridad` (un `enum`) y `Tarea`
4. `npm run comprobar s03 e02`: 3 de 7

Referencia rápida · §2

---

## Tu turno 1: leer y escribir un contrato

1. **e01 (10 min):** lee `carta.yaml` y contesta en `respuestas/contrato.ts`
2. **e02 (15 min):** las cinco operaciones que faltan y sus esquemas

> **Lo tienes si** `npm run comprobar s03 e01` y `e02` dan `[ OK ]`.

**Si acabas antes, e03:** parámetros y errores con `$ref`, y la cabecera `Link`. Referencia rápida · §3

---

## TareaNueva no es Tarea

| Esquema | Para qué | Lleva `id` | Obligatorios |
|---|---|---|---|
| `Tarea` | Lo que **devuelve** la API | Sí | Los cuatro |
| `TareaNueva` | El cuerpo de `POST` y `PUT` | No | `titulo` |
| `CambiosTarea` | El cuerpo de `PATCH` | No | Ninguno, pero al menos uno |

> `additionalProperties: false`: lo que no está en la lista, no entra.

---

## @seccion Publicar el contrato y cumplirlo

---

## Un contrato, tres usos

@diagrama abanico
openapi.yaml:
Swagger UI (documentación para personas)
/openapi.json (para programas y agentes)
Validador (la API lo cumple)

Hoy montamos los tres. Y una cuarta: **los tipos** de TypeScript.

---

## En el código: /openapi.json y /docs

1. Leer `openapi.yaml` con `readFileSync` y `parse`
2. `app.get("/openapi.json", …)`: el contrato, en JSON
3. `app.use("/docs", swaggerUi.serve, swaggerUi.setup(contrato))`
4. Abre `/docs` en el navegador

![FOTO 2] Swagger UI en /docs: la API de tareas, sacada del contrato

Referencia rápida · §4

---

## Qué es Swagger UI

Una página web que **pinta el contrato**: cada operación, sus parámetros, sus respuestas.

- No se escribe: sale sola de `openapi.yaml`
- Con **Try it out** se prueba la API desde el navegador
- Si el contrato cambia, la documentación cambia

> La documentación que no se mantiene a mano no se queda vieja.

---

## Validar contra el contrato

@diagrama flujo
Petición -> Validador del contrato -> Rutas (Zod) -> Respuesta -> Validador de respuestas!

- Lo que el contrato **no declara**, no existe: 404 o 400
- Lo que **no cumple**: 400 antes de llegar a tus rutas
- Lo que la API **contesta**, también se comprueba

---

## En el código: el validador

1. `OpenApiValidator.middleware({ apiSpec, validateRequests, validateResponses })`
2. Después de `/docs`, **antes** de las rutas
3. `curl "localhost:3000/tareas?inventado=1"`
4. ¿Qué código sale?

Referencia rápida · §5

---

## El validador funciona; el error, no

![FOTO 3] curl con un parámetro inventado: 500 «Error interno», y en el log, status 400

El validador ha dicho **400**. Nuestro manejador no lo conoce: lo trata como inesperado.

> Lo mismo que el ZodError de S2: un error nuevo, un caso nuevo en el manejador.

---

## Convertir sus errores en problem+json

| El validador trae | Lo convertimos en |
|---|---|
| `status: 400`, `415`, `404`, `405` | El mismo código |
| `errors: [{ path, message }]` | `errors: [{ campo, mensaje }]` |
| `path: "/query/inventado"` | `campo: "inventado"` |

Referencia rápida · §5

---

## Así se ve cuando está bien

![FOTO 5] Cuatro peticiones que no cumplen el contrato: 400, 400, 415 y 400 en problem+json

Ni una línea nueva en las rutas: **lo dice el contrato**.

---

## El bug del día: todo en verde y está mal

1. Una descripción con una coma: `description: Tareas que cumplen los filtros, en todas las páginas`
2. `comprobar e02` y `e05`: **en verde**
3. Swagger UI enseña la descripción **cortada**
4. ¿Qué ha pasado?

Referencia rápida · §6

---

## El lint lo encuentra

![FOTO 4] comprobar e02 y e05 en verde; npm run lint:s03 encuentra la propiedad que sobra

Dentro de `{ … }`, la coma **separa campos**. Arreglo: el texto entre comillas.

---

## Qué es un lint

Un revisor que **lee el contrato sin ejecutarlo** y aplica reglas.

| Regla | Qué pide |
|---|---|
| `struct` | Que la estructura sea la de OpenAPI |
| `operation-4xx-response` | Que cada operación declare algún error |
| `no-unused-components` | Nada definido que no se use |
| `rule/…` | **Las tuyas**: la guía de estilo de tu equipo |

> La ortografía del contrato, antes de que lo lea nadie.

---

## Tipos desde el contrato

@diagrama flujo
openapi.yaml -> npm run tipos:s03 -> src/tipos/api.d.ts -> tu código!

`type Tarea = components["schemas"]["Tarea"]`

Si el contrato quita un campo que el código usa, **el compilador avisa**.

Referencia rápida · §7

---

## Un tipo generado, sin tecnicismos

Imagina que la carta cambia y el plato ya no lleva `precio`.

- Sin tipos: el código sigue usando `plato.precio` y falla **en producción**
- Con tipos generados: `npm run typecheck` marca **cada línea** que lo usa
- Se generan con una orden; **nunca se escriben a mano**

> El compilador lee la carta por ti.

---

## Tu turno 2: publicar y cumplir

1. **e04:** `/openapi.json` y Swagger UI en `/docs`
2. **e05:** el validador, y sus errores en `problem+json`

> **Lo tienes si** `npm run comprobar s03 e04` y `e05` dan `[ OK ]`.

**Si acabas antes, e06:** `npm run lint:s03` limpio y una regla tuya. Referencia rápida · §8

---

## Rompe el contrato a propósito

| Cambio | Qué pasa |
|---|---|
| Quitar `titulo` de `required` | Zod lo para detrás; el contrato **miente** |
| `limite` con `maximum: 50` | `?limite=80` da 400, aunque el código admite 100 |
| Quitar el `delete` | `DELETE /tareas/3`: 405 sin llegar a la ruta |

> Dos fuentes de verdad pueden separarse. Por eso, lint, pruebas y tipos.

---

## @seccion Pruebas que demuestran el contrato

---

## Qué es una prueba automática

Un programa que **usa tu API y comprueba** lo que contesta. Se pasa en un segundo, mil veces.

- Hoy ya las usáis: son las de `comprobar`
- Hoy **escribís las vuestras**
- Una prueba que nunca falla **no prueba nada**

> Como el control de calidad de la cocina: probar el plato antes de servirlo.

---

## Vitest y Supertest

@diagrama capas
it("…") | La frase: «GET /tareas/999 responde 404»
request(app).get(…)* | Supertest llama a la API en memoria, sin puerto
expect(…).toBe(404) | Vitest compara y, si no coincide, falla

Cada prueba, una API nueva con los datos de partida.

---

## Una prueba, en tres pasos

| Paso | En la prueba | En la cocina |
|---|---|---|
| Preparar | `crearApp()`: una API nueva, con sus doce tareas | La mesa limpia |
| Llamar | `request(app).post("/tareas").send({})` | Pedir el plato |
| Comprobar | `expect(res.status).toBe(400)` | Mirar que es el que pediste |

> Cada prueba empieza de cero: no depende de lo que hicieron las demás.

---

## En el código: tus primeras pruebas

1. `mis-pruebas/tareas.test.ts`: un `POST` sin título → 400
2. `GET /tareas/999` → 404
3. `npm run pruebas:s03 -- tareas`: **3 de 3**
4. Rompe la API a propósito: ¿falla la del 404?

Referencia rápida · §9

---

## ¿Tus pruebas detectan una API rota?

| Versión rota | Qué hace mal |
|---|---|
| `sin-validacion` | Acepta un `POST` sin título |
| `404-como-200` | Responde 200 a lo que no existe |
| `respuesta-rota` | Códigos buenos, **cuerpos que no cumplen el esquema** |

> `comprobar` pasa tus pruebas contra ellas. Si siguen en verde, no prueban lo importante.

---

## Pruebas contra el contrato

`expect(cumpleContrato(res)).toEqual([])`

1. Busca en el contrato la operación y el código de la respuesta
2. Comprueba el `Content-Type` y el **cuerpo entero** contra su esquema
3. Devuelve la lista de fallos: `[]` es «la cumple»

Referencia rápida · §10

---

## En el código: cuando no la cumple

![FOTO 6] Las pruebas de contrato contra la versión rota: qué campo falta y qué valor no vale

El fallo dice **qué campo** y **por qué**. Con un `toBe(200)` no se habría visto.

---

## Cada prueba mira una cosa

| Prueba | Comprueba | Se le escapa |
|---|---|---|
| `toBe(200)` | El código | La forma del cuerpo |
| `body.titulo` | Un campo | El resto |
| `cumpleContrato(res)` | Código, tipo y cuerpo | Que el valor sea el correcto |

> Hacen falta las dos: las de contrato y las de comportamiento.

---

## Tu turno 3: tus pruebas

1. **e07:** 5 pruebas en `tareas.test.ts`, con un 400 y un 404
2. **e08:** 3 pruebas con `cumpleContrato` en `contrato.test.ts`

> **Lo tienes si** `npm run comprobar s03 e07` y `e08` dan `[ OK ]`.

**Si acabas antes, e09:** las seis operaciones, cada una con un caso bueno y uno de error. Referencia rápida · §11

---

## @seccion El contrato primero, y para agentes de IA

---

## Un lector nuevo: el agente de IA

Un asistente que **llama a APIs por su cuenta**: lee el contrato y decide qué llamar.

- No lee tu código ni te pregunta
- Si dos operaciones se parecen, elige por la `description`
- Si se equivoca, lee el error para corregirse

> Lo que le sirve a él, le sirve a la persona nueva del equipo.

---

## Lo que ve un agente

![FOTO 7] Swagger UI con GET /tareas desplegada: la descripción, y cada parámetro con la suya y sus valores

Todo lo que sabe de tu API está **aquí**. Nada más.

---

## La lista: ¿lo entendería un agente?

1. `operationId` con verbo: `listarTareas`, no `op2`
2. `description` que dice **cuándo** usarla
3. Cada parámetro y cada campo, con `description`
4. Valores cerrados en `enum`, no texto libre
5. Un `example` en cada cuerpo
6. Errores que dicen **cómo corregir**

Referencia rápida · §12

---

## Una description buena y una mala

@diagrama comparacion
Mala | «Tareas» | «Actualiza» | El agente adivina
Buena | «Úsala para marcar una tarea como completada» | «Cambia solo los campos que se mandan» | El agente elige bien

> Escribe para alguien que no puede preguntarte.

---

## Revisión cruzada

1. Pásale tu contrato a otra pareja
2. Ella lo revisa con la lista: **tres cosas** que un agente no entendería
3. Tú arreglas las tuyas
4. `npm run comprobar s03 e10`

> No hace falta red entre equipos: basta compartir pantalla.

---

## Un recurso nuevo, en cuatro pasos

@diagrama flujo
Contrato -> Revisión -> Tipos -> Código -> Prueba!

Con proyectos: `GET` y `POST /proyectos`, `GET /proyectos/{id}`.

Referencia rápida · §13

---

## En el código: proyectos, contract-first

1. El contrato: tres operaciones y `Proyecto`, con sus `description`
2. `npm run tipos:s03`
3. `src/proyectos/rutas.ts` con esos tipos, **sin Zod**
4. `POST` sin nombre: 400, sin una línea de validación

Referencia rápida · §13

---

## Tu turno 4: revisión y proyectos

1. **e10 (10 min):** la lista sobre tu contrato, con la revisión cruzada
2. **e11 (15 min):** proyectos, del contrato al código

> **Lo tienes si** `npm run comprobar s03` da **8 de 8**.

**Si acabas antes, e12:** las pruebas de proyectos. Referencia rápida · §14

---

## Así se ve cuando está bien

![FOTO 8] npm run comprobar s03 con todo hecho: 8 de 8 ejercicios y 4 de 4 retos

`npm run comprobar s03` → **8 de 8 ejercicios superados**, y los retos aparte.

---

## @seccion Cierre

---

## Lo que hemos hecho hoy

@diagrama flujo
Contrato OpenAPI -> Swagger UI y validador -> Lint y tipos -> Pruebas -> Contrato primero!

Una API que **dice lo que hace**, **hace lo que dice** y **lo demuestra**.

---

## La lista de hoy

- El contrato en `openapi.yaml`: `paths`, `components` y `$ref`
- Publicado: `/docs` para personas, `/openapi.json` para programas
- Lo que no lo cumple, no entra; y las respuestas, también se miran
- El lint encuentra lo que las pruebas no ven
- Pruebas propias, que fallan si la API se rompe, y contra el contrato
- Descripciones para alguien que no puede preguntarte

---

## Cuestionario

Diez preguntas, en el chat o en `docs/cuestionarios/cuestionario-sesion-03.pdf`.

> Treinta segundos por pregunta. Contesta con la letra.

---

## Guarda tu trabajo

1. `git add -A`
2. `git commit -m "s03: ejercicios"`
3. `git push`
4. Para el codespace: **Stop**, no lo borres

Referencia rápida · §15

---

## Si te sobra tiempo: la práctica 3

`docs/prácticas/practica-03.pdf` · una hora

Los comentarios de la práctica 2, **contract-first**: primero el contrato, revisado
con la lista; después los tipos, el código y las pruebas.

> Lo que no termines, en casa. **Mañana empezamos con vuestras dudas**.

---

## Mañana, en S4

@diagrama rejilla
JWT* | Quién eres, en un token firmado
OAuth 2 | Dar acceso sin dar la contraseña
Buenas prácticas | ETag, idempotencia, versionado
Agentes de IA | Un servidor MCP sobre nuestra API

Empezamos con **las dudas de la práctica 3**, en `ejercicios/s04`.

---

## @fin Gracias

¿Dudas?

---

## @seccion Reserva

---

## La API que miente

1. En `GET /tareas/:id`, devuelve `completada: "sí"`
2. `curl localhost:3000/tareas/3`: **500**
3. En el log: `/response/completada must be boolean`

> Mejor un 500 en tu log que un dato equivocado en el cliente.

Referencia rápida · R3

---

## Probar desde Swagger UI

1. `/docs` → `POST /tareas` → **Try it out**
2. El ejemplo del contrato ya viene escrito: **Execute**
3. 201 y `Location`, y el `curl` equivalente
4. Sin título: 400 en `problem+json`

Referencia rápida · R4

---

## El contrato de vuestro mundo

Sin código: el recurso principal de vuestra empresa, como contrato.

- Una operación de lectura y una de escritura
- Su esquema, sus `enum` y sus errores
- Una `description` que diga **cuándo** usarla

Referencia rápida · R5

---

## El anexo de hoy

@diagrama rejilla
A · La guía de estilo* | Reglas de lint propias para todo el equipo
B · Un cliente tipado | El otro lado del contrato: quien llama
C · Code-first | El contrato que sale de los esquemas de Zod

`docs/sesiones/anexos/s03-anexo-slides.md` · Referencia rápida · R6
