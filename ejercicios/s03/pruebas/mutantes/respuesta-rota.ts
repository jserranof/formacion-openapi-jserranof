// Versión rota de la API: los códigos son los buenos, pero lo que devuelve no cumple el contrato.
// Las tareas salen con una prioridad que no existe y sin «completada», y las listas, sin «total».
// Toca la respuesta después del validador del contrato, así que el validador no lo ve.
import express from "express";
import { crearApp as real } from "../../src/app.js";

type Objeto = Record<string, unknown>;

function romperTarea(t: unknown) {
	if (!t || typeof t !== "object" || !("titulo" in t)) return t;
	const { completada: _c, ...resto } = t as Objeto;
	return { ...resto, prioridad: "urgentísima" };
}

function romper(cuerpo: unknown) {
	if (!cuerpo || typeof cuerpo !== "object") return cuerpo;
	const c = cuerpo as Objeto;
	if (Array.isArray(c.items)) {
		const { total: _t, ...resto } = c;
		return { ...resto, items: c.items.map(romperTarea) };
	}
	return romperTarea(c);
}

export function crearApp(...args: Parameters<typeof real>) {
	const envoltorio = express();
	envoltorio.use((_req, res, next) => {
		const json = res.json.bind(res);
		res.json = (cuerpo: unknown) => json(romper(cuerpo));
		next();
	});
	envoltorio.use(real(...args));
	return envoltorio;
}
