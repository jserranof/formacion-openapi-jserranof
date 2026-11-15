import { describe, expect, it } from "vitest";
import { pasarMisPruebas } from "./mis-pruebas.js";

const FICHERO = "proyectos.test.ts";

describe("Ejercicio 12 (reto) · Cierra el círculo: las pruebas de proyectos", { timeout: 60_000 }, () => {
	it("s03/mis-pruebas/proyectos.test.ts tiene al menos 3 pruebas y todas pasan", () => {
		const r = pasarMisPruebas(FICHERO);
		expect(r.total, "escribe al menos 3 it(…) en s03/mis-pruebas/proyectos.test.ts").toBeGreaterThanOrEqual(3);
		expect(r.fallan, "tienen que pasar con tu API: npm run pruebas:s03 -- proyectos").toBe(0);
	});

	it("detectan un POST /proyectos sin nombre que se acepta", () => {
		expect(pasarMisPruebas(FICHERO, "sin-validacion").fallan, "prueba que un POST sin nombre responde 400").toBeGreaterThan(0);
	});

	it("detectan un proyecto que no existe y responde 200", () => {
		expect(pasarMisPruebas(FICHERO, "404-como-200").fallan, "prueba que un proyecto que no existe responde 404").toBeGreaterThan(0);
	});
});
