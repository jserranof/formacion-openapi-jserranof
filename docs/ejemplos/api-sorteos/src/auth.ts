import type { NextFunction, Request, Response } from "express";
import { SignJWT, errors, jwtVerify } from "jose";

// Clave de firma de los tokens de prácticas. No es un secreto real: la API es ficticia.
const CLAVE = new TextEncoder().encode(process.env.CLAVE_TOKENS ?? "clave-de-firma-solo-para-practicas");
export const EMISOR = "api-sorteos-practicas";
export const DURACION_S = 30 * 60;

export async function firmarToken(usuario: string, permisos: string[], caducaEn?: number) {
	const ahora = Math.floor(Date.now() / 1000);
	return new SignJWT({ scope: permisos.join(" ") })
		.setProtectedHeader({ alg: "HS256", typ: "JWT" })
		.setIssuer(EMISOR)
		.setSubject(usuario)
		.setIssuedAt(caducaEn ? caducaEn - DURACION_S : ahora)
		.setExpirationTime(caducaEn ?? ahora + DURACION_S)
		.sign(CLAVE);
}

export interface Identidad {
	usuario: string;
	permisos: string[];
}

declare global {
	namespace Express {
		interface Request {
			identidad?: Identidad;
		}
	}
}

function problema(res: Response, status: number, title: string, detail: string) {
	res.status(status).type("application/problem+json").json({ title, status, detail });
}

export function autenticar(opciones: { aceptaCaducados: boolean }) {
	return async (req: Request, res: Response, next: NextFunction) => {
		const cabecera = req.get("authorization") ?? "";
		const [tipo, token] = cabecera.split(" ");
		if (tipo?.toLowerCase() !== "bearer" || !token) {
			return problema(res, 401, "No autenticado", "Falta la cabecera Authorization: Bearer <token>");
		}
		try {
			const { payload } = await jwtVerify(token, CLAVE, {
				issuer: EMISOR,
				currentDate: opciones.aceptaCaducados ? new Date(0) : undefined,
			});
			req.identidad = {
				usuario: String(payload.sub),
				permisos: String(payload.scope ?? "").split(" ").filter(Boolean),
			};
			next();
		} catch (e) {
			const caducado = e instanceof errors.JWTExpired;
			problema(res, 401, "No autenticado", caducado ? "El token ha caducado" : "El token no es válido");
		}
	};
}

export function exigirPermiso(permiso: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.identidad?.permisos.includes(permiso)) {
			return problema(res, 403, "Sin permiso", `El token no tiene el permiso ${permiso}`);
		}
		next();
	};
}
