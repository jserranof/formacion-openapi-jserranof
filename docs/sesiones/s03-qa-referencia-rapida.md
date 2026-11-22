# S3 · Referencia rápida — Del contrato a los casos de prueba

> Los pasos y todo lo que se copia en la sesión 3, en el orden de la presentación
> ([`s03-qa.pdf`](presentaciones/s03-qa.pdf)). Hoy no se programa: se arranca la API de
> Sorteos, se lee su contrato y se prueba con Swagger UI, en el navegador.

| § | Dónde | Qué |
|---|---|---|
| 0 | Terminal del codespace | Traer el material nuevo y arrancar la API |
| 1 | Navegador | Direcciones, usuarios y datos de partida |
| 2 | `practicas/s03/versiones` y Swagger Editor | Práctica 1: ¿qué versión es? |
| 3 | `practicas/s03/requisitos.csv` | Práctica 2: tu tabla de requisitos |
| 4 | Swagger UI | Probar una operación con «Try it out» |
| 5 | Swagger UI | Pedir un token y usarlo con «Authorize» |
| 6 | Swagger UI | Cuerpos de prueba listos para copiar |
| 7 | Swagger UI de la candidata | Práctica 3: ¿qué incumple la candidata? |
| 8 | `practicas/s03/casos.csv` y `matriz.csv` | Práctica 4: tu batería de casos |
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

Se responde en la plantilla **`practicas/s03/versiones/respuestas.md`**: ábrela en VS Code y
escribe donde están los `…`. Tiene tres partes.

1. **Parte 1.** En la misma carpeta abre `fragmento-a.yaml`, `fragmento-b.yaml` y
   `fragmento-c.yaml`.
2. Para cada uno, anota su versión y la línea que la delata:

   | Si la primera línea es… | Es… |
   |---|---|
   | `swagger: "2.0"` | Swagger 2.0 |
   | `openapi: 3.0.x` | OpenAPI 3.0 |
   | `openapi: 3.1.x` | OpenAPI 3.1 |

3. **Parte 2.** Abre <https://editor.swagger.io>. Abre `openapi.yaml` en VS Code, selecciónalo todo
   (Ctrl+A), cópialo (Ctrl+C) y pégalo en la parte izquierda del editor, sustituyendo lo
   que hubiera.
4. En la parte derecha, despliega `POST /apuestas`: ¿qué datos pide, con qué reglas, qué
   respuestas puede devolver y si pide autenticación?
5. **Parte 3.** Migración: en el fragmento 2.0, señala qué cambiaría al pasarlo a 3.x. Guíate por la
   tabla «Migrar de 2.0 a 3.x» de la presentación: `host`/`basePath` → `servers`,
   `in: body` → `requestBody`, `definitions` → `components/schemas`…

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

## §6 · Cuerpos de prueba listos para copiar

Todos son para `POST /apuestas`, con el token de ana salvo que se diga otra cosa.

| Escenario | Cuerpo | Esperado según el contrato |
|---|---|---|
| Apuesta válida | `{"sorteoId": 4, "numeros": [3, 12, 21, 30, 39, 48]}` | 201 y cabecera `location` |
| Un número repetido | `{"sorteoId": 4, "numeros": [1, 1, 2, 3, 4, 5]}` | 400 |
| Solo cinco números | `{"sorteoId": 4, "numeros": [1, 2, 3, 4, 5]}` | 400 |
| Siete números | `{"sorteoId": 4, "numeros": [1, 2, 3, 4, 5, 6, 7]}` | 400 |
| Límite inferior fuera: 0 | `{"sorteoId": 4, "numeros": [0, 2, 3, 4, 5, 6]}` | 400 |
| Límite superior fuera: 50 | `{"sorteoId": 4, "numeros": [1, 2, 3, 4, 5, 50]}` | 400 |
| Límites dentro: 1 y 49 | `{"sorteoId": 4, "numeros": [1, 2, 3, 4, 5, 49]}` | 201 |
| Sorteo cerrado | `{"sorteoId": 3, "numeros": [1, 2, 3, 4, 5, 6]}` | 409 |
| Sorteo que no existe | `{"sorteoId": 99, "numeros": [1, 2, 3, 4, 5, 6]}` | 404 |
| Sin permiso (token de luis) | `{"sorteoId": 4, "numeros": [1, 2, 3, 4, 5, 6]}` | 403 |
| Sin token (Authorize → Logout) | cualquiera de los anteriores | 401 |

Otras peticiones útiles:

| Petición | Esperado |
|---|---|
| `GET /sorteos/5` | 200 con el sorteo 5 |
| `GET /sorteos/99` | 404 con `application/problem+json` |
| `GET /sorteos?estado=abierto` | 200 con los sorteos 4 y 5 |
| `GET /sorteos?estado=otro` | 400 |
| `GET /sorteos/1/resultado` | 200 con la combinación ganadora |
| `GET /apuestas/3` con el token de ana | 404: la apuesta 3 es de luis |

Cuando la API rechaza algo, responde en formato `application/problem+json`: `title`,
`status`, `detail` y, si son datos no válidos, la lista `errores` con el campo que falla.

## §7 · Práctica 3: ¿qué incumple la candidata? (25 min)

1. Abre la Swagger UI de la **candidata**: la dirección que acaba en `-3001…/docs`.
2. Pide un token (§5) y pégalo en su Authorize.
3. Recorre tus requisitos y pruébalos en la candidata. Los cuerpos de §6 te sirven.
4. Si dudas de lo que debería pasar, lanza la misma petición en la estable.
5. Por cada diferencia con el contrato, guarda el **curl** y la **respuesta**, y anota qué
   requisito incumple.

Pista: no te quedes en los casos que funcionan. Prueba datos «malos», límites, otros
usuarios y fíjate también en los tipos de los campos y en las cabeceras.

**Entrega:** lista de defectos, cada uno con su requisito, el curl y la respuesta obtenida.

## §8 · Práctica 4: tu batería de casos (25 min)

Abre `practicas/s03/casos.csv`. La primera fila ya está hecha como ejemplo:

```text
CP-01;Apuesta válida en sorteo abierto;REQ-03;positivo;Token de ana;POST /apuestas;{"sorteoId": 4, "numeros": [3,12,21,30,39,48]};201;Apuesta con estado activa e importe 0.5;;;
```

1. Aplica **partición de equivalencia** a los datos de `POST /apuestas`: un caso por
   grupo (cantidad de números, rango, repetidos, estado del sorteo, token).
2. Añade los **valores límite**: 0, 1, 49 y 50; 5, 6 y 7 números.
3. Incluye casos que provoquen 400, 404 y 409.
4. Ejecuta cada caso en las dos versiones y anota «pasa» o «falla» en sus columnas.
5. Rellena `practicas/s03/matriz.csv`: cada requisito con sus casos y cuántos son
   positivos, negativos, de límite y de seguridad. Marca los requisitos sin casos: son
   huecos de cobertura.

El esperado de un caso tiene tres partes: **código**, **esquema** (qué campos y de qué
tipo) y **datos** (qué valores).

**Entrega:** al menos 12 casos y la matriz. Mañana esta batería se automatiza en ReadyAPI:
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
