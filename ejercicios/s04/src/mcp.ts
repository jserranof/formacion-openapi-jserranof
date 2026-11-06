import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface OpcionesMcp {
	/** Dónde está la API, p. ej. http://localhost:3000 */
	urlApi: string;
	/** El token con el que el agente llama a la API: con los permisos justos */
	token: string;
}

// Ejercicio 5: un servidor MCP que envuelve dos operaciones de la API.
//
//   servidor.registerTool("listar_tareas", { title, description, inputSchema: { prioridad, completada },
//     annotations: { readOnlyHint: true } }, async (args) => ({ content: [{ type: "text", text: "..." }] }));
//
// Las herramientas llaman a la API con fetch y «Authorization: Bearer <token>». Si la API
// responde con un error, devuelve { isError: true, content: [...] } con su «detail».
export function crearServidorMcp(_opciones: OpcionesMcp) {
	const servidor = new McpServer({ name: "tareas-del-curso", version: "1.0.0" });
	return servidor;
}
