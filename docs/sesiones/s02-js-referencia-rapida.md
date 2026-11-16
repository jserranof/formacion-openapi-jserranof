# S2 · Referencia rápida — Repaso exprés de JavaScript y TypeScript

> Para abrir la S2: lo justo de JavaScript y TypeScript para leer y escribir el código del
> curso. Cada sección trae todo lo que hace falta: cópiala tal cual. Los fragmentos de
> §2 a §8 se pegan en `ejercicios/js/src/patio.ts`, **sustituyendo** lo que haya.

| § | Dónde | Qué |
|---|---|---|
| 0 | Terminal | Guardar lo de ayer y traer el material de hoy |
| 1 | `ejercicios` | El patio: `npm run patio` |
| 2 | `js/src/patio.ts` | `const`, `let`, textos y comparaciones |
| 3 | `js/src/patio.ts` | Objetos |
| 4 | `js/src/patio.ts` | Listas |
| 5 | `js/src/patio.ts` | Funciones y flechas |
| 6 | `js/src/patio.ts` | `filter`, `find`, `map` y compañía |
| 7 | `js/src/patio.ts` | Los tres puntos: copiar y combinar |
| 8 | `js/src/patio.ts` | `undefined`, `?.` y `??` |
| 9 | `ejercicios` | Tu turno: el calentamiento (`js`, e01–e07) |
| F | Tu equipo | La duda de ayer: tu rama, en tu propio repositorio |

## §0 · Guardar lo de ayer y traer el material de hoy

**Terminal:**

```bash
# desde la raíz del repositorio
git branch --show-current                  # alumno/<tu-nombre>; si dice main: git switch alumno/<tu-nombre>
git add -A
git commit -m "s01: ejercicios"            # si dice «nothing to commit», no pasa nada
git fetch origin
git merge --no-edit origin/main            # trae a tu rama lo nuevo de main
```

**Comprobar:** existe la carpeta `ejercicios/js/`, y

```bash
# desde la raíz del repositorio
cd ejercicios && npm run comprobar js
```

termina con `0 de 5 ejercicios superados · retos: 0 de 2.` Es lo esperado.

## §1 · El patio: `npm run patio`

**Terminal:**

```bash
# desde ejercicios, en una terminal (déjala abierta)
npm run patio
```

1. Abre `ejercicios/js/src/patio.ts`.
2. Cambia `"Ana"` por tu nombre y guarda (`Ctrl+S`).
3. La terminal vuelve a ejecutar el fichero sola y enseña lo que imprime `console.log`.

**Comprobar:** la terminal muestra `Hola, <tu nombre>. Contador: 1`, `Hay 6 tareas` y
la lista de las tres tareas completadas. Para salir: `Ctrl+C`.

## §2 · `const`, `let`, textos y comparaciones

**Fichero:** `ejercicios/js/src/patio.ts`

```ts
const nombre = "Ana";          // const: no se reasigna. Úsalo por defecto
let contador = 0;              // let: va a cambiar
contador = contador + 1;

// Texto con valores dentro: comillas invertidas (la tecla a la derecha de la P) y ${}
console.log(`Hola, ${nombre}. Contador: ${contador}`);

// req.params.id llega como texto: Number() lo pasa a número
console.log(Number("7") === 7);   // true: === compara valor y tipo
```

**Comprobar:** imprime `Hola, Ana. Contador: 1` y `true`. Prueba a escribir
`nombre = "Luis";`: TypeScript lo subraya en rojo, porque `nombre` es `const`.

## §3 · Objetos

**Fichero:** `ejercicios/js/src/patio.ts`

```ts
const tarea = { id: 3, titulo: "Leer el contrato", completada: false };

console.log(tarea.titulo);     // se lee con un punto
tarea.completada = true;       // y se cambia igual
console.log(tarea);
```

**Comprobar:** imprime `Leer el contrato` y
`{ id: 3, titulo: 'Leer el contrato', completada: true }`.

Un `const` con un objeto no deja **reasignar** la variable (`tarea = …`), pero sí cambiar
sus campos (`tarea.completada = …`).

## §4 · Listas

**Fichero:** `ejercicios/js/src/patio.ts`

```ts
const letras = ["a", "b", "c"];

console.log(letras.length, letras[0]);   // cuántas hay y la primera (se cuenta desde 0)
letras.push("d");                        // añade al final
console.log(letras);
```

**Comprobar:** imprime `3 a` y `[ 'a', 'b', 'c', 'd' ]`. En TypeScript, una lista de
tareas se escribe `Tarea[]`.

## §5 · Funciones y flechas

**Fichero:** `ejercicios/js/src/patio.ts`

```ts
// Con nombre: recibe n (un número) y devuelve un número
function doble(n: number): number {
	return n * 2;
}

// Flecha: lo que va a la derecha de => se devuelve
const triple = (n: number) => n * 3;

console.log(doble(4), triple(4));
```

**Comprobar:** imprime `8 12`.

Cómo se lee `(t) => t.completada`: «dada una tarea `t`, devuelve si está completada».
Es la función que se le pasa a `filter`, `find` y `map`.

## §6 · `filter`, `find`, `map` y compañía

**Fichero:** `ejercicios/js/src/patio.ts`

```ts
import { tareas } from "./tareas.js";

console.log(tareas.filter((t) => !t.completada).map((t) => t.id)); // ids de las pendientes
console.log(tareas.find((t) => t.id === 4));                       // la tarea 4
console.log(tareas.find((t) => t.id === 99));                      // no existe
console.log(tareas.findIndex((t) => t.id === 4));                  // su posición
console.log(tareas.map((t) => t.titulo));                          // solo los títulos
console.log(tareas.filter((t) => t.completada).length);            // cuántas completadas
console.log(tareas.some((t) => t.prioridad === "baja"));           // ¿alguna de prioridad baja?
console.log(tareas.slice(0, 2).map((t) => t.id));                  // las dos primeras
```

**Comprobar:** imprime, en orden: `[ 3, 4, 5 ]`, la tarea 4 entera
(`{ id: 4, titulo: 'Diseñar las rutas', … }`), `undefined`, `3`, los seis títulos,
`3`, `true` y `[ 1, 2 ]`.

| Escribes | Devuelve | Si no hay ninguno |
|---|---|---|
| `lista.filter(f)` | Una lista con los que cumplen | `[]` |
| `lista.find(f)` | El primero que cumple | `undefined` |
| `lista.findIndex(f)` | La posición del primero que cumple | `-1` |
| `lista.map(f)` | Una lista con cada uno transformado | `[]` |
| `lista.some(f)` | `true` si alguno cumple | `false` |
| `[...lista].sort(f)` | Una copia ordenada | `[]` |
| `lista.slice(a, b)` | Los de la posición `a` a la `b` (sin incluir `b`) | `[]` |

## §7 · Los tres puntos: copiar y combinar

**Fichero:** `ejercicios/js/src/patio.ts`

```ts
import type { Tarea } from "./tareas.js";

const tarea: Tarea = { id: 3, titulo: "Leer el contrato", completada: false, prioridad: "media" };
const cambios: Partial<Tarea> = { completada: true };   // Partial: todos los campos opcionales

const nueva = { ...tarea, ...cambios };   // copia de tarea, con los cambios encima
console.log(nueva);
console.log(tarea.completada);            // la original no cambia
```

**Comprobar:** imprime la tarea con `completada: true` y después `false`. Es exactamente
el `PATCH` de hoy: lo que va más a la derecha gana.

Con listas es igual: `[...lista]` es una copia, y `[...lista, nueva]` una copia con una
más al final.

## §8 · `undefined`, `?.` y `??`

**Fichero:** `ejercicios/js/src/patio.ts`

```ts
import { tareas } from "./tareas.js";

const tarea = tareas.find((t) => t.id === 99);   // Tarea | undefined
if (!tarea) {
	console.log("404: no existe");               // así empieza cualquier GET /tareas/:id
}
console.log(tarea?.titulo);                       // ?. : el título, o undefined sin romper

const limite: number | undefined = undefined;
console.log(limite ?? 20);                        // ?? : el valor, y si no viene, 20
```

**Comprobar:** imprime `404: no existe`, `undefined` y `20`.

Los tipos de TypeScript que verás en S2:

| TypeScript | Qué es |
|---|---|
| `"baja" \| "media" \| "alta"` | Solo uno de esos tres textos (la barra se lee «o») |
| `Tarea \| undefined` | Una tarea, o nada: lo que devuelve `find` |
| `Partial<Tarea>` | Una tarea con todos los campos opcionales: un `PATCH` |
| `Omit<Tarea, "id">` | Una tarea sin `id`: lo que llega en un `POST` |
| `z.infer<typeof esquema>` | El tipo que sale de un esquema de Zod |

## §9 · Tu turno: el calentamiento (`js`, e01–e07)

**Fichero:** `ejercicios/js/src/tareas.ts`

Cambia **solo el cuerpo** de cada función (lo que hay entre `{` y `}`):

| Ejercicio | Función | Qué devuelve | Pista |
|---|---|---|---|
| e01 | `pendientes(lista)` | Las tareas sin completar | `filter` |
| e02 | `buscar(lista, id)` | La tarea con ese id, o `undefined` | `find` |
| e03 | `titulos(lista)` | Solo los títulos | `map` |
| e04 | `resumen(lista)` | `{ total, completadas, pendientes }` | `.length` y `filter` |
| e05 | `cambiar(tarea, cambios)` | Una tarea nueva con los cambios, sin tocar la original | `{ ...tarea, ...cambios }` |
| e06 · reto | `buscarTexto(lista, texto)` | Las que contienen el texto, sin distinguir mayúsculas | `includes` y `toLowerCase` |
| e07 · reto | `ordenarPorTitulo(lista)` | Una copia ordenada de la A a la Z | `[...lista]`, `sort` y `localeCompare` |

**Terminal:**

```bash
# desde ejercicios
npm run comprobar js           # todos
npm run comprobar js e01       # solo uno
```

**Comprobar:** `5 de 5 ejercicios superados`. Los retos se cuentan aparte.

**Si acabas antes:** termina los e07–e09 de ayer (`npm run comprobar s01`).

## §F · La duda de ayer: tu rama, en tu propio repositorio

**Respuesta corta:** sí, pero no con el botón **Fork** de GitHub. El fork copia el
repositorio entero (o solo `main`), no deja elegir tu rama, y como el repositorio del
curso es privado, tu fork **se borra** cuando acabe tu acceso. Lo que funciona es crear
un repositorio tuyo y subir a él solo tu rama.

**En GitHub:** **New repository** → nombre `mi-curso-api` → **Private** → **sin** README,
`.gitignore` ni licencia (tiene que estar vacío) → **Create repository**.

**Terminal, en tu equipo** (no en el codespace: su permiso es solo para el repositorio
del curso):

> ⚠️ POR VERIFICAR: que el `git push` a otro repositorio falle desde el codespace no se
> ha probado en uno real. Desde tu equipo funciona.

```bash
# desde la carpeta donde guardes tus proyectos
git clone --single-branch --branch alumno/<tu-nombre> <URL-DEL-REPOSITORIO-DEL-CURSO> mi-curso-api
cd mi-curso-api
git push https://github.com/<tu-usuario>/mi-curso-api.git alumno/<tu-nombre>:main
```

1. `--single-branch --branch …`: clona solo tu rama, no las de los demás.
2. `alumno/<tu-nombre>:main`: tu rama se sube a tu repositorio con el nombre `main`.
3. Para ponerlo al día otro día: `git pull` (trae lo nuevo de tu rama del curso) y repite
   el `git push` del paso anterior.

**Comprobar:** en `https://github.com/<tu-usuario>/mi-curso-api` está tu código, con tus
commits. `git branch -a` en `mi-curso-api` solo muestra tu rama.

Tu rama empieza en el material del curso, así que tu copia lleva también ese historial.
Es material del curso: déjalo **privado**.

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| `npm run comprobar js` dice «No hay ningún ejercicio que coincida» | Aún no has traído el material de hoy | §0: `git fetch origin && git merge --no-edit origin/main` |
| `git merge` dice `Your local changes … would be overwritten` | Cambios sin guardar en un fichero que también trae `main` | `git add -A && git commit -m "s01: ejercicios"` y repite el `merge` |
| `git merge` dice `CONFLICT` | Has tocado un fichero que no es de tus ejercicios | Avisa al formador; mientras, `git merge --abort` lo deja como estaba |
| `Cannot redeclare block-scoped variable` en el patio | Has pegado el fragmento debajo de otro con los mismos nombres | Sustituye todo el contenido de `patio.ts` por el fragmento |
| `filter` devuelve `[]` y debería haber tareas | La flecha no devuelve nada: `(t) => { t.completada }` | Sin llaves: `(t) => t.completada`; con llaves, `return` |
| `buscar(tareas, "4")` no encuentra nada | `"4"` es texto y el id es número: `===` compara también el tipo | `Number("4")` antes de comparar |
| e05: «no modifica la tarea original» falla | Has hecho `tarea.completada = …` | `return { ...tarea, ...cambios };` |
| e07: «no desordena la lista original» falla | `sort` ordena la lista que le das | Ordena una copia: `[...lista].sort(…)` |
| `git push` a `mi-curso-api` da 403 en el codespace | El codespace solo tiene permiso para el repositorio del curso | Hazlo desde tu equipo (§F) |
| `git push` a `mi-curso-api` dice `rejected … fetch first` | Creaste el repositorio con README | Bórralo y créalo vacío, o añade `--force` solo esa primera vez |
