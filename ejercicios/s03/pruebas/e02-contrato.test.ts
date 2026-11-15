import { Validator } from "@seriousme/openapi-schema-validator";
import { describe, expect, it } from "vitest";
import { leerContrato, operaciones, resolver } from "./contrato.js";

const contrato = leerContrato();
const op = (ruta: string, verbo: string) => contrato.paths?.[ruta]?.[verbo];

describe("Ejercicio 2 · El contrato de /tareas en openapi.yaml", () => {
	it("es un OpenAPI 3.1 válido", async () => {
		expect(contrato.openapi, "la primera línea es «openapi: 3.1.0»").toMatch(/^3\.1\./);
		const r = await new Validator().validate(contrato);
		expect(r.errors ?? [], "el contrato tiene errores de estructura").toEqual([]);
		expect(r.valid).toBe(true);
	});

	it("declara las seis operaciones de tareas", () => {
		for (const [ruta, verbo] of [["/tareas", "get"], ["/tareas", "post"], ["/tareas/{id}", "get"], ["/tareas/{id}", "put"], ["/tareas/{id}", "patch"], ["/tareas/{id}", "delete"]])
			expect(op(ruta, verbo), `falta ${verbo.toUpperCase()} ${ruta}`).toBeDefined();
	});

	it("cada operación tiene un operationId único y un summary", () => {
		const ids = operaciones(contrato).map(({ ruta, verbo, op }) => {
			expect(op.operationId, `${verbo.toUpperCase()} ${ruta} no tiene operationId`).toEqual(expect.any(String));
			expect(op.summary, `${verbo.toUpperCase()} ${ruta} no tiene summary`).toEqual(expect.any(String));
			return op.operationId;
		});
		expect(new Set(ids).size, "hay operationId repetidos").toBe(ids.length);
	});

	it("el esquema Tarea tiene sus cuatro campos obligatorios y la prioridad es un enumerado", () => {
		const tarea = resolver(contrato, contrato.components?.schemas?.Tarea);
		expect(tarea, "falta components/schemas/Tarea").toBeDefined();
		expect([...(tarea.required ?? [])].sort()).toEqual(["completada", "id", "prioridad", "titulo"]);
		const prioridad = resolver(contrato, tarea.properties?.prioridad);
		expect([...(prioridad?.enum ?? [])].sort(), "prioridad: enum [baja, media, alta]").toEqual(["alta", "baja", "media"]);
	});

	it("POST /tareas exige titulo, responde 201 y declara la cabecera Location", () => {
		const post = op("/tareas", "post");
		const cuerpo = resolver(contrato, resolver(contrato, post?.requestBody)?.content?.["application/json"]?.schema);
		expect(cuerpo?.required ?? [], "el cuerpo del POST tiene que pedir «titulo»").toContain("titulo");
		const creado = resolver(contrato, post?.responses?.["201"]);
		expect(creado, "falta la respuesta 201").toBeDefined();
		expect(creado.headers?.Location, "declara el header Location en la respuesta 201").toBeDefined();
	});

	it("GET /tareas declara sus parámetros de consulta, con limite de 1 a 100", () => {
		const params = (op("/tareas", "get")?.parameters ?? []).map((p: unknown) => resolver(contrato, p));
		const nombres = params.filter((p: { in: string }) => p.in === "query").map((p: { name: string }) => p.name);
		for (const n of ["prioridad", "completada", "orden", "pagina", "limite"]) expect(nombres, `falta el parámetro «${n}»`).toContain(n);
		const limite = resolver(contrato, params.find((p: { name: string }) => p.name === "limite").schema);
		expect(limite).toMatchObject({ minimum: 1, maximum: 100 });
	});

	it("los errores (400 y 404) se declaran como application/problem+json", () => {
		const errores = operaciones(contrato)
			.filter(({ ruta }) => ruta.startsWith("/tareas"))
			.flatMap(({ ruta, verbo, op }) => Object.entries<unknown>(op.responses ?? {}).filter(([c]) => /^4/.test(c)).map(([c, r]) => ({ donde: `${verbo.toUpperCase()} ${ruta} ${c}`, r: resolver(contrato, r) })));
		expect(errores.length, "declara al menos los 400 y 404").toBeGreaterThan(0);
		for (const { donde, r } of errores) expect(Object.keys(r.content ?? {}), `${donde} debería ser application/problem+json`).toContain("application/problem+json");
		const tiene404 = ["get", "put", "patch", "delete"].every((v) => op("/tareas/{id}", v)?.responses?.["404"]);
		expect(tiene404, "las operaciones de /tareas/{id} declaran el 404").toBe(true);
	});
});
