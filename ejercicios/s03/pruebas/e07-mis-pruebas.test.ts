import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MIS_PRUEBAS, pasarMisPruebas } from "./mis-pruebas.js";

const FICHERO = "tareas.test.ts";

describe("Ejercicio 7 · Tus propias pruebas", { timeout: 60_000 }, () => {
	it("existe s03/mis-pruebas/tareas.test.ts", () => {
		expect(existsSync(join(MIS_PRUEBAS, FICHERO))).toBe(true);
	});

	it("tiene al menos 5 pruebas y todas pasan con la API de verdad", () => {
		const r = pasarMisPruebas(FICHERO);
		expect(r.total, "escribe al menos 5 it(…)").toBeGreaterThanOrEqual(5);
		expect(r.fallan, "tus pruebas tienen que pasar con la API buena: npm run pruebas:s03 -- tareas").toBe(0);
	});

	it("detectan una API que no valida (acepta un POST sin título)", () => {
		expect(pasarMisPruebas(FICHERO, "sin-validacion").fallan, "prueba que un POST no válido responde 400").toBeGreaterThan(0);
	});

	it("detectan una API que responde 200 a lo que no existe", () => {
		expect(pasarMisPruebas(FICHERO, "404-como-200").fallan, "prueba que una tarea inexistente responde 404").toBeGreaterThan(0);
	});
});
