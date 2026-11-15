import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

describe("Ejercicio 10 · La cadena de middleware: identificador, helmet y CORS", () => {
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
});
