import request from "supertest";
import { describe, expect, it } from "vitest";
import { leerContrato } from "./contrato.js";
import { appDePrueba, bearer, token } from "./tokens.js";

const sinAutenticar = (res: request.Response) => {
	expect(res.status, "sin un token válido: 401").toBe(401);
	expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
	expect(res.headers["www-authenticate"], "un 401 dice cómo autenticarse: WWW-Authenticate: Bearer").toMatch(/^Bearer/);
};

describe("Ejercicio 1 · Proteger la API con JWT", () => {
	it("/salud sigue siendo pública", async () => {
		expect((await request(appDePrueba()).get("/salud")).status).toBe(200);
	});

	it("sin token, /tareas responde 401 con WWW-Authenticate", async () => {
		sinAutenticar(await request(appDePrueba()).get("/tareas"));
	});

	it("con un token que no es un JWT, 401", async () => {
		sinAutenticar(await request(appDePrueba()).get("/tareas").set(bearer("esto.no.vale")));
	});

	it("con un token firmado con otra clave, 401", async () => {
		sinAutenticar(await request(appDePrueba()).get("/tareas").set(bearer(await token({ conOtraClave: true }))));
	});

	it("con un token caducado, 401", async () => {
		sinAutenticar(await request(appDePrueba()).get("/tareas").set(bearer(await token({ caducaEn: Math.floor(Date.now() / 1000) - 60 }))));
	});

	it("con un token para otra API (aud) o de otro emisor (iss), 401", async () => {
		const app = appDePrueba();
		sinAutenticar(await request(app).get("/tareas").set(bearer(await token({ aud: "otra-api" }))));
		sinAutenticar(await request(app).get("/tareas").set(bearer(await token({ iss: "https://falso.example" }))));
	});

	it("sin token no se valida nada más: 401 antes que 400", async () => {
		sinAutenticar(await request(appDePrueba()).get("/tareas?inventado=1"));
	});

	it("con un token válido, 200", async () => {
		expect((await request(appDePrueba()).get("/tareas").set(bearer(await token()))).status).toBe(200);
	});

	it("el contrato declara la seguridad (securitySchemes y security), y /salud sin ella", () => {
		const c = leerContrato();
		const esquemas = Object.values<{ type: string; scheme?: string }>(c.components?.securitySchemes ?? {});
		expect(esquemas.some((e) => e.type === "oauth2" || (e.type === "http" && e.scheme === "bearer")), "declara un securityScheme oauth2 o http bearer").toBe(true);
		expect(c.security?.length ?? 0, "aplica la seguridad a toda la API con «security» en la raíz").toBeGreaterThan(0);
		expect(c.paths?.["/salud"]?.get?.security, "/salud es pública: security: []").toEqual([]);
	});
});
