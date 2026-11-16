import type { NextFunction, Request, Response } from "express";
import type { CryptoKey, JWTVerifyGetKey, KeyObject } from "jose";

export interface OpcionesAuth {
	/** Con qué se comprueba la firma: una clave pública o un JWKS remoto (createRemoteJWKSet) */
	claves: CryptoKey | KeyObject | Uint8Array | JWTVerifyGetKey;
	/** Quién firma los tokens en los que confiamos (iss) */
	emisor: string;
	/** Para quién son los tokens (aud): esta API */
	audiencia: string;
	/** Los «jti» de los tokens revocados antes de caducar (ejercicio 3, reto) */
	revocados?: Set<string>;
}

export interface Usuario {
	sub: string;
	permisos: string[];
	clienteId?: string;
}

// Ejercicio 2: 401 si no sé quién eres.
//   - Lee «Authorization: Bearer <token>». Si falta, 401 con WWW-Authenticate: Bearer.
//   - jwtVerify(token, claves, { issuer: emisor, audience: audiencia }) de «jose». Si lanza, 401.
//   - Guarda en res.locals.usuario { sub, permisos: scope.split(" ") } y sigue con next().
// Ejercicio 3 (reto): 401 también si el token no caduca (sin «exp»), si dura más de una hora
// (exp − iat > 3600) o si su «jti» está en opciones.revocados.
export function autenticar(_opciones: OpcionesAuth) {
	return (_req: Request, _res: Response, next: NextFunction) => next();
}

// Ejercicio 4: 403 si te falta el permiso. GET y HEAD piden «<recurso>:leer»; el resto, «<recurso>:escribir».
export function exigirSegunMetodo(_recurso: string) {
	return (_req: Request, _res: Response, next: NextFunction) => next();
}
