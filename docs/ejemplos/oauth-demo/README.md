# oauth-demo

Demo de la sesión 4: un servidor de autorización de prueba
([`oauth2-mock-server`](https://github.com/axa-group/oauth2-mock-server)) que emite tokens
JWT firmados, y una API que los valida contra su JWKS y exige un permiso por operación.

```bash
# desde docs/ejemplos/oauth-demo
npm install
npm run autorizacion     # terminal 1 · http://localhost:9000
npm run api              # terminal 2 · http://localhost:3000
npx tsx src/probar-flujos.ts   # terminal 3 · recorre los dos flujos
```

| Cliente | Permisos que puede recibir |
|---|---|
| `app-lectura` | `tareas:leer` |
| `app-gestion` | `tareas:leer`, `tareas:escribir`, `proyectos:leer`, `proyectos:escribir` |

Todos los tokens son del usuario de prueba `ana` (`sub`).

| Petición | Resultado |
|---|---|
| `GET /tareas` sin token | 401 y cabecera `WWW-Authenticate` |
| `GET /tareas` con token de `app-lectura` | 200 |
| `POST /tareas` con token de `app-lectura` | 403: falta `tareas:escribir` |
| `POST /tareas` con token de `app-gestion` | 201 |
| Canje de un code con un verificador PKCE falso | 400 |
| Reusar un code ya canjeado | 400 |

Pedir un token a mano:

```bash
curl -s -X POST http://localhost:9000/token -u app-gestion:secreto \
  -d grant_type=client_credentials -d "scope=tareas:leer tareas:escribir"
```

Límites del servidor de prueba, que en clase hay que decir en voz alta:

- Acepta cualquier secreto de cliente. Los permisos por cliente los decide el
  `beforeTokenSigning` de `src/servidor-autorizacion.ts`, no el servidor.
- Si el canje del code llega **sin** `code_verifier`, lo acepta. Uno de verdad (Keycloak,
  Entra ID, Auth0) lo rechaza si la autorización se pidió con `code_challenge`.
- El usuario es siempre `ana`, sin pantalla de inicio de sesión.

Requiere Node 22.12 o superior (`oauth2-mock-server` 9 admite Node 22, 24 y 26).
