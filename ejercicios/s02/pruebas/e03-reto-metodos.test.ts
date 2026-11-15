import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

// «GET, POST» → ["GET", "POST"]
const metodos = (allow: string | undefined) => (allow ?? "").split(",").map((m) => m.trim().toUpperCase()).filter(Boolean);

describe("Ejercicio 3 (reto) · 405: el recurso existe, el verbo no", () => {
	it("DELETE /tareas responde 405, no 404", async () => {
		const res = await request(crearApp()).delete("/tareas");
		expect(res.status, "la colección existe; lo que no se puede es borrarla entera: 405 Method Not Allowed").toBe(405);
	});

	it("el 405 de /tareas dice en «Allow» qué verbos sí valen (GET y POST)", async () => {
		const res = await request(crearApp()).put("/tareas");
		expect(res.status).toBe(405);
		expect(metodos(res.headers.allow).sort(), "cabecera Allow: GET, POST").toEqual(["GET", "POST"]);
	});

	it("POST /tareas/3 responde 405 con Allow: GET, PUT, PATCH, DELETE", async () => {
		const res = await request(crearApp()).post("/tareas/3").send({ titulo: "x" });
		expect(res.status, "sobre una tarea no se crea: se lee, se sustituye, se cambia o se borra").toBe(405);
		expect(metodos(res.headers.allow).sort()).toEqual(["DELETE", "GET", "PATCH", "PUT"]);
	});

	it("el 405 va con problem+json", async () => {
		const res = await request(crearApp()).delete("/tareas");
		expect(res.headers["content-type"], "usa problema(res, 405, …)").toMatch(/application\/problem\+json/);
		expect(res.body).toMatchObject({ status: 405, title: expect.any(String) });
	});

	it("los verbos que sí existen siguen funcionando", async () => {
		const app = crearApp();
		expect((await request(app).get("/tareas")).status, "GET /tareas").toBe(200);
		expect((await request(app).get("/tareas/3")).status, "GET /tareas/3: el 405 va después de las rutas de verdad").toBe(200);
	});
});
