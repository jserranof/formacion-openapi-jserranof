# Ejercicios

Cada sesión tiene sus ejercicios en `sNN/`. Escribes el código en `sNN/src/` y las
pruebas de `sNN/pruebas/` te dicen si está bien. **Las pruebas no se tocan**: son el
criterio de hecho.

## Cómo se trabaja

```bash
# desde ejercicios/
npm run dev:s01                  # (o dev:s02, dev:s03, dev:s04) arranca tu API en http://localhost:3000 y se reinicia al guardar
npm run comprobar s01 e03        # comprueba un ejercicio
npm run comprobar s01            # comprueba toda la sesión
npm run comprobar                # comprueba todo
```

`comprobar` no necesita la API encendida: arranca la tuya en memoria para cada prueba.

Así se ve un ejercicio a medias:

```text
[FALTA] s01 · e03-salud  (1/3)
        - devuelve JSON
          usa res.json(), no res.send(): llega 'text/html; charset=utf-8' y se esperaba /application\/json/
```

Cada línea con `-` es una comprobación que falta, y debajo va una pista. Cuando todo está
bien:

```text
[ OK ] s01 · e03-salud  (3/3)
```

También puedes ver las pruebas en el panel **Testing** de VS Code (el icono del matraz).

## Al terminar cada sesión

```bash
git add -A && git commit -m "s01: ejercicios" && git push
```

Al hacer `push`, GitHub vuelve a pasar las pruebas (pestaña **Actions** de tu
repositorio) y el formador ve cómo vas.

## Sesiones

| Sesión | Ejercicios |
|---|---|
| S1 | [`s01/`](s01/README.md): explorar una API, verbos y códigos, `GET /salud`, listar, tipar, obtener uno con 404, un resumen y dos retos |
| S2 | [`s02/`](s02/README.md): arreglar un diseño, el CRUD, el manejador de errores, validar con Zod, filtrar, ordenar y paginar, la cadena de middleware, límites y registro, y cuatro retos (405, el id, `Link` y el 500) |
| S3 | [`s03/`](s03/README.md): leer un contrato, el contrato de `/tareas`, publicarlo y cumplirlo, tus pruebas y pruebas contra el contrato, «¿lo entendería un agente de IA?», proyectos contract-first, y cuatro retos (reutilizar, el lint con una regla propia, la cobertura del contrato y las pruebas de proyectos) |
| S4 | [`s04/`](s04/README.md): leer un token, proteger la API con JWT, permisos por operación, la seguridad en el contrato, cada uno lo suyo (BOLA), ETag, un servidor MCP y la confirmación humana, y cuatro retos (tokens cortos y revocables, PKCE, `Idempotency-Key` y la inyección de instrucciones) |

Cada sesión parte de la anterior **terminada**: si una sesión no te dio tiempo a acabarla,
la siguiente empieza igual que para todos.
