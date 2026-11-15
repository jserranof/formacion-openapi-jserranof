# S2 · Anexo — La API, lista para producción · diapositivas

Fuente de la presentación `presentaciones/s02-anexo-presentacion.pptx`.

> Material de ampliación de S2, para usar si sobra tiempo. Tres bloques independientes:
> se pueden dar en cualquier orden. Los valores exactos, en
> `s02-anexo-referencia-rapida.md` (§A1–§C4). El código, en `docs/ejemplos/anexo-s02/`.

@pie Anexo S2 · La API, lista para producción

---

## @portada Curso APIs REST y OpenAPI con Node y TypeScript
### Sesión 2 · Anexo: la API, lista para producción

Martes 17 de noviembre de 2026

Alejandro Muñoz · Julditec

---

## Nos sobra tiempo: tres extras

@diagrama rejilla
A · Salud y parada ordenada* | Arrancar y apagar sin cortar a nadie
B · Otra despensa | El repositorio en SQLite, sin tocar las rutas
C · CORS de verdad | Una web en otro puerto, y el navegador que bloquea

Lo que montamos lo quitamos al final: la S3 empieza en `ejercicios/s03`, como estaba.

---

## @seccion A · Salud y parada ordenada

---

## Vivo no es lo mismo que listo

@diagrama comparacion
/salud · ¿estás vivo? | El proceso responde | Si falla: reiniciarlo
/listo · ¿puedo mandarte tráfico? | Ha terminado de arrancar y no se está apagando | Si falla: no mandarle peticiones, esperar

Quien pregunta es el **orquestador**: Kubernetes, un balanceador, la plataforma donde despliegas.

---

## Apagar sin cortar a nadie

@diagrama flujo
Llega SIGTERM -> /listo pasa a 503 -> No acepta conexiones nuevas -> Termina las que tiene a medias -> Sale!

Cada despliegue apaga la versión vieja. Sin esto, **las peticiones a medias se cortan**.

---

## En el código: el servidor ordenado

1. Copia `servidor-ordenado.ts` a `ejercicios/s02/src/`
2. Arráncalo: `/listo` da 503 dos segundos y después 200
3. Lanza `/lenta` (3 s) y pulsa `Ctrl+C` en el servidor
4. La lenta termina bien; una petición nueva ya no entra

![FOTO 1] /listo de 503 a 200; Ctrl+C con una petición a medias: termina bien, y la nueva no entra

Referencia rápida · §A2–§A3

---

## Lo que hay que saber antes de usarlo

- `server.close()` deja de aceptar conexiones y espera a las abiertas
- Pon siempre un **tiempo máximo**: si algo se cuelga, sal igualmente
- En Codespaces y en local, `Ctrl+C` manda **SIGINT**; las plataformas mandan **SIGTERM**
- `/listo` también puede comprobar la base de datos: si no hay conexión, 503

---

## @seccion B · Otra despensa: SQLite

---

## Para qué eran las capas

@diagrama capas
Rutas | No cambian
Servicio | Una línea: pide «algo que se comporte como un repositorio»
Repositorio* | Hoy en memoria; ahora, SQLite

Es la promesa de la mañana: **cambiar la despensa sin tocar al camarero ni al cocinero**.

---

## La misma forma, otra implementación

| Método | En memoria | En SQLite |
|---|---|---|
| `todas()` | `this.tareas` | `SELECT * FROM tareas` |
| `buscar(id)` | `find` | `SELECT … WHERE id = ?` |
| `crear(datos)` | `push` | `INSERT …` |
| `guardar(tarea)` | Sustituye en la lista | `UPDATE …` |
| `borrar(id)` | `filter` | `DELETE …` |

Los `?` evitan la **inyección SQL**: los valores nunca se pegan en el texto de la consulta.

---

## En el código: el repositorio de SQLite

1. Copia `repositorio-sqlite.ts` a `s02/src/tareas/`
2. En el servicio, una línea: el tipo del repositorio
3. En `app.ts`, `new RepositorioSqlite(process.env.BD)`
4. `npm run comprobar s02`: **8 de 8**, sin tocar las rutas

![FOTO 2] Una tarea que sobrevive al reinicio con BD=tareas.db, y las pruebas en verde con :memory:

Referencia rápida · §B2–§B4

---

## Interfaz, no clase concreta

`constructor(private repo: Pick<RepositorioTareas, keyof RepositorioTareas>)`

- Antes, el servicio pedía **esa clase**: solo valía la de memoria
- Ahora pide **su forma**: cualquier objeto con esos cinco métodos
- Se llama **inversión de dependencias**, y es lo que hace posible probar por partes

---

## @seccion C · CORS en un navegador de verdad

---

## Lo que vimos con curl, ahora de verdad

@diagrama flujo
Página en localhost:5174 -> fetch a localhost:3000 -> La API contesta 200 -> El navegador mira Access-Control-Allow-Origin -> Bloqueada!

La API **sí ha respondido**. Quien no deja leer la respuesta es **el navegador**.

---

## En el navegador: dos orígenes

1. La API de s02 con el e10 hecho, en el 3000
2. `servir.mjs 5173` y `servir.mjs 5174`: la misma página, dos puertos
3. Desde 5173 (en la lista): **200** y los datos
4. Desde 5174: **bloqueada**, y el error en la consola (F12)

![FOTO 3] La misma página desde 5173 (lee la respuesta) y desde 5174 (el navegador la bloquea)

Referencia rápida · §C2–§C3

---

## Lo que enseña la demo

- En el registro del servidor, las dos peticiones salen con **200**
- `Link` y `X-Request-Id` solo se ven porque CORS los **expone** (`exposedHeaders`)
- El `POST` con JSON hace antes una petición `OPTIONS` (**preflight**): «¿puedo?»
- CORS no protege la API: protege a **tus usuarios** de webs ajenas

---

## @fin Volvemos al guion

Deja `s02` como estaba: borra los ficheros copiados y deshaz los cambios de `app.ts` y `servicio.ts` (referencia rápida · §0)
