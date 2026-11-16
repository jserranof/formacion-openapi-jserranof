import { describe, expect, it } from "vitest";
import { tareas, titulos } from "../src/tareas.js";

describe("Ejercicio 3 · titulos(lista)", () => {
	it("devuelve los seis títulos, en el mismo orden", () => {
		expect(titulos(tareas), "usa lista.map((t) => t.titulo)").toEqual([
			"Instalar Node",
			"Arrancar la API",
			"Leer el contrato",
			"Diseñar las rutas",
			"Añadir paginación",
			"Escribir pruebas",
		]);
	});

	it("con una lista vacía, devuelve una lista vacía", () => {
		expect(titulos([])).toEqual([]);
	});
});
