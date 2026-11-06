import { Router, type Response } from "express";
import type { Usuario } from "../auth.js";
import { CambiosTarea, Consulta, TareaNueva } from "./esquemas.js";
import type { ServicioTareas } from "./servicio.js";

// Quién hace la petición: lo deja autenticar() en res.locals.usuario (ejercicio 1)
const quien = (res: Response) => (res.locals.usuario as Usuario | undefined)?.sub ?? "anonimo";

// Ejercicio 3: ETag fuerte en GET, PUT y PATCH; 304 con If-None-Match; 412 con un If-Match viejo.
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
		const tarea = servicio.crear(quien(res), TareaNueva.parse(req.body));
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
