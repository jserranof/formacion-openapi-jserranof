import express from "express";
import { manejadorErrores, noEncontrado } from "./errores.js";
import { RepositorioTareas } from "./tareas/repositorio.js";
import { crearRutasTareas } from "./tareas/rutas.js";
import { ServicioTareas } from "./tareas/servicio.js";

/** Una línea del registro: una por petición (ejercicio 11) */
export interface LineaRegistro {
	requestId: string;
	metodo: string;
	ruta: string;
	status: number;
	ms: number;
}

export interface Opciones {
	/** Peticiones por minuto y cliente (por defecto, 100) */
	limitePorMinuto?: number;
	/** Orígenes que pueden llamar desde un navegador */
	origenes?: string[];
	/** Qué hacer con cada línea del registro (por defecto, nada; server.ts la escribe en la consola) */
	registro?: (linea: LineaRegistro) => void;
}

export function crearApp({ limitePorMinuto = 100, origenes = ["http://localhost:5173"] }: Opciones = {}) {
	const app = express();

	// Ejercicios 10 y 11: el orden importa. Antes de express.json(), por este orden:
	// idPeticion, registroPeticiones(registro), helmet(), corsConLista(origenes),
	// limitePeticiones(limitePorMinuto). Y a express.json(), un límite de 100 kB.
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
