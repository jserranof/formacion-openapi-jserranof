import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";

// Link: </tareas?pagina=3&limite=5>; rel="next", </tareas?pagina=1&limite=5>; rel="prev"
function enlaces(link: string | undefined): Record<string, string> {
	const salida: Record<string, string> = {};
	for (const trozo of (link ?? "").split(",")) {
		const m = trozo.match(/<([^>]+)>\s*;\s*rel="?(\w+)"?/);
		if (m) salida[m[2]] = m[1];
	}
	return salida;
}
const parametros = (url: string) => Object.fromEntries(new URL(url, "http://x").searchParams);

describe("Ejercicio 9 (reto) · Enlaces de paginación en la cabecera Link", () => {
	it("en una página del medio, Link trae rel=\"next\" y rel=\"prev\"", async () => {
		const res = await request(crearApp()).get("/tareas?limite=5&pagina=2");
		const l = enlaces(res.headers.link);
		expect(l.next, "falta la cabecera Link con rel=\"next\" (formato: <url>; rel=\"next\")").toBeDefined();
		expect(l.prev, "falta rel=\"prev\"").toBeDefined();
		expect(parametros(l.next)).toMatchObject({ pagina: "3", limite: "5" });
		expect(parametros(l.prev)).toMatchObject({ pagina: "1", limite: "5" });
	});

	it("la primera página no tiene «prev» y la última no tiene «next»", async () => {
		const app = crearApp();
		expect(enlaces((await request(app).get("/tareas?limite=5")).headers.link).prev, "pagina 1: no hay anterior").toBeUndefined();
		expect(enlaces((await request(app).get("/tareas?limite=5&pagina=3")).headers.link).next, "pagina 3 de 3: no hay siguiente").toBeUndefined();
	});

	it("los enlaces conservan los filtros y el orden", async () => {
		const res = await request(crearApp()).get("/tareas?prioridad=alta&orden=-titulo&limite=2");
		expect(parametros(enlaces(res.headers.link).next ?? "/")).toMatchObject({ prioridad: "alta", orden: "-titulo", limite: "2", pagina: "2" });
	});

	it("el enlace «next» funciona tal cual", async () => {
		const app = crearApp();
		const primera = await request(app).get("/tareas?limite=5");
		const siguiente = await request(app).get(enlaces(primera.headers.link).next ?? "/no-hay-next");
		expect(siguiente.status).toBe(200);
		expect(siguiente.body.items.map((t: { id: number }) => t.id)).toEqual([6, 7, 8, 9, 10]);
	});
});
