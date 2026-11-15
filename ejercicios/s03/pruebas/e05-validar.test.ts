import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

const problema = (res: request.Response, status: number) => {
	expect(res.status).toBe(status);
	expect(res.headers["content-type"], "también estos errores van con problem+json: conviértelos en manejadorErrores").toMatch(/application\/problem\+json/);
};

describe("Ejercicio 5 · La API cumple el contrato", () => {
	it("un parámetro de consulta que el contrato no declara responde 400", async () => {
		problema(await request(crearApp()).get("/tareas?inventado=1"), 400);
	});

	it("un id que no es un número responde 400, no 404", async () => {
		problema(await request(crearApp()).get("/tareas/abc"), 400);
	});

	it("un cuerpo que no es JSON responde 415", async () => {
		problema(await request(crearApp()).post("/tareas").set("Content-Type", "text/plain").send("hola"), 415);
	});

	it("un campo que el contrato no permite responde 400 y dice cuál", async () => {
		const res = await request(crearApp()).post("/tareas").send({ titulo: "Válida", propietario: "otro" });
		problema(res, 400);
		expect(JSON.stringify(res.body.errors ?? res.body.detail), "nombra el campo que sobra").toMatch(/propietario/);
	});

	it("una ruta que el contrato no tiene sigue siendo un 404 en problem+json", async () => {
		problema(await request(crearApp()).get("/no-existe"), 404);
	});

	it("lo que cumple el contrato sigue funcionando", async () => {
		const app = crearApp();
		expect((await request(app).get("/tareas?prioridad=alta&completada=false&limite=5")).status, "GET /tareas con filtros: ¿declara el contrato prioridad, completada y limite?").toBe(200);
		expect((await request(app).post("/tareas").send({ titulo: "Desde el contrato" })).status, "POST /tareas con solo el título").toBe(201);
		expect((await request(app).patch("/tareas/1").send({ completada: false })).status, "PATCH /tareas/1").toBe(200);
		expect((await request(app).delete("/tareas/2")).status, "DELETE /tareas/2").toBe(204);
	});
});
