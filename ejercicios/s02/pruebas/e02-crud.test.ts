import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

const nueva = { titulo: "Preparar la demo", prioridad: "alta", completada: false };

describe("Ejercicio 2 · CRUD completo de /tareas", () => {
	it("POST /tareas responde 201 con la tarea creada y su id", async () => {
		const res = await request(crearApp()).post("/tareas").send(nueva);
		expect(res.status, "crear es 201 Created, no 200").toBe(201);
		expect(res.body).toMatchObject({ ...nueva, id: expect.any(Number) });
	});

	it("POST /tareas devuelve la cabecera Location con la URL de la nueva tarea", async () => {
		const app = crearApp();
		const res = await request(app).post("/tareas").send(nueva);
		expect(res.headers.location, "usa res.location(`/tareas/${id}`)").toBe(`/tareas/${res.body.id}`);
		const vuelta = await request(app).get(res.headers.location);
		expect(vuelta.status, "la URL de Location tiene que funcionar").toBe(200);
	});

	it("PUT /tareas/3 reemplaza la tarea entera", async () => {
		const app = crearApp();
		const res = await request(app).put("/tareas/3").send({ titulo: "Reescrita", prioridad: "baja", completada: true });
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ id: 3, titulo: "Reescrita", prioridad: "baja", completada: true });
	});

	it("PATCH /tareas/3 cambia solo lo que se manda", async () => {
		const app = crearApp();
		const antes = (await request(app).get("/tareas/3")).body;
		const res = await request(app).patch("/tareas/3").send({ completada: true });
		expect(res.status).toBe(200);
		expect(res.body, "el resto de campos se queda como estaba").toEqual({ ...antes, completada: true });
	});

	it("DELETE /tareas/3 responde 204 sin cuerpo, y después ya no está", async () => {
		const app = crearApp();
		const res = await request(app).delete("/tareas/3");
		expect(res.status, "borrar es 204 No Content").toBe(204);
		expect(res.text, "un 204 no lleva cuerpo").toBe("");
		expect((await request(app).get("/tareas/3")).status).toBe(404);
	});

	it("PUT, PATCH y DELETE sobre una tarea que no existe responden 404", async () => {
		const app = crearApp();
		expect((await request(app).put("/tareas/999").send(nueva)).status, "PUT /tareas/999").toBe(404);
		expect((await request(app).patch("/tareas/999").send({ completada: true })).status, "PATCH /tareas/999").toBe(404);
		expect((await request(app).delete("/tareas/999")).status, "DELETE /tareas/999").toBe(404);
	});

	it("los cambios se guardan: un GET posterior los ve", async () => {
		const app = crearApp();
		await request(app).patch("/tareas/4").send({ titulo: "Guardado" });
		expect((await request(app).get("/tareas/4")).body.titulo).toBe("Guardado");
	});
});
