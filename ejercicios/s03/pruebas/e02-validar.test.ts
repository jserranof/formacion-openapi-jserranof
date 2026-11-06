import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { leerContrato } from "./contrato.js";

const problema = (res: request.Response, status: number) => {
	expect(res.status).toBe(status);
	expect(res.headers["content-type"], "también estos errores van con problem+json").toMatch(/application\/problem\+json/);
};

describe("Ejercicio 2 · La API publica el contrato y lo cumple", () => {
	it("GET /openapi.json devuelve el contrato", async () => {
		const res = await request(crearApp()).get("/openapi.json");
		expect(res.status).toBe(200);
		expect(res.body, "sirve el mismo contenido que openapi.yaml").toEqual(leerContrato());
	});

	it("GET /docs/ muestra Swagger UI", async () => {
		const res = await request(crearApp()).get("/docs/");
		expect(res.status, "monta swagger-ui-express en /docs").toBe(200);
		expect(res.text).toMatch(/swagger/i);
	});

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

	it("lo que cumple el contrato sigue funcionando", async () => {
		const app = crearApp();
		expect((await request(app).get("/tareas?prioridad=alta&completada=false&limite=5")).status).toBe(200);
		expect((await request(app).post("/tareas").send({ titulo: "Desde el contrato" })).status).toBe(201);
		expect((await request(app).patch("/tareas/1").send({ completada: false })).status).toBe(200);
	});
});
