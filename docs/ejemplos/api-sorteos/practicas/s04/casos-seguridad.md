# Práctica 1 · Pruebas de seguridad

Lanza cada caso en la versión estable (puerto 3000) y en la candidata (3001). CS-07 y CS-08
los diseñas tú.

| ID | Caso | Cómo | Esperado | Estable | Candidata | Evidencia |
|---|---|---|---|---|---|---|
| CS-01 | Sin credencial | `GET /apuestas` sin cabecera `Authorization` | 401 | | | |
| CS-02 | Token manipulado | `GET /apuestas` con un carácter del token cambiado | 401 | | | |
| CS-03 | Token caducado | `GET /apuestas` con el token de `npm run token:caducado` | 401 | | | |
| CS-04 | Secreto incorrecto | `POST /oauth/token` con un `client_secret` erróneo | 401 `invalid_client` | | | |
| CS-05 | Permiso insuficiente | `POST /apuestas` con el token de luis o de app-consulta | 403 | | | |
| CS-06 | Datos de otro usuario | `GET /apuestas/3` con el token de ana | 404 | | | |
| CS-07 | Diseñado por ti: … | … | … | | | |
| CS-08 | Diseñado por ti: … | … | … | | | |

**Estable y Candidata:** pasa o falla. **Evidencia:** si falla, el código y lo que devolvió.
No pegues tokens: escribe `<token de ana>`.
