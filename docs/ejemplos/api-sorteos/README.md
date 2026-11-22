# API de Sorteos (prácticas)

API ficticia de sorteos y apuestas para las prácticas de testing de las sesiones 3 y 4.
No hay que programar nada: se arranca, se lee su contrato y se prueba.

## Arrancarla

En la terminal del codespace (la primera vez, `git pull` trae la API a tu rama sin tocar tus
ejercicios):

```bash
git pull --no-rebase --no-edit origin main
cd docs/ejemplos/api-sorteos
./arrancar.sh
```

Arranca **dos versiones** de la misma API y te da sus direcciones:

| Versión | Puerto | Qué es |
|---|---|---|
| **estable** | 3000 | La que está en producción |
| **candidata** | 3001 | La nueva versión, que hay que validar antes de publicarla |

Cada una tiene su documentación en `/docs` (Swagger UI). Para pararlas, `Ctrl+C`.
Los datos se reinician cada vez que se arranca.

## El contrato

| Fichero | Para qué |
|---|---|
| [`openapi.yaml`](openapi.yaml) | El contrato en OpenAPI 3.0. Es el que manda |
| [`swagger2.yaml`](swagger2.yaml) | El mismo contrato en Swagger 2.0, para SoapUI |

La API también los sirve: `/openapi.json` y `/swagger2.json` (este con la dirección de esa
instancia ya puesta, para importarlo en SoapUI).

## Usuarios de prueba

| Usuario | Clave | Permisos |
|---|---|---|
| ana | ana-practicas | `apuestas:leer` y `apuestas:escribir` |
| luis | luis-practicas | solo `apuestas:leer` |

Pide un token con `POST /auth/token` y pégalo en el botón **Authorize** de Swagger UI. El
token caduca a los 30 minutos. Para probar con un token ya caducado:

```bash
npm run token:caducado
```

## Si trabajas con SoapUI desde tu equipo

ReadyAPI y SoapUI se ejecutan en tu equipo, fuera del codespace, así que tienen que poder llegar
a la API: haz públicos los puertos 3000 y 3001 en la pestaña **PUERTOS** → clic derecho en la
fila del puerto → **Visibilidad del puerto** → **Public**. Después importa el contrato desde la
dirección `…-3000.app.github.dev/openapi.json` (ReadyAPI) o `/swagger2.json` (SoapUI) que
muestra `arrancar.sh`. Los datos son ficticios; al cerrar el codespace los puertos dejan de
estar accesibles.
