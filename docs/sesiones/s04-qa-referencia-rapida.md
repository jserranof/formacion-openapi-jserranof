# S4 · Referencia rápida — Seguridad, automatización y trazabilidad

> Los pasos y todo lo que se copia en la sesión 4, en el orden de la presentación
> ([`s04-qa.pdf`](presentaciones/s04-qa.pdf)). Seguimos con la API de Sorteos; hoy entra
> ReadyAPI, que se ejecuta en **tu equipo**, no en el codespace.

| § | Dónde | Qué |
|---|---|---|
| 0 | Codespace | Arrancar la API y hacer públicos los puertos |
| 1 | Swagger UI | Token de usuario y token caducado |
| 2 | Swagger UI | OAuth2 Client Credentials |
| 3 | Decodificador de JWT | Ver lo que lleva un token |
| 4 | `practicas/s04/casos-seguridad.md` | Práctica 1: pruebas de seguridad |
| 5 | ReadyAPI | Paso a paso: el proyecto y el primer caso con su token |
| 6 | ReadyAPI | Práctica 2: tu suite en ReadyAPI |
| 7 | ReadyAPI | Práctica 3: estable frente a candidata |
| 8 | Terminal de tu equipo | Ejecutar la suite por línea de comandos |
| 9 | `informe-defecto.md` y `matriz-completa.md` | Taller final: el ciclo completo |
| 10 | Terminal | Guardar tu trabajo |
| 11 | | Si algo falla |
| 12 | Navegador | Cuestionario final |

Las rutas de ficheros son relativas a `docs/ejemplos/api-sorteos/`. Los usuarios y los
datos de partida están en la [referencia de la sesión 3](s03-qa-referencia-rapida.md), §1.

## §0 · Arrancar la API y hacer públicos los puertos

En la terminal del codespace, desde la raíz del repositorio:

```bash
git pull --no-rebase --no-edit origin main      # trae la solución de ayer y una mejora de la API
cd docs/ejemplos/api-sorteos
./arrancar.sh
```

Si la API ya estaba arrancada, párala con Ctrl+C y vuelve a lanzar `./arrancar.sh` después
del `git pull`.

ReadyAPI está en tu equipo y solo llega a la API si sus puertos son **públicos**:

1. En el panel de abajo, pestaña **PUERTOS** (si no ves el panel: Ctrl+J).
2. Clic derecho en la fila del **3000** → **Visibilidad del puerto** → **Public**.
3. Lo mismo con el **3001**.
4. La columna Visibilidad pasa a poner Public.

Apunta las dos direcciones públicas, que son las que escribió `arrancar.sh` sin el `/docs`
final:

```text
Estable:   https://<tu-codespace>-3000.app.github.dev
Candidata: https://<tu-codespace>-3001.app.github.dev
```

Al terminar la sesión, vuelve a ponerlos en **Private** (mismo menú) o detén el codespace.
Los datos son ficticios, pero no hace falta dejarlos abiertos.

## §1 · Token de usuario y token caducado

Token de ana o luis, como ayer: `POST /auth/token` en Swagger UI.

```json
{ "usuario": "ana", "clave": "ana-practicas" }
```

Para el caso del **token caducado**, abre una terminal nueva en el codespace (icono **+**
del panel de terminales):

```bash
cd docs/ejemplos/api-sorteos
npm run token:caducado
```

Escribe un token de ana que caducó hace una hora: cópialo y úsalo en Authorize.

## §2 · OAuth2 Client Credentials

Aplicaciones de prueba (están en la descripción del contrato):

| client_id | client_secret | Permisos |
|---|---|---|
| `app-consulta` | `secreto-consulta` | `apuestas:leer` |
| `app-gestion` | `secreto-gestion` | `apuestas:leer` y `apuestas:escribir` |

**Con Swagger UI:** Authorize → bloque **oauth2 (OAuth2, clientCredentials)** → escribe
`client_id` y `client_secret`, marca los permisos que pides → **Authorize** → Close.
Swagger UI pide el token y lo usa solo.

**La petición por dentro** (la usarás en el caso CS-04 de la práctica 1, desde la operación
`POST /oauth/token` de Swagger UI): `POST /oauth/token`
con el cuerpo como formulario (`application/x-www-form-urlencoded`), no como JSON:

```text
grant_type=client_credentials&client_id=app-consulta&client_secret=secreto-consulta&scope=apuestas:leer
```

| Prueba | Esperado |
|---|---|
| `app-consulta` con su secreto | 200 con `access_token` y `scope: apuestas:leer` |
| `app-consulta` con otro secreto | 401 `invalid_client` |
| `app-consulta` pidiendo `apuestas:escribir` | 400 `invalid_scope` |
| Token de `app-consulta` → `GET /apuestas` | 200 |
| Token de `app-consulta` → `POST /apuestas` | 403 |

## §3 · Ver lo que lleva un token

Un JWT son tres bloques separados por puntos: `cabecera.contenido.firma`. Pega un token de
**prácticas** en un decodificador de JWT y mira el contenido:

| Campo | Qué es |
|---|---|
| `sub` | Quién es: `ana` |
| `iss` | Quién lo emitió: `api-sorteos-practicas` |
| `iat` · `exp` | Cuándo se creó y cuándo caduca (30 minutos después) |
| `scope` | Qué puede hacer: `apuestas:leer apuestas:escribir` |

Se puede leer porque está **firmado, no cifrado**. Nunca pegues en una web externa un
token real del trabajo.

## §4 · Práctica 1: pruebas de seguridad (25 min)

Abre `practicas/s04/casos-seguridad.md` (Ctrl+Shift+V para verla como tabla) y lanza los
seis casos en la **estable** y después en la **candidata**. Todos con `GET /apuestas` salvo que se diga otra cosa:

| ID | Caso | Cómo | Esperado |
|---|---|---|---|
| CS-01 | Sin credencial | Authorize → Logout, y lanzar la petición | 401 |
| CS-02 | Token manipulado | Pegar en Authorize el token con un carácter cambiado | 401 |
| CS-03 | Token caducado | El de `npm run token:caducado` (§1) | 401 |
| CS-04 | Secreto incorrecto | `POST /oauth/token` con otro `client_secret` | 401 `invalid_client` |
| CS-05 | Permiso insuficiente | `POST /apuestas` con el token de luis o de app-consulta | 403 |
| CS-06 | Datos de otro usuario | `GET /apuestas/3` con el token de ana (la 3 es de luis) | 404 |

Después **diseña dos casos más**, CS-07 y CS-08, en las filas vacías de la plantilla: otra
forma de intentar entrar sin permiso o de ver lo que no es tuyo. Escribe cómo se lanza y qué
debería responder según el contrato, y pruébalos también en las dos versiones.

Anota el resultado en las dos columnas y, si falla, el curl y la respuesta en la columna de
evidencia. Añade los casos que fallen a tu batería y a la matriz.

## §5 · ReadyAPI paso a paso: el proyecto y el primer caso con su token

Antes: puertos 3000 y 3001 públicos (§0). Todo se hace **dentro de ReadyAPI**: no hace falta
Swagger UI ni copiar el token de la práctica 1, porque el caso pide su propio token cada vez
que se ejecuta (el token caduca a los 30 minutos). Si algún nombre de menú no coincide del
todo con tu versión, búscalo con **clic derecho** sobre el elemento.

### A · Crear el proyecto desde el contrato (una sola vez)

1. Menú **File → New Functional Test** (o, en el Dashboard, **New Test → Functional Test**).
2. Elige **API Definition** y pega la URL del contrato → **Next**:

   ```text
   https://<tu-codespace>-3000.app.github.dev/openapi.json
   ```

   Si tu ReadyAPI no acepta el 3.0, usa el mismo contrato en Swagger 2.0:
   `…-3000.app.github.dev/swagger2.json`.
3. Proyecto: deja **New project** → **Next**.
4. Aserciones: deja marcada la del código de estado → **Next**.
5. Elige **Multiple Test Cases** (un caso por operación) → **Create Test**.

En el panel de la izquierda (**Navigator**), dentro de **Functional Tests**, aparece el
proyecto con una suite y un caso por operación. Renombra la suite a **«Apuestas»**
(clic derecho → **Rename**).

### B · El primer caso: CP-05 Apuesta válida

Parte del caso que ha creado ReadyAPI para `POST /apuestas`. Renómbralo a
`CP-05 Apuesta válida` y ábrelo con doble clic (se abre el **editor del caso**).

1. **La propiedad del token.** En el editor del caso, panel **Properties** (abajo) → **+** →
   nombre `token`, valor vacío.
2. **Paso «Pedir token».** Clic derecho en el caso (en el Navigator) → **Add Step → REST
   Request** → elige `POST /auth/token`. En la petición, cuerpo `application/json`:

   ```json
   { "usuario": "ana", "clave": "ana-practicas" }
   ```

   Ejecútala (botón **▶** verde de la petición): tiene que salir 200 con `access_token`.
   Añade la aserción: panel **Assertions** de la petición → **+** → **Valid HTTP Status
   Codes** → `200`.
3. **Paso «Guardar token».** Clic derecho en el caso → **Add Step → Property Transfer**. En
   su editor, **+** (nueva transferencia):
   - **Source:** el paso «Pedir token», **Property** `Response`, **Path language** `JSONPath`,
     y en el cuadro de abajo escribe `$.access_token`.
   - **Target:** el caso de prueba (CP-05) y **Property** `token`.
   - Ejecuta la transferencia (**▶**): la propiedad `token` del caso se rellena.
4. **Ordena los pasos.** Los nuevos se añaden al final: arrástralos en el editor del caso hasta
   dejar **1 · Pedir token**, **2 · Guardar token** y **3 · POST /apuestas**.
5. **La petición que se prueba.** Abre el paso `POST /apuestas`:
   - Panel **Headers** → **+** → nombre `Authorization`, valor
     `Bearer ${#TestCase#token}`.
   - Cuerpo `application/json`:

     ```json
     {"sorteoId": 4, "numeros": [3, 12, 21, 30, 39, 48]}
     ```

   - Aserciones: la del código de estado con `201`, y **+** → **JsonPath Match** con la
     expresión `$.estado` y el valor esperado `activa`.
6. **Ejecuta el caso entero** (botón **▶ Run** del editor del caso): los tres pasos en verde.

### C · Los demás casos: clonar

Clic derecho en `CP-05` → **Clone Test Case**, y en la copia cambia solo lo necesario:

| Caso | Qué cambias | Esperado |
|---|---|---|
| Datos no válidos (repetido, fuera de rango…) | El cuerpo del paso 3 | Código `400` (quita el JsonPath) |
| Sorteo cerrado | `"sorteoId": 3` en el paso 3 | Código `409` |
| Sin permiso | El cuerpo del paso 1: `luis` / `luis-practicas` | Código `403` |
| Apuesta de otro usuario | Cambia el paso 3 por `GET /apuestas/{id}` con `id` = `3` (con la misma cabecera `Authorization`) | Código `404` |

### D · Atajo solo de ReadyAPI: la pestaña Auth (opcional)

En vez de los pasos 1 a 3, ReadyAPI puede pedir el token por OAuth2. En la petición, panel
**Auth** → **Add Authorization Profile** → **OAuth 2.0**, y en **OAuth 2 Flow** elige
**Client Credentials Grant**:

| Campo | Valor |
|---|---|
| Access Token URL | `https://<tu-codespace>-3000.app.github.dev/oauth/token` |
| Client Identification | `app-gestion` |
| Client Secret | `secreto-gestion` |
| Scope | `apuestas:leer apuestas:escribir` |

Pulsa **Get Access Token** y ejecuta la petición. Comprueba: con `app-gestion`,
`POST /apuestas` responde 201; con un perfil de `app-consulta` (`secreto-consulta`, scope
`apuestas:leer`), 403; sin perfil ni cabecera, 401.

## §6 · Práctica 2: tu suite en ReadyAPI (25 min)

1. Crea el proyecto y el primer caso, **CP-05**, siguiendo el §5 (apartados A y B).
2. **Clónalo** (§5, apartado C) hasta tener **6 casos** de tu batería de ayer (`casos.md`).
   Elige casos variados: positivos, negativos, de límite y de seguridad.
3. Añade a cada petición sus **aserciones**:

| Aserción | Para qué |
|---|---|
| Valid HTTP Status Codes | El código esperado |
| JsonPath Match | Un valor concreto de la respuesta |
| JsonPath Count | Cuántos elementos tiene una lista |
| Contains | Un texto en la respuesta |
| Swagger/OpenAPI Compliance | Que la respuesta cumple el contrato (solo ReadyAPI) |
| Response SLA | Tiempo máximo de respuesta |

4. Ejecuta la **suite** contra la estable (doble clic en «Apuestas» → **▶ Run**): todo en
   **verde**. Si algo sale en rojo en la estable, revisa el caso: la estable es la referencia.
5. Guarda el proyecto (**File → Save Project**, o Ctrl+S) y apunta dónde queda el `.xml`: lo
   necesitarás para `testrunner` (§8).

Aserción de script opcional (la de la presentación), para `GET /sorteos/{id}`:

```groovy
import groovy.json.JsonSlurper

def s = new JsonSlurper().parseText(messageExchange.responseContent)
assert ['id', 'nombre', 'precioApuesta'].every { s.containsKey(it) }
assert s.precioApuesta instanceof Number : "precioApuesta no es un número"
```

## §7 · Práctica 3: estable frente a candidata (25 min)

1. Ejecuta tu suite contra la estable (`…-3000…`): verde.
2. Cambia la dirección al puerto **3001**, para todas las peticiones a la vez: en el
   Navigator, doble clic en la **API** (el nodo de la API de Sorteos, no un caso) → pestaña
   **Service Endpoints** → **+** y escribe la dirección de la candidata:

   ```text
   https://<tu-codespace>-3001.app.github.dev
   ```

   Selecciónala → **Assign** → todas las peticiones y pasos de prueba. (Si en tu proyecto
   hay **Environments**, vale también crear uno «Candidata» con esa dirección y elegirlo en el
   desplegable de la barra.)
3. Ejecuta la **misma** suite contra la candidata (doble clic en «Apuestas» → **▶ Run**).
4. Compara: ¿qué casos pasan a rojo? Haz clic en un paso rojo para ver la respuesta que
   recibió.
5. Con la suite abierta, botón **Report** de la barra → **Test suite printable report** →
   **OK**, y guárdalo con **Save** (si tu versión no lo tiene, una captura de la suite en rojo
   vale). Después rellena
   **`practicas/s04/decision-publicacion.md`**: resultados de las dos versiones, la decisión
   (¿se puede publicar?) y qué defectos no detecta tu suite.
6. Para volver a la estable: lo mismo que en el paso 2, con la dirección del 3000.

## §8 · Ejecutar la suite por línea de comandos

ReadyAPI y SoapUI traen el mismo ejecutor, `testrunner`, en su carpeta `bin`
(`testrunner.bat` en Windows, `testrunner.sh` en macOS y Linux).

**Windows (cmd), desde la carpeta `bin` de ReadyAPI** (normalmente
`C:\Program Files\SmartBear\ReadyAPI-<versión>\bin`):

```bat
testrunner.bat -s "Apuestas" -r -j -f informes -e https://<tu-codespace>-3001.app.github.dev "C:\ruta\a\proyecto-sorteos.xml"
echo %ERRORLEVEL%
```

**macOS o Linux:**

```bash
./testrunner.sh -s "Apuestas" -r -j -f informes \
  -e https://<tu-codespace>-3001.app.github.dev \
  /ruta/a/proyecto-sorteos.xml
echo $?
```

| Opción | Qué hace |
|---|---|
| `-s` | La suite que se ejecuta |
| `-r` | Resumen en pantalla |
| `-j` | Informe en formato JUnit, el que leen Jenkins, GitLab o Azure DevOps |
| `-f` | Carpeta donde se guardan los informes |
| `-e` | Otro endpoint: así se cambia de entorno sin tocar el proyecto |

El código de salida es **0** si todo pasa; cualquier otro valor significa que algo ha
fallado. Es lo que mira un pipeline para seguir o pararse.

## §9 · Taller final: el ciclo completo (30 min)

1. Elige un defecto que hayas encontrado en la candidata.
2. Traza su requisito (REQ), su parte del contrato y su caso (CP o CS).
3. Recoge la evidencia del informe de ReadyAPI: petición y respuesta.
4. Copia `practicas/s04/informe-defecto.md` y rellénalo:

   | Campo | Ejemplo |
   |---|---|
   | ID y título | DEF-.. · Qué falla, en una frase |
   | Requisito y caso | REQ-.. · CP-.. |
   | Versión y entorno | Candidata 1.0.0 · codespace (puerto 3001) |
   | Pasos para reproducir | Token de ana · `POST /apuestas` con… |
   | Esperado | Código, cuerpo y cabeceras según el contrato |
   | Obtenido | Lo que devolvió la API |
   | Evidencia | Petición y respuesta, o el informe de ReadyAPI |
   | Gravedad | Alta, media o baja, y por qué |

5. Completa `practicas/s04/matriz-completa.md`: requisito, contrato, caso, ejecución,
   resultado, evidencia, defecto y si está automatizado.

En un informe de defecto no pegues tokens: escribe `Bearer <token de ana>`.

## §10 · Guardar tu trabajo

Guarda también el proyecto de ReadyAPI (`.xml`) dentro de tu repositorio si quieres
conservarlo. En una terminal del codespace, desde la raíz del repositorio:

```bash
git branch --show-current                  # alumno/<tu-nombre>, no main
git add -A
git commit -m "s04: seguridad, suite y defecto"
git push
```

## §11 · Si algo falla

| Síntoma | Solución |
|---|---|
| ReadyAPI no puede importar o todo da error de conexión | Los puertos no son públicos (§0), o la API está parada en el codespace |
| ReadyAPI recibe una página de inicio de sesión de GitHub | Igual: el puerto sigue en Private |
| ReadyAPI no importa el OpenAPI 3.0 | Usa `/swagger2.json` |
| El paso «Guardar token» falla o `token` queda vacío | Ejecuta el **caso entero**, no solo un paso: la transferencia necesita la respuesta del paso anterior. Revisa que la expresión sea `$.access_token` |
| Todo da 401 | El token ha caducado (30 min): vuelve a pedirlo o ejecuta el caso entero, que lo pide en su primer paso |
| `npm run token:caducado` falla | Estás en otra carpeta: `cd docs/ejemplos/api-sorteos` |
| `testrunner` no se encuentra | Ejecútalo desde la carpeta `bin` de ReadyAPI, o con su ruta completa |
| La cabecera llega como `Bearer ${#TestCase#token}` literal | El nombre de la propiedad no coincide: tiene que llamarse exactamente `token`, en el caso de prueba |
| La candidata da los mismos resultados que la estable | Revisa que el endpoint apunta al **3001** |

## §12 · Cuestionario final

Para terminar el curso, rellena el cuestionario:

<https://forms.cloud.microsoft/r/0HVS1znY2v>
