// Servidor de autorización de PRUEBA. Emite tokens firmados (RS256) y publica sus
// claves en /jwks. Nunca en producción: no comprueba secretos de cliente ni usuarios.
import { createServer } from "node:http";
import { OAuth2Server, type MutableToken, type TokenRequestIncomingMessage } from "oauth2-mock-server";

const PUERTO = Number(process.env.PUERTO_AUTORIZACION ?? 9000);
export const AUDIENCIA = "api-curso";

// Qué permisos (scopes) puede recibir cada aplicación cliente
const permisosPorCliente: Record<string, string[]> = {
	"app-lectura": ["tareas:leer"],
	"app-gestion": ["tareas:leer", "tareas:escribir", "proyectos:leer", "proyectos:escribir"],
};

function clienteDe(req: TokenRequestIncomingMessage): string | undefined {
	const basic = req.headers.authorization?.match(/^Basic (.+)$/i)?.[1];
	if (basic) return Buffer.from(basic, "base64").toString().split(":")[0];
	return typeof req.body.client_id === "string" ? req.body.client_id : undefined;
}

const servidor = new OAuth2Server();
await servidor.issuer.keys.generate("RS256");

servidor.service.on("beforeTokenSigning", (token: MutableToken, req: TokenRequestIncomingMessage) => {
	const cliente = clienteDe(req) ?? "desconocido";
	const pedidos = String(token.payload.scope ?? "").split(" ").filter(Boolean);
	const permitidos = permisosPorCliente[cliente] ?? [];
	token.payload.aud = AUDIENCIA;
	token.payload.client_id = cliente;
	// Usuario de prueba: en los ejercicios de S4, las tareas 1–6 son de «ana»
	token.payload.sub = "ana";
	token.payload.scope = pedidos.filter((s) => permitidos.includes(s)).join(" ");
});

// Se arranca con un servidor HTTP propio por una sola razón: el botón «Authorize» de Swagger UI
// manda la cabecera X-Requested-With, y la CORS de oauth2-mock-server solo admite Content-Type y
// Authorization, así que el navegador bloquea la petición del token. Aquí se contesta el preflight
// y todo lo demás lo atiende oauth2-mock-server tal cual.
// EMISOR permite usar una URL pública como «iss» (en un Codespace, la URL reenviada del puerto 9000).
servidor.issuer.url = process.env.EMISOR ?? `http://localhost:${PUERTO}`;
const manejador = servidor.service.requestHandler;
createServer((req, res) => {
	if (req.method === "OPTIONS") {
		res.writeHead(204, {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
		});
		return res.end();
	}
	manejador(req, res);
}).listen(PUERTO, process.env.EMISOR ? "0.0.0.0" : "localhost");
console.log(`Servidor de autorización en ${servidor.issuer.url}`);
console.log(`  Descubrimiento: ${servidor.issuer.url}/.well-known/openid-configuration`);
