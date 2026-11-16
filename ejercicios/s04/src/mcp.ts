import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface OpcionesMcp {
	/** Dónde está la API, p. ej. http://localhost:3000 */
	urlApi: string;
	/** El token con el que el agente llama a la API: con los permisos justos */
	token: string;
	/** Qué hacer con cada llamada a una herramienta (ejercicio 12): quién hizo qué, y si fue bien */
	registro?: (linea: { herramienta: string; argumentos: unknown; ok: boolean }) => void;
}

// Ejercicio 10: un servidor MCP que envuelve dos operaciones de la API.
//
//   servidor.registerTool("listar_tareas", { title, description, inputSchema: { prioridad, completada },
//     annotations: { readOnlyHint: true } }, async (args) => ({ content: [{ type: "text", text: "..." }] }));
//
// Las herramientas llaman a la API con fetch y «Authorization: Bearer <token>». Si la API
// responde con un error, devuelve { isError: true, content: [...] } con su «detail».
//
// Ejercicio 11: borrar_tarea, que pide confirmación a la persona con servidor.server.elicitInput()
// antes de borrar; y crear_tarea y borrar_tarea solo si el token trae tareas:escribir.
//
// Ejercicio 12 (reto): structuredContent y outputSchema en listar_tareas, el aviso de que los
// datos no son instrucciones, y opciones.registro() en cada llamada.
export function crearServidorMcp(_opciones: OpcionesMcp) {
	const servidor = new McpServer({ name: "tareas-del-curso", version: "1.0.0" });
	return servidor;
}
