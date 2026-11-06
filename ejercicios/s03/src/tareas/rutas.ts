import { Router } from "express";
import { CambiosTarea, Consulta, TareaNueva } from "./esquemas.js";
import type { ServicioTareas } from "./servicio.js";

// Traduce HTTP a llamadas al servicio. Express 5 pasa al manejador de errores lo que se lance aquí.
export function crearRutasTareas(servicio: ServicioTareas) {
	const rutas = Router();

	rutas.get("/", (req, res) => {
		res.json(servicio.listar(Consulta.parse(req.query)));
	});

	rutas.get("/:id", (req, res) => {
		res.json(servicio.obtener(Number(req.params.id)));
	});

	rutas.post("/", (req, res) => {
		const tarea = servicio.crear(TareaNueva.parse(req.body));
		res.status(201).location(`/tareas/${tarea.id}`).json(tarea);
	});

	rutas.put("/:id", (req, res) => {
		res.json(servicio.reemplazar(Number(req.params.id), TareaNueva.parse(req.body)));
	});

	rutas.patch("/:id", (req, res) => {
		res.json(servicio.cambiar(Number(req.params.id), CambiosTarea.parse(req.body)));
	});

	rutas.delete("/:id", (req, res) => {
		servicio.borrar(Number(req.params.id));
		res.status(204).end();
	});

	return rutas;
}
