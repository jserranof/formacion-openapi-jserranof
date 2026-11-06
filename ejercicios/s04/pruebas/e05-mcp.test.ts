import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearServidorMcp } from "../src/mcp.js";
import { appDePrueba, token } from "./tokens.js";

let api: Server;
let urlApi: string;

// Conecta un cliente MCP (lo que haría Claude o VS Code) a tu servidor, en memoria
async function conectar(scope = "tareas:leer tareas:escribir") {
	const servidor = crearServidorMcp({ urlApi, token: await token({ sub: "ana", scope }) });
	const [a, b] = InMemoryTransport.createLinkedPair();
	await servidor.connect(a);
	const cliente = new Client({ name: "pruebas", version: "1.0.0" });
	await cliente.connect(b);
	return cliente;
}

const texto = (r: unknown) => ((r as { content: unknown }).content as { type: string; text: string }[]).map((c) => c.text).join("\n");

describe("Ejercicio 5 · La API, lista para agentes de IA (MCP)", () => {
	beforeAll(async () => {
		api = appDePrueba().listen(0);
		urlApi = `http://localhost:${(api.address() as AddressInfo).port}`;
	});
	afterAll(() => {
		api.close();
	});

	it("ofrece las herramientas listar_tareas y crear_tarea", async () => {
		const { tools } = await (await conectar()).listTools();
		expect(tools.map((t) => t.name).sort()).toEqual(["crear_tarea", "listar_tareas"]);
	});

	it("cada herramienta explica cuándo usarla (description de 40 caracteres o más)", async () => {
		for (const t of (await (await conectar()).listTools()).tools)
			expect(t.description?.length ?? 0, `${t.name}: el agente elige por la descripción`).toBeGreaterThanOrEqual(40);
	});

	it("los parámetros están tipados: prioridad es un enumerado y crear_tarea exige titulo", async () => {
		const { tools } = await (await conectar()).listTools();
		const listar = tools.find((t) => t.name === "listar_tareas")!;
		const crear = tools.find((t) => t.name === "crear_tarea")!;
		const prioridad = (listar.inputSchema.properties as Record<string, { enum?: string[] }>)?.prioridad;
		expect([...(prioridad?.enum ?? [])].sort(), "usa z.enum(PRIORIDADES)").toEqual(["alta", "baja", "media"]);
		expect(crear.inputSchema.required ?? []).toContain("titulo");
	});

	it("listar_tareas se marca como de solo lectura", async () => {
		const listar = (await (await conectar()).listTools()).tools.find((t) => t.name === "listar_tareas")!;
		expect(listar.annotations?.readOnlyHint, "annotations: { readOnlyHint: true }").toBe(true);
	});

	it("listar_tareas llama a la API con el filtro y devuelve las tareas del usuario", async () => {
		const r = await (await conectar()).callTool({ name: "listar_tareas", arguments: { prioridad: "alta" } });
		expect(r.isError ?? false).toBe(false);
		const t = texto(r);
		expect(t, "las tareas altas de ana").toMatch(/Instalar Node/);
		expect(t, "no las de prioridad media").not.toMatch(/Leer el contrato/);
		expect(t, "ni las de luis").not.toMatch(/Limitar peticiones/);
	});

	it("crear_tarea crea la tarea de verdad en la API", async () => {
		const cliente = await conectar();
		const r = await cliente.callTool({ name: "crear_tarea", arguments: { titulo: "Apuntada por el agente", prioridad: "alta" } });
		expect(r.isError ?? false).toBe(false);
		expect(texto(await cliente.callTool({ name: "listar_tareas", arguments: { prioridad: "alta" } }))).toMatch(/Apuntada por el agente/);
	});

	it("con un token de solo lectura, crear_tarea devuelve un error que el agente entiende", async () => {
		const r = await (await conectar("tareas:leer")).callTool({ name: "crear_tarea", arguments: { titulo: "No debería" } });
		expect(r.isError, "un fallo de la API se devuelve con isError: true, no se lanza").toBe(true);
		expect(texto(r), "pasa al agente el detail del problem+json").toMatch(/tareas:escribir/);
	});
});
