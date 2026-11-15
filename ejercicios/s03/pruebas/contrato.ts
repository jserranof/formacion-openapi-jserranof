// Utilidades para leer el contrato desde las pruebas
import { readFileSync } from "node:fs";
import { expect } from "vitest";
import { parse } from "yaml";

export const RUTA_CONTRATO = new URL("../openapi.yaml", import.meta.url).pathname;
export const VERBOS = ["get", "post", "put", "patch", "delete"] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Nodo = any;

export function leerContrato(): Nodo {
	return parse(readFileSync(RUTA_CONTRATO, "utf8"));
}

// Sigue un $ref interno («#/components/schemas/Tarea») hasta el nodo de verdad
export function resolver(contrato: Nodo, nodo: Nodo): Nodo {
	let actual = nodo;
	while (actual?.$ref) {
		actual = actual.$ref
			.replace(/^#\//, "")
			.split("/")
			.reduce((n: Nodo, k: string) => n?.[k], contrato);
	}
	return actual;
}

export function operaciones(contrato: Nodo) {
	const lista: { ruta: string; verbo: string; op: Nodo }[] = [];
	for (const [ruta, item] of Object.entries<Nodo>(contrato.paths ?? {}))
		for (const verbo of VERBOS) if (item[verbo]) lista.push({ ruta, verbo, op: item[verbo] });
	return lista;
}

// Las operaciones de las tareas: si no están las seis, el ejercicio 2 está sin hacer
export function deTareas(contrato: Nodo) {
	const lista = operaciones(contrato).filter(({ ruta }) => ruta.startsWith("/tareas"));
	expect(lista.length, "faltan operaciones de /tareas en el contrato: primero, el ejercicio 2").toBeGreaterThanOrEqual(6);
	return lista;
}

// Los parámetros de una operación, los de su ruta incluidos, ya resueltos
export function parametros(contrato: Nodo, ruta: string, verbo: string): Nodo[] {
	const item = contrato.paths?.[ruta] ?? {};
	return [...(item.parameters ?? []), ...(item[verbo]?.parameters ?? [])].map((p: Nodo) => resolver(contrato, p));
}

// «GET /tareas/7?x=1» → la operación del contrato que le corresponde («get /tareas/{id}»)
export function operacionDe(contrato: Nodo, metodo: string, url: string) {
	const camino = url.split("?")[0].replace(/\/+$/, "") || "/";
	return operaciones(contrato).find(({ ruta, verbo }) => verbo === metodo.toLowerCase() && new RegExp(`^${ruta.replace(/\{[^}]+\}/g, "[^/]+")}$`).test(camino));
}
