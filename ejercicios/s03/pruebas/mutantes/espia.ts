// La API de verdad, con un espía: apunta en el fichero ESPIA cada petición que hacen tus pruebas
// («GET /tareas/7 404»), para saber qué partes del contrato recorren.
import { appendFileSync } from "node:fs";
import express from "express";
import { crearApp as real } from "../../src/app.js";

export function crearApp(...args: Parameters<typeof real>) {
	const envoltorio = express();
	envoltorio.use((req, res, next) => {
		res.on("finish", () => {
			if (process.env.ESPIA) appendFileSync(process.env.ESPIA, `${req.method} ${req.originalUrl} ${res.statusCode}\n`);
		});
		next();
	});
	envoltorio.use(real(...args));
	return envoltorio;
}
