import { describe, expect, it } from "vitest";
import { type Nodo, deTareas, leerContrato, resolver } from "./contrato.js";

const contrato = leerContrato();

// Los parámetros tal como están escritos (sin resolver), los de la ruta incluidos
const escritos = (ruta: string, verbo: string): Nodo[] => [...(contrato.paths?.[ruta]?.parameters ?? []), ...(contrato.paths?.[ruta]?.[verbo]?.parameters ?? [])];
const nombre = (p: Nodo) => resolver(contrato, p)?.name;

describe("Ejercicio 3 (reto) · Escríbelo una vez y reutilízalo", () => {
	it("pagina, limite e id se definen una vez en components.parameters y se usan con $ref", () => {
		deTareas(contrato);
		const definidos = Object.values<Nodo>(contrato.components?.parameters ?? {}).map((p) => p.name);
		for (const n of ["pagina", "limite", "id"]) expect(definidos, `define «${n}» en components.parameters`).toContain(n);
		for (const p of escritos("/tareas", "get").filter((p) => ["pagina", "limite"].includes(nombre(p))))
			expect(p.$ref, `GET /tareas: «${nombre(p)}» con $ref, no escrito otra vez`).toMatch(/^#\/components\/parameters\//);
		for (const verbo of ["get", "put", "patch", "delete"]) {
			const id = escritos("/tareas/{id}", verbo).find((p) => nombre(p) === "id");
			expect(id?.$ref, `${verbo.toUpperCase()} /tareas/{id}: el parámetro «id» con $ref (vale ponerlo una vez en la ruta)`).toMatch(/^#\/components\/parameters\//);
		}
	});

	it("todos los errores de /tareas son $ref a components/responses", () => {
		for (const { ruta, verbo, op } of deTareas(contrato))
			for (const [codigo, r] of Object.entries<Nodo>(op.responses ?? {}).filter(([c]) => /^4/.test(c)))
				expect(r.$ref, `${verbo.toUpperCase()} ${ruta} ${codigo}: usa $ref a una respuesta de components/responses`).toMatch(/^#\/components\/responses\//);
	});

	it("GET /tareas declara la cabecera Link en su 200", () => {
		const ok = resolver(contrato, contrato.paths?.["/tareas"]?.get?.responses?.["200"]);
		expect(ok?.headers?.Link, "añade headers → Link a la respuesta 200 de GET /tareas, con su description").toBeDefined();
		expect(resolver(contrato, ok.headers.Link).description, "la cabecera Link necesita una description").toBeTruthy();
	});
});
