import { Router } from "express";
import type { ServicioTareas } from "./servicio.js";

// Traduce HTTP a llamadas al servicio. Express 5 pasa al manejador de errores lo que se lance aquí.
export function crearRutasTareas(servicio: ServicioTareas) {
	const rutas = Router();

	rutas.get("/", (_req, res) => {
		res.json(servicio.listar());
	});

	rutas.get("/:id", (req, res) => {
		res.json(servicio.obtener(Number(req.params.id)));
	});

	// Ejercicio 1: POST / (201 + Location), PUT /:id, PATCH /:id y DELETE /:id (204)

	return rutas;
}
