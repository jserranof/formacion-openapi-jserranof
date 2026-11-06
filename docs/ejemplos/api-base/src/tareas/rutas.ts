import { Router } from "express";
import * as repositorio from "./repositorio.js";

export const rutasTareas = Router();

rutasTareas.get("/", (_req, res) => {
	res.json({ items: repositorio.listar() });
});

rutasTareas.get("/:id", (req, res) => {
	const tarea = repositorio.buscar(Number(req.params.id));
	if (!tarea) {
		res.status(404).type("application/problem+json").json({
			title: "Tarea no encontrada",
			status: 404,
			detail: `No hay ninguna tarea con id ${req.params.id}`,
		});
		return;
	}
	res.json(tarea);
});

rutasTareas.post("/", (req, res) => {
	const titulo = req.body?.titulo;
	if (typeof titulo !== "string" || titulo.trim() === "") {
		res.status(400).type("application/problem+json").json({
			title: "Petición no válida",
			status: 400,
			detail: "El campo «titulo» es obligatorio",
		});
		return;
	}
	const tarea = repositorio.crear(titulo.trim());
	res.status(201).location(`/tareas/${tarea.id}`).json(tarea);
});
