import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("Ejercicio 4 · Un manejador central de errores", () => {
	it("GET /tareas/99 responde 404 con problem+json, no con una página HTML", async () => {
		const res = await request(crearApp()).get("/tareas/99");
		expect(res.status).toBe(404);
		expect(res.headers["content-type"], "el manejador tiene que contestar con problema(), no pasarle el error a Express").toMatch(/application\/problem\+json/);
	});

	it("un ErrorApi conserva su status, su título y su detalle", async () => {
		const res = await request(crearApp()).get("/tareas/99");
		expect(res.body, "usa err.status, err.titulo y err.detalle").toMatchObject({
			status: 404,
			title: "Tarea no encontrada",
			detail: expect.stringContaining("99"),
		});
	});

	it("un JSON mal formado responde 400 con problem+json", async () => {
		const res = await request(crearApp()).post("/tareas").set("Content-Type", "application/json").send('{"titulo": ');
		expect(res.status, "el error de express.json() trae type «entity.parse.failed»: es culpa del cliente").toBe(400);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
		expect(res.text, "nada de páginas HTML con la traza del error").not.toMatch(/<!DOCTYPE|<html|SyntaxError/i);
	});

	it("una ruta que no existe sigue respondiendo 404 con problem+json", async () => {
		const res = await request(crearApp()).get("/no-existe");
		expect(res.status).toBe(404);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
	});
});
