import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { tareas } from "../src/datos.js";

describe("Ejercicio 6 (reto) · GET /tareas?completada=…", () => {
	it("?completada=true devuelve solo las completadas", async () => {
		const res = await request(crearApp()).get("/tareas?completada=true");
		expect(res.status).toBe(200);
		expect(res.body.items, "req.query.completada llega como texto: \"true\", no true").toEqual(tareas.filter((t) => t.completada));
	});

	it("?completada=false devuelve solo las pendientes", async () => {
		const res = await request(crearApp()).get("/tareas?completada=false");
		expect(res.body.items).toEqual(tareas.filter((t) => !t.completada));
	});

	it("sin el parámetro, todas", async () => {
		const res = await request(crearApp()).get("/tareas");
		expect(res.body.items, "sin ?completada no filtres nada").toEqual(tareas);
	});
});
