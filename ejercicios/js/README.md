# Calentamiento · JavaScript y TypeScript

Siete funciones sobre una lista de tareas, en `src/tareas.ts`. Cambia solo el cuerpo de
cada función (lo que hay entre `{` y `}`). Las pruebas, de solo lectura, en `pruebas/`.
Lo que necesitas saber está en la referencia rápida del repaso
([`docs/sesiones/s02-js-referencia-rapida.md`](../../docs/sesiones/s02-js-referencia-rapida.md)).

```bash
# desde ejercicios
npm run comprobar js           # todos
npm run comprobar js e01       # solo uno
npm run patio                  # tu zona de pruebas: src/patio.ts, se ejecuta al guardar
```

| Ejercicio | Para quién |
|---|---|
| e01 · `pendientes` | Todos |
| e02 · `buscar` | Todos |
| e03 · `titulos` | Todos |
| e04 · `resumen` | Todos |
| e05 · `cambiar` | Todos |
| e06 · Reto: `buscarTexto` | Si acabas antes |
| e07 · Reto: `ordenarPorTitulo` | Si acabas antes |

## e01 · `pendientes(lista)`

Devuelve solo las tareas que no están completadas.

**Hecho cuando:** con la lista de ejemplo devuelve las tareas 3, 4 y 5, enteras; con una
lista vacía, `[]`.

## e02 · `buscar(lista, id)`

Devuelve la tarea con ese `id`, o `undefined` si no está.

**Hecho cuando:** `buscar(tareas, 4)` devuelve la tarea 4 (un objeto, no una lista) y
`buscar(tareas, 99)` devuelve `undefined`.

## e03 · `titulos(lista)`

Devuelve solo los títulos, en el mismo orden.

**Hecho cuando:** devuelve los seis títulos de la lista de ejemplo, en orden; con una
lista vacía, `[]`.

## e04 · `resumen(lista)`

Devuelve un objeto `{ total, completadas, pendientes }`.

**Hecho cuando:** con la lista de ejemplo da `{ total: 6, completadas: 3, pendientes: 3 }`,
y con otra lista, sus cuentas (nada escrito a mano).

## e05 · `cambiar(tarea, cambios)`

Devuelve una tarea nueva con los cambios aplicados, sin tocar la original.

**Hecho cuando:** aplica los cambios, conserva el resto de campos y la tarea original
sigue igual.

## e06 · Reto: `buscarTexto(lista, texto)`

Devuelve las tareas cuyo título contiene el texto, sin distinguir mayúsculas.

**Hecho cuando:** `"ar"` encuentra las tareas 1, 2 y 4; `"api"` y `"API"` encuentran la
2; un texto que no está devuelve `[]`.

## e07 · Reto: `ordenarPorTitulo(lista)`

Devuelve una lista nueva ordenada por título, de la A a la Z, sin desordenar la original.

**Hecho cuando:** el orden es 5, 2, 4, 6, 1, 3 («Añadir…» junto a la A) y la lista que
recibe sigue en su orden.
