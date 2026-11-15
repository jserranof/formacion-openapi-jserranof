import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import type { LineaRegistro } from "./app.js";
import { problema } from "./errores.js";

// Un identificador por petición: viaja en la respuesta y en los logs, para encontrar un fallo
export function idPeticion(req: Request, res: Response, next: NextFunction) {
	const recibido = req.get("X-Request-Id");
	const id = recibido && /^[\w-]{1,64}$/.test(recibido) ? recibido : randomUUID();
	res.locals.idPeticion = id;
	res.set("X-Request-Id", id);
	next();
}

// Una línea por petición, cuando la respuesta ya ha salido: sabe el código y lo que ha tardado
export function registroPeticiones(registro?: (linea: LineaRegistro) => void) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!registro) return next();
		const inicio = performance.now();
		res.on("finish", () => {
			registro({
				requestId: res.locals.idPeticion,
				metodo: req.method,
				ruta: req.originalUrl,
				status: res.statusCode,
				ms: Math.round(performance.now() - inicio),
			});
		});
		next();
	};
}

// Solo los orígenes de la lista pueden llamar desde un navegador
export function corsConLista(origenes: string[]) {
	return cors({ origin: origenes, exposedHeaders: ["Location", "Link", "X-Request-Id"] });
}

export function limitePeticiones(porMinuto: number) {
	return rateLimit({
		windowMs: 60_000,
		limit: porMinuto,
		standardHeaders: "draft-8",
		legacyHeaders: false,
		handler: (_req, res) => problema(res, 429, "Demasiadas peticiones", `El máximo son ${porMinuto} por minuto`),
	});
}
