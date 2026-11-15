import { beforeAll, describe, expect, it } from "vitest";
import { deTareas, leerContrato, operacionDe } from "./contrato.js";
import { pasarMisPruebas } from "./mis-pruebas.js";

const contrato = leerContrato();

// Qué operaciones del contrato recorren tus pruebas, y con qué códigos
function recorrido() {
	const r = pasarMisPruebas("*.test.ts", "espia");
	const visto = new Map<string, Set<number>>();
	for (const linea of r.peticiones) {
		const [metodo, url, status] = linea.split(" ");
		const op = operacionDe(contrato, metodo, url);
		if (!op) continue;
		const clave = `${op.verbo.toUpperCase()} ${op.ruta}`;
		visto.set(clave, (visto.get(clave) ?? new Set()).add(Number(status)));
	}
	return visto;
}

describe("Ejercicio 9 (reto) · Tus pruebas recorren todo el contrato de /tareas", { timeout: 60_000 }, () => {
	let visto = new Map<string, Set<number>>();
	beforeAll(() => {
		visto = recorrido();
	}, 60_000);

	it("pasan por las seis operaciones de /tareas", () => {
		for (const { ruta, verbo } of deTareas(contrato))
			expect(visto.has(`${verbo.toUpperCase()} ${ruta}`), `ninguna de tus pruebas llama a ${verbo.toUpperCase()} ${ruta}`).toBe(true);
	});

	it("cada operación, con un caso que va bien (2xx) y uno de error (4xx)", () => {
		for (const { ruta, verbo } of deTareas(contrato)) {
			const codigos = [...(visto.get(`${verbo.toUpperCase()} ${ruta}`) ?? [])];
			expect(codigos.some((c) => c < 300), `${verbo.toUpperCase()} ${ruta}: falta un caso que vaya bien`).toBe(true);
			expect(codigos.some((c) => c >= 400 && c < 500), `${verbo.toUpperCase()} ${ruta}: falta un caso de error (400 o 404)`).toBe(true);
		}
	});
});
