// Ejercicio 8: pruebas contra el contrato. No miran un campo o un código suelto: miran
// que la respuesta entera es la que promete openapi.yaml (código, Content-Type y cuerpo).
// Escribe al menos 3 it(…) con cumpleContrato: listar, obtener una, crear, un error…
// Pásalas con: npm run pruebas:s03 -- contrato
import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { cumpleContrato } from "./cumple-contrato.js";

describe("La API cumple su contrato", () => {
	it("GET /salud", async () => {
		const res = await request(crearApp()).get("/salud");
		expect(cumpleContrato(res)).toEqual([]);
	});
});
