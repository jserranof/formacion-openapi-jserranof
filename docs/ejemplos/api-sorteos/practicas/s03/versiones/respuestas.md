# Práctica 1 · ¿Qué versión es?

Escribe tus respuestas donde están los `…`. No hay que programar: hay que leer con atención
y, en la parte 3, editar un YAML corto.

## Parte 1 · Detective de versiones (8 min)

A los tres fragmentos de esta carpeta (`fragmento-a.yaml`, `fragmento-b.yaml` y
`fragmento-c.yaml`) se les ha **borrado la línea que dice la versión** de la
especificación. Dedúcela por su estructura: para cada uno, la versión y al menos **dos
líneas** que lo demuestren.

| Fragmento | Versión | Pista 1 (línea del fragmento) | Pista 2 (línea del fragmento) |
|---|---|---|---|
| A | … | … | … |
| B | … | … | … |
| C | … | … | … |

**Trampa:** el fragmento A tiene `version: 2.0.0` dentro de `info`. ¿Quiere decir que es
Swagger 2.0? ¿Qué indica esa línea?

…

## Parte 2 · Leer una operación como tester (7 min)

Abre <https://editor.swagger.io> y pega el contrato de la API de Sorteos
(`docs/ejemplos/api-sorteos/openapi.yaml`). Despliega `POST /apuestas` y su esquema
`ApuestaNueva`.

1. ¿Qué datos hay que enviar y cuáles son obligatorios?

   …

2. ¿Qué reglas tienen los números de la apuesta? Escribe cada una como la comprobarías.

   …

3. ¿Qué códigos de respuesta puede devolver y en qué situación sale cada uno?

   | Código | Cuándo |
   |---|---|
   | … | … |

4. ¿Hace falta autenticarse? ¿Qué parte del contrato lo dice?

   …

## Parte 3 · Migrar a OpenAPI 3.0 (10 min)

Abre `fragmento-b-migrado.yaml`, en esta carpeta: es una copia del fragmento B
(Swagger 2.0). Reescríbelo en **OpenAPI 3.0** usando como modelo el fragmento C, que ya
está en 3.0 y tiene la misma forma: una operación `POST` con su cuerpo y un esquema.

Cuando lo tengas, cópialo entero en <https://editor.swagger.io>. Está bien cuando el editor
no marca **ningún error** y muestra la operación `POST /puntos` con su cuerpo.

¿Qué errores te ha dado el editor por el camino y cómo los has corregido?

…
