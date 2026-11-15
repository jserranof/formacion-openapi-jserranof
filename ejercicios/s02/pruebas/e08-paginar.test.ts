import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

type T = { id: number; titulo: string; prioridad: string; completada: boolean };
const listar = async (q: string) => (await request(crearApp()).get(`/tareas${q}`)).body as { items: T[]; total: number; pagina: number; limite: number };

describe("Ejercicio 8 · Ordenar y paginar GET /tareas", () => {
	it("por defecto devuelve 10, con «total», «pagina» y «limite»", async () => {
		const r = await listar("");
		expect(r.items.length, "por defecto, 10 por página").toBe(10);
		expect(r, "la respuesta lleva { items, total, pagina, limite }").toMatchObject({ total: 12, pagina: 1, limite: 10 });
	});

	it("?limite=5&pagina=2 devuelve de la 6 a la 10", async () => {
		const r = await listar("?limite=5&pagina=2");
		expect(r.items.map((t) => t.id)).toEqual([6, 7, 8, 9, 10]);
		expect(r.total, "«total» cuenta todas, no solo las de la página").toBe(12);
	});

	it("una página más allá del final devuelve la lista vacía, no un error", async () => {
		const r = await listar("?limite=5&pagina=9");
		expect(r.items, "pagina=9 no existe, pero la petición está bien: 200 con items vacío").toEqual([]);
		expect(r.total).toBe(12);
	});

	it("?orden=-titulo ordena por título de la Z a la A", async () => {
		const r = await listar("?orden=-titulo&limite=100");
		const titulos = r.items.map((t) => t.titulo);
		expect(titulos).toEqual([...titulos].sort((a, b) => b.localeCompare(a, "es")));
	});

	it("?orden=prioridad va de baja a alta (por su orden, no por el alfabeto)", async () => {
		const r = await listar("?orden=prioridad&limite=100");
		const peso = { baja: 0, media: 1, alta: 2 } as Record<string, number>;
		const pesos = r.items.map((t) => peso[t.prioridad]);
		expect(pesos, "«alta» < «baja» < «media» en el alfabeto: usa la posición en PRIORIDADES").toEqual([...pesos].sort((a, b) => a - b));
	});

	it("límite, página u orden no válidos responden 400 con problem+json", async () => {
		const app = crearApp();
		for (const q of ["?limite=0", "?limite=500", "?pagina=abc", "?pagina=0", "?orden=fecha"]) {
			const res = await request(app).get(`/tareas${q}`);
			expect(res.status, `GET /tareas${q} debería ser 400`).toBe(400);
			expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
		}
	});
});
