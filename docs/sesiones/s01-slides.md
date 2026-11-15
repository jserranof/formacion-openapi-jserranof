# S1 — HTTP y REST desde cero; primera API · diapositivas

> Fuente de la presentación `presentaciones/s01-presentacion.pptx`.
>
> Patrón: cada idea va seguida de su «En el código» (o «En la terminal»), que remite a la
> referencia rápida (§N). Las diapositivas de base (explican cada palabra desde cero) se
> pueden saltar si el grupo ya la conoce: la lista está en el guion.

@pie HTTP y REST desde cero; primera API

---

## @portada Curso APIs REST y OpenAPI con Node y TypeScript
### Sesión 1 · HTTP y REST desde cero; primera API

Lunes 16 de noviembre de 2026

Alejandro Muñoz · Julditec

---

## Tres preguntas para empezar

1. ¿En qué lenguaje programas en el día a día?
2. ¿Has llamado alguna vez a una API desde tu código? ¿A cuál?
3. Del 1 al 5, ¿cuánto TypeScript sabes?

> Contesta en el chat. No hay respuestas malas: sirven para ajustar el ritmo.

---

## @seccion Cómo funciona el curso

---

## Cuatro sesiones, una API

@diagrama ruta
S1 · HTTP y primera API > S2 · CRUD, validación y errores > S3 · OpenAPI y pruebas > S4 · Seguridad y agentes de IA

| Sesión | Fecha | Qué construimos |
|---|---|---|
| S1 | Lun 16 | Entender HTTP y las primeras rutas |
| S2 | Mar 17 | Crear, cambiar y borrar, bien validado |
| S3 | Lun 23 | El contrato OpenAPI y las pruebas |
| S4 | Mar 24 | Seguridad y agentes de IA |

---

## Un día de curso

| Tramo | Hora |
|---|---|
| Apertura | 9:00–9:15 |
| Bloque 1 · descanso | 9:15–10:10 · 10:10–10:20 |
| Bloque 2 · pausa larga | 10:20–11:15 · 11:15–11:40 |
| Bloque 3 · descanso | 11:40–12:35 · 12:35–12:45 |
| Bloque 4 · cierre | 12:45–13:40 · 13:40–14:00 |

Cinco horas cansan: **tres descansos**, y la mitad del tiempo es tuyo.

---

## Cómo es un bloque

@diagrama flujo
Idea (diapositivas) -> En el código (demo) -> Tu turno (25 min) -> Corrección!

Primero lo cuento y lo hago en pantalla. **Después lo haces tú**,
y al final lo corregimos juntos con una solución real.

---

## Qué hay en el repositorio

| Carpeta | Qué encuentras |
|---|---|
| `docs/sesiones/` | Diapositivas y **referencia rápida** de cada sesión |
| `docs/material/` | Las diapositivas en PDF |
| `ejercicios/` | Los ejercicios, con pruebas automáticas |
| `docs/prácticas/` | Una práctica por sesión, en PDF rellenable |
| `docs/cuestionarios/` | Diez preguntas por sesión |
| `docs/ejemplos/` | Código de ejemplo para mirar y probar |

---

## La referencia rápida

Cada sesión tiene un documento con **todo el código y los comandos**, numerado: §1, §2…

1. Cuando lo necesites, **pego la sección en el chat**
2. La copias y la pegas: no hace falta teclearlo todo
3. Si te pierdes, búscala en `docs/sesiones/s01-referencia-rapida.md`

> Las diapositivas dicen la idea; la referencia, el detalle exacto.

---

## Los ejercicios

@diagrama flujo
Lees el enunciado -> Escribes el código -> npm run comprobar -> OK o una pista!

- Hoy, **nueve ejercicios**: dos o tres por bloque, y en cada bloque un reto para quien vaya rápido
- Cada sesión tiene su carpeta: `ejercicios/s01`, `s02`…
- `npm run comprobar` te dice **en español** qué te falta
- Cada carpeta trae ya **la solución de la sesión anterior**: si un día te pierdes, al siguiente empiezas limpio

---

## Las prácticas y el cuestionario

@diagrama comparacion
Práctica | Repite lo del día con otro ejemplo | Al final de la sesión si sobra tiempo, o en casa (1 hora) | Sus dudas, al empezar la siguiente sesión
Cuestionario | Diez preguntas tipo test | En el cierre de cada sesión | Para comprobar que la idea ha quedado

---

## Dónde trabajas: tu codespace

@diagrama abanico
Tu codespace:
VS Code (en el navegador)
Node y dependencias (ya instalados)
Tu copia del repositorio (se guarda en GitHub)

No hay que instalar nada. Ábrelo cada día **desde el mismo sitio**; al terminar, **páralo**.

Referencia rápida · §0

---

## Cuando te atasques

1. Lee la pista de `npm run comprobar`: suele decir qué falta
2. Mira la tabla **Si algo falla**, al final de la referencia rápida
3. Escribe en el chat **el error tal cual** (copiado, no resumido)
4. Si hace falta, compartes pantalla y lo vemos juntos

> Atascarse es parte de aprender. Preguntar pronto ahorra a todos tiempo.

---

## Hoy

@diagrama flujo
Qué es una API -> Verbos y códigos -> TypeScript y Express -> Una tarea, o 404!

A las 14:00: una API con tres rutas que contesta bien **incluso cuando algo no existe**.

---

## @seccion Qué es una API y REST

---

## Qué es una API, sin tecnicismos

Una **API** es la forma en que un programa le pide algo a otro programa.
Sin pantallas ni botones: un programa pregunta y otro contesta con datos.

> API: *Application Programming Interface*, «interfaz para programas».

---

## Ya usas APIs cada día

@diagrama abanico
Tu móvil pide datos:
El tiempo (la app pregunta a un servicio meteorológico)
El banco (la app pide tu saldo al servidor)
Un mapa en una web (la web pide el mapa a Google)
Pagar online (la tienda habla con el banco)

Detrás de cada pantalla hay **una petición y una respuesta**.

---

## Un camarero para programas

@diagrama flujo
Cliente (tú) -> API (el camarero) -> Servidor (la cocina)
Servidor (la cocina) ~vuelve con el plato~> Cliente (tú)

No entras en la cocina: **pides de la carta**.
Siempre en pareja: **una petición, una respuesta**.

---

## Cliente y servidor

@diagrama comparacion
Cliente | Quien pide | Navegador, app del móvil, otro programa | Hoy: curl y REST Client
Servidor | Quien atiende y tiene los datos | Un programa siempre encendido, esperando | Hoy: nuestra API en Node

Un mismo programa puede ser servidor para unos y **cliente de otros**.

---

## HTTP: el idioma de la web

**HTTP** es el idioma en el que se hablan cliente y servidor.
El mismo que usa tu navegador al abrir cualquier página.

Es un idioma **de texto, con reglas fijas**: qué va primero, qué va después.
Por eso cualquier lenguaje (Java, Python, JavaScript…) puede hablarlo.

---

## Las partes de una dirección (URL)

`https://api.ejemplo.com:443/tareas/2?completada=true`

| Parte | Ejemplo | Qué es |
|---|---|---|
| Protocolo | `https` | El idioma (con la `s`, cifrado) |
| Servidor | `api.ejemplo.com` | A quién le hablas |
| Puerto | `443` | Por qué puerta (casi nunca se escribe) |
| Ruta | `/tareas/2` | De qué cosa hablas |
| Consulta | `?completada=true` | Detalles opcionales: filtros |

---

## localhost y los puertos

- **localhost** es tu propia máquina: el cliente y el servidor están en el mismo sitio
- Un **puerto** es una puerta numerada: un servidor «escucha» en una
- Nuestra API escucha en el **3000**: `http://localhost:3000`

> Dos programas no pueden escuchar en la misma puerta a la vez. Lo verás hoy.

---

## Qué lleva una petición

@diagrama rejilla
Verbo* | Qué quieres hacer: GET, POST…
Ruta | De qué hablas: /tareas/2
Cabeceras | Datos sobre el mensaje
Cuerpo | Los datos que mandas (a veces)

`GET /tareas/2` → «tráeme la tarea 2».

---

## Qué lleva una respuesta

@diagrama capas
Línea de estado* | HTTP/1.1 200 OK: cómo ha ido
Cabeceras | Content-Type, Location…
Cuerpo | Los datos, casi siempre JSON

Entre las cabeceras y el cuerpo, **una línea en blanco**.

---

## Cabeceras que vas a ver

| Cabecera | Qué dice |
|---|---|
| `Content-Type` | En qué formato va el cuerpo: `application/json` |
| `Content-Length` | Cuánto ocupa el cuerpo |
| `Location` | Dónde está lo que acabas de crear |
| `Accept` | Qué formato quiere el cliente |
| `Authorization` | Quién eres (lo veremos en S4) |

Son como **lo que se apunta en el margen** de la comanda.

---

## REST en cuatro ideas

@diagrama rejilla
Recursos* | Cada cosa, su dirección: /tareas/2
Verbos de siempre | POST /tareas, no /crearTarea
Sin estado | Cada petición lleva todo lo que hace falta
Representaciones | Lo que viaja es JSON

REST no es una librería: es **una forma de diseñar** APIs sobre HTTP.

---

## La terminal y curl

- La **terminal** es una ventana para dar órdenes escribiendo, en lugar de con el ratón
- **`curl`** es un cliente HTTP de terminal: hace una petición y te enseña la respuesta
- **REST Client** hace lo mismo desde un fichero de VS Code, con botones

> Usaremos dos terminales: una para el servidor, otra para las peticiones.

---

## En la terminal: la API de ejemplo

1. `cd docs/ejemplos/api-base` y `npm run dev`
2. En **otra** terminal: `curl -i localhost:3000/tareas`
3. Señala: línea de estado, cabeceras, línea en blanco, cuerpo
4. Lo mismo con REST Client: `peticiones/tareas.http`

![FOTO 1] curl -i a /salud y /tareas: línea de estado, cabeceras y cuerpo

Referencia rápida · §1–§3

---

## Tu turno 1: explora la API de ejemplo (e01)

Ocho preguntas con `curl -i` o REST Client: qué código vuelve, qué cabeceras,
qué pasa con lo que no existe, cómo se crea una tarea, dónde está al reiniciar.
Contesta en `ejercicios/s01/src/respuestas/explorar.ts`.

> **Lo tienes si** `npm run comprobar s01 e01` da `[ OK ]`.

**Si acabas antes:** la API de GitHub. Referencia rápida · §4

---

## @seccion Verbos, idempotencia, códigos y JSON

---

## Qué es un recurso

Un **recurso** es una «cosa» de tu negocio que la API deja manejar:
una tarea, un proyecto, un cliente, una factura.

| Bien | Mal | Por qué |
|---|---|---|
| `/tareas` | `/listarTareas` | La acción va en el verbo |
| `/tareas/7` | `/tarea?id=7` | Cada cosa, su dirección |
| `/proyectos/3/tareas` | `/tareasDelProyecto/3` | Se lee como carpetas |

---

## Cinco verbos para todo

| Quiero… | Verbo | Ejemplo |
|---|---|---|
| Crear | `POST` | `POST /tareas` |
| Leer | `GET` | `GET /tareas/7` |
| Sustituir entero | `PUT` | `PUT /tareas/7` |
| Cambiar una parte | `PATCH` | `PATCH /tareas/7` |
| Borrar | `DELETE` | `DELETE /tareas/7` |

> ¿Marcar una tarea como completada: `PUT` o `PATCH`?

---

## PUT frente a PATCH

@diagrama comparacion
PUT | «La tarea 7 es esto, entera» | Mandas todos los campos | Si falta uno, error
PATCH | «De la tarea 7, cambia esto» | Mandas solo lo que cambia | El resto se queda igual

Como **reescribir una ficha entera** frente a **corregir una casilla**.

---

## Seguro e idempotente

| Verbo | Seguro (no cambia nada) | Idempotente (repetir deja lo mismo) |
|---|---|---|
| `GET` | Sí | Sí |
| `PUT` · `DELETE` | No | Sí |
| `POST` | No | **No** |
| `PATCH` | No | No necesariamente |

---

## Por qué importa repetir

Pagas en una tienda online, la conexión se corta y **no sabes si ha llegado**.

- Si repetir es seguro (idempotente), reintentas tranquilo
- Si no lo es (un `POST`), **puedes pagar dos veces**

> La red falla siempre. Una API bien diseñada lo tiene en cuenta (lo veremos en S4).

---

## El código, por familias

@diagrama rejilla
2xx* | Ha ido bien
3xx | Mira en otro sitio, o lo que tienes vale
4xx | Revisa lo que has pedido
5xx | Se ha roto el servidor

No hay que aprenderse sesenta: **la primera cifra ya dice de quién es el problema**.

---

## Los que vas a usar

| Código | Significa |
|---|---|
| `200` · `201` · `204` | Bien · Creado · Hecho, nada que devolver |
| `400` | Lo que mandas está mal |
| `401` · `403` | No sé quién eres · Sé quién eres, pero no puedes |
| `404` · `409` | No existe · Choca con lo que hay |
| `500` | Error del servidor |

---

## Los errores también son respuestas

Un error bien hecho dice **qué ha pasado y cómo arreglarlo**:

`400` · `{"title":"Petición no válida","detail":"El campo «titulo» es obligatorio"}`

Un error mal hecho solo dice «algo ha ido mal», o devuelve una página HTML.

> Quien usa tu API no ve tu código: **solo ve tus respuestas**.

---

## JSON en dos minutos

@diagrama rejilla
Objeto | { "titulo": "Leer el contrato" }
Lista | [ 1, 2, 3 ]
Valores | texto, número, true/false, null
Fechas | Texto ISO: "2026-11-16T09:00:00Z"

Nombres siempre **entre comillas dobles**. Sin comentarios. **Sin coma al final.**

---

## Un JSON de verdad

`{ "items": [ { "id": 1, "titulo": "Instalar Node", "completada": true }, … ] }`

1. Un objeto con un campo `items`
2. `items` es una lista (corchetes) de tareas
3. Cada tarea es un objeto: `id` número, `titulo` texto, `completada` verdadero o falso

> Léelo en voz alta: es **una ficha escrita para que la lea un programa**.

---

## En la terminal: crear y repetir

1. `POST /tareas` con `-H "Content-Type: application/json"` y `-d '{…}'`
2. Vuelve `201 Created` y `Location: /tareas/3`
3. Dos `POST` iguales: **dos tareas** distintas
4. `DELETE /tareas/1`: 404… debería ser `405`

Referencia rápida · §5–§6

---

## El bug del día: esto devuelve 500, ¿por qué?

1. `POST` con `{"titulo":"…",}`: la coma de más
2. Vuelve `500`. ¿De quién es la culpa?
3. El log del servidor dice `status: 400`
4. Arreglo: `res.status(err.status ?? 500)`

> Lo primero cuando algo falla: **leer el log del servidor**.

Referencia rápida · §7

---

## Tu turno 2: ¿qué verbo y qué código? (e02)

Diez situaciones con tareas y proyectos. Para cada una: **verbo, ruta y código**,
en `ejercicios/s01/src/respuestas/verbos.ts`.
La 1, la 3 y la 5, compruébalas también con `curl -i` contra la API de ejemplo.

> **Lo tienes si** `npm run comprobar s01 e02` da `[ OK ]`.

**Si acabas antes:** las rutas de los comentarios de una tarea. Referencia rápida · §8

---

## @seccion Manos en el código: TypeScript y Express

---

## Las piezas de nuestra API

@diagrama capas
Express* | Recibe las peticiones y las reparte a cada ruta
TypeScript | JavaScript con tipos: avisa de errores antes de ejecutar
Node.js | Ejecuta JavaScript fuera del navegador, en el servidor
npm | Instala las librerías y lanza las órdenes del proyecto

---

## Node.js y npm

- **Node.js** ejecuta JavaScript en el servidor, no solo en el navegador
- **npm** descarga librerías (paquetes) y guarda la lista en `package.json`
- `npm run <algo>` lanza una orden apuntada en `package.json`

| Orden | Qué hace |
|---|---|
| `npm run dev:s01` | Arranca la API de los ejercicios |
| `npm run typecheck` | Comprueba los tipos |
| `npm run comprobar s01` | Pasa las pruebas de la sesión 1 |

---

## En el código: los ejercicios de hoy

1. Para la API de ejemplo (`Ctrl+C`)
2. `cd ejercicios`
3. `npm run comprobar s01`: e01 y e02 ya en `[ OK ]`
4. Cada `[FALTA]`: qué comprobación falla y una pista

![FOTO 5] npm run comprobar con un ejercicio sin hacer: qué falla y la pista en español

Referencia rápida · §9

---

## Qué es una prueba automática

Un programa que **usa tu API y comprueba las respuestas**: «pido `GET /salud`, espero un 200».

- Las pruebas ya están escritas: tú escribes el código que las cumple
- `[ OK ]` es que cumple; `[FALTA]`, que no, y por qué
- Cualquier solución vale **si cumple lo pedido**

---

## TypeScript: por qué tipos

@diagrama comparacion
JavaScript | completada: "sí" en lugar de true | Nadie avisa | Falla en producción, delante del usuario
TypeScript | completada: "sí" en lugar de true | Subrayado en rojo al escribir | Lo arreglas antes de ejecutar

Los tipos **desaparecen al ejecutar**: no hacen el programa más lento.

---

## TypeScript: lo justo

| TypeScript | Qué es |
|---|---|
| `string` · `number` · `boolean` | Texto · número · verdadero o falso |
| `Tarea[]` | Lista de tareas |
| `campo?: string` | Opcional |
| `"alta"`, `"media"` o `"baja"` (unión) | Solo uno de estos |

---

## Leer una interface

`interface Tarea { id: number; titulo: string; completada: boolean; }`

1. `interface Tarea`: así es **una tarea**
2. `id: number`: tiene un `id`, que es un número
3. `titulo: string`: un título, que es texto
4. `completada: boolean`: verdadero o falso

> Es la **plantilla de la ficha**: TypeScript comprueba que cada tarea la cumple.

---

## En el código: romper un tipo

1. Abre `s01/src/datos.ts`: la `interface Tarea`
2. Cambia `completada: true` por `completada: "sí"`
3. `npm run typecheck`: fichero, línea y qué pasa
4. Deshazlo: **no sale nada, y eso es bueno**

![FOTO 4] npm run typecheck con un error de tipos: fichero, línea y explicación

Referencia rápida · §10

---

## El proyecto por dentro

@diagrama comparacion
tsx watch | Ejecuta TypeScript tal cual | Reinicia al guardar | No mira los tipos
tsc --noEmit | Solo comprueba los tipos | No genera nada | Es npm run typecheck

En los `import` propios, **`.js` al final** aunque el fichero sea `.ts`.

Referencia rápida · §11

---

## Express en tres líneas

@diagrama flujo
GET /salud -> app.get("/salud", …) -> res.json({ estado: "ok" })!

Una **aplicación**, una **ruta** y una **función** que recibe `req` y contesta con `res`.

---

## Anatomía de una ruta

`app.get("/salud", (req, res) => { res.json({ estado: "ok" }); });`

| Trozo | Qué significa |
|---|---|
| `app.get` | Cuando llegue un `GET`… |
| `"/salud"` | …a esta ruta… |
| `(req, res) => { … }` | …ejecuta esta función |
| `req` | La petición: lo que ha llegado |
| `res.json(…)` | La respuesta: contesta con este JSON (y un 200) |

---

## En el código: GET /salud

1. Quita el `//` del `import` de los datos
2. Escribe la ruta bajo `// Ejercicio 3`
3. `npm run dev:s01` y `curl -i localhost:3000/salud`
4. `npm run comprobar s01 e03`

![FOTO 6] La API de los ejercicios arrancada con npm run dev:s01

Referencia rápida · §12

---

## Tu turno 3: listar y tipar

1. **e04:** `GET /tareas` → 200 con `{ "items": [ … ] }`
2. **e05:** `prioridad?: "alta" | "media" | "baja"`, y la tarea 2 en `"alta"`

> **Lo tienes si** `npm run typecheck` sale limpio y `npm run comprobar s01 e04` y `e05` dan `[ OK ]`.

**Si acabas antes, e06:** `GET /tareas?completada=true`. Referencia rápida · §13

---

## @seccion Una tarea, o 404

---

## Dos formas de pasar datos en la URL

| Forma | Ejemplo | En Express | Para qué |
|---|---|---|---|
| Parámetro de ruta | `/tareas/2` | `req.params.id` | Cuál: identifica el recurso |
| Parámetro de consulta | `/tareas?completada=true` | `req.query.completada` | Cómo: filtra u ordena |

En los dos casos **llega texto**, aunque parezca un número.

---

## Buscar una tarea en la lista

`tareas.find((t) => t.id === 2)`

1. `tareas.find(…)` recorre la lista y devuelve **la primera** que cumple
2. `(t) => t.id === 2`: para cada tarea `t`, ¿su `id` es 2?
3. Si ninguna cumple, devuelve `undefined`: **ahí va el 404**

---

## Todo lo que llega en la URL es texto

1. `app.get("/tareas/:id", …)`: el hueco llega en `req.params.id`
2. `t.id === req.params.id` → `TS2367`
3. `"2"` no es `2`: **`Number(req.params.id)`**

![FOTO 7] comprobar del ejercicio de una tarea con el error típico: el id como texto y el 404 sin problem+json

Referencia rápida · §14

---

## Un 404 que explica el error

`Content-Type: application/problem+json` (RFC 9457)

| Campo | Qué dice |
|---|---|
| `title` | Qué pasa, en corto: «No encontrado» |
| `status` | El código: `404` |
| `detail` | Este caso: «No hay ninguna tarea con id 99» |

Referencia rápida · §15

---

## if y return: cortar a tiempo

1. `if (!tarea)`: si no la hemos encontrado…
2. `noEncontrado(res, "…")`: …contestamos 404…
3. `return;`: …**y paramos aquí**
4. Si no paramos, el código sigue y se intenta contestar dos veces: error

> Una petición, **una sola** respuesta.

---

## El orden importa

@diagrama capas
GET /salud | ¿Encaja? Contesta y se acaba
GET /tareas/resumen | Si no, la siguiente: antes que /tareas/:id
GET /tareas/:id | Encaja con cualquier cosa: /tareas/2, /tareas/resumen…
Manejador final* | Nada encajó: 404 en problem+json

Lo concreto, **antes** que lo genérico. Sin manejador final, Express contesta con **una página HTML**.

---

## Lo que hace comprobar por dentro

1. `request(crearApp()).get("/salud")`
2. `expect(res.status, "pista").toBe(200)`

Una petición **sin abrir puerto** y una comparación.
El título del `it` es el criterio; el segundo argumento, la pista.

Referencia rápida · R4

---

## Tu turno 4: una tarea, o 404

1. **e07, para todos:** `GET /tareas/2` → 200; `GET /tareas/99` → 404 con `application/problem+json`
2. **e08, si acabas e07:** `GET /tareas/resumen` → `{ total, completadas, pendientes }`
3. **e09, reto:** las etiquetas y el manejador final

> **Lo tienes si** `npm run comprobar s01 e07` da `[ OK ] (4/4)`.

Referencia rápida · §16

---

## Así se ve cuando está bien

![FOTO 2] curl -i a /tareas/99 y /no-existe: 404 con application/problem+json

`npm run comprobar s01` → **9 de 9 ejercicios superados** (o 7 de 9 sin los dos retos).

---

## @seccion Cierre

---

## Lo que hemos hecho hoy

@diagrama flujo
Petición y respuesta -> Verbos y códigos -> TypeScript -> Express con 404!

Los códigos y los errores **son parte del diseño**, no un detalle.

---

## Cuestionario

Diez preguntas, en el chat o en `docs/cuestionarios/cuestionario-sesion-01.pdf`.

> Treinta segundos por pregunta. Contesta con la letra.

---

## Guarda tu trabajo

1. `git branch --show-current`: tu rama
2. `git add -A` y `git commit -m "s01: ejercicios"`
3. `git push`
4. Para el codespace: **Stop**, no lo borres

Referencia rápida · §17

---

## Si te sobra tiempo: la práctica 1

`docs/prácticas/practica-01.pdf` · una hora

Repite lo de hoy con **otro recurso, los proyectos**: su tipo, sus rutas,
su 404 y tus propias peticiones de prueba.

> Lo que no termines, en casa. **Mañana empezamos con vuestras dudas** de la práctica.

---

## Mañana, en S2

@diagrama rejilla
CRUD completo* | POST, PUT, PATCH y DELETE bien diseñados
Validación | Zod: lo que llega tiene sentido
Errores | Un manejador central con problem+json
Middleware | Lo que lleva una API en producción

Empezamos con **las dudas de la práctica 1**, en `ejercicios/s02`.

---

## @fin Gracias

¿Dudas?

---

## @seccion Reserva

---

## HTTP a mano: es solo texto

`printf 'GET /salud HTTP/1.1\r\nHost: localhost\r\n…' | nc localhost 3000`

Sin `curl` ni navegador: escribes el texto de una petición
y el servidor contesta con el texto de una respuesta.

Referencia rápida · R1

---

## La caché de HTTP: ETag y 304

1. `curl -sI https://api.github.com/repos/nodejs/node` → `etag`
2. La misma petición con `If-None-Match: <etag>`
3. Vuelve `304`, **sin cuerpo**: lo que tienes sigue valiendo

Sin identificarte, GitHub deja **60 peticiones por hora**. Referencia rápida · R2

---

## El contrato y Swagger UI

![FOTO 9] Swagger UI de la API de ejemplo en /docs

`openapi.yaml` describe la API, y `/docs` la enseña y la deja probar.
Es **la carta del restaurante**: la S3.

Referencia rápida · R5

---

## Diseña las rutas de tu mundo

> ¿Qué dos o tres «cosas» maneja vuestra aplicación principal?

Para cada una: `GET` la lista, `GET` una, `POST`, `PATCH`, `DELETE`,
una relación anidada y un estado con valores cerrados.
