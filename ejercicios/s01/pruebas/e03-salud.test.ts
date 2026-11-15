import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("Ejercicio 3 · GET /salud", () => {
	it("responde 200", async () => {
		const res = await request(crearApp()).get("/salud");
		expect(res.status, "GET /salud debería devolver 200").toBe(200);
	});

	it("devuelve JSON", async () => {
		const res = await request(crearApp()).get("/salud");
		expect(res.headers["content-type"], "usa res.json(), no res.send()").toContain("application/json");
	});

	it('el cuerpo es {"estado":"ok"}', async () => {
		const res = await request(crearApp()).get("/salud");
		expect(res.body).toEqual({ estado: "ok" });
	});
});
