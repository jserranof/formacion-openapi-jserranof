# S2 · Repaso exprés de JavaScript y TypeScript · diapositivas

> Fuente de la presentación `presentaciones/s02-js-presentacion.pptx`.
>
> Bloque de 45 minutos para abrir la S2: 25 de idea y demo, 15 de Tu turno y 5 de
> corrección. Antes, la duda de S1 sobre copiar tu rama a tu propio repositorio. El
> código de cada diapositiva está en `s02-js-referencia-rapida.md` (§N).

@pie Repaso de JavaScript y TypeScript

---

## @portada Curso APIs REST y OpenAPI con Node y TypeScript
### Repaso exprés de JavaScript y TypeScript

Martes 17 de noviembre de 2026

Alejandro Muñoz · Julditec

---

## La duda de ayer: mi rama, en mi propio repositorio

@diagrama comparacion
Botón Fork de GitHub | Copia el repositorio entero, o solo main | No deja elegir tu rama | El curso es privado: el fork se borra cuando acaba tu acceso
Tu repositorio y git push | Un repositorio vacío y privado, tuyo | Subes solo tu rama, como su main | Es tuyo: sigue ahí cuando acabe el curso

> Sí se puede, pero **no con el botón Fork**: con un `git push` a un repositorio tuyo.

---

## En la terminal: tu rama, en tu repositorio

1. En GitHub, **New repository**: `mi-curso-api`, **privado** y vacío
2. En tu equipo, clona **solo tu rama**: `git clone --single-branch --branch alumno/<tu-nombre> …`
3. Súbela a tu repositorio como `main`: `git push <tu-repositorio> alumno/<tu-nombre>:main`
4. Repite el paso 3 cuando quieras ponerla al día

Desde tu equipo, no desde el codespace: el codespace solo tiene permiso para este
repositorio. Referencia rápida · §F

---

## @seccion JavaScript y TypeScript, lo justo

---

## Por qué este repaso

Ayer, en el reto de filtrar, faltaba una sola palabra: `filter`.

@diagrama rejilla
const y let | Guardar un valor
Objetos | Una ficha con campos
Listas | Varias fichas en orden
Funciones | Recibe, hace, devuelve
filter · find · map* | Recorrer una lista sin bucles
Los tres puntos* | Copiar y combinar
undefined | Cuando no hay nada
Tipos | Lo que TypeScript comprueba

> Con estas ocho piezas se lee **todo el código del curso**.

---

## Tu rama, al día con main

@diagrama flujo
main: material nuevo -> git fetch origin -> git merge origin/main -> tu rama al día!

Cada uno trabaja en **su rama**, `alumno/<tu-nombre>`. El material nuevo llega a
**`main`**: hay que traerlo a tu rama. Tus ejercicios no se tocan.

> Primero guarda lo tuyo con un commit; después, el `merge`.

---

## En la terminal: trae el material de hoy

1. Guarda lo de ayer: `git add -A && git commit -m "s01: ejercicios"`
2. Trae lo nuevo de `main` a tu rama: `git fetch origin && git merge --no-edit origin/main`
3. Abre el patio: `npm run patio`, desde `ejercicios`
4. Cambia algo en `js/src/patio.ts` y guarda: se vuelve a ejecutar solo

Referencia rápida · §0 y §1

---

## const y let: guardar un valor

| Escribes | Qué significa |
|---|---|
| `const nombre = "Ana";` | Un valor que **no se reasigna**. Úsalo casi siempre |
| `let contador = 0;` | Un valor que **va a cambiar**: `contador = contador + 1;` |
| `var x = 1;` | La forma antigua. No la uses |

> Por defecto `const`. Si TypeScript se queja al reasignar, entonces `let`.

---

## Textos, números y comparaciones

| Escribes | Da |
|---|---|
| `Tarea ${id}: ${titulo}` | Texto con valores dentro: va entre **comillas invertidas** (la tecla a la derecha de la P) |
| `Number("7")` | `7`: de texto a número (`req.params.id` llega como texto) |
| `id === 7` | `true` si es igual **y del mismo tipo**. Siempre tres `=` |
| `!completada` | Lo contrario: `true` pasa a `false` |
| `a && b` | «a y b»: las dos tienen que cumplirse |

---

## Objetos: una ficha con campos

`const tarea = { id: 3, titulo: "Leer el contrato", completada: false };`

1. Llaves `{ }`: dentro, `campo: valor`, separados por comas
2. Se lee con un punto: `tarea.titulo` da `"Leer el contrato"`
3. Se cambia igual: `tarea.completada = true;`
4. La `interface Tarea` de ayer dice **qué campos** debe tener

> Un objeto es **una fila de la hoja de cálculo**; sus campos, las columnas.

---

## Listas: varias fichas en orden

| Escribes | Da |
|---|---|
| `const tareas = [t1, t2, t3];` | Una lista: corchetes `[ ]` |
| `tareas.length` | `3`: cuántas hay |
| `tareas[0]` | La **primera**: se cuenta desde 0 |
| `tareas.push(t4);` | Añade una al final |
| `Tarea[]` (en TypeScript) | «Lista de tareas» |

---

## Funciones: reciben, hacen y devuelven

@diagrama comparacion
function | function doble(n) { return n * 2; } | Con nombre y con return | Se usa en cualquier sitio
Flecha | const doble = (n) => n * 2; | Corta: lo de la derecha se devuelve | La que verás dentro de filter, find y map

Las dos hacen lo mismo: `doble(4)` da `8`.

---

## Leer una flecha

`(t) => t.completada`

1. `(t)`: recibe **una tarea**, que dentro se llama `t`
2. `=>`: «y devuelve…»
3. `t.completada`: …si está completada
4. Se lee: **«dada una tarea, ¿está completada?»**

> Ayer ya la usaste sin saberlo: `app.get("/salud", (req, res) => { … })`.

---

## filter: los que cumplen

`tareas.filter((t) => !t.completada)`

@diagrama abanico
filter:
Pasa por cada tarea
Le pregunta (¿!t.completada?)
Se queda con los true

Siempre devuelve **una lista nueva**, aunque esté vacía: `[]`.

---

## find: el primero que cumple

`tareas.find((t) => t.id === 4)`

| | Con filter | Con find |
|---|---|---|
| Devuelve | Una **lista** | **Un** elemento |
| Si no hay ninguno | `[]` | `undefined` |
| Para | `GET /tareas?completada=false` | `GET /tareas/4` |

> `findIndex` es igual, pero devuelve **la posición** (o `-1`).

---

## map: transformar cada uno

`tareas.map((t) => t.titulo)`

@diagrama flujo
3 tareas -> map((t) => t.titulo) -> 3 títulos!

Misma cantidad de elementos, **otra forma**. Para el resumen:
`tareas.filter((t) => t.completada).length`, cuántas completadas.

---

## Los de cada día, de un vistazo

| Escribes | Devuelve | En el curso |
|---|---|---|
| `lista.filter(f)` | Los que cumplen | Filtrar por `?completada` |
| `lista.find(f)` | El primero, o `undefined` | `GET /tareas/:id` |
| `lista.map(f)` | Cada uno transformado | Copiar los datos iniciales |
| `lista.some(f)` | `true` si alguno cumple | ¿Ya existe ese título? |
| `[...lista].sort(f)` | Una copia ordenada | `?orden=titulo` |
| `lista.slice(a, b)` | Un trozo | Paginar |

---

## Los tres puntos: copiar y combinar

| Escribes | Da |
|---|---|
| `{ ...tarea }` | Una **copia** de la tarea |
| `{ ...tarea, completada: true }` | Una copia con un campo cambiado |
| `{ ...tarea, ...cambios }` | La tarea con los cambios encima: **el `PATCH` de hoy** |
| `[...lista]` | Una copia de la lista |

> Gana lo que va **más a la derecha**.

---

## undefined: cuando no hay nada

`const tarea = tareas.find((t) => t.id === 99);` da `undefined`.

1. `if (!tarea)` → no existe: contesta **404**
2. `tarea?.titulo` → el título, o `undefined` sin romper
3. `limite ?? 20` → `limite`, y si no viene, `20`

> Ayer, el 404 de `GET /tareas/:id` era exactamente el paso 1.

---

## Los tipos que verás en S2

`"baja" | "media" | "alta"`: solo uno de esos tres textos. `Tarea | undefined`: una
tarea, o nada (lo que da `find`). La barra se lee **«o»**.

| TypeScript | Qué es |
|---|---|
| `Partial<Tarea>` | Una tarea con **todos los campos opcionales**: un `PATCH` |
| `Omit<Tarea, "id">` | Una tarea **sin** `id`: lo que llega en un `POST` |
| `z.infer<typeof esquema>` | El tipo que sale de un esquema de Zod |

---

## import, export y una clase

- `export function buscar(…)`: este fichero **ofrece** `buscar`
- `import { buscar } from "./tareas.js";`: otro fichero **lo usa** (con `.js`)
- `class RepositorioTareas { … }`: datos y funciones **juntos**
- `new RepositorioTareas()` crea uno; `repo.buscar(4)` usa su función

> En S2, rutas, servicio y repositorio son tres ficheros que se importan.

---

## Tu turno: calentamiento (js)

Siete funciones sobre una lista de tareas, en `ejercicios/js/src/tareas.ts`:
`pendientes`, `buscar`, `titulos`, `resumen` y `cambiar`. Retos: `buscarTexto` y
`ordenarPorTitulo`.

> **Lo tienes si** `npm run comprobar js` dice `5 de 5 ejercicios superados`.

**Si acabas antes:** termina los e07–e09 de ayer. Referencia rápida · §9

---

## Así se ve cuando está bien

| Función | Una línea |
|---|---|
| `pendientes` | `return lista.filter((t) => !t.completada);` |
| `buscar` | `return lista.find((t) => t.id === id);` |
| `titulos` | `return lista.map((t) => t.titulo);` |
| `cambiar` | `return { ...tarea, ...cambios };` |
| `ordenarPorTitulo` | `return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo));` |

---

## @fin Y ahora, a la API

Lo que no recuerdes, en la referencia rápida del repaso (§2–§8).
