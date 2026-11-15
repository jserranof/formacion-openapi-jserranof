import { existsSync, readFileSync } from "node:fs";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { leerContrato, operaciones, resolver } from "./contrato.js";

const contrato = leerContrato();
const deProyectos = () => operaciones(contrato).filter(({ ruta }) => ruta.startsWith("/proyectos"));

describe("Ejercicio 11 · Proyectos, del contrato al código", () => {
	it("el contrato declara GET y POST /proyectos y GET /proyectos/{id}", () => {
		for (const [ruta, verbo] of [["/proyectos", "get"], ["/proyectos", "post"], ["/proyectos/{id}", "get"]])
			expect(contrato.paths?.[ruta]?.[verbo], `falta ${verbo.toUpperCase()} ${ruta}`).toBeDefined();
	});

	it("un agente lo entendería: cada operación explica cuándo usarla", () => {
		for (const { ruta, verbo, op } of deProyectos())
			expect(op.description?.length ?? 0, `${verbo.toUpperCase()} ${ruta}: description de al menos 30 caracteres`).toBeGreaterThanOrEqual(30);
	});

	it("un agente lo entendería: cada campo de Proyecto tiene description", () => {
		const proyecto = resolver(contrato, contrato.components?.schemas?.Proyecto);
		expect(proyecto?.properties, "falta components/schemas/Proyecto").toBeDefined();
		for (const [campo, def] of Object.entries<{ description?: string }>(proyecto.properties)) expect(resolver(contrato, def).description, `«${campo}» no tiene description`).toBeTruthy();
	});

	it("los tipos están generados desde el contrato (npm run tipos:s03)", () => {
		const ruta = new URL("../src/tipos/api.d.ts", import.meta.url);
		expect(existsSync(ruta), "ejecuta npm run tipos:s03").toBe(true);
		expect(readFileSync(ruta, "utf8"), "vuelve a generarlos: no incluyen Proyecto").toMatch(/Proyecto/);
	});

	it("GET /proyectos responde { items }", async () => {
		const res = await request(crearApp()).get("/proyectos");
		expect(res.status, "monta las rutas en app.ts: app.use(\"/proyectos\", crearRutasProyectos())").toBe(200);
		expect(Array.isArray(res.body.items)).toBe(true);
	});

	it("POST /proyectos crea (201 + Location) y GET /proyectos/{id} lo devuelve", async () => {
		const app = crearApp();
		const res = await request(app).post("/proyectos").send({ nombre: "Nuevo" });
		expect(res.status).toBe(201);
		expect(res.headers.location).toBe(`/proyectos/${res.body.id}`);
		expect((await request(app).get(res.headers.location)).body).toMatchObject({ nombre: "Nuevo" });
	});

	it("POST /proyectos sin nombre responde 400, y un id que no existe, 404", async () => {
		const app = crearApp();
		expect((await request(app).post("/proyectos").send({ descripcion: "Sin nombre" })).status, "«nombre» tiene que estar en required de ProyectoNuevo").toBe(400);
		expect((await request(app).get("/proyectos/999")).status, "si no lo encuentras, lanza un ErrorApi(404, …)").toBe(404);
	});
});
