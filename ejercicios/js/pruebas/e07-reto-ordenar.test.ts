import { describe, expect, it } from "vitest";
import { ordenarPorTitulo, tareas } from "../src/tareas.js";

describe("Ejercicio 7 (reto) · ordenarPorTitulo(lista)", () => {
	it("ordena de la A a la Z, con la Á junto a la A", () => {
		expect(ordenarPorTitulo(tareas).map((t) => t.id), "compara con a.titulo.localeCompare(b.titulo)").toEqual([5, 2, 4, 6, 1, 3]);
	});

	it("no desordena la lista original", () => {
		const copia = [...tareas];
		ordenarPorTitulo(copia);
		expect(copia.map((t) => t.id), "sort cambia la lista que ordena: ordena una copia, [...lista].sort(...)").toEqual([1, 2, 3, 4, 5, 6]);
	});
});
