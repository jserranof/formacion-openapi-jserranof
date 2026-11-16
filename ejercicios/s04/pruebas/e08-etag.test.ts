import request from "supertest";
import { describe, expect, it } from "vitest";
import { appDePrueba, bearer, token } from "./tokens.js";

const ana = async () => bearer(await token({ sub: "ana" }));

describe("Ejercicio 8 · ETag: caché y cambios sin pisarse", () => {
	it("GET /tareas/1 devuelve un ETag fuerte: la huella de la tarea, entre comillas y sin W/", async () => {
		const res = await request(appDePrueba()).get("/tareas/1").set(await ana());
		expect(res.headers.etag, 'el de Express es débil (W/"…") y If-Match necesita uno fuerte: res.set("ETag", `"${huella}"`)').toMatch(/^".+"$/);
	});

	it("con If-None-Match y el mismo ETag responde 304 sin cuerpo", async () => {
		const app = appDePrueba();
		const t = await ana();
		const { headers } = await request(app).get("/tareas/1").set(t);
		const res = await request(app).get("/tareas/1").set(t).set("If-None-Match", headers.etag);
		expect(res.status, "no ha cambiado: 304 Not Modified").toBe(304);
		expect(res.text ?? "").toBe("");
	});

	it("el ETag cambia cuando cambia la tarea, y el PATCH devuelve el nuevo", async () => {
		const app = appDePrueba();
		const t = await ana();
		const antes = (await request(app).get("/tareas/1").set(t)).headers.etag;
		const cambio = await request(app).patch("/tareas/1").set(t).send({ titulo: "Otro título" });
		expect(cambio.headers.etag, "el PATCH responde con el ETag nuevo, también fuerte").toMatch(/^".+"$/);
		expect(cambio.headers.etag).not.toBe(antes);
		expect((await request(app).get("/tareas/1").set(t)).headers.etag).toBe(cambio.headers.etag);
	});

	it("PATCH con If-Match de una versión vieja responde 412 y no cambia nada", async () => {
		const app = appDePrueba();
		const t = await ana();
		const vieja = (await request(app).get("/tareas/3").set(t)).headers.etag;
		await request(app).patch("/tareas/3").set(t).send({ prioridad: "alta" }); // otro la cambia
		const res = await request(app).patch("/tareas/3").set(t).set("If-Match", vieja).send({ prioridad: "baja" });
		expect(res.status, "alguien la cambió desde que la leíste: 412 Precondition Failed").toBe(412);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
		expect((await request(app).get("/tareas/3").set(t)).body.prioridad, "el cambio rechazado no se aplica").toBe("alta");
	});

	it("PUT con If-Match de una versión vieja también responde 412", async () => {
		const app = appDePrueba();
		const t = await ana();
		const vieja = (await request(app).get("/tareas/5").set(t)).headers.etag;
		await request(app).patch("/tareas/5").set(t).send({ completada: true });
		const res = await request(app).put("/tareas/5").set(t).set("If-Match", vieja).send({ titulo: "Pisada", prioridad: "baja", completada: false });
		expect(res.status, "comprueba la versión en PUT igual que en PATCH").toBe(412);
	});

	it("PATCH y PUT con el If-Match actual sí se aplican", async () => {
		const app = appDePrueba();
		const t = await ana();
		const actual = (await request(app).get("/tareas/4").set(t)).headers.etag;
		const patch = await request(app).patch("/tareas/4").set(t).set("If-Match", actual).send({ completada: true });
		expect(patch.status).toBe(200);
		const put = await request(app).put("/tareas/4").set(t).set("If-Match", patch.headers.etag).send({ titulo: "Entera", prioridad: "baja", completada: true });
		expect(put.status).toBe(200);
	});
});
