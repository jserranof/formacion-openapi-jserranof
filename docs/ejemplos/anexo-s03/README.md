# Anexo S3 · El contrato, más allá de la API

Código de los tres bloques del anexo de S3. Los pasos están en
[`docs/sesiones/anexos/s03-anexo-referencia-rapida.md`](../../sesiones/anexos/s03-anexo-referencia-rapida.md).

| Fichero | Bloque | Qué es | Dónde se usa |
|---|---|---|---|
| `estilo.yaml` | A | La guía de estilo del equipo, como reglas de lint (cinco reglas propias) | Se copia a `ejercicios/s03/` |
| `lint-estilo.ts` | A | Pasa `estilo.yaml` a un contrato | Se copia a `ejercicios/s03/` |
| `contrato-malo.yaml` | A | Un contrato que funciona, pero no cumple la guía | Se copia a `ejercicios/s03/` |
| `cliente.ts` | B | Un cliente de la API tipado con el contrato (`openapi-fetch`) | Se copia a `ejercicios/s03/src/` |
| `code-first.ts` | C | Genera desde Zod el esquema de `TareaNueva` y `CambiosTarea` y lo compara con el contrato | Se copia a `ejercicios/s03/src/` |

Se copian a `ejercicios/s03` para que encuentren las dependencias de `ejercicios/node_modules`.
Antes de copiar nada, haz commit de tus ejercicios. Al terminar, borra lo copiado (§0 de la
referencia).
