import { readFileSync } from "node:fs";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
import helmet from "helmet";
import { createRemoteJWKSet } from "jose";
import type { OpcionesAuth } from "./auth.js";
import { manejadorErrores, noEncontrado } from "./errores.js";
import { corsConLista, idPeticion, limitePeticiones } from "./middleware.js";
import { crearRutasProyectos } from "./proyectos/rutas.js";
import { RepositorioTareas } from "./tareas/repositorio.js";
import { crearRutasTareas } from "./tareas/rutas.js";
import { ServicioTareas } from "./tareas/servicio.js";

export interface Opciones {
	/** Peticiones por minuto y cliente (por defecto, 100) */
	limitePorMinuto?: number;
	/** Orígenes que pueden llamar desde un navegador */
	origenes?: string[];
	/** En qué tokens confiar. Por defecto, los del servidor de autorización de EMISOR (puerto 9000) */
	auth?: OpcionesAuth;
}

function authPorDefecto(): OpcionesAuth {
	const emisor = process.env.EMISOR ?? "http://localhost:9000";
	return { claves: createRemoteJWKSet(new URL(`${emisor}/jwks`)), emisor, audiencia: "api-curso" };
}

export function crearApp({ limitePorMinuto = 100, origenes = ["http://localhost:5173"], auth = authPorDefecto() }: Opciones = {}) {
	void auth; // Ejercicio 1: úsalo con autenticar(auth)
	const app = express();

	// El orden importa: cada pieza ve la petición después de las de arriba
	app.use(idPeticion);
	app.use(helmet());
	app.use(corsConLista(origenes));
	app.use(limitePeticiones(limitePorMinuto));
	app.use(express.json({ limit: "100kb" }));

	// El contrato, publicado: para personas en /docs y para programas en /openapi.json
	const rutaContrato = new URL("../openapi.yaml", import.meta.url).pathname;
	const contrato = parse(readFileSync(rutaContrato, "utf8"));
	app.get("/openapi.json", (_req, res) => {
		res.json(contrato);
	});
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(contrato));

	// Ejercicio 1: autenticar(auth) en /tareas y /proyectos, ANTES del validador:
	// sin token, 401, y no un 400 que enseñe la forma del contrato.

	// Lo que no cumpla el contrato no llega a las rutas
	app.use(
		OpenApiValidator.middleware({
			apiSpec: rutaContrato,
			validateRequests: true,
			// La seguridad la comprueba autenticar(); el validador solo mira la forma de la petición
			validateSecurity: false,
			// Apagado en S4: 304, 412 y 422 aún no están en el contrato
			validateResponses: false,
			ignorePaths: /^\/(docs|openapi\.json|fallo-de-prueba)/,
		}),
	);

	app.get("/salud", (_req, res) => {
		res.json({ estado: "ok" });
	});

	// Ejercicio 2: exigirSegunMetodo("tareas") y exigirSegunMetodo("proyectos") delante de cada router
	// Ejercicio 4: idempotencia() delante del router de tareas
	app.use("/tareas", crearRutasTareas(new ServicioTareas(new RepositorioTareas())));
	app.use("/proyectos", crearRutasProyectos());

	// Solo para las pruebas del manejador de errores: simula un fallo inesperado
	app.get("/fallo-de-prueba", () => {
		throw new Error("Conexión perdida con db-interna:5432 (usuario admin)");
	});

	app.use(noEncontrado);
	app.use(manejadorErrores);

	return app;
}
