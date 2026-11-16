import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { arrancarApi, conectar, diceQueSi, texto } from "./agente.js";
import { bearer, token } from "./tokens.js";

let api: Awaited<ReturnType<typeof arrancarApi>>;

// ¿Sigue existiendo la tarea? Se pregunta a la API directamente, no al agente
const existe = async (id: number) => (await fetch(`${api.url}/tareas/${id}`, { headers: bearer(await token({ sub: "ana" })) })).status === 200;

describe("Ejercicio 11 · Confirmación humana y permisos mínimos", () => {
	beforeAll(async () => {
		api = await arrancarApi();
	});
	afterAll(() => api.cerrar());

	it("borrar_tarea existe y se marca como destructiva", async () => {
		const borrar = (await (await conectar({ urlApi: api.url })).listTools()).tools.find((t) => t.name === "borrar_tarea");
		expect(borrar, "registra la herramienta borrar_tarea, con el parámetro id").toBeDefined();
		expect(borrar?.annotations?.destructiveHint, "annotations: { destructiveHint: true }: el cliente avisará antes de usarla").toBe(true);
	});

	it("antes de borrar, pregunta a la persona, y le dice qué tarea va a borrar", async () => {
		const preguntas: string[] = [];
		const cliente = await conectar({ urlApi: api.url, persona: (p) => (preguntas.push(p.message), diceQueSi(p)) });
		const r = await cliente.callTool({ name: "borrar_tarea", arguments: { id: 6 } });
		expect(preguntas.length, "usa servidor.server.elicitInput({ message, requestedSchema }) antes de llamar a DELETE").toBe(1);
		expect(preguntas[0], "el mensaje lleva el título de la tarea (pídela antes con GET): la persona tiene que saber qué borra").toMatch(/Documentar los errores/);
		expect(r.isError ?? false).toBe(false);
		expect(await existe(6), "con un sí, se borra de verdad").toBe(false);
	});

	it("si la persona dice que no, no se borra", async () => {
		const r = await (await conectar({ urlApi: api.url, persona: () => ({ action: "decline" }) })).callTool({ name: "borrar_tarea", arguments: { id: 5 } });
		expect(await existe(5), "action «decline» o «cancel»: no llames a DELETE").toBe(true);
		expect(texto(r), "dile al agente que no se ha borrado porque la persona no lo ha confirmado").toMatch(/no se ha borrado|no (lo )?ha confirmado/i);
	});

	it("si la persona acepta pero deja la casilla sin marcar, tampoco se borra", async () => {
		const noMarca = { action: "accept" as const, content: {} };
		await (await conectar({ urlApi: api.url, persona: () => noMarca })).callTool({ name: "borrar_tarea", arguments: { id: 4 } });
		expect(await existe(4), "comprueba el valor de la casilla, no solo que haya dicho «accept»").toBe(true);
	});

	it("si el cliente no sabe pedir confirmación, no se borra y se devuelve un error", async () => {
		const r = await (await conectar({ urlApi: api.url })).callTool({ name: "borrar_tarea", arguments: { id: 3 } });
		expect(await existe(3), "sin una persona que diga sí, nunca se borra").toBe(true);
		expect(r.isError, "captura el fallo de elicitInput y devuelve isError: true").toBe(true);
	});

	it("permisos mínimos: con un token de solo lectura, el agente solo ve listar_tareas", async () => {
		const { tools } = await (await conectar({ urlApi: api.url, scope: "tareas:leer" })).listTools();
		expect(tools.map((t) => t.name), "lee el «scope» del token (decodeJwt de jose) y registra crear y borrar solo con tareas:escribir").toEqual(["listar_tareas"]);
	});
});
