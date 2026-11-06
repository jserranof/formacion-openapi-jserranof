# S3 · Ejercicios: el contrato primero, y las pruebas

Partes de la API de S2 terminada. Hoy escribes su contrato en `openapi.yaml`, haces que la
API lo publique y lo cumpla, y escribes tus propias pruebas.

```bash
# desde ejercicios/
npm run dev:s03                   # y abre /docs en el navegador
npm run comprobar s03 e01
npm run tipos:s03                 # genera src/tipos/api.d.ts desde el contrato
npx vitest run s03/mis-pruebas    # tus pruebas
```

Para ver el contrato mientras lo escribes, abre `openapi.yaml` y pulsa la vista previa de
la extensión OpenAPI (el icono de la esquina superior derecha).

## e01 · El contrato de /tareas (Bloque 1)

**Hecho cuando** `openapi.yaml`:

- Es un OpenAPI 3.1 válido.
- Declara las seis operaciones de S2, cada una con un `operationId` único y un `summary`.
- Tiene el esquema `Tarea` con sus cuatro campos obligatorios y `prioridad` como `enum`.
- `POST /tareas` pide `titulo` y declara la respuesta 201 con la cabecera `Location`.
- `GET /tareas` declara `prioridad`, `completada`, `orden`, `pagina` y `limite` (de 1 a 100).
- Los 400 y 404 son `application/problem+json` (usa las respuestas de `components`).

## e02 · La API publica el contrato y lo cumple (Bloque 2)

**Hecho cuando:**

- `GET /openapi.json` devuelve el contrato y `/docs/` muestra Swagger UI.
- Lo que el contrato no permite se rechaza antes de llegar a las rutas: un parámetro
  inventado (400), un id que no es un número (400, no 404), un cuerpo que no es JSON (415)
  o un campo que sobra (400, nombrándolo). Siempre con problem+json.

Para pensar: rompe el contrato a propósito (por ejemplo, quita `titulo` de `required`) y
mira qué pruebas fallan y qué dice el error.

## e03 · Tus propias pruebas (Bloque 3)

Escribe tus pruebas en `mis-pruebas/tareas.test.ts`. **Hecho cuando** hay al menos 5, todas
pasan con la API buena, y **detectan dos versiones rotas de la API** que tenemos
preparadas: una que no valida y otra que responde 200 a lo que no existe. Si tus pruebas
siguen en verde con la API rota, no están probando lo importante.

## e04 · Reto: proyectos, del contrato al código (si acabas antes)

Primero el contrato, después el código:

1. Añade al contrato `GET /proyectos`, `POST /proyectos` y `GET /proyectos/{id}`. Un
   proyecto tiene `id`, `nombre` (obligatorio) y `descripcion`.
2. Escríbelo para que lo entienda **un agente de IA**: cada operación con una
   `description` de al menos 30 caracteres que diga *cuándo* usarla, y cada campo de
   `Proyecto` con su `description`.
3. `npm run tipos:s03` y crea `src/proyectos/rutas.ts` usando esos tipos. No hace falta
   Zod: el validador del contrato ya comprueba el cuerpo.

**Hecho cuando** todo eso está, y `POST /proyectos` crea (201 + `Location`), sin `nombre`
responde 400, y un id que no existe, 404.
