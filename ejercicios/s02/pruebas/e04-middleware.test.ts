import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("Ejercicio 4 · La cadena de middleware", () => {
	it("cada respuesta lleva un X-Request-Id", async () => {
		const res = await request(crearApp()).get("/salud");
		expect(res.headers["x-request-id"], "genera uno con randomUUID() si no llega").toMatch(/^[\w-]{8,}$/);
	});

	it("si la petición trae X-Request-Id, se devuelve el mismo", async () => {
		const res = await request(crearApp()).get("/salud").set("X-Request-Id", "prueba-123");
		expect(res.headers["x-request-id"]).toBe("prueba-123");
	});

	it("cabeceras de seguridad (helmet) y sin X-Powered-By", async () => {
		const res = await request(crearApp()).get("/salud");
		expect(res.headers["x-content-type-options"], "falta helmet()").toBe("nosniff");
		expect(res.headers["x-powered-by"], "no digas que usas Express").toBeUndefined();
	});

	it("CORS: un origen de la lista puede llamar", async () => {
		const res = await request(crearApp()).get("/tareas").set("Origin", "http://localhost:5173");
		expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
	});

	it("CORS: un origen fuera de la lista no recibe permiso (nada de «*»)", async () => {
		const res = await request(crearApp()).get("/tareas").set("Origin", "https://malicioso.example");
		expect(res.headers["access-control-allow-origin"]).toBeUndefined();
	});

	it("CORS: la lista se puede cambiar con crearApp({ origenes })", async () => {
		const res = await request(crearApp({ origenes: ["https://panel.example"] })).get("/tareas").set("Origin", "https://panel.example");
		expect(res.headers["access-control-allow-origin"]).toBe("https://panel.example");
	});

	it("un cuerpo de más de 100 kB responde 413 con problem+json", async () => {
		const res = await request(crearApp()).post("/tareas").send({ titulo: "x".repeat(200_000) });
		expect(res.status, "usa express.json({ limit: \"100kb\" })").toBe(413);
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
});
