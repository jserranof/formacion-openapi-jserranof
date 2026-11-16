import { createRemoteJWKSet, decodeJwt } from "jose";
import { OAuth2Server } from "oauth2-mock-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { crearVerificador, retoDe } from "../src/pkce.js";
import { bearer } from "./tokens.js";

const VUELTA = "http://localhost:5173/callback";
const servidor = new OAuth2Server();
let emisor = "";

// El paso del navegador: el usuario inicia sesión y el servidor le devuelve a la app con un code
async function pedirCodigo(reto: string) {
	const url = new URL(`${emisor}/authorize`);
	url.search = new URLSearchParams({
		response_type: "code", client_id: "app-tareas", redirect_uri: VUELTA, scope: "openid tareas:leer",
		state: "xyz", code_challenge: reto, code_challenge_method: "S256",
	}).toString();
	const r = await fetch(url, { redirect: "manual" });
	return new URL(r.headers.get("location") ?? VUELTA).searchParams.get("code") ?? "";
}

async function canjear(code: string, verificador: string) {
	const r = await fetch(`${emisor}/token`, {
		method: "POST",
		// El servidor de prueba no recuerda el scope pedido en /authorize: hay que repetirlo aquí
		body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: "app-tareas", redirect_uri: VUELTA, code_verifier: verificador, scope: "openid tareas:leer" }),
	});
	return { status: r.status, cuerpo: (await r.json()) as Record<string, string> };
}

describe("Ejercicio 6 (reto) · Authorization code con PKCE", () => {
	beforeAll(async () => {
		await servidor.issuer.keys.generate("RS256");
		servidor.service.on("beforeTokenSigning", (t) => {
			t.payload.aud = "api-curso";
			t.payload.sub = "ana";
		});
		await servidor.start(0, "localhost");
		emisor = servidor.issuer.url!;
	});
	afterAll(() => servidor.stop());

	it("crearVerificador() da un texto aleatorio de 43 a 128 caracteres seguros para una URL", () => {
		const a = crearVerificador();
		expect(a, "solo letras, números y - . _ ~ (RFC 7636): randomBytes(32).toString(\"base64url\")").toMatch(/^[A-Za-z0-9\-._~]{43,128}$/);
		expect(crearVerificador(), "cada llamada, uno distinto: es un secreto de un solo uso").not.toBe(a);
	});

	it("retoDe() es el SHA-256 del verificador en base64url (el ejemplo de la RFC 7636)", () => {
		expect(retoDe("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"), "createHash(\"sha256\").update(verificador).digest(\"base64url\")").toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
	});

	it("con el verificador bueno, el canje da un token de acceso y un id_token (OpenID Connect)", async () => {
		const verificador = crearVerificador();
		const { status, cuerpo } = await canjear(await pedirCodigo(retoDe(verificador)), verificador);
		expect(status, "el servidor calcula el reto del verificador y lo compara con el que mandaste al principio").toBe(200);
		expect(cuerpo.access_token).toBeTruthy();
		expect(decodeJwt(cuerpo.id_token ?? "").sub, "con el permiso «openid» llega también un id_token: quién es el usuario").toBe("ana");
	});

	it("el token sirve en la API", async () => {
		const verificador = crearVerificador();
		const { cuerpo } = await canjear(await pedirCodigo(retoDe(verificador)), verificador);
		const app = crearApp({ auth: { claves: createRemoteJWKSet(new URL(`${emisor}/jwks`)), emisor, audiencia: "api-curso" } });
		expect((await request(app).get("/tareas").set(bearer(cuerpo.access_token))).status).toBe(200);
	});

	it("un code robado no sirve sin su verificador: 400", async () => {
		const code = await pedirCodigo(retoDe(crearVerificador()));
		const { status } = await canjear(code, crearVerificador());
		expect(status, "quien intercepta el code no tiene el verificador, que nunca salió de la app").toBe(400);
	});
});
