import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { etiquetas } from "../src/datos.js";

describe("Ejercicio 9 (reto) · GET /etiquetas y GET /etiquetas/:id", () => {
	it("GET /etiquetas devuelve { items } con todas", async () => {
		const res = await request(crearApp()).get("/etiquetas");
		expect(res.status).toBe(200);
		expect(res.body.items).toEqual(etiquetas);
	});

	it("GET /etiquetas/1 devuelve la etiqueta", async () => {
		const res = await request(crearApp()).get("/etiquetas/1");
		expect(res.status).toBe(200);
		expect(res.body).toEqual(etiquetas[0]);
	});

	it("GET /etiquetas/99 devuelve 404 con problem+json", async () => {
		const res = await request(crearApp()).get("/etiquetas/99");
		expect(res.status).toBe(404);
		expect(res.headers["content-type"]).toContain("application/problem+json");
	});

	it("una ruta que no existe devuelve 404 con problem+json", async () => {
		const res = await request(crearApp()).get("/no-existe");
		expect(res.status).toBe(404);
		expect(res.headers["content-type"], "añade un manejador final con app.use((req, res) => ...)").toContain("application/problem+json");
	});
});
