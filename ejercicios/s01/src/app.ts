import express from "express";
// import { etiquetas, tareas } from "./datos.js";

export function crearApp() {
	const app = express();
	app.use(express.json());

	// Ejercicio 3: GET /salud

	// Ejercicio 4: GET /tareas
	// Ejercicio 6 (reto): que GET /tareas?completada=true|false filtre

	// Ejercicio 8: GET /tareas/resumen (ojo: tiene que ir ANTES de /tareas/:id)

	// Ejercicio 7: GET /tareas/:id

	// Ejercicio 9 (reto): GET /etiquetas, GET /etiquetas/:id y el manejador final

	return app;
}
