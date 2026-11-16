import { describe, expect, it } from "vitest";
import { cambiar, type Tarea } from "../src/tareas.js";

const original = (): Tarea => ({ id: 3, titulo: "Leer el contrato", completada: false, prioridad: "media" });

describe("Ejercicio 5 · cambiar(tarea, cambios)", () => {
	it("aplica los cambios", () => {
		expect(cambiar(original(), { completada: true }).completada, "usa { ...tarea, ...cambios }").toBe(true);
	});

	it("conserva lo que no cambia", () => {
		expect(cambiar(original(), { prioridad: "alta" }), "lo que va después en las llaves gana").toEqual({
			id: 3,
			titulo: "Leer el contrato",
			completada: false,
			prioridad: "alta",
		});
	});

	it("no modifica la tarea original", () => {
		const tarea = original();
		cambiar(tarea, { completada: true });
		expect(tarea.completada, "no hagas tarea.completada = ...: devuelve una copia, { ...tarea, ...cambios }").toBe(false);
	});
});
