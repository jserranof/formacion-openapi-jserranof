import { describe, expect, it } from "vitest";
import { buscarTexto, tareas } from "../src/tareas.js";

describe("Ejercicio 6 (reto) · buscarTexto(lista, texto)", () => {
	it("\"ar\" encuentra las tres tareas que lo contienen", () => {
		const ids = buscarTexto(tareas, "ar").map((t) => t.id);
		expect(ids, "usa filter y t.titulo.includes(texto)").toEqual([1, 2, 4]);
	});

	it("no distingue mayúsculas: \"API\" y \"api\" encuentran lo mismo", () => {
		expect(buscarTexto(tareas, "api"), "pasa los dos textos a minúsculas con toLowerCase()").toEqual(buscarTexto(tareas, "API"));
		expect(buscarTexto(tareas, "api").map((t) => t.id)).toEqual([2]);
	});

	it("si nada coincide, devuelve una lista vacía", () => {
		expect(buscarTexto(tareas, "zzz")).toEqual([]);
	});
});
