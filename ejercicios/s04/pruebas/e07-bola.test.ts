import request from "supertest";
import { describe, expect, it } from "vitest";
import { appDePrueba, bearer, token } from "./tokens.js";

type T = { id: number; propietario?: string; titulo: string };
const ana = async () => bearer(await token({ sub: "ana" }));
const luis = async () => bearer(await token({ sub: "luis" }));

describe("Ejercicio 7 · Cada uno, lo suyo (OWASP API1 y API3)", () => {
	it("cada usuario solo ve sus tareas, y «total» cuenta solo las suyas (ana: 1–6)", async () => {
		const res = await request(appDePrueba()).get("/tareas?limite=100").set(await ana());
		expect(res.body.items.map((t: T) => t.id).sort((a: number, b: number) => a - b), "filtra por el «sub» del token en el servicio").toEqual([1, 2, 3, 4, 5, 6]);
		expect(res.body.total, "«total» tampoco puede contar las de otros").toBe(6);
	});

	it("la tarea de otro responde 404, exactamente igual que una que no existe", async () => {
		const app = appDePrueba();
		const ajena = await request(app).get("/tareas/7").set(await ana());
		const inexistente = await request(app).get("/tareas/999").set(await ana());
		expect(ajena.status, "404, no 403 ni 200: no confirmes que existe").toBe(404);
		expect(ajena.body.title, "el mismo «title» que una que no existe").toBe(inexistente.body.title);
	});

	it("tampoco se puede cambiar, reemplazar ni borrar la de otro, y no cambia nada", async () => {
		const app = appDePrueba();
		const t = await ana();
		expect((await request(app).patch("/tareas/7").set(t).send({ titulo: "Mía" })).status).toBe(404);
		expect((await request(app).put("/tareas/7").set(t).send({ titulo: "Mía" })).status).toBe(404);
		expect((await request(app).delete("/tareas/7").set(t)).status).toBe(404);
		const deLuis = await request(app).get("/tareas/7").set(await luis());
		expect(deLuis.status, "luis sigue teniendo su tarea 7").toBe(200);
		expect(deLuis.body.titulo, "y nadie se la ha cambiado").toBe("Añadir paginación");
	});

	it("lo que crea ana es de ana (el «sub» del token), y luis no lo ve", async () => {
		const app = appDePrueba();
		const creada = await request(app).post("/tareas").set(await ana()).send({ titulo: "De ana" });
		expect(creada.body.propietario, "el propietario sale del token, no del cuerpo").toBe("ana");
		expect((await request(app).get(`/tareas/${creada.body.id}`).set(await luis())).status).toBe(404);
	});

	it("asignación masiva: nadie puede ponerse de propietario a otro desde el cuerpo", async () => {
		const app = appDePrueba();
		const t = await ana();
		expect((await request(app).post("/tareas").set(t).send({ titulo: "Trampa", propietario: "luis" })).status, "«propietario» no está en TareaNueva: 400").toBe(400);
		expect((await request(app).patch("/tareas/1").set(t).send({ propietario: "luis" })).status, "ni en CambiosTarea").toBe(400);
		expect((await request(app).get("/tareas/1").set(t)).body.propietario).toBe("ana");
	});
});
