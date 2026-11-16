import request from "supertest";
import { describe, expect, it } from "vitest";
import { appDePrueba, bearer, token } from "./tokens.js";

const ahora = () => Math.floor(Date.now() / 1000);

const rechazado = (res: request.Response, pista: string) => {
	expect(res.status, pista).toBe(401);
	expect(res.headers["www-authenticate"]).toMatch(/^Bearer/);
};

describe("Ejercicio 3 (reto) · Tokens que caducan pronto y se pueden revocar", () => {
	it("un token sin caducidad (sin «exp») responde 401", async () => {
		rechazado(await request(appDePrueba()).get("/tareas").set(bearer(await token({ caducaEn: null }))), "un token que no caduca vale para siempre si lo roban: exige «exp» (requiredClaims)");
	});

	it("un token que dura más de una hora (exp − iat) responde 401", async () => {
		const emitido = ahora() - 60;
		const res = await request(appDePrueba()).get("/tareas").set(bearer(await token({ emitidoEn: emitido, caducaEn: emitido + 3 * 3600 })));
		rechazado(res, "los tokens de acceso duran poco: si exp − iat pasa de 3600 segundos, 401");
	});

	it("un token de una hora o menos sigue valiendo", async () => {
		const emitido = ahora() - 60;
		const res = await request(appDePrueba()).get("/tareas").set(bearer(await token({ emitidoEn: emitido, caducaEn: emitido + 3600 })));
		expect(res.status, "una hora justa todavía vale").toBe(200);
	});

	it("un token revocado (su «jti» está en la lista) responde 401 y lo dice", async () => {
		const revocados = new Set(["robado-1"]);
		const app = appDePrueba({ auth: { revocados } });
		const res = await request(app).get("/tareas").set(bearer(await token({ jti: "robado-1" })));
		rechazado(res, "mira si payload.jti está en opciones.revocados");
		expect(res.body.detail, "di en «detail» que el token está revocado").toMatch(/revocad/i);
		expect((await request(app).get("/tareas").set(bearer(await token({ jti: "otro" })))).status, "los demás tokens siguen valiendo").toBe(200);
	});

	it("revocar funciona en caliente: lo que se añade a la lista después también cuenta", async () => {
		const revocados = new Set<string>();
		const app = appDePrueba({ auth: { revocados } });
		const t = bearer(await token({ jti: "sesion-7" }));
		expect((await request(app).get("/tareas").set(t)).status).toBe(200);
		revocados.add("sesion-7");
		expect((await request(app).get("/tareas").set(t)).status, "consulta la lista en cada petición, no al arrancar").toBe(401);
	});
});
