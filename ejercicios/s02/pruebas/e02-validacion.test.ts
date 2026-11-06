import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

function esProblema(res: request.Response, status: number) {
	expect(res.status).toBe(status);
	expect(res.headers["content-type"], "los errores van con application/problem+json").toMatch(/application\/problem\+json/);
	expect(res.body).toMatchObject({ status, title: expect.any(String) });
}

function camposConError(res: request.Response): string[] {
	expect(Array.isArray(res.body.errors), "lista los fallos en «errors»: [{ campo, mensaje }]").toBe(true);
	return res.body.errors.map((e: { campo: string }) => e.campo);
}

describe("Ejercicio 2 · Validación y errores con problem+json", () => {
	it("POST sin «titulo» responde 400 y dice qué campo falla", async () => {
		const res = await request(crearApp()).post("/tareas").send({ prioridad: "alta" });
		esProblema(res, 400);
		expect(camposConError(res)).toContain("titulo");
	});

	it("POST con «titulo» vacío o solo espacios responde 400", async () => {
		const res = await request(crearApp()).post("/tareas").send({ titulo: "   " });
		esProblema(res, 400);
	});

	it("POST con una prioridad que no existe responde 400 sobre «prioridad»", async () => {
		const res = await request(crearApp()).post("/tareas").send({ titulo: "Algo", prioridad: "urgentísima" });
		esProblema(res, 400);
		expect(camposConError(res)).toContain("prioridad");
	});

	it("POST con solo «titulo» rellena prioridad «media» y completada false", async () => {
		const res = await request(crearApp()).post("/tareas").send({ titulo: "Mínima" });
		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ titulo: "Mínima", prioridad: "media", completada: false });
	});

	it("PATCH con «completada» que no es booleano responde 400", async () => {
		const res = await request(crearApp()).patch("/tareas/1").send({ completada: "sí" });
		esProblema(res, 400);
		expect(camposConError(res)).toContain("completada");
	});

	it("PATCH no deja cambiar el id (asignación masiva)", async () => {
		const app = crearApp();
		await request(app).patch("/tareas/1").send({ id: 500, titulo: "Intento" });
		expect((await request(app).get("/tareas/500")).status, "el id lo pone el servidor, nunca el cliente").toBe(404);
		expect((await request(app).get("/tareas/1")).status).toBe(200);
	});

	it("un JSON mal formado responde 400 con problem+json, no con una página HTML", async () => {
		const res = await request(crearApp()).post("/tareas").set("Content-Type", "application/json").send('{"titulo": ');
		esProblema(res, 400);
	});

	it("GET /tareas/99 responde 404 con problem+json", async () => {
		esProblema(await request(crearApp()).get("/tareas/99"), 404);
	});
});
