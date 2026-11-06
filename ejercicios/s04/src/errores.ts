import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export interface DetalleError {
	campo: string;
	mensaje: string;
}

// Un error que ya sabe cómo contarse al cliente
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

// El manejador central: el único sitio que decide cómo se ve un error
export function manejadorErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	if (err instanceof ErrorApi) return problema(res, err.status, err.titulo, err.detalle, err.errores);
	if (err instanceof ZodError) {
		const errores = err.issues.map((i) => ({ campo: i.path.join(".") || "(cuerpo)", mensaje: i.message }));
		return problema(res, 400, "Petición no válida", "Revisa los campos de «errors»", errores);
	}
	// Los errores del validador del contrato traen status y una lista de fallos
	const e = err as { status?: number; message?: string; errors?: { path: string; message: string }[] };
	if (typeof e.status === "number" && e.status >= 400 && e.status < 500 && Array.isArray(e.errors)) {
		const errores = e.errors.map((x) => ({ campo: x.path.replace(/^\/(body|query|params)\/?/, "") || "(cuerpo)", mensaje: x.message }));
		const titulos: Record<number, string> = { 400: "Petición no válida", 404: "No encontrado", 405: "Método no permitido", 415: "Tipo de contenido no admitido" };
		return problema(res, e.status, titulos[e.status] ?? "Petición no válida", "La petición no cumple el contrato OpenAPI", errores);
	}
	if (typeof e.status === "number" && e.status >= 500 && Array.isArray(e.errors)) {
		console.error(`[${res.locals.idPeticion}] La respuesta no cumple el contrato:`, e.errors);
	}
	const tipo = (err as { type?: string }).type;
	if (tipo === "entity.parse.failed") return problema(res, 400, "JSON mal formado", "El cuerpo no es un JSON válido");
	if (tipo === "entity.too.large") return problema(res, 413, "Cuerpo demasiado grande", "El máximo son 100 kB");

	// Lo inesperado: se registra entero, pero al cliente no se le cuenta nada interno
	console.error(`[${res.locals.idPeticion}]`, err);
	problema(res, 500, "Error interno", "Algo ha fallado. Si se repite, avisa con el requestId");
}
