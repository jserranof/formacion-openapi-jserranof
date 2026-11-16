// Arranca tu API en un puerto libre y conecta un cliente MCP (lo que haría Claude o VS Code)
// a tu servidor MCP, en memoria
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ElicitRequestSchema, type ElicitRequest, type ElicitResult } from "@modelcontextprotocol/sdk/types.js";
import { crearServidorMcp, type OpcionesMcp } from "../src/mcp.js";
import { appDePrueba, token } from "./tokens.js";

export async function arrancarApi() {
	const api = appDePrueba().listen(0);
	await new Promise((r) => api.once("listening", r));
	return { url: `http://localhost:${(api.address() as AddressInfo).port}`, cerrar: () => api.close() };
}

interface Conexion {
	urlApi: string;
	scope?: string;
	/** Un token ya hecho, en lugar de uno nuevo de ana con `scope` */
	conToken?: string;
	/** Qué contesta la persona cuando el servidor le pide confirmación. Sin esto, el cliente no admite pedir confirmación */
	persona?: (peticion: ElicitRequest["params"]) => ElicitResult;
	registro?: OpcionesMcp["registro"];
}

export async function conectar({ urlApi, scope = "tareas:leer tareas:escribir", conToken, persona, registro }: Conexion) {
	const servidor = crearServidorMcp({ urlApi, token: conToken ?? (await token({ sub: "ana", scope })), registro });
	const [a, b] = InMemoryTransport.createLinkedPair();
	await servidor.connect(a);
	const cliente = new Client({ name: "pruebas", version: "1.0.0" }, { capabilities: persona ? { elicitation: {} } : {} });
	if (persona) cliente.setRequestHandler(ElicitRequestSchema, async (req) => persona(req.params));
	await cliente.connect(b);
	return cliente;
}

/** El texto de un resultado de herramienta, todo junto */
export const texto = (r: unknown) => (((r as { content?: unknown }).content ?? []) as { type: string; text?: string }[]).map((c) => c.text ?? "").join("\n");

/** Una persona que dice que sí a todo lo que se le pregunta con casillas */
export const diceQueSi = (p: ElicitRequest["params"]): ElicitResult => {
	const propiedades = ("requestedSchema" in p ? p.requestedSchema.properties : {}) as Record<string, { type?: string }>;
	const content = Object.fromEntries(Object.entries(propiedades).filter(([, v]) => v.type === "boolean").map(([k]) => [k, true]));
	return { action: "accept", content };
};
