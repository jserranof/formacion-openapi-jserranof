import express from "express";
// import { etiquetas, tareas } from "./datos.js";

export function crearApp() {
	const app = express();
	app.use(express.json());

	// Ejercicio 1: GET /salud

	// Ejercicio 2: GET /tareas

	// Ejercicio 3: GET /tareas/:id

	// Ejercicio 4 (reto): GET /etiquetas y GET /etiquetas/:id

	return app;
}
