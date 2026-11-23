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
| 5 | ReadyAPI | Práctica 2: tu suite en ReadyAPI |
| 6 | ReadyAPI | Autenticación en ReadyAPI |
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

**La petición por dentro** (la que tendrás que montar en ReadyAPI): `POST /oauth/token`
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

## §5 · Práctica 2: tu suite en ReadyAPI (25 min)

Antes: puertos 3000 y 3001 públicos (§0).

1. **Nuevo proyecto** a partir de una definición de API (OpenAPI/Swagger), con la URL:

   ```text
   https://<tu-codespace>-3000.app.github.dev/openapi.json
   ```

   Si tu ReadyAPI no acepta el 3.0, usa el mismo contrato en Swagger 2.0:
   `…-3000.app.github.dev/swagger2.json`.
2. Crea una suite **«Apuestas»** con **6 casos** de tu batería de ayer (`casos.md` o `casos.csv`).
   Elige casos variados: positivos, negativos, de límite y de seguridad.
3. Cada caso de `/apuestas` necesita su token (§6). Monta **un caso completo** (pedir token,
   guardarlo y la petición con sus aserciones), comprueba que funciona y después
   **clónalo** (clic derecho en el caso → Clone) para los demás: solo cambias el cuerpo,
   el usuario y lo esperado.
4. Añade a cada petición sus **aserciones**:

   | Aserción | Para qué |
   |---|---|
   | Valid HTTP Status Codes | El código esperado |
   | JsonPath Match | Un valor concreto de la respuesta |
   | JsonPath Count | Cuántos elementos tiene una lista |
   | Contains | Un texto en la respuesta |
   | Swagger/OpenAPI Compliance | Que la respuesta cumple el contrato (solo ReadyAPI) |
   | Response SLA | Tiempo máximo de respuesta |

5. Ejecuta la suite contra la estable: todo en **verde**. Si algo sale en rojo en la
   estable, revisa el caso: la estable es la referencia.
6. Guarda el proyecto.

Aserción de script opcional (la de la presentación), para `GET /sorteos/{id}`:

```groovy
import groovy.json.JsonSlurper

def s = new JsonSlurper().parseText(messageExchange.responseContent)
assert ['id', 'nombre', 'precioApuesta'].every { s.containsKey(it) }
assert s.precioApuesta instanceof Number : "precioApuesta no es un número"
```

## §6 · Autenticación en ReadyAPI

Se usa en la **práctica 2** (§5), al montar los casos de `/apuestas`. Todo se hace **dentro de
ReadyAPI**: no hace falta Swagger UI ni copiar el token de la práctica 1, porque el caso pide su
propio token cada vez que se ejecuta (el token caduca a los 30 minutos).

**Opción A, válida en ReadyAPI y en SoapUI:** el token se pide dentro del propio caso.

1. Primer paso del caso: petición `POST /auth/token` con este cuerpo, y aserción de
   código `200`:

   ```json
   { "usuario": "ana", "clave": "ana-practicas" }
   ```

2. Segundo paso: **Property Transfer**. Origen: la respuesta (`Response`) del paso
   anterior, con JsonPath `$.access_token`. Destino: una propiedad `token` del caso de
   prueba.
3. En la petición que se prueba, añade la cabecera:

   ```text
   Authorization: Bearer ${#TestCase#token}
   ```

**Opción B, solo ReadyAPI:** pestaña **Auth** de la petición → nuevo perfil **OAuth 2.0**,
flujo Client Credentials:

| Campo | Valor |
|---|---|
| Access Token URI | `https://<tu-codespace>-3000.app.github.dev/oauth/token` |
| Client ID | `app-gestion` |
| Client Secret | `secreto-gestion` |
| Scope | `apuestas:leer apuestas:escribir` |

Comprueba los tres resultados: 200 con permiso, 401 sin token y 403 sin permiso.

## §7 · Práctica 3: estable frente a candidata (25 min)

1. Ejecuta tu suite contra la estable (`…-3000…`): verde.
2. Cambia el endpoint al puerto **3001**: en el entorno del proyecto o en el desplegable
   de la dirección de las peticiones.
3. Ejecuta la **misma** suite contra la candidata.
4. Compara: ¿qué casos pasan a rojo?
5. Genera el informe de la ejecución de la candidata y rellena
   **`practicas/s04/decision-publicacion.md`**: resultados de las dos versiones, la decisión
   (¿se puede publicar?) y qué defectos no detecta tu suite.

## §8 · Ejecutar la suite por línea de comandos

ReadyAPI y SoapUI traen el mismo ejecutor, `testrunner`, en su carpeta `bin`
(`testrunner.bat` en Windows, `testrunner.sh` en macOS y Linux).

**Windows (cmd), desde la carpeta `bin` de ReadyAPI:**

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
| Todo da 401 | El token ha caducado (30 min): vuelve a pedirlo o ejecuta el caso entero, que lo pide en su primer paso |
| `npm run token:caducado` falla | Estás en otra carpeta: `cd docs/ejemplos/api-sorteos` |
| `testrunner` no se encuentra | Ejecútalo desde la carpeta `bin` de ReadyAPI, o con su ruta completa |
| La candidata da los mismos resultados que la estable | Revisa que el endpoint apunta al **3001** |

## §12 · Cuestionario final

Para terminar el curso, rellena el cuestionario:

<https://forms.cloud.microsoft/r/0HVS1znY2v>
