import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

type T = { id: number; titulo: string; prioridad: string; completada: boolean };
const listar = async (q: string) => (await request(crearApp()).get(`/tareas${q}`)).body as { items: T[]; total: number; pagina: number; limite: number };

describe("Ejercicio 7 · Filtrar GET /tareas", () => {
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

	it("sin filtros devuelve todas las prioridades", async () => {
		const r = await listar("?limite=100");
		expect(new Set(r.items.map((t) => t.prioridad)).size, "sin ?prioridad no se filtra nada").toBe(3);
	});

	it("un filtro con un valor que no existe responde 400 con problem+json", async () => {
		const app = crearApp();
		for (const q of ["?prioridad=urgente", "?completada=quizas"]) {
			const res = await request(app).get(`/tareas${q}`);
			expect(res.status, `GET /tareas${q}: mejor un 400 que diga qué valores valen que una lista vacía`).toBe(400);
			expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
		}
	});
});
