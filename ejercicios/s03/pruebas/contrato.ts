// Utilidades para leer el contrato desde las pruebas
import { readFileSync } from "node:fs";
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
