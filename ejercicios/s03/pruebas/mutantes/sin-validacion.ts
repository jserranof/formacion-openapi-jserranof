// Versión rota de la API: acepta cualquier cosa. Lo que iba a ser 400 sale como 201.
import express from "express";
import { crearApp as real } from "../../src/app.js";

export function crearApp(...args: Parameters<typeof real>) {
	const envoltorio = express();
	envoltorio.use((_req, res, next) => {
		const status = res.status.bind(res);
		res.status = (c: number) => status(c === 400 ? 201 : c);
		next();
	});
	envoltorio.use(real(...args));
	return envoltorio;
}
