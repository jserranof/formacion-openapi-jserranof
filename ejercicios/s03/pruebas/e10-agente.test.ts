import { describe, expect, it } from "vitest";
import { type Nodo, deTareas, leerContrato, operaciones, parametros, resolver } from "./contrato.js";

const contrato = leerContrato();
const nombre = (verbo: string, ruta: string) => `${verbo.toUpperCase()} ${ruta}`;

describe("Ejercicio 10 · ¿Lo entendería un agente de IA?", () => {
	it("cada operationId empieza por un verbo en infinitivo, en camelCase (listarTareas)", () => {
		deTareas(contrato);
		for (const { ruta, verbo, op } of operaciones(contrato))
			expect(op.operationId ?? "", `${nombre(verbo, ruta)}: «${op.operationId}» tendría que ser como listarTareas o crearTarea`).toMatch(/^[a-z]+(ar|er|ir)[A-Z][A-Za-z]*$/);
	});

	it("cada operación tiene una description de al menos 30 caracteres que dice cuándo usarla", () => {
		for (const { ruta, verbo, op } of deTareas(contrato))
			expect(op.description?.trim().length ?? 0, `${nombre(verbo, ruta)}: añade una description que diga cuándo usarla (30 caracteres o más)`).toBeGreaterThanOrEqual(30);
	});

	it("cada parámetro de /tareas tiene description", () => {
		for (const { ruta, verbo } of deTareas(contrato))
			for (const p of parametros(contrato, ruta, verbo)) expect(p?.description, `${nombre(verbo, ruta)}: el parámetro «${p?.name}» no tiene description`).toBeTruthy();
	});

	it("cada campo de Tarea, TareaNueva, CambiosTarea y PaginaTareas tiene description", () => {
		for (const esquema of ["Tarea", "TareaNueva", "CambiosTarea", "PaginaTareas"]) {
			const def = resolver(contrato, contrato.components?.schemas?.[esquema]);
			expect(def?.properties, `falta components/schemas/${esquema}`).toBeDefined();
			for (const [campo, prop] of Object.entries<Nodo>(def.properties)) {
				const descripcion = prop.description ?? resolver(contrato, prop)?.description;
				expect(descripcion, `${esquema}.${campo} no tiene description`).toBeTruthy();
			}
		}
	});

	it("los cuerpos de POST, PUT y PATCH de /tareas llevan un ejemplo", () => {
		for (const [ruta, verbo] of [["/tareas", "post"], ["/tareas/{id}", "put"], ["/tareas/{id}", "patch"]]) {
			const cuerpo = resolver(contrato, contrato.paths?.[ruta]?.[verbo]?.requestBody)?.content?.["application/json"];
			const ejemplo = cuerpo?.example ?? cuerpo?.examples ?? resolver(contrato, cuerpo?.schema)?.example;
			expect(ejemplo, `${nombre(verbo, ruta)}: añade un example al cuerpo (content → application/json → example)`).toBeDefined();
		}
	});
});
