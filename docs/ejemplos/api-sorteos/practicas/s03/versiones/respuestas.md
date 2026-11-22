# Práctica 1 · ¿Qué versión es?

Rellena este fichero en VS Code: escribe tus respuestas donde están los `…`. No hay que
programar nada, solo leer.

## Parte 1 · Reconocer la versión (10 min)

Abre `fragmento-a.yaml`, `fragmento-b.yaml` y `fragmento-c.yaml`, en esta misma carpeta.
Para cada uno, indica qué versión es y qué línea lo delata. Si encuentras más pistas, añádelas.

| Fragmento | Versión (Swagger 2.0, OpenAPI 3.0 u OpenAPI 3.1) | La línea que lo delata | Otras pistas |
|---|---|---|---|
| A | … | … | … |
| B | … | … | … |
| C | … | … | … |

Pista: mira la primera línea, y después palabras como `host`, `definitions`, `servers`,
`requestBody`, `components`, `nullable` o `webhooks`.

## Parte 2 · Moverse por un contrato real (10 min)

Abre <https://editor.swagger.io> y pega el contrato de la API de Sorteos
(`docs/ejemplos/api-sorteos/openapi.yaml`). En la parte derecha, despliega
`POST /apuestas`.

1. ¿Qué datos hay que enviar en el cuerpo? ¿Cuáles son obligatorios?

   …

2. ¿Qué reglas tienen los números de la apuesta? (Pista: abre el esquema `ApuestaNueva`.)

   …

3. ¿Qué códigos de respuesta puede devolver? Escribe para qué sirve cada uno.

   | Código | Cuándo |
   |---|---|
   | … | … |

4. ¿Hace falta autenticarse para usar esta operación? ¿Cómo lo sabes?

   …

## Parte 3 · Migrar de Swagger 2.0 a OpenAPI 3.x (5 min)

En el fragmento B (Swagger 2.0), señala qué cambiaría al pasarlo a OpenAPI 3.x. Guíate por
la diapositiva «Migrar de 2.0 a 3.x: qué se mueve».

| En el fragmento B pone… | En OpenAPI 3.x pasaría a… |
|---|---|
| `host: api.ejemplo.com` y `basePath: /v1` | … |
| `in: body` | … |
| `definitions:` | … |
| `$ref: "#/definitions/Punto"` | … |
