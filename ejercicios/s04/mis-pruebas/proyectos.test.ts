// Práctica 4: tus pruebas de los proyectos. Ejecútalas con: npm run pruebas:s04
// Los tokens de prueba: token({ sub, scope }) y bearer(t), de ../pruebas/tokens.js
import request from "supertest";
import { describe, expect, it } from "vitest";
import { appDePrueba } from "../pruebas/tokens.js";

describe("Proyectos", () => {
	it("/salud sigue siendo pública", async () => {
		expect((await request(appDePrueba()).get("/salud")).status).toBe(200);
	});
});
