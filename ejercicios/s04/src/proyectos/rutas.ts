import { Router } from "express";
import { ErrorApi } from "../errores.js";
import type { components } from "../tipos/api.js";

// Tipos generados desde el contrato con `npm run tipos:s03`: si cambia el contrato, el compilador avisa
type Proyecto = components["schemas"]["Proyecto"];
type ProyectoNuevo = components["schemas"]["ProyectoNuevo"];

// Aquí no hay Zod: el validador del contrato ya ha comprobado el cuerpo antes de llegar
export function crearRutasProyectos() {
	const proyectos: Proyecto[] = [{ id: 1, nombre: "Curso de APIs", descripcion: "Material y ejercicios" }];
	const rutas = Router();

	rutas.get("/", (_req, res) => {
		res.json({ items: proyectos });
	});

	rutas.get("/:id", (req, res) => {
		const proyecto = proyectos.find((p) => p.id === Number(req.params.id));
		if (!proyecto) throw new ErrorApi(404, "Proyecto no encontrado", `No hay ningún proyecto con id ${req.params.id}`);
		res.json(proyecto);
	});

	rutas.post("/", (req, res) => {
		const datos = req.body as ProyectoNuevo;
		const proyecto: Proyecto = { id: proyectos.length + 1, ...datos };
		proyectos.push(proyecto);
		res.status(201).location(`/proyectos/${proyecto.id}`).json(proyecto);
	});

	return rutas;
}
