import type { NextFunction, Request, Response } from "express";
import type { CryptoKey, JWTVerifyGetKey, KeyObject } from "jose";

export interface OpcionesAuth {
	/** Con qué se comprueba la firma: una clave pública o un JWKS remoto (createRemoteJWKSet) */
	claves: CryptoKey | KeyObject | Uint8Array | JWTVerifyGetKey;
	/** Quién firma los tokens en los que confiamos (iss) */
	emisor: string;
	/** Para quién son los tokens (aud): esta API */
	audiencia: string;
}

export interface Usuario {
	sub: string;
	permisos: string[];
	clienteId?: string;
}

// Ejercicio 1: 401 si no sé quién eres.
//   - Lee «Authorization: Bearer <token>». Si falta, 401 con WWW-Authenticate: Bearer.
//   - jwtVerify(token, claves, { issuer: emisor, audience: audiencia }) de «jose». Si lanza, 401.
//   - Guarda en res.locals.usuario { sub, permisos: scope.split(" ") } y sigue con next().
export function autenticar(_opciones: OpcionesAuth) {
	return (_req: Request, _res: Response, next: NextFunction) => next();
}

// Ejercicio 2: 403 si te falta el permiso. GET y HEAD piden «<recurso>:leer»; el resto, «<recurso>:escribir».
export function exigirSegunMetodo(_recurso: string) {
	return (_req: Request, _res: Response, next: NextFunction) => next();
}
