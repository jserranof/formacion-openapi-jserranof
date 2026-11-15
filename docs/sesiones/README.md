# Sesiones S1–S4 · APIs REST y OpenAPI con Node y TypeScript

Material de aula de las cuatro sesiones, impartidas por **Alejandro Muñoz** (Julditec).
Todas son de 9:00 a 14:00.

Antes de S1: [puesta en marcha](puesta-en-marcha.md).

## Índice

| Sesión | Fecha | Tema | Diapositivas | PPTX | Referencia rápida |
|---|---|---|---|---|---|
| S1 | Lun 16/11 | HTTP y REST desde cero; primera API | [slides](s01-slides.md) | [pptx](presentaciones/s01-presentacion.pptx) | [pasos y código](s01-referencia-rapida.md) |
| S2 | Mar 17/11 | CRUD completo, validación y errores | [slides](s02-slides.md) | [pptx](presentaciones/s02-presentacion.pptx) | [pasos y código](s02-referencia-rapida.md) |
| S3 | Lun 23/11 | OpenAPI: el contrato primero y las pruebas | [slides](s03-slides.md) | [pptx](presentaciones/s03-presentacion.pptx) | [pasos y código](s03-referencia-rapida.md) |
| S4 | Mar 24/11 | Seguridad, buenas prácticas y APIs para agentes de IA | [slides](s04-slides.md) | [pptx](presentaciones/s04-presentacion.pptx) | [pasos y código](s04-referencia-rapida.md) |

Cada `sNN-slides.md` es el contenido de la presentación, una diapositiva por sección
`##`. Los `.pptx` se generan desde ese markdown, y su versión en PDF está en
[`docs/material/sesion-NN.pdf`](../material/).

Cada sesión tiene además una **práctica** de una hora
([`docs/prácticas/practica-NN.pdf`](../prácticas/)): empiézala en clase si acabas un
ejercicio antes o si sobra tiempo al final, y termínala en casa. Las dudas que te surjan
se ven al principio de la sesión siguiente. Y un **cuestionario** de 10 preguntas
([`docs/cuestionarios/cuestionario-sesion-NN.pdf`](../cuestionarios/)), en el cierre.

Algunas sesiones tienen además un **anexo** (`anexos/sNN-anexo-slides.md` y su
referencia rápida): material de ampliación para cuando sobra tiempo, con su PDF en
`docs/material/sesion-NN-anexo.pdf`. El de S2: [salud y parada ordenada, SQLite y CORS en
el navegador](anexos/s02-anexo-slides.md). El de S3: [una guía de estilo como reglas de
lint, un cliente tipado con el contrato y code-first con Zod](anexos/s03-anexo-slides.md).

Cada `sNN-referencia-rapida.md` recoge, sección a sección (§N), los pasos y el código
exacto de todo lo que se hace en la sesión. Es lo que se pega en el chat durante la clase.

## El caso práctico

> Pendiente: se fija cuando se conozca la empresa. Durante las cuatro sesiones se
> construye una sola API, poco a poco, sobre la plantilla de
> [`docs/ejemplos/api-base/`](../ejemplos/api-base/).

## Entorno de referencia

| Dato | Valor |
|---|---|
| Node.js | 24 LTS (o 22.12 o superior) |
| Lenguaje | TypeScript, ejecutado con `tsx` en desarrollo |
| Framework | Express 5 |
| Contrato | OpenAPI 3.1, con Swagger UI en `/docs` |
| Entorno | GitHub Codespaces (`.devcontainer/`), o local con Node 24 |
| Ejercicios | `ejercicios/sNN/`, con pruebas (Vitest + Supertest) y `npm run comprobar` |
| Cliente HTTP | `curl` y la extensión REST Client de VS Code |

