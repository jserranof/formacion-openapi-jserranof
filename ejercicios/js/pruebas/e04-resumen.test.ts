import { describe, expect, it } from "vitest";
import { resumen, tareas } from "../src/tareas.js";

describe("Ejercicio 4 · resumen(lista)", () => {
	it("cuenta 6 en total, 3 completadas y 3 pendientes", () => {
		expect(resumen(tareas), "total es lista.length; completadas, lista.filter(...).length").toEqual({
			total: 6,
			completadas: 3,
			pendientes: 3,
		});
	});

	it("funciona con cualquier lista, no solo con la de ejemplo", () => {
		expect(resumen(tareas.slice(0, 2)), "no escribas los números a mano: cuéntalos").toEqual({
			total: 2,
			completadas: 2,
			pendientes: 0,
		});
	});
});
