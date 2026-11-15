import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { leerContrato } from "./contrato.js";

describe("Ejercicio 4 · La API publica su contrato", () => {
	it("GET /openapi.json devuelve el contrato, en JSON", async () => {
		const res = await request(crearApp()).get("/openapi.json");
		expect(res.status, "añade app.get(\"/openapi.json\", …) en app.ts").toBe(200);
		expect(res.headers["content-type"], "usa res.json(contrato)").toMatch(/application\/json/);
		expect(res.body, "sirve el mismo contenido que openapi.yaml, ya leído con parse()").toEqual(leerContrato());
	});

	it("GET /docs/ muestra Swagger UI", async () => {
		const res = await request(crearApp()).get("/docs/");
		expect(res.status, "monta swagger-ui-express en /docs").toBe(200);
		expect(res.text, "la página de /docs/ tiene que ser la de Swagger UI").toMatch(/swagger-ui/i);
	});

	it("Swagger UI enseña vuestro contrato, no uno de ejemplo", async () => {
		const res = await request(crearApp()).get("/docs/swagger-ui-init.js");
		expect(res.status, "monta swagger-ui-express en /docs").toBe(200);
		expect(res.text, "pásale el contrato a swaggerUi.setup(contrato)").toContain(leerContrato().info.title);
	});
});
