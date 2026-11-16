# Anexo S4 · Más allá de la sesión: webhooks, operaciones largas y claves que rotan

Código de los tres bloques del anexo de S4. Los pasos están en
[`docs/sesiones/anexos/s04-anexo-referencia-rapida.md`](../../sesiones/anexos/s04-anexo-referencia-rapida.md).

| Fichero | Bloque | Qué es | Dónde se usa |
|---|---|---|---|
| `webhooks.ts` | A | Firmar y verificar un aviso con HMAC-SHA256 y la hora; demo con un receptor | Se copia a `ejercicios/s04/src/` |
| `operaciones.ts` | B | `POST /informes` responde 202 + `Location`, y `GET /operaciones/{id}` dice cómo va | Se copia a `ejercicios/s04/src/` |
| `rotar-claves.ts` | C | Rotar la clave de firma con `kid` y JWKS, sin tocar la API | Se copia a `ejercicios/s04/src/` |

Se copian a `ejercicios/s04/src` para que encuentren las dependencias de
`ejercicios/node_modules`. No tocan ningún fichero de los ejercicios: al terminar, se borran
(§0 de la referencia).
