import express from "express";
import helmet from "helmet";
import { manejadorErrores, noEncontrado } from "./errores.js";
import { corsConLista, idPeticion, limitePeticiones, registroPeticiones } from "./middleware.js";
import { RepositorioTareas } from "./tareas/repositorio.js";
import { crearRutasTareas } from "./tareas/rutas.js";
import { ServicioTareas } from "./tareas/servicio.js";

/** Una línea del registro: una por petición (S2, ejercicio 11) */
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

export function crearApp({ limitePorMinuto = 100, origenes = ["http://localhost:5173"], registro }: Opciones = {}) {
	const app = express();

	// El orden importa: cada pieza ve la petición después de las de arriba
	app.use(idPeticion);
	app.use(registroPeticiones(registro));
	app.use(helmet());
	app.use(corsConLista(origenes));
	app.use(limitePeticiones(limitePorMinuto));
	app.use(express.json({ limit: "100kb" }));

	// Ejercicio 2: publicar el contrato y hacer que la API lo cumpla
	//   1. Lee ../openapi.yaml (readFileSync + parse de «yaml») y sírvelo en GET /openapi.json
	//   2. Swagger UI en /docs: app.use("/docs", swaggerUi.serve, swaggerUi.setup(contrato))
	//   3. OpenApiValidator.middleware({ apiSpec, validateRequests: true, validateResponses: true,
	//      ignorePaths: /^\/(docs|openapi\.json|fallo-de-prueba)/ })
	//   4. En errores.ts, convierte los errores del validador (traen status y errors) en problem+json

	app.get("/salud", (_req, res) => {
		res.json({ estado: "ok" });
	});

	app.use("/tareas", crearRutasTareas(new ServicioTareas(new RepositorioTareas())));

	// Ejercicio 4 (reto): app.use("/proyectos", crearRutasProyectos())

	// Solo para las pruebas del manejador de errores: simula un fallo inesperado
	app.get("/fallo-de-prueba", () => {
		throw new Error("Conexión perdida con db-interna:5432 (usuario admin)");
	});

	app.use(noEncontrado);
	app.use(manejadorErrores);

	return app;
}
