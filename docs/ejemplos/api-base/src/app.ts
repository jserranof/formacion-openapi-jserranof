import { readFileSync } from "node:fs";
import express, { type NextFunction, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
import { rutasTareas } from "./tareas/rutas.js";

export function crearApp() {
	const app = express();
	app.use(express.json());

	const contrato = parse(readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8"));
	app.get("/openapi.json", (_req, res) => {
		res.json(contrato);
	});
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(contrato));

	app.get("/salud", (_req, res) => {
		res.json({ estado: "ok" });
	});

	app.use("/tareas", rutasTareas);

	app.use((req, res) => {
		res.status(404).type("application/problem+json").json({
			title: "No encontrado",
			status: 404,
			detail: `No existe ${req.method} ${req.path}`,
		});
	});

	app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
		console.error(err);
		res.status(500).type("application/problem+json").json({
			title: "Error interno",
			status: 500,
		});
	});

	return app;
}
