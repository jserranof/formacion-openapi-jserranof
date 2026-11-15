import { describe, expect, it } from "vitest";
import { tareas } from "../src/datos.js";

type ConPrioridad = { id: number; prioridad?: string };

describe("Ejercicio 5 · La prioridad, tipada", () => {
	it("la tarea 2 tiene prioridad «alta»", () => {
		const dos = (tareas as ConPrioridad[]).find((t) => t.id === 2);
		expect(dos?.prioridad, "en datos.ts, añade prioridad: \"alta\" a la tarea 2").toBe("alta");
	});

	it("ninguna tarea tiene una prioridad que no existe", () => {
		const validas = [undefined, "alta", "media", "baja"];
		for (const t of tareas as ConPrioridad[]) {
			expect(validas, `la tarea ${t.id} tiene una prioridad no válida`).toContain(t.prioridad);
		}
	});

	it("las demás tareas siguen sin prioridad (es opcional)", () => {
		const otras = (tareas as ConPrioridad[]).filter((t) => t.id !== 2);
		expect(otras.every((t) => t.prioridad === undefined), "prioridad es opcional (prioridad?:): no hace falta ponérsela a todas").toBe(true);
	});
});
