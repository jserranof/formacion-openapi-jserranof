import express from "express";
import { manejadorErrores, noEncontrado } from "./errores.js";
import { RepositorioTareas } from "./tareas/repositorio.js";
import { crearRutasTareas } from "./tareas/rutas.js";
import { ServicioTareas } from "./tareas/servicio.js";

export interface Opciones {
	/** Peticiones por minuto y cliente (por defecto, 100) */
	limitePorMinuto?: number;
	/** Orígenes que pueden llamar desde un navegador */
	origenes?: string[];
}

export function crearApp({ limitePorMinuto = 100, origenes = ["http://localhost:5173"] }: Opciones = {}) {
	const app = express();

	// Ejercicio 4: el orden importa. Antes de express.json(), por este orden:
	// idPeticion, helmet(), corsConLista(origenes), limitePeticiones(limitePorMinuto)
	app.use(express.json());

	app.get("/salud", (_req, res) => {
		res.json({ estado: "ok" });
	});

	app.use("/tareas", crearRutasTareas(new ServicioTareas(new RepositorioTareas())));

	// Solo para las pruebas del manejador de errores: simula un fallo inesperado
	app.get("/fallo-de-prueba", () => {
		throw new Error("Conexión perdida con db-interna:5432 (usuario admin)");
	});

	app.use(noEncontrado);
	app.use(manejadorErrores);

	return app;
}
