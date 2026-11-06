import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

type T = { id: number; titulo: string; prioridad: string; completada: boolean };
const listar = async (q: string) => (await request(crearApp()).get(`/tareas${q}`)).body as { items: T[]; total: number; pagina: number; limite: number };

describe("Ejercicio 3 · Filtrar, ordenar y paginar GET /tareas", () => {
	it("?prioridad=alta devuelve solo las de prioridad alta", async () => {
		const r = await listar("?prioridad=alta&limite=100");
		expect(r.items.length).toBeGreaterThan(0);
		expect(r.items.every((t) => t.prioridad === "alta"), "hay tareas de otra prioridad").toBe(true);
	});

	it("?completada=false devuelve solo las pendientes", async () => {
		const r = await listar("?completada=false&limite=100");
		expect(r.items.length).toBeGreaterThan(0);
		expect(r.items.every((t) => t.completada === false), "«false» llega como texto: compáralo bien").toBe(true);
	});

	it("los filtros se combinan", async () => {
		const r = await listar("?prioridad=alta&completada=true&limite=100");
		expect(r.items.map((t) => t.id)).toEqual([1, 2]);
	});

	it("por defecto devuelve 10, con «total», «pagina» y «limite»", async () => {
		const r = await listar("");
		expect(r.items.length).toBe(10);
		expect(r, "la respuesta lleva { items, total, pagina, limite }").toMatchObject({ total: 12, pagina: 1, limite: 10 });
	});

	it("?limite=5&pagina=2 devuelve de la 6 a la 10", async () => {
		const r = await listar("?limite=5&pagina=2");
		expect(r.items.map((t) => t.id)).toEqual([6, 7, 8, 9, 10]);
		expect(r.total, "«total» cuenta todas, no solo las de la página").toBe(12);
	});

	it("?orden=-titulo ordena por título de la Z a la A", async () => {
		const r = await listar("?orden=-titulo&limite=100");
		const titulos = r.items.map((t) => t.titulo);
		expect(titulos).toEqual([...titulos].sort((a, b) => b.localeCompare(a, "es")));
	});

	it("parámetros no válidos responden 400 con problem+json", async () => {
		const app = crearApp();
		for (const q of ["?prioridad=urgente", "?limite=0", "?limite=500", "?pagina=abc", "?orden=fecha"]) {
			const res = await request(app).get(`/tareas${q}`);
			expect(res.status, `GET /tareas${q} debería ser 400`).toBe(400);
			expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
		}
	});
});
