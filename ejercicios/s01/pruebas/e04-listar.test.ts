import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { tareas } from "../src/datos.js";

describe("Ejercicio 4 · GET /tareas", () => {
	it("responde 200 con JSON", async () => {
		const res = await request(crearApp()).get("/tareas");
		expect(res.status, "GET /tareas debería devolver 200").toBe(200);
		expect(res.headers["content-type"]).toContain("application/json");
	});

	it("la lista va dentro de «items», no suelta", async () => {
		const res = await request(crearApp()).get("/tareas");
		expect(Array.isArray(res.body), "devuelve { items: [...] }, no el array directamente").toBe(false);
		expect(Array.isArray(res.body.items), "falta la propiedad «items» con un array").toBe(true);
	});

	it("están todas las tareas de datos.ts", async () => {
		const res = await request(crearApp()).get("/tareas");
		expect(res.body.items).toEqual(tareas);
	});
});
