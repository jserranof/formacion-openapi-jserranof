import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { tareas } from "../src/datos.js";

describe("Ejercicio 8 · GET /tareas/resumen", () => {
	it("responde 200", async () => {
		const res = await request(crearApp()).get("/tareas/resumen");
		expect(res.status, "¿está la ruta /tareas/resumen ANTES de /tareas/:id? Express usa la primera que encaja").toBe(200);
	});

	it("cuenta el total, las completadas y las pendientes", async () => {
		const res = await request(crearApp()).get("/tareas/resumen");
		const completadas = tareas.filter((t) => t.completada).length;
		expect(res.body, "devuelve { total, completadas, pendientes }, calculados a partir de la lista").toEqual({
			total: tareas.length,
			completadas,
			pendientes: tareas.length - completadas,
		});
	});

	it("GET /tareas/2 sigue funcionando", async () => {
		const res = await request(crearApp()).get("/tareas/2");
		expect(res.status, "la ruta nueva no debe romper GET /tareas/:id").toBe(200);
	});
});
