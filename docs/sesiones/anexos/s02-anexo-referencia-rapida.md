# S2 · Anexo · Referencia rápida — La API, lista para producción

> Material de ampliación de S2. Parte de `ejercicios/s02` con los ejercicios hechos (al
> menos e02, e04 y e10; para el bloque C, e10 es imprescindible). El código está en
> `docs/ejemplos/anexo-s02/`: se copia a `ejercicios/s02/src/` y se quita al final (§0).
>
> Tres bloques independientes: **A** (salud y parada ordenada), **B** (el repositorio en
> SQLite) y **C** (CORS en un navegador de verdad).

| § | Dónde | Qué |
|---|---|---|
| 0 | Terminal | Antes y después: guardar tu trabajo y dejarlo como estaba |
| A1 | Chat | Vivo no es lo mismo que listo |
| A2 | `ejercicios/s02/src/servidor-ordenado.ts` | El servidor con `/listo` y parada ordenada |
| A3 | Terminal | Probarlo: una petición a medias y `Ctrl+C` |
| B1 | Chat | Para qué eran las capas |
| B2 | `ejercicios/s02/src/tareas/repositorio-sqlite.ts` | El repositorio en SQLite |
| B3 | `servicio.ts` y `app.ts` | Dos líneas para cambiar de despensa |
| B4 | Terminal | Probarlo: sobrevive al reinicio, y las pruebas en verde |
| C1 | Chat | Qué vamos a ver |
| C2 | Terminal | La API y la misma página en dos puertos |
| C3 | Navegador | Desde 5173 se lee; desde 5174, bloqueada |
| C4 | Terminal | El preflight, con `curl` |

## §0 · Antes y después

**Antes de empezar**, guarda tus ejercicios:

```bash
# desde la raíz del repositorio
git add -A && git commit -m "s02: ejercicios" && git push
```

**Al terminar**, deja `s02` como estaba (solo toca lo del anexo):

```bash
# desde la raíz del repositorio
rm -f ejercicios/s02/src/servidor-ordenado.ts ejercicios/s02/src/tareas/repositorio-sqlite.ts ejercicios/tareas.db
git restore ejercicios/s02/src/app.ts ejercicios/s02/src/tareas/servicio.ts
```

**Comprobar:** `git status` no lista nada bajo `ejercicios/s02` y `npm run comprobar s02`
da lo mismo que antes del anexo.

---

# A · Salud y parada ordenada

## §A1 · Vivo no es lo mismo que listo

| Ruta | Pregunta | Si falla, el orquestador… |
|---|---|---|
| `/salud` | ¿El proceso responde? | Lo reinicia |
| `/listo` | ¿Ha terminado de arrancar y no se está apagando? | No le manda tráfico y espera |

El orquestador es lo que arranca y vigila tu API: Kubernetes, un balanceador o la
plataforma donde despliegas. En cada despliegue apaga la versión vieja con la señal
`SIGTERM`. Si la API sale de golpe, las peticiones a medias se cortan.

## §A2 · El servidor con `/listo` y parada ordenada

**Terminal:**

```bash
# desde la raíz del repositorio
cp docs/ejemplos/anexo-s02/servidor-ordenado.ts ejercicios/s02/src/
```

**Fichero:** `ejercicios/s02/src/servidor-ordenado.ts` (lo importante)

```ts
let listo = false;
let cerrando = false;

const raiz = express();
raiz.get("/listo", (_req, res) => {
	res.status(listo ? 200 : 503).json({ listo });
});
raiz.use(crearApp({ registro: (linea) => console.log(JSON.stringify(linea)) }));

const servidor = raiz.listen(puerto, () => {
	setTimeout(() => (listo = true), 2000); // simula lo que tarda en estar lista de verdad
});

function cerrar(senal: string) {
	if (cerrando) return; // tsx reenvía la señal: que solo cuente la primera
	cerrando = true;
	listo = false;
	servidor.close(() => process.exit(0)); // no acepta nuevas; espera a las que tiene
	setTimeout(() => process.exit(1), 10_000).unref(); // y si algo se cuelga, no espera para siempre
}

process.on("SIGTERM", () => cerrar("SIGTERM"));
process.on("SIGINT", () => cerrar("SIGINT"));
```

1. `/listo` va en una aplicación «raíz», delante de la API: la API no cambia.
2. `/lenta` (en el fichero) tarda 3 segundos: solo para la demo.
3. `server.close()` deja de aceptar conexiones y llama a su función cuando terminan las abiertas.

## §A3 · Probarlo: una petición a medias y `Ctrl+C`

**Terminal:**

```bash
# terminal 1, desde ejercicios (para antes npm run dev:s02 si lo tienes arrancado)
npx tsx s02/src/servidor-ordenado.ts

# terminal 2, enseguida, y otra vez a los dos segundos
curl -i localhost:3000/listo

# terminal 2: una petición que tarda 3 s…
curl localhost:3000/lenta
# …y mientras, Ctrl+C en la terminal 1. En una terminal 3:
curl -s localhost:3000/salud; echo $?
```

**Comprobar:**

- `/listo`: primero `503 {"listo":false}` y a los dos segundos `200 {"listo":true}`.
- La petición a `/lenta` termina bien: `{"terminada":true}`.
- La de `/salud` no entra: no imprime nada y `echo $?` da `7` (no se puede conectar).
- La terminal 1 dice `SIGINT: dejo de aceptar peticiones y termino las que tengo a medias`
  y después `Cerrado sin cortar a nadie`.

---

# B · Otra despensa: SQLite

## §B1 · Para qué eran las capas

Esta mañana: «cambiar la base de datos solo toca el repositorio». Ahora se comprueba. Las
rutas no cambian; el servicio, una línea de tipo; `app.ts`, una línea.

`node:sqlite` viene con Node (22.13 o superior): no hay que instalar nada. Al arrancar
verás `ExperimentalWarning: SQLite is an experimental feature`: es normal.

## §B2 · El repositorio en SQLite

**Terminal:**

```bash
# desde la raíz del repositorio
cp docs/ejemplos/anexo-s02/repositorio-sqlite.ts ejercicios/s02/src/tareas/
```

**Fichero:** `ejercicios/s02/src/tareas/repositorio-sqlite.ts` (lo importante)

```ts
import { DatabaseSync } from "node:sqlite";

export class RepositorioSqlite {
	private bd: DatabaseSync;

	// ":memory:" para las pruebas (cada app, su base de datos); un fichero para guardar de verdad
	constructor(ruta = ":memory:") {
		this.bd = new DatabaseSync(ruta);
		this.bd.exec("CREATE TABLE IF NOT EXISTS tareas (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, completada INTEGER NOT NULL, prioridad TEXT NOT NULL)");
		// …si está vacía, mete las doce tareas de datosIniciales()
	}

	buscar(id: number): Tarea | undefined {
		const fila = this.bd.prepare("SELECT * FROM tareas WHERE id = ?").get(id) as Fila | undefined;
		return fila && aTarea(fila);
	}
	// …todas, crear, guardar y borrar, igual: los mismos nombres y lo mismo que devuelven
}
```

1. Los mismos cinco métodos que `RepositorioTareas`, con las mismas entradas y salidas.
2. SQLite no tiene booleanos: `completada` se guarda como 0 o 1 y se convierte al leer.
3. Los `?` evitan la inyección SQL: los valores nunca se pegan dentro del texto de la consulta.

## §B3 · Dos líneas para cambiar de despensa

**Fichero:** `ejercicios/s02/src/tareas/servicio.ts` (el constructor)

```ts
// antes: constructor(private repo: RepositorioTareas) {}
constructor(private repo: Pick<RepositorioTareas, keyof RepositorioTareas>) {}
```

**Fichero:** `ejercicios/s02/src/app.ts`

```ts
// antes: import { RepositorioTareas } from "./tareas/repositorio.js";
import { RepositorioSqlite } from "./tareas/repositorio-sqlite.js";
// …
app.use("/tareas", crearRutasTareas(new ServicioTareas(new RepositorioSqlite(process.env.BD))));
```

1. Antes, el servicio pedía **esa clase** (y una clase con campos privados no admite
   otra). Ahora pide **su forma**: cualquier objeto con esos métodos públicos.
2. Sin la variable `BD`, la base de datos es `:memory:`: las pruebas no cambian.

## §B4 · Probarlo: sobrevive al reinicio, y las pruebas en verde

**Terminal:**

```bash
# terminal 1, desde ejercicios
npx tsc --noEmit
BD=tareas.db npm run dev:s02

# terminal 2
curl -s -X POST localhost:3000/tareas -H "Content-Type: application/json" -d '{"titulo":"Sobrevivo al reinicio"}'

# Ctrl+C en la terminal 1, otra vez BD=tareas.db npm run dev:s02, y en la terminal 2:
curl -s localhost:3000/tareas/13

# desde ejercicios
npm run comprobar s02
```

**Comprobar:** el `typecheck` no dice nada; la tarea 13 sigue ahí después de reiniciar
(con la API en memoria, se perdía: lo visteis ayer en el e01); y `comprobar` da
`8 de 8 ejercicios superados`, sin haber tocado ni una ruta. `tareas.db` no se sube a
GitHub: el `.gitignore` ya ignora los `*.db`.

---

# C · CORS en un navegador de verdad

## §C1 · Qué vamos a ver

Con `curl` vimos la cabecera `Access-Control-Allow-Origin`. Ahora, lo que hace el
navegador con ella: la misma página, servida desde dos puertos (dos orígenes), llama a la
API del 3000. Uno está en la lista de `crearApp({ origenes })` (`http://localhost:5173`) y
el otro no.

## §C2 · La API y la misma página en dos puertos

**Terminal:**

```bash
# terminal 1, desde ejercicios: la API con el e10 hecho
npm run dev:s02

# terminal 2 y terminal 3, desde la raíz del repositorio
node docs/ejemplos/anexo-s02/servir.mjs 5173
node docs/ejemplos/anexo-s02/servir.mjs 5174
```

**Comprobar:** cada una dice `Página en http://localhost:517X`.

## §C3 · Desde 5173 se lee; desde 5174, bloqueada

1. Abre `http://localhost:5173` en el navegador y pulsa **GET /tareas?limite=2**.
2. Abre `http://localhost:5174` y pulsa lo mismo. Abre la consola (`F12`).
3. Mira la terminal 1: el registro del servidor.

**Comprobar:**

- Desde 5173: `200 OK`, las dos tareas y las cabeceras `link` y `x-request-id` (se ven
  porque CORS las expone con `exposedHeaders`; `location` no sale porque un `GET` no la lleva).
- Desde 5174: `El navegador ha bloqueado la respuesta (Failed to fetch)`, y en la consola
  el error de CORS: falta `Access-Control-Allow-Origin`.
- En el registro, **las dos** peticiones salen con `"status":200`. La API respondió; el
  navegador no dejó leer la respuesta.

> ⚠️ POR VERIFICAR en Codespaces: allí la página y la API salen por direcciones
> `https://…-5173.app.github.dev` y `https://…-3000.app.github.dev`. Hay que poner esa
> dirección de la página en `origenes`, la de la API en el campo **API** de la página, y
> el puerto 3000 como público en la pestaña **Puertos**. Probado en local.

## §C4 · El preflight, con `curl`

Un `POST` con `Content-Type: application/json` no sale directamente: el navegador
pregunta antes con `OPTIONS`.

```bash
curl -si -X OPTIONS localhost:3000/tareas \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" | grep -iE "^HTTP|access-control"
```

**Comprobar:**

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
```

Con `Origin: http://localhost:5174`, el mismo `204` pero sin `Access-Control-Allow-Origin`:
el navegador ni siquiera manda el `POST`.

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| `EADDRINUSE :::3000` al arrancar el servidor ordenado | `npm run dev:s02` sigue arrancado | `Ctrl+C` en su terminal |
| `Ctrl+C` y sale al instante | No había ninguna petición abierta: es lo normal | Para verlo esperar, lanza antes `curl localhost:3000/lenta` |
| `/listo` siempre 503 | Lo has pedido antes de los dos segundos | Espera y repite |
| `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` | Node anterior a 22.13 | `node --version`; en el codespace es Node 24 |
| `TS2345: … is not assignable to parameter of type 'RepositorioTareas'` | El servicio sigue pidiendo la clase | El constructor del §B3 |
| La tarea no sobrevive al reinicio | Arrancas sin `BD=tareas.db` (va a `:memory:`) | `BD=tareas.db npm run dev:s02` |
| Desde 5173 también se bloquea | La API no tiene el e10 hecho, o `origenes` no incluye `http://localhost:5173` | `corsConLista(origenes)` en la cadena |
| La página no carga | `servir.mjs` no está arrancado en ese puerto | §C2 |
