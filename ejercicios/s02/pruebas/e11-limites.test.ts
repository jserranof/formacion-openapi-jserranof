import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { crearApp } from "../src/app.js";

describe("Ejercicio 11 · Límites y registro de cada petición", () => {
	it("un cuerpo de más de 100 kB responde 413 con problem+json", async () => {
		const res = await request(crearApp()).post("/tareas").send({ titulo: "x".repeat(200_000) });
		expect(res.status, "usa express.json({ limit: \"100kb\" }) y trata «entity.too.large» en el manejador").toBe(413);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
	});

	it("pasado el límite por minuto responde 429 con problem+json y cuándo reintentar", async () => {
		const app = crearApp({ limitePorMinuto: 3 });
		for (let i = 0; i < 3; i++) expect((await request(app).get("/salud")).status).toBe(200);
		const res = await request(app).get("/salud");
		expect(res.status, "la cuarta petición del minuto").toBe(429);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
		expect(res.headers["retry-after"] ?? res.headers["ratelimit"], "di cuándo puede volver: Retry-After o RateLimit").toBeDefined();
	});

	it("con crearApp({ registro }), cada petición deja una línea con requestId, método, ruta, código y ms", async () => {
		const registro = vi.fn();
		await request(crearApp({ registro })).get("/tareas/99").set("X-Request-Id", "linea-1");
		await new Promise((r) => setImmediate(r));
		expect(registro, "llama a registro(linea) en res.on(\"finish\"): una vez por petición").toHaveBeenCalledTimes(1);
		expect(registro.mock.calls[0][0]).toMatchObject({ requestId: "linea-1", metodo: "GET", ruta: "/tareas/99", status: 404, ms: expect.any(Number) });
	});

	it("también se registran las peticiones rechazadas por el límite", async () => {
		const registro = vi.fn();
		const app = crearApp({ limitePorMinuto: 1, registro });
		await request(app).get("/salud");
		await request(app).get("/salud");
		await new Promise((r) => setImmediate(r));
		const codigos = registro.mock.calls.map((c) => c[0].status);
		expect(codigos, "el registro va antes del límite en la cadena: si no, el 429 no se ve en los logs").toEqual([200, 429]);
	});
});
