// Ejercicio 12 (reto): las pruebas del recurso nuevo. Al menos 3 it(…), y que entre ellas
// comprueben que un POST sin nombre responde 400 y que un proyecto que no existe responde 404.
// Pásalas con: npm run pruebas:s03 -- proyectos
import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("API de proyectos", () => {
	it("GET /proyectos responde 200 con una lista", async () => {
		const res = await request(crearApp()).get("/proyectos");
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.items)).toBe(true);
	});
});
