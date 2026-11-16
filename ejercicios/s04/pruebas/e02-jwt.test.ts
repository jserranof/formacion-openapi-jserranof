import request from "supertest";
import { describe, expect, it } from "vitest";
import { appDePrueba, bearer, token } from "./tokens.js";

const sinAutenticar = (res: request.Response) => {
	expect(res.status, "sin un token válido: 401").toBe(401);
	expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
	expect(res.headers["www-authenticate"], "un 401 dice cómo autenticarse: WWW-Authenticate: Bearer").toMatch(/^Bearer/);
};

describe("Ejercicio 2 · Proteger la API con JWT", () => {
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

	it("con un token válido, 200, y /proyectos también está protegido", async () => {
		const app = appDePrueba();
		expect((await request(app).get("/tareas").set(bearer(await token()))).status, "un token bueno pasa: ¿llamas a next()?").toBe(200);
		sinAutenticar(await request(app).get("/proyectos"));
	});

	it("el 401 de un token caducado lo dice en «detail»", async () => {
		const res = await request(appDePrueba()).get("/tareas").set(bearer(await token({ caducaEn: Math.floor(Date.now() / 1000) - 60 })));
		expect(res.body.detail, "di en «detail» que el token ha caducado: el cliente sabrá que tiene que pedir otro").toMatch(/caduc/i);
	});
});
