import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("Ejercicio 6 (reto) · Un id que no es un id: ¿400 o 404?", () => {
	it("GET /tareas/abc responde 400, no 404", async () => {
		const res = await request(crearApp()).get("/tareas/abc");
		expect(res.status, "«abc» no puede ser el id de nada: la petición está mal escrita (400)").toBe(400);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
	});

	it("el 400 dice que el campo que falla es «id»", async () => {
		const res = await request(crearApp()).get("/tareas/abc");
		const campos = (res.body.errors ?? []).map((e: { campo: string }) => e.campo);
		expect(campos, "valida { id: req.params.id } con Zod: así el error sale con campo «id»").toContain("id");
	});

	it("0, -3 y 2.5 tampoco son ids válidos", async () => {
		const app = crearApp();
		for (const id of ["0", "-3", "2.5"]) {
			expect((await request(app).get(`/tareas/${id}`)).status, `GET /tareas/${id}: un id es un entero de 1 en adelante`).toBe(400);
		}
	});

	it("PATCH y DELETE validan el id igual", async () => {
		const app = crearApp();
		expect((await request(app).patch("/tareas/abc").send({ completada: true })).status, "PATCH /tareas/abc").toBe(400);
		expect((await request(app).delete("/tareas/abc")).status, "DELETE /tareas/abc").toBe(400);
	});

	it("un id bien escrito que no existe sigue siendo 404", async () => {
		expect((await request(crearApp()).get("/tareas/99")).status, "/tareas/99 está bien escrita: no existe (404)").toBe(404);
	});
});
