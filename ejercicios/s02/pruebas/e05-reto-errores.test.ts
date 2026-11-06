import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { crearApp } from "../src/app.js";

describe("Ejercicio 5 (reto) · Un 500 que no cuenta secretos", () => {
	it("un fallo inesperado responde 500 con problem+json", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const res = await request(crearApp()).get("/fallo-de-prueba");
		expect(res.status).toBe(500);
		expect(res.headers["content-type"], "también el 500 va con problem+json").toMatch(/application\/problem\+json/);
	});

	it("la respuesta no enseña la traza ni el mensaje interno", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const res = await request(crearApp()).get("/fallo-de-prueba");
		expect(res.text, "nada de rutas de ficheros ni «at …» de la traza").not.toMatch(/\bat\s|\.ts:\d+/);
		expect(res.text, "el mensaje del error es interno: no se reenvía").not.toMatch(/db-interna|admin/);
	});

	it("el error lleva el requestId, el mismo que la cabecera X-Request-Id", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const res = await request(crearApp()).get("/fallo-de-prueba").set("X-Request-Id", "busca-esto");
		expect(res.body.requestId, "así el usuario te da un dato para buscar en los logs").toBe("busca-esto");
	});

	it("el fallo sí se registra en el log del servidor", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		await request(crearApp()).get("/fallo-de-prueba");
		expect(log, "registra el error con console.error (o tu logger)").toHaveBeenCalled();
	});
});
