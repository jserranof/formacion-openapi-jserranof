import { describe, expect, it } from "vitest";
import { pendientes, tareas } from "../src/tareas.js";

describe("Ejercicio 1 · pendientes(lista)", () => {
	it("devuelve las tres tareas sin completar", () => {
		const ids = pendientes(tareas).map((t) => t.id);
		expect(ids, "usa lista.filter((t) => !t.completada)").toEqual([3, 4, 5]);
	});

	it("devuelve las tareas enteras, no solo el id o el título", () => {
		expect(pendientes(tareas)[0], "filter devuelve los mismos objetos que había en la lista").toEqual(tareas[2]);
	});

	it("con una lista vacía, devuelve una lista vacía", () => {
		expect(pendientes([])).toEqual([]);
	});
});
