import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MIS_PRUEBAS, pasarMisPruebas } from "./mis-pruebas.js";

const FICHERO = "contrato.test.ts";

describe("Ejercicio 8 · Pruebas contra el contrato", { timeout: 60_000 }, () => {
	it("s03/mis-pruebas/contrato.test.ts usa cumpleContrato al menos 3 veces", () => {
		const ruta = join(MIS_PRUEBAS, FICHERO);
		expect(existsSync(ruta), "falta s03/mis-pruebas/contrato.test.ts").toBe(true);
		const usos = readFileSync(ruta, "utf8").match(/cumpleContrato\(/g)?.length ?? 0;
		expect(usos, "comprueba al menos tres respuestas con expect(cumpleContrato(res)).toEqual([])").toBeGreaterThanOrEqual(3);
	});

	it("todas pasan con la API de verdad", () => {
		const r = pasarMisPruebas(FICHERO);
		expect(r.total, "escribe al menos 3 it(…)").toBeGreaterThanOrEqual(3);
		expect(r.fallan, "tus pruebas tienen que pasar con la API buena: npm run pruebas:s03 -- contrato").toBe(0);
	});

	it("detectan una API que responde con datos que no cumplen el contrato", () => {
		expect(
			pasarMisPruebas(FICHERO, "respuesta-rota").fallan,
			"la versión rota da los mismos códigos, pero las tareas no cumplen el esquema: comprueba con cumpleContrato el cuerpo de GET /tareas y de GET /tareas/{id}",
		).toBeGreaterThan(0);
	});
});
