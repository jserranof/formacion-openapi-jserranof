import { createRemoteJWKSet } from "jose";
import { OAuth2Server } from "oauth2-mock-server";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { appDePrueba, bearer, token } from "./tokens.js";

type T = { id: number; propietario?: string };

describe("Ejercicio 2 · Permisos y tareas de cada uno", () => {
	it("un token sin permisos no puede leer: 403 que dice qué permiso falta", async () => {
		const res = await request(appDePrueba()).get("/tareas").set(bearer(await token({ scope: "" })));
		expect(res.status, "autenticado pero sin permiso: 403, no 401").toBe(403);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
		expect(res.body.detail, "di qué permiso hace falta").toMatch(/tareas:leer/);
	});

	it("con tareas:leer se lee, pero no se escribe (403)", async () => {
		const app = appDePrueba();
		const t = await token({ scope: "tareas:leer" });
		expect((await request(app).get("/tareas").set(bearer(t))).status).toBe(200);
		const res = await request(app).post("/tareas").set(bearer(t)).send({ titulo: "No debería" });
		expect(res.status).toBe(403);
		expect(res.body.detail).toMatch(/tareas:escribir/);
	});

	it("con tareas:escribir se puede crear, cambiar y borrar", async () => {
		const app = appDePrueba();
		const t = bearer(await token({ scope: "tareas:leer tareas:escribir" }));
		expect((await request(app).post("/tareas").set(t).send({ titulo: "Sí" })).status).toBe(201);
		expect((await request(app).patch("/tareas/1").set(t).send({ completada: false })).status).toBe(200);
		expect((await request(app).delete("/tareas/2").set(t)).status).toBe(204);
	});

	it("cada usuario solo ve sus tareas (ana: 1–6)", async () => {
		const res = await request(appDePrueba()).get("/tareas?limite=100").set(bearer(await token({ sub: "ana" })));
		expect(res.body.items.map((t: T) => t.id).sort((a: number, b: number) => a - b), "filtra por el «sub» del token").toEqual([1, 2, 3, 4, 5, 6]);
	});

	it("la tarea de otro usuario responde 404, también al cambiarla o borrarla (BOLA)", async () => {
		const app = appDePrueba();
		const ana = bearer(await token({ sub: "ana" }));
		expect((await request(app).get("/tareas/7").set(ana)).status, "404, no 403: no confirmes que existe").toBe(404);
		expect((await request(app).patch("/tareas/7").set(ana).send({ titulo: "Mía" })).status).toBe(404);
		expect((await request(app).delete("/tareas/7").set(ana)).status).toBe(404);
	});

	it("lo que crea ana es de ana, y luis no lo ve", async () => {
		const app = appDePrueba();
		const creada = await request(app).post("/tareas").set(bearer(await token({ sub: "ana" }))).send({ titulo: "De ana" });
		expect(creada.body.propietario, "el propietario sale del token, no del cuerpo").toBe("ana");
		expect((await request(app).get(`/tareas/${creada.body.id}`).set(bearer(await token({ sub: "luis" })))).status).toBe(404);
	});

	describe("con un servidor de autorización de verdad (oauth2-mock-server)", () => {
		const servidor = new OAuth2Server();

		beforeAll(async () => {
			await servidor.issuer.keys.generate("RS256");
			servidor.service.on("beforeTokenSigning", (t) => {
				t.payload.aud = "api-curso";
				t.payload.sub = "luis";
			});
			await servidor.start(0, "localhost");
		});
		afterAll(() => servidor.stop());

		it("un token de client credentials, validado contra su JWKS, da acceso", async () => {
			const emisor = servidor.issuer.url!;
			const r = await fetch(`${emisor}/token`, { method: "POST", body: new URLSearchParams({ grant_type: "client_credentials", scope: "tareas:leer" }) });
			const { access_token } = (await r.json()) as { access_token: string };
			const app = crearApp({ auth: { claves: createRemoteJWKSet(new URL(`${emisor}/jwks`)), emisor, audiencia: "api-curso" } });
			const res = await request(app).get("/tareas?limite=100").set(bearer(access_token));
			expect(res.status, "crearApp({ auth: { claves: createRemoteJWKSet(...) } }) tiene que funcionar").toBe(200);
			expect(res.body.items.every((t: T) => t.propietario === "luis")).toBe(true);
		});
	});
});
