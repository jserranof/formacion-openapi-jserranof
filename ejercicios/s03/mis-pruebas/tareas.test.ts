// Ejercicio 3: tus pruebas. Escribe al menos 5 it(...), y que entre ellas comprueben
// que lo que está mal responde 400 y que lo que no existe responde 404.
// Pásalas con: npx vitest run s03/mis-pruebas
import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("API de tareas", () => {
	it("GET /salud responde ok", async () => {
		const res = await request(crearApp()).get("/salud");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ estado: "ok" });
	});
});
