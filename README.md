# Formación APIs REST, OpenAPI y testing de APIs

Material del curso de APIs REST, Swagger/OpenAPI y testing de APIs:
4 sesiones de 5 horas (20 h), del 16 al 24 de noviembre de 2026, de 9:00 a 14:00.
Impartido por Alejandro Muñoz (Julditec).

| Sesión | Fecha | Contenido | Material |
|---|---|---|---|
| S1 | Lun 16 nov | HTTP y REST desde cero · Node y TypeScript · Primera API | [`docs/sesiones/`](docs/sesiones/README.md) |
| S2 | Mar 17 nov | Diseño REST · CRUD completo · Validación · Errores · Middleware | [`docs/sesiones/`](docs/sesiones/README.md) |
| S3 | Lun 23 nov | Testing: del contrato OpenAPI a los casos de prueba · Swagger UI | [`s03-qa.pdf`](docs/sesiones/presentaciones/s03-qa.pdf) · [referencia rápida](docs/sesiones/s03-qa-referencia-rapida.md) · [API de Sorteos](docs/ejemplos/api-sorteos/README.md) |
| S4 | Mar 24 nov | Testing: seguridad (JWT y OAuth2) · ReadyAPI · CI/CD · Trazabilidad | [`s04-qa.pdf`](docs/sesiones/presentaciones/s04-qa.pdf) · [referencia rápida](docs/sesiones/s04-qa-referencia-rapida.md) · [API de Sorteos](docs/ejemplos/api-sorteos/README.md) |

Las sesiones 3 y 4 se centran en probar APIs, sin programar, sobre la **API de Sorteos**
(`docs/ejemplos/api-sorteos/`): se arranca con `./arrancar.sh` y sus prácticas están en
`practicas/`.

## Qué hay en el repositorio

| Carpeta | Qué es |
|---|---|
| `docs/sesiones/` | Diapositivas en Markdown y PPTX, referencias rápidas y puesta en marcha |
| `docs/material/` | Presentaciones en PDF |
| `docs/prácticas/` | Prácticas guiadas en PDF, rellenables |
| `docs/cuestionarios/` | Cuestionarios de cada sesión en PDF, rellenables |
| `ejercicios/` | Ejercicios de cada sesión, con pruebas automáticas: `npm run comprobar` |
| `docs/ejemplos/` | Código de ejemplo: la API de partida (`api-base`) y la demo de OAuth 2 (`oauth-demo`) |

## Cómo se trabaja: GitHub Codespaces

Cada alumno trabaja en su propia copia del repositorio, abierta en **GitHub Codespaces**:
VS Code en el navegador con Node, las extensiones y las dependencias ya instaladas. No
hace falta instalar nada en tu equipo.

**Entrar en 3 pasos:**

1. Botón verde **Code** → pestaña **Codespaces** → **Create codespace on main**. La
   primera vez tarda 2–3 minutos. Los días siguientes, reabre el mismo; no crees otro.
2. En la terminal: `cd ejercicios && npm run comprobar s01`. Que salgan ejercicios
   pendientes es lo esperado.
3. Una sola vez, en <https://github.com/settings/codespaces> (los ajustes de tu
   cuenta): **Default idle timeout** a 15 minutos. Así no gastas horas gratis con el
   codespace encendido sin usar.

**Si te han añadido como colaborador** de este repositorio (en vez de tener tu propia
copia), trabaja siempre en tu rama, nunca en `main`. Créala una sola vez, desde la raíz
del repositorio:

```bash
git switch -c alumno/<tu-nombre>
git push -u origin alumno/<tu-nombre>
```

Al acabar cada sesión, `git add -A && git commit -m "s01: ejercicios" && git push`: lo
que no subas se pierde si el codespace se borra. Antes de subir, comprueba con
`git branch --show-current` que estás en tu rama.

Todos los detalles (cupo gratuito, cómo parar el codespace, trabajar sin Codespaces y
qué hacer si algo falla) están en la [puesta en marcha](docs/sesiones/puesta-en-marcha.md).
