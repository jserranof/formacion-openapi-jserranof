# S3 · Anexo — El contrato, más allá de la API · diapositivas

Fuente de la presentación `presentaciones/s03-anexo-presentacion.pptx`.

> Material de ampliación de S3, para usar si sobra tiempo. Tres bloques independientes:
> se pueden dar en cualquier orden. Los valores exactos, en
> `s03-anexo-referencia-rapida.md` (§A1–§C3). El código, en `docs/ejemplos/anexo-s03/`.

@pie Anexo S3 · El contrato, más allá de la API

---

## @portada Curso APIs REST y OpenAPI con Node y TypeScript
### Sesión 3 · Anexo: el contrato, más allá de la API

Lunes 23 de noviembre de 2026

Alejandro Muñoz · Julditec

---

## Nos sobra tiempo: tres extras

@diagrama rejilla
A · La guía de estilo* | Reglas de lint propias para todo el equipo
B · Un cliente tipado | El otro lado del contrato: quien llama
C · Code-first | El contrato que sale de los esquemas de Zod

Lo que montamos lo quitamos al final: la S4 empieza en `ejercicios/s04`, como estaba.

---

## @seccion A · La guía de estilo, como reglas de lint

---

## Una guía que se comprueba sola

@diagrama comparacion
En un PDF | Cada revisor la recuerda a su manera | Se discute en cada revisión
Como reglas de lint | Se comprueba en cada cambio | La revisión humana, para el diseño

> La de Zalando es la guía de estilo de APIs más conocida: empieza por ahí.

---

## Cinco reglas propias

| Regla | Exige |
|---|---|
| `operationid-con-verbo` | `listarTareas`, no `notasGet` |
| `description-que-explique` | Una `description` que diga cuándo usarla |
| `rutas-en-minusculas` | `/tareas/{id}`, no `/Notas/{id}` |
| `errores-problem-json` | Cada error, con cuerpo en problem+json |
| `cuerpo-con-ejemplo` | Un `example` en cada cuerpo (aviso) |

Referencia rápida · §A2

---

## Cómo se escribe una regla

@diagrama capas
subject* | A qué parte del contrato: Operation, Paths, Response…
property | Qué campo: operationId, description… (sin él, las claves)
assertions | Qué cumple: pattern, defined, minLength, required
severity | error para parar el cambio; warn para recomendar

---

## En la terminal: un contrato malo

1. Copia `estilo.yaml`, `lint-estilo.ts` y `contrato-malo.yaml` a `ejercicios/s03`
2. `npx tsx s03/lint-estilo.ts s03/contrato-malo.yaml`: **9 errores y 1 aviso**
3. El mismo, con tu `openapi.yaml`: cumple la guía
4. En el CI: un paso más que lo pasa en cada `push`

![FOTO 1] La guía de estilo sobre el contrato malo: rutas, operationId, descriptions y errores

Referencia rápida · §A3

---

## @seccion B · Un cliente tipado con el contrato

---

## El otro lado del contrato

@diagrama abanico
openapi.yaml:
El servidor (validador y tipos)
Quien llama (un cliente tipado)
Las personas (Swagger UI)

El equipo de la app móvil usa **los mismos tipos**: el compilador le avisa si se equivoca.

---

## En el código: el cliente

1. `createClient<paths>({ baseUrl })`: un cliente que conoce el contrato
2. `api.GET("/tareas", { params: { query: … } })`: rutas y parámetros, autocompletados
3. `api.POST("/tareas", { body: … })`: el cuerpo, una `TareaNueva`
4. Cada llamada devuelve `data` o `error` (el problem+json)

Referencia rápida · §B2

---

## La trampa del default

![FOTO 2] typecheck: el tipo pide completada; generado sin esa regla, el cliente funciona

`default: false` → el generador cree que **siempre viene**. Verdad en la respuesta; falso en la petición.

Referencia rápida · §B3

---

## Lo que enseña el cliente

- Los tipos generados son tan buenos como el generador **entiende** el contrato
- Mira cómo trata `default`, `nullable` y `readOnly` tu herramienta
- Con el contrato bien escrito, el cliente no tiene que adivinar nada

---

## @seccion C · Code-first, con lo que ya tenemos

---

## El camino contrario

@diagrama flujo
Esquema de Zod -> z.toJSONSchema() -> JSON Schema -> components del contrato!

Desde Zod 4, sin librerías: OpenAPI 3.1 usa JSON Schema para sus esquemas.

---

## En la terminal: Zod frente al contrato

![FOTO 3] El esquema que sale de Zod, comparado con el contrato: la prioridad por defecto no está

El código pone `"media"` si no llega la prioridad; **el contrato no lo dice**.

Referencia rápida · §C2

---

## Arreglarlo, y lo que no se puede

`prioridad: { $ref: "#/components/schemas/Prioridad", default: media }`

- En 3.1, un `$ref` admite campos a su lado
- Lo que Zod no puede pasar al contrato: el `trim()` y los mensajes en español
- Un título de tres espacios cumple `minLength: 1`

Referencia rápida · §C3

---

## Contract-first o code-first, otra vez

| | Contract-first | Code-first |
|---|---|---|
| Fuente de verdad | `openapi.yaml` | El código |
| Se revisa antes de programar | Sí | No |
| Encaja con | APIs públicas, varios equipos, agentes | Un equipo, API interna |

> Lo que no funciona es no tener contrato. Ni tener dos que digan cosas distintas.

---

## @fin Volvemos al guion

Al terminar: §0, para dejar `s03` como estaba.
