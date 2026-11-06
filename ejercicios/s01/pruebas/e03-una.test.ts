import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { tareas } from "../src/datos.js";

describe("Ejercicio 3 · GET /tareas/:id", () => {
	it("una que existe: 200 con la tarea", async () => {
		const res = await request(crearApp()).get("/tareas/2");
		expect(res.status, "GET /tareas/2 debería devolver 200").toBe(200);
		expect(res.body).toEqual(tareas[1]);
	});

	it("el id se compara como número, no como texto", async () => {
		const res = await request(crearApp()).get("/tareas/1");
		expect(res.body?.id, "req.params.id es un string: conviértelo con Number()").toBe(1);
	});

	it("una que no existe: 404", async () => {
		const res = await request(crearApp()).get("/tareas/99");
		expect(res.status, "si no existe, 404 (no 200 con el cuerpo vacío)").toBe(404);
	});

	it("el 404 explica el error con problem+json", async () => {
		const res = await request(crearApp()).get("/tareas/99");
		expect(res.headers["content-type"], "usa res.type(\"application/problem+json\")").toMatch(/application\/problem\+json/);
		expect(res.body).toMatchObject({ status: 404, title: expect.any(String) });
	});
});
