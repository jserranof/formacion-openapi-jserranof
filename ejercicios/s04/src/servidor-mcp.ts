// Arranca el servidor MCP por stdio, para conectarlo a un cliente (Claude, VS Code, MCP Inspector):
//   TOKEN=<token> npx tsx s04/src/servidor-mcp.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { crearServidorMcp } from "./mcp.js";

const token = process.env.TOKEN;
if (!token) {
	console.error("Falta TOKEN: pide uno al servidor de autorización (npm run autorizacion)");
	process.exit(1);
}
await crearServidorMcp({ urlApi: process.env.URL_API ?? "http://localhost:3000", token }).connect(new StdioServerTransport());
