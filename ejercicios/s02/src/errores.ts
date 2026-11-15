import type { NextFunction, Request, Response } from "express";

export interface DetalleError {
	campo: string;
	mensaje: string;
}

// Un error que ya sabe cómo contarse al cliente: lánzalo desde el servicio
export class ErrorApi extends Error {
	constructor(
		public status: number,
		public titulo: string,
		public detalle?: string,
		public errores?: DetalleError[],
	) {
		super(titulo);
	}
}

export function problema(res: Response, status: number, title: string, detail?: string, errors?: DetalleError[]) {
	res.status(status).type("application/problem+json").json({
		type: "about:blank",
		title,
		status,
		...(detail ? { detail } : {}),
		...(errors ? { errors } : {}),
		...(res.locals.idPeticion ? { requestId: res.locals.idPeticion } : {}),
	});
}

export function noEncontrado(req: Request, res: Response) {
	problema(res, 404, "No encontrado", `No existe ${req.method} ${req.path}`);
}

// Ejercicio 4: el manejador central de errores. Hoy pasa el error a Express, que
// responde con una página HTML. Haz que responda siempre con problem+json:
//   - ErrorApi                       → su status, título y detalle (ejercicio 4)
//   - err.type "entity.parse.failed" → 400, JSON mal formado (ejercicio 4)
//   - ZodError                       → 400 con errors: [{ campo, mensaje }] (ejercicio 5)
//   - err.type "entity.too.large"    → 413 (ejercicio 11)
//   - cualquier otro                 → 500 sin contar nada interno (ejercicio 12, reto)
// Ojo: Express reconoce un manejador de errores porque tiene CUATRO parámetros.
export function manejadorErrores(err: unknown, _req: Request, _res: Response, next: NextFunction) {
	next(err);
}
