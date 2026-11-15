# S3 · Ejercicios: el contrato primero, y las pruebas

Partes de la API de S2 terminada. Hoy escribes su contrato en `openapi.yaml`, haces que la
API lo publique y lo cumpla, escribes tus propias pruebas y añades un recurso nuevo
empezando por el contrato. Doce ejercicios, tres por bloque: dos para todos y un reto.

```bash
# desde ejercicios
npm run comprobar s03 e02           # un ejercicio
npm run comprobar s03               # toda la sesión
npm run dev:s03                     # tu API en http://localhost:3000 (y /docs, desde el e04)
npm run lint:s03                    # revisa el contrato (e06)
npm run tipos:s03                   # genera src/tipos/api.d.ts desde el contrato (e11)
npm run pruebas:s03                 # tus pruebas (e07, e08 y e12), contra tu API
```

| Ejercicio | Bloque | Dónde | Para quién |
|---|---|---|---|
| e01 · Lee un contrato | 1 | `src/respuestas/contrato.ts` (lee `carta.yaml`) | Todos |
| e02 · El contrato de /tareas | 1 | `openapi.yaml` | Todos (`GET /tareas/{id}`, en directo) |
| e03 · Reto: escríbelo una vez | 1 | `openapi.yaml` | Si acabas antes |
| e04 · Publica el contrato | 2 | `src/app.ts` | Todos |
| e05 · La API cumple el contrato | 2 | `src/app.ts` y `src/errores.ts` | Todos (necesita e02) |
| e06 · Reto: el lint y tu regla | 2 | `openapi.yaml` y `redocly.yaml` | Si acabas antes |
| e07 · Tus propias pruebas | 3 | `mis-pruebas/tareas.test.ts` | Todos |
| e08 · Pruebas contra el contrato | 3 | `mis-pruebas/contrato.test.ts` | Todos |
| e09 · Reto: recorre todo el contrato | 3 | `mis-pruebas/` | Si acabas antes |
| e10 · ¿Lo entendería un agente de IA? | 4 | `openapi.yaml` | Todos |
| e11 · Proyectos, del contrato al código | 4 | `openapi.yaml`, `src/proyectos/rutas.ts` y `app.ts` | Todos |
| e12 · Reto: las pruebas de proyectos | 4 | `mis-pruebas/proyectos.test.ts` | Si acabas antes |

Los retos (e03, e06, e09 y e12) se cuentan aparte: `npm run comprobar s03` termina con
`8 de 8 ejercicios superados · retos: 0 de 4.` y eso ya es el día completo.

Para ver el contrato mientras lo escribes, abre `openapi.yaml` y pulsa la vista previa de
la extensión OpenAPI (el icono de la esquina superior derecha). Prueba la API a mano con
`curl` o con REST Client (`s03/tareas.http`).

Si terminas todo lo tuyo antes que el resto: práctica 3 (`docs/prácticas/practica-03.pdf`).

## e01 · Lee un contrato (Bloque 1)

`carta.yaml` es el contrato de la API de un restaurante. Sin programar nada, contesta en
`src/respuestas/contrato.ts` trece preguntas: dónde están las rutas, qué operación
llamar, qué pedidos cumplen el contrato, para qué sirve `$ref`, y contract-first frente
a code-first.

**Hecho cuando:** `npm run comprobar s03 e01` da `[ OK ]`. Si una respuesta está mal, te
dice cuál y te da una pista, pero no la solución.

## e02 · El contrato de /tareas (Bloque 1)

**Hecho cuando** `openapi.yaml`:

- Es un OpenAPI 3.1 válido.
- Declara las seis operaciones de S2, cada una con un `operationId` único y un `summary`.
- Tiene el esquema `Tarea` con sus cuatro campos obligatorios y `prioridad` como `enum`.
- `POST /tareas` pide `titulo` y declara la respuesta 201 con la cabecera `Location`.
- `GET /tareas` declara `prioridad`, `completada`, `orden`, `pagina` y `limite` (de 1 a 100).
- Los 400 y 404 son `application/problem+json` (usa las respuestas de `components`), y
  las cuatro operaciones de `/tareas/{id}` declaran el 404.

Pista: `TareaNueva` (el cuerpo de `POST` y `PUT`) lleva `additionalProperties: false`, y
`CambiosTarea` (el del `PATCH`), además, ningún campo obligatorio.

## e03 · Reto: escríbelo una vez (Bloque 1, si acabas antes)

**Hecho cuando:**

- `pagina`, `limite` e `id` están en `components.parameters` y las operaciones los usan
  con `$ref`.
- Todos los errores (4xx) de `/tareas` son un `$ref` a `components/responses`.
- La respuesta 200 de `GET /tareas` declara la cabecera `Link` (la del reto e09 de S2).

## e04 · Publica el contrato (Bloque 2)

**Hecho cuando** `GET /openapi.json` devuelve el contrato y `/docs/` muestra Swagger UI con
**tu** contrato.

## e05 · La API cumple el contrato (Bloque 2, necesita e02)

**Hecho cuando** lo que el contrato no permite se rechaza antes de llegar a las rutas: un
parámetro inventado (400), un id que no es un número (400, no 404), un cuerpo que no es
JSON (415) o un campo que sobra (400, nombrándolo). Siempre con problem+json. Y lo que sí
lo cumple sigue funcionando.

Para pensar: rompe el contrato a propósito (quita `titulo` de `required`) y mira qué
pruebas fallan y qué dice el error.

## e06 · Reto: el lint y tu regla (Bloque 2, si acabas antes)

**Hecho cuando:**

- `npm run lint:s03` no da ni errores ni avisos. Si una regla no aplica, apágala en
  `redocly.yaml` con un comentario que diga por qué.
- `redocly.yaml` tiene una regla tuya, `rule/<nombre>`, que exige que cada `operationId`
  empiece por un verbo en infinitivo: con `operationId: saludGet` el lint se queja.

## e07 · Tus propias pruebas (Bloque 3)

Escribe tus pruebas en `mis-pruebas/tareas.test.ts`. **Hecho cuando** hay al menos 5, todas
pasan con la API buena, y **detectan dos versiones rotas de la API** que tenemos
preparadas: una que no valida y otra que responde 200 a lo que no existe. Si tus pruebas
siguen en verde con la API rota, no están probando lo importante.

## e08 · Pruebas contra el contrato (Bloque 3)

Escribe en `mis-pruebas/contrato.test.ts` al menos 3 pruebas que comprueben respuestas
enteras con `expect(cumpleContrato(res)).toEqual([])`. **Hecho cuando** pasan con la API
buena y detectan una versión rota que da **los códigos buenos** pero devuelve tareas que
no cumplen el esquema.

## e09 · Reto: recorre todo el contrato (Bloque 3, si acabas antes)

**Hecho cuando** tus pruebas (todas las de `mis-pruebas/`) llaman a las seis operaciones de
`/tareas`, y a cada una con un caso que va bien (2xx) y otro de error (4xx).

## e10 · ¿Lo entendería un agente de IA? (Bloque 4)

Un agente de IA no lee tu código ni te pregunta: lee el contrato y decide con él qué
llamar. **Hecho cuando:**

- Cada `operationId` empieza por un verbo en infinitivo, en camelCase (`listarTareas`).
- Cada operación de `/tareas` tiene una `description` de 30 caracteres o más que dice
  **cuándo** usarla.
- Cada parámetro de `/tareas` y cada campo de `Tarea`, `TareaNueva`, `CambiosTarea` y
  `PaginaTareas` tiene `description`.
- Los cuerpos de `POST`, `PUT` y `PATCH` llevan un `example`.

En clase lo revisa otra pareja con la lista de comprobación de la referencia rápida (§12).

## e11 · Proyectos, del contrato al código (Bloque 4)

Primero el contrato, después el código:

1. Añade al contrato `GET /proyectos`, `POST /proyectos` y `GET /proyectos/{id}`. Un
   proyecto tiene `id`, `nombre` (obligatorio) y `descripcion`. Con la lista del e10:
   cada operación con una `description` de al menos 30 caracteres y cada campo de
   `Proyecto` con la suya.
2. `npm run tipos:s03` y crea `src/proyectos/rutas.ts` usando esos tipos. No hace falta
   Zod: el validador del contrato ya comprueba el cuerpo.
3. Móntalo en `app.ts`.

**Hecho cuando** todo eso está, y `POST /proyectos` crea (201 + `Location`), sin `nombre`
responde 400, y un id que no existe, 404.

## e12 · Reto: las pruebas de proyectos (Bloque 4, si acabas antes)

Cierra el círculo: contrato → tipos → código → **prueba**. **Hecho cuando**
`mis-pruebas/proyectos.test.ts` tiene al menos 3 pruebas que pasan y detectan un
`POST /proyectos` sin nombre que se acepta y un proyecto que no existe que responde 200.
