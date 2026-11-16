import { createRemoteJWKSet } from "jose";
import { OAuth2Server } from "oauth2-mock-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { appDePrueba, bearer, token } from "./tokens.js";

const sinPermiso = (res: request.Response, permiso: string) => {
	expect(res.status, "autenticado pero sin permiso: 403, no 401").toBe(403);
	expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
	expect(res.body.detail, `di en «detail» qué permiso hace falta: ${permiso}`).toContain(permiso);
};

describe("Ejercicio 4 · Permisos por operación", () => {
	it("un token sin permisos no puede leer: 403 que dice qué permiso falta", async () => {
		sinPermiso(await request(appDePrueba()).get("/tareas").set(bearer(await token({ scope: "" }))), "tareas:leer");
	});

	it("con tareas:leer se lee, pero no se crea, ni se cambia, ni se borra (403)", async () => {
		const app = appDePrueba();
		const t = bearer(await token({ scope: "tareas:leer" }));
		expect((await request(app).get("/tareas").set(t)).status).toBe(200);
		expect((await request(app).get("/tareas/1").set(t)).status).toBe(200);
		sinPermiso(await request(app).post("/tareas").set(t).send({ titulo: "No debería" }), "tareas:escribir");
		sinPermiso(await request(app).patch("/tareas/1").set(t).send({ completada: false }), "tareas:escribir");
		sinPermiso(await request(app).delete("/tareas/1").set(t), "tareas:escribir");
	});

	it("con tareas:escribir se puede crear, cambiar y borrar", async () => {
		const app = appDePrueba();
		const t = bearer(await token({ scope: "tareas:leer tareas:escribir" }));
		expect((await request(app).post("/tareas").set(t).send({ titulo: "Sí" })).status).toBe(201);
		expect((await request(app).patch("/tareas/1").set(t).send({ completada: false })).status).toBe(200);
		expect((await request(app).delete("/tareas/2").set(t)).status).toBe(204);
	});

	it("los proyectos piden sus propios permisos: proyectos:leer y proyectos:escribir", async () => {
		const app = appDePrueba();
		sinPermiso(await request(app).get("/proyectos").set(bearer(await token({ scope: "tareas:leer tareas:escribir" }))), "proyectos:leer");
		const t = bearer(await token({ scope: "proyectos:leer" }));
		expect((await request(app).get("/proyectos").set(t)).status).toBe(200);
		sinPermiso(await request(app).post("/proyectos").set(t).send({ nombre: "No" }), "proyectos:escribir");
	});

	it("sin token sigue siendo 401, no 403", async () => {
		expect((await request(appDePrueba()).post("/tareas").send({ titulo: "X" })).status, "primero quién eres (401), después qué puedes hacer (403)").toBe(401);
	});

	describe("con un servidor de autorización de verdad (oauth2-mock-server)", () => {
		const servidor = new OAuth2Server();

		beforeAll(async () => {
			await servidor.issuer.keys.generate("RS256");
			servidor.service.on("beforeTokenSigning", (t) => {
				t.payload.aud = "api-curso";
				t.payload.sub = "ana";
			});
			await servidor.start(0, "localhost");
		});
		afterAll(() => servidor.stop());

		it("un token de client credentials con tareas:leer, validado contra su JWKS, lee pero no escribe", async () => {
			const emisor = servidor.issuer.url!;
			const r = await fetch(`${emisor}/token`, { method: "POST", body: new URLSearchParams({ grant_type: "client_credentials", scope: "tareas:leer" }) });
			const { access_token } = (await r.json()) as { access_token: string };
			const app = crearApp({ auth: { claves: createRemoteJWKSet(new URL(`${emisor}/jwks`)), emisor, audiencia: "api-curso" } });
			expect((await request(app).get("/tareas").set(bearer(access_token))).status, "crearApp({ auth: { claves: createRemoteJWKSet(...) } }) tiene que funcionar").toBe(200);
			sinPermiso(await request(app).post("/tareas").set(bearer(access_token)).send({ titulo: "No" }), "tareas:escribir");
		});
	});
});
