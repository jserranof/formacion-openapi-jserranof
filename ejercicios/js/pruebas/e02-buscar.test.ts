import { describe, expect, it } from "vitest";
import { buscar, tareas } from "../src/tareas.js";

describe("Ejercicio 2 · buscar(lista, id)", () => {
	it("buscar(tareas, 4) devuelve la tarea 4", () => {
		expect(buscar(tareas, 4), "usa lista.find((t) => t.id === id)").toEqual(tareas[3]);
	});

	it("devuelve un objeto, no una lista", () => {
		expect(Array.isArray(buscar(tareas, 1)), "find devuelve el primero que cumple; filter, una lista").toBe(false);
	});

	it("si no existe, devuelve undefined", () => {
		expect(buscar(tareas, 99), "find devuelve undefined cuando ninguno cumple").toBeUndefined();
	});
});
