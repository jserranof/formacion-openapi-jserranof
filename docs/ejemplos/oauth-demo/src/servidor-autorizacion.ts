// Servidor de autorización de PRUEBA. Emite tokens firmados (RS256) y publica sus
// claves en /jwks. Nunca en producción: no comprueba secretos de cliente ni usuarios.
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

await servidor.start(PUERTO, "localhost");
console.log(`Servidor de autorización en ${servidor.issuer.url}`);
console.log(`  Descubrimiento: ${servidor.issuer.url}/.well-known/openid-configuration`);
