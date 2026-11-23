# S3 · Referencia rápida — Del contrato a los casos de prueba

> Los pasos y todo lo que se copia en la sesión 3, en el orden de la presentación
> ([`s03-qa.pdf`](presentaciones/s03-qa.pdf)). Hoy no se programa: se arranca la API de
> Sorteos, se lee su contrato y se prueba con Swagger UI, en el navegador.

| § | Dónde | Qué |
|---|---|---|
| 0 | Terminal del codespace | Traer el material nuevo y arrancar la API |
| 1 | Navegador | Direcciones, usuarios y datos de partida |
| 2 | `practicas/s03/versiones` y Swagger Editor | Las partes del contrato y práctica 1: ¿qué versión es? |
| 3 | `practicas/s03/requisitos.csv` | Práctica 2: tu tabla de requisitos |
| 4 | Swagger UI | Probar una operación con «Try it out» |
| 5 | Swagger UI | Pedir un token y usarlo con «Authorize» |
| 6 | Swagger UI | Cómo escribir un cuerpo de prueba |
| 7 | Swagger UI de la candidata | Práctica 3: ¿qué incumple la candidata? |
| 8 | `practicas/s03/casos.md` y `matriz.md` | Práctica 4: tu batería de casos |
| 9 | Terminal | Guardar tu trabajo |
| 10 | | Si algo falla |

Todas las rutas de ficheros son relativas a `docs/ejemplos/api-sorteos/`.

## §0 · Traer el material nuevo y arrancar la API

Abre tu codespace de siempre. En la terminal, desde la raíz del repositorio:

```bash
git branch --show-current                       # alumno/<tu-nombre>
git pull --no-rebase --no-edit origin main      # trae la API de Sorteos a tu rama
cd docs/ejemplos/api-sorteos
./arrancar.sh
```

`git pull` solo hace falta la primera vez: añade a tu rama la API y el material de las
sesiones 3 y 4 sin tocar tus ejercicios.

`./arrancar.sh` arranca **dos versiones** de la misma API y escribe sus direcciones:

```text
  Versión estable   → https://<tu-codespace>-3000.app.github.dev/docs
  Versión candidata → https://<tu-codespace>-3001.app.github.dev/docs
```

Abre la de la versión estable (Ctrl+clic en la terminal). Deja esa terminal abierta: si la
cierras o pulsas Ctrl+C, la API se para.

**Comprobar:** en Swagger UI, `GET /salud` → Try it out → Execute devuelve
`"version": "estable"`.

## §1 · Direcciones, usuarios y datos de partida

| Qué | Dónde |
|---|---|
| Swagger UI de la estable (la que está «en producción») | `…-3000.app.github.dev/docs` |
| Swagger UI de la candidata (la que hay que validar) | `…-3001.app.github.dev/docs` |
| Contrato en OpenAPI 3.0 | [`openapi.yaml`](../ejemplos/api-sorteos/openapi.yaml), o `/openapi.json` en la API |
| El mismo contrato en Swagger 2.0 | [`swagger2.yaml`](../ejemplos/api-sorteos/swagger2.yaml), o `/swagger2.json` |

Usuarios de prueba (también están en la cabecera de Swagger UI):

| Usuario | Clave | Puede |
|---|---|---|
| `ana` | `ana-practicas` | consultar y apostar |
| `luis` | `luis-practicas` | solo consultar |

Datos con los que arranca la API (se reinician cada vez que la arrancas):

| Sorteo | Estado | Precio |
|---|---|---|
| 1 · Sorteo Semanal 45 | celebrado (tiene resultado) | 1,5 |
| 2 · Sorteo Diario 318 | celebrado (tiene resultado) | 0,5 |
| 3 · Sorteo Semanal 46 | **cerrado** | 1,5 |
| 4 · Sorteo Diario 322 | **abierto** | 0,5 |
| 5 · Sorteo Semanal 47 | **abierto** | 1,5 |

| Apuesta | De | Sorteo |
|---|---|---|
| 1 | ana | 1 |
| 2 | ana | 5 |
| 3 | luis | 4 |

## §2 · Práctica 1: ¿qué versión es? (25 min)

Antes de empezar, el mapa del contrato. Un contrato OpenAPI empieza por la línea de la versión y
tiene cuatro bloques principales (en VS Code, Ctrl+K Ctrl+0 lo pliega y solo se ven ellos):

| Bloque | Qué contiene |
|---|---|
| `openapi` | La versión de la especificación (el formato del fichero) |
| `info` | El nombre de la API, su descripción y la versión de la API |
| `servers` | Dónde está la API |
| `paths` | Las rutas y, en cada una, sus operaciones (`get`, `post`, `delete`…), con lo que reciben (`parameters`, `requestBody`) y lo que devuelven (`responses`) |
| `components` | Las piezas que se reutilizan: esquemas de datos, respuestas de error y seguridad. Se usan con `$ref` |

Para leer y editar el YAML:

- La **sangría** dice qué va dentro de qué: siempre con **espacios**, nunca con tabuladores.
- `clave: valor`, con un espacio después de los dos puntos.
- Una línea que empieza por `-` es un elemento de una lista.
- `{ type: integer }` y `[sorteoId, numeros]` son la forma corta de un objeto y de una lista.
- `#` empieza un comentario.
- `$ref: "#/components/schemas/ApuestaNueva"` se lee como una ruta: en este fichero (`#`),
  dentro de `components`, en `schemas`, el esquema `ApuestaNueva`.

Todo se responde en la plantilla **`practicas/s03/versiones/respuestas.md`**: ábrela en VS
Code y escribe donde están los `…`.

1. **Parte 1 (8 min).** Abre `fragmento-a.yaml`, `fragmento-b.yaml` y `fragmento-c.yaml`,
   en la misma carpeta. Les falta la línea que dice la versión: dedúcela por su estructura
   y apunta al menos dos líneas que lo demuestren. La tabla «Diferencias prácticas entre
   versiones» de la presentación es tu chuleta.
2. **Parte 2 (7 min).** Abre <https://editor.swagger.io>. Abre `openapi.yaml` en VS Code,
   selecciónalo todo (Ctrl+A), cópialo (Ctrl+C) y pégalo en la parte izquierda del editor,
   sustituyendo lo que hubiera. Con el YAML a la izquierda y la documentación a la derecha,
   contesta las preguntas de la plantilla sobre las partes del contrato.
3. **Parte 3 (10 min).** Abre `fragmento-b-migrado.yaml`, una copia del fragmento B, y
   reescríbelo en OpenAPI 3.0 tomando como modelo el fragmento C. Para comprobarlo, pégalo
   en el editor: no debe marcar ningún error.

Los datos son ficticios: no pasa nada por pegarlos en el editor online. Con contratos del
trabajo, usa la herramienta que tengáis aprobada.

## §3 · Práctica 2: tu tabla de requisitos (25 min)

Abre `practicas/s03/requisitos.csv`. Es un CSV separado por **punto y coma**: puedes
editarlo directamente en VS Code o descargarlo (clic derecho → Descargar) y abrirlo con
Excel.

```text
ID;Requisito;Origen en el contrato (operación, campo o respuesta);Tipo (éxito / error)
REQ-01;Se pueden listar los sorteos filtrando por estado;GET /sorteos · parámetro estado;éxito
REQ-02;Un sorteo que no existe responde 404;GET /sorteos/{id} · respuesta 404;error
```

1. Recorre el contrato operación a operación en Swagger UI.
2. Por cada operación, al menos un requisito de éxito y uno de error.
3. Repasa los esquemas (abajo del todo en Swagger UI, «Schemas»): campos obligatorios
   (`required`), rangos (`minimum`, `maximum`), tamaños (`minItems`, `maxItems`), sin
   repetidos (`uniqueItems`) y valores permitidos (`enum`).
4. Pon a cada requisito su ID y su origen en el contrato.

Un requisito verificable es atómico, comprobable y con origen. Mal: «la apuesta se valida
bien». Bien: «una apuesta con un número repetido se rechaza con 400».

**Entrega:** al menos 12 requisitos.

## §4 · Probar una operación con «Try it out»

1. Despliega la operación, por ejemplo `GET /sorteos`.
2. Pulsa **Try it out**.
3. Rellena los parámetros: `estado` = `abierto`.
4. Pulsa **Execute**.
5. Lee la respuesta:

   | Mira | Pregunta |
   |---|---|
   | Code | ¿Es uno de los códigos que el contrato declara para esa operación? |
   | Response body | ¿Tiene los campos obligatorios, con su tipo? ¿Los valores son los esperados? |
   | Response headers | `content-type`, `location`… |
   | Curl y Request URL | Es la evidencia: cópialos si la prueba falla |

### Cuando Swagger UI no te deja enviar el dato

Swagger UI respeta el contrato: si un parámetro tiene valores permitidos (`enum`), solo deja
elegir uno de ellos. Para probar un valor no permitido, sáltatelo:

- **En el navegador** (peticiones `GET` sin token): escribe la dirección a mano, por ejemplo
  `https://<tu-codespace>-3000.app.github.dev/sorteos?estado=otro`. Verás el cuerpo de la
  respuesta, pero no el código.
- **En la terminal del codespace**, con `curl` y `localhost` (no la dirección
  `…app.github.dev`, que pide iniciar sesión en GitHub):

  ```bash
  curl -i 'http://localhost:3000/sorteos?estado=otro'     # estable
  curl -i 'http://localhost:3001/sorteos?estado=otro'     # candidata
  ```

  `-i` enseña el código de estado y las cabeceras además del cuerpo.

## §5 · Pedir un token y usarlo con «Authorize»

Las operaciones con candado (las de `/apuestas`) piden token.

1. Despliega `POST /auth/token` → Try it out y pega este cuerpo → Execute:

   ```json
   { "usuario": "ana", "clave": "ana-practicas" }
   ```

   Para luis: `{ "usuario": "luis", "clave": "luis-practicas" }`.

2. De la respuesta, copia **solo** el valor de `access_token`: lo que va entre comillas,
   sin las comillas.
3. Arriba del todo, botón **Authorize** → en `bearerAuth` pega el token → **Authorize** →
   **Close**. No hace falta escribir `Bearer`: Swagger UI lo añade solo.
4. Prueba `GET /apuestas`: devuelve las apuestas de ana.

El token caduca a los 30 minutos: si de repente todo da 401, pide otro y vuelve a pulsar
Authorize. Para cambiar de usuario: Authorize → **Logout** y pega el otro token.

El mismo token vale para la estable y para la candidata, pero cada Swagger UI tiene su
propio botón Authorize: hay que pegarlo en las dos.

## §6 · Cómo escribir un cuerpo de prueba

`POST /apuestas` lleva un cuerpo JSON. Este es el de una apuesta válida en el sorteo 4:

```json
{"sorteoId": 4, "numeros": [3, 12, 21, 30, 39, 48]}
```

Para un caso negativo o de límite, copia ese cuerpo y cambia **solo un dato** cada vez: así,
si la respuesta no es la esperada, sabes qué la ha provocado. Qué datos cambiar y qué
debería responder la API lo sacas del contrato: es el trabajo de las prácticas.

Cuando la API rechaza algo, responde en formato `application/problem+json`: `title`,
`status`, `detail` y, si son datos no válidos, la lista `errores` con el campo que falla.

## §7 · Práctica 3: ¿qué incumple la candidata? (25 min)

1. Abre la Swagger UI de la **candidata**: la dirección que acaba en `-3001…/docs`.
2. Pide un token (§5) y pégalo en su Authorize.
3. Recorre tus requisitos y pruébalos en la candidata.
4. Si dudas de lo que debería pasar, lanza la misma petición en la estable.
5. Apunta cada defecto en **`practicas/s03/defectos.csv`**: su requisito, lo que enviaste,
   lo esperado según el contrato, lo obtenido, el curl y la respuesta, y su gravedad. La
   fila DEF-01, el defecto del sorteo 99 que vemos juntos, va de ejemplo.

No te quedes en los casos que funcionan: prueba también con datos «malos».

## §8 · Práctica 4: tu batería de casos (25 min)

Abre `practicas/s03/casos.md`: es una tabla, con la primera fila de ejemplo. En VS Code,
**Ctrl+Shift+V** abre la vista previa y la enseña como tabla; edítala en el texto, una fila
por caso. Si ya empezaste en `casos.csv`, puedes seguir allí.

1. **Guiado: `POST /apuestas`.** Convierte en casos las tablas de partición de equivalencia
   y de valores límite de la presentación: un caso por grupo y uno por cada valor límite.
2. **Tú solo: `GET /sorteos/{id}` y `DELETE /apuestas/{id}`.** Aquí no hay tabla: busca en
   el contrato sus parámetros, sus reglas y sus respuestas, y saca tú los grupos y los
   límites. Piensa también en quién hace la petición y sobre qué datos (§1).
3. Que haya al menos un caso por cada código de respuesta que declara el contrato para esas
   operaciones.
4. Ejecuta cada caso en las dos versiones y anota «pasa» o «falla» en sus columnas.
5. Rellena `practicas/s03/matriz.md`: cada requisito con sus casos y cuántos son
   positivos, negativos, de límite y de seguridad. Marca los requisitos sin casos: son
   huecos de cobertura.

Anular una apuesta cambia los datos: si necesitas volver a los de partida, Ctrl+C y
`./arrancar.sh`.

El esperado de un caso tiene tres partes: **código**, **esquema** (qué campos y de qué
tipo) y **datos** (qué valores).

**Entrega:** al menos 15 casos de las tres operaciones y la matriz. Mañana esta batería se automatiza en ReadyAPI:
guárdala.

## §9 · Guardar tu trabajo

En una terminal nueva (la de la API sigue ocupada: icono **+** del panel de terminales),
desde la raíz del repositorio:

```bash
git branch --show-current                  # alumno/<tu-nombre>, no main
git add -A
git commit -m "s03: requisitos, casos y matriz"
git push
```

## §10 · Si algo falla

| Síntoma | Solución |
|---|---|
| `cd: no such file or directory: docs/ejemplos/api-sorteos` | Falta el `git pull` de §0. Antes, vuelve a la raíz con `cd /workspaces/*` |
| `git pull` dice que hay un conflicto | Avisa al formador y sigue la sesión en pantalla con un compañero |
| `./arrancar.sh: Permission denied` | `bash arrancar.sh` |
| `address already in use` | Ya estaba arrancada en otra terminal: usa esa, o ciérrala y vuelve a arrancar |
| La dirección pide iniciar sesión en GitHub | Normal la primera vez: entra con tu cuenta |
| Todo da 401 | El token ha caducado (30 min) o no lo has pegado en el Authorize de esa versión |
| Los datos no son los de §1 | Has creado o anulado apuestas: Ctrl+C y `./arrancar.sh` las reinicia |
