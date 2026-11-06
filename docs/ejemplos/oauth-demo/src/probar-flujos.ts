// Recorre los dos flujos de OAuth 2 contra el servidor de autorización (9000) y la API (3000).
// Arranca antes `npm run autorizacion` y `npm run api` en dos terminales.
import { createHash, randomBytes } from "node:crypto";

const AUT = process.env.EMISOR ?? "http://localhost:9000";
const API = process.env.API ?? "http://localhost:3000";

async function token(cuerpo: Record<string, string>, basic?: string) {
	const r = await fetch(`${AUT}/token`, {
		method: "POST",
		headers: basic ? { Authorization: `Basic ${Buffer.from(basic).toString("base64")}` } : {},
		body: new URLSearchParams(cuerpo),
	});
	return { status: r.status, cuerpo: (await r.json()) as Record<string, string> };
}

function contenido(jwt: string) {
	return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
}

async function llamar(metodo: string, jwt?: string) {
	const r = await fetch(`${API}/tareas`, {
		method: metodo,
		headers: { "Content-Type": "application/json", ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
		body: metodo === "POST" ? JSON.stringify({ titulo: "Desde el script" }) : undefined,
	});
	return r.status;
}

console.log("— 1. Client credentials (máquina a máquina) —");
const lectura = await token({ grant_type: "client_credentials", scope: "tareas:leer tareas:escribir" }, "app-lectura:secreto");
const gestion = await token({ grant_type: "client_credentials", scope: "tareas:leer tareas:escribir" }, "app-gestion:secreto");
console.log("Contenido del token de app-lectura:", contenido(lectura.cuerpo.access_token));
console.log("GET sin token          →", await llamar("GET"));
console.log("GET  con app-lectura   →", await llamar("GET", lectura.cuerpo.access_token));
console.log("POST con app-lectura   →", await llamar("POST", lectura.cuerpo.access_token));
console.log("POST con app-gestion   →", await llamar("POST", gestion.cuerpo.access_token));

console.log("\n— 2. Authorization code + PKCE (aplicación con usuario) —");
const redirect = "http://localhost:5173/callback";

// Paso del navegador: el usuario inicia sesión y el servidor le devuelve a la app con un code
async function pedirCodigo(reto: string) {
	const url = new URL(`${AUT}/authorize`);
	url.search = new URLSearchParams({
		response_type: "code", client_id: "app-gestion", redirect_uri: redirect,
		scope: "tareas:leer", state: "xyz", code_challenge: reto, code_challenge_method: "S256",
	}).toString();
	const r = await fetch(url, { redirect: "manual" });
	return new URL(r.headers.get("location")!);
}

const verificador = randomBytes(32).toString("base64url");
const reto = createHash("sha256").update(verificador).digest("base64url");
const vuelta = await pedirCodigo(reto);
console.log("El navegador vuelve a:", vuelta.href);
const code = vuelta.searchParams.get("code")!;
const canje = { grant_type: "authorization_code", code, client_id: "app-gestion", redirect_uri: redirect, scope: "tareas:leer" };

const bueno = await token({ ...canje, code_verifier: verificador });
console.log("Canje con el verificador bueno →", bueno.status, "· trae:", Object.keys(bueno.cuerpo).join(", "));
console.log("Contenido del token de usuario:", contenido(bueno.cuerpo.access_token));
console.log("GET  con token de usuario →", await llamar("GET", bueno.cuerpo.access_token));
console.log("POST con token de usuario →", await llamar("POST", bueno.cuerpo.access_token));

const repetido = await token({ ...canje, code_verifier: verificador });
console.log("Reusar el mismo code       →", repetido.status, repetido.cuerpo.detail);

// Alguien intercepta un code pero no tiene el verificador
const robado = (await pedirCodigo(reto)).searchParams.get("code")!;
const malo = await token({ ...canje, code: robado, code_verifier: randomBytes(32).toString("base64url") });
console.log("Code robado, verificador falso →", malo.status, malo.cuerpo.detail);
