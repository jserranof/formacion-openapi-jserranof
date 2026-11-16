import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { arrancarApi, conectar, texto } from "./agente.js";
import { token } from "./tokens.js";

let api: Awaited<ReturnType<typeof arrancarApi>>;

describe("Ejercicio 10 · La API, lista para agentes de IA (MCP)", () => {
	beforeAll(async () => {
		api = await arrancarApi();
	});
	afterAll(() => api.cerrar());

	it("ofrece las herramientas listar_tareas y crear_tarea", async () => {
		const { tools } = await (await conectar({ urlApi: api.url })).listTools();
		expect(tools.map((t) => t.name), "servidor.registerTool(\"listar_tareas\", …) y \"crear_tarea\"").toEqual(expect.arrayContaining(["listar_tareas", "crear_tarea"]));
	});

	it("cada herramienta explica cuándo usarla (description de 40 caracteres o más)", async () => {
		for (const t of (await (await conectar({ urlApi: api.url })).listTools()).tools)
			expect(t.description?.length ?? 0, `${t.name}: el agente elige por la descripción`).toBeGreaterThanOrEqual(40);
	});

	it("los parámetros están tipados: prioridad es un enumerado y crear_tarea exige titulo", async () => {
		const { tools } = await (await conectar({ urlApi: api.url })).listTools();
		const listar = tools.find((t) => t.name === "listar_tareas");
		const crear = tools.find((t) => t.name === "crear_tarea");
		const prioridad = (listar?.inputSchema.properties as Record<string, { enum?: string[] }> | undefined)?.prioridad;
		expect([...(prioridad?.enum ?? [])].sort(), "usa z.enum(PRIORIDADES)").toEqual(["alta", "baja", "media"]);
		expect(crear?.inputSchema.required ?? [], "titulo: z.string(), sin .optional()").toContain("titulo");
	});

	it("listar_tareas se marca como de solo lectura", async () => {
		const listar = (await (await conectar({ urlApi: api.url })).listTools()).tools.find((t) => t.name === "listar_tareas");
		expect(listar?.annotations?.readOnlyHint, "annotations: { readOnlyHint: true }").toBe(true);
	});

	it("listar_tareas llama a la API con el filtro", async () => {
		const r = await (await conectar({ urlApi: api.url })).callTool({ name: "listar_tareas", arguments: { prioridad: "alta" } });
		expect(r.isError ?? false).toBe(false);
		const t = texto(r);
		expect(t, "las tareas altas de ana").toMatch(/Instalar Node/);
		expect(t, "no las de prioridad media: pasa ?prioridad= a la API").not.toMatch(/Leer el contrato/);
	});

	it("crear_tarea crea la tarea de verdad en la API", async () => {
		const cliente = await conectar({ urlApi: api.url });
		const r = await cliente.callTool({ name: "crear_tarea", arguments: { titulo: "Apuntada por el agente", prioridad: "alta" } });
		expect(r.isError ?? false).toBe(false);
		expect(texto(await cliente.callTool({ name: "listar_tareas", arguments: { prioridad: "alta" } })), "POST /tareas con el token del agente").toMatch(/Apuntada por el agente/);
	});

	it("si la API responde con un error, la herramienta devuelve isError con el «detail», no lo lanza", async () => {
		const caducado = await token({ sub: "ana", caducaEn: Math.floor(Date.now() / 1000) - 60 });
		const esperado = (await (await fetch(`${api.url}/tareas`, { method: "POST", headers: { Authorization: `Bearer ${caducado}`, "Content-Type": "application/json" }, body: "{}" })).json()) as { detail?: string };
		const r = await (await conectar({ urlApi: api.url, conToken: caducado })).callTool({ name: "crear_tarea", arguments: { titulo: "Con un token caducado" } });
		expect(r.isError, "un fallo de la API se devuelve con isError: true").toBe(true);
		expect(texto(r), "pasa al agente el «detail» del problem+json: le dice qué ha pasado").toContain(esperado.detail ?? "(la API no ha dado un 401: haz antes el e02)");
	});
});
