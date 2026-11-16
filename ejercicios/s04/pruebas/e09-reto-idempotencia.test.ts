import request from "supertest";
import { describe, expect, it } from "vitest";
import { appDePrueba, bearer, token } from "./tokens.js";

const total = async (app: ReturnType<typeof appDePrueba>, t: Record<string, string>) => (await request(app).get("/tareas").set(t)).body.total as number;

describe("Ejercicio 9 (reto) · Idempotency-Key: repetir no duplica", () => {
	it("el mismo POST con la misma clave crea una sola tarea y devuelve la misma", async () => {
		const app = appDePrueba();
		const t = bearer(await token({ sub: "ana" }));
		const antes = await total(app, t);
		const a = await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-1").send({ titulo: "Una vez" });
		const b = await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-1").send({ titulo: "Una vez" });
		expect(a.status).toBe(201);
		expect(b.status, "la repetición devuelve la respuesta de la primera").toBe(201);
		expect(b.body.id, "la misma tarea, no otra").toBe(a.body.id);
		expect(await total(app, t), "solo se ha creado una").toBe(antes + 1);
	});

	it("la repetición se marca con Idempotent-Replayed: true", async () => {
		const app = appDePrueba();
		const t = bearer(await token());
		await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-2").send({ titulo: "Marcada" });
		const b = await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-2").send({ titulo: "Marcada" });
		expect(b.headers["idempotent-replayed"]).toBe("true");
		expect(b.headers.location).toBe(`/tareas/${b.body.id}`);
	});

	it("la misma clave con otro cuerpo responde 422", async () => {
		const app = appDePrueba();
		const t = bearer(await token());
		await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-3").send({ titulo: "Primera" });
		const res = await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-3").send({ titulo: "Otra cosa" });
		expect(res.status, "una clave es para una sola petición").toBe(422);
		expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
	});

	it("claves distintas, o sin clave, crean tareas distintas", async () => {
		const app = appDePrueba();
		const t = bearer(await token());
		const a = await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-4").send({ titulo: "Igual" });
		const b = await request(app).post("/tareas").set(t).set("Idempotency-Key", "k-5").send({ titulo: "Igual" });
		const c = await request(app).post("/tareas").set(t).send({ titulo: "Igual" });
		expect(new Set([a.body.id, b.body.id, c.body.id]).size).toBe(3);
	});

	it("las claves son de cada usuario: la misma clave de otro no devuelve tu tarea", async () => {
		const app = appDePrueba();
		const a = await request(app).post("/tareas").set(bearer(await token({ sub: "ana" }))).set("Idempotency-Key", "compartida").send({ titulo: "X" });
		const b = await request(app).post("/tareas").set(bearer(await token({ sub: "luis" }))).set("Idempotency-Key", "compartida").send({ titulo: "X" });
		expect(b.body.id, "luis no puede recibir la tarea de ana").not.toBe(a.body.id);
		expect(b.body.propietario).toBe("luis");
	});
});
