// Versión rota de la API: lo que no existe responde 200 en lugar de 404.
import express from "express";
import { crearApp as real } from "../../src/app.js";

export function crearApp(...args: Parameters<typeof real>) {
	const envoltorio = express();
	envoltorio.use((_req, res, next) => {
		const status = res.status.bind(res);
		res.status = (c: number) => status(c === 404 ? 200 : c);
		next();
	});
	envoltorio.use(real(...args));
	return envoltorio;
}
