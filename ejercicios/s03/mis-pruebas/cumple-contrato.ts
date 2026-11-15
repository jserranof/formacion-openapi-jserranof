// Comprueba que una respuesta de Supertest cumple lo que dice openapi.yaml (no hace falta tocarlo).
//
//   const res = await request(crearApp()).get("/tareas/1");
//   expect(cumpleContrato(res)).toEqual([]);     // [] = la cumple; si no, la lista de fallos
//
// Busca en el contrato la operación (verbo y ruta) y la respuesta (el código), y valida el
// Content-Type y el cuerpo contra su esquema. Un código que el contrato no declara, también es un fallo.
import { readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { Response } from "supertest";
import { parse } from "yaml";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Nodo = any;

const contrato: Nodo = parse(readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addSchema({ ...contrato, $id: "contrato" });

// «/tareas/{id}» → «/tareas/[^/]+», para encontrar la operación de «/tareas/7»
function buscarOperacion(metodo: string, url: string) {
	const camino = new URL(url, "http://x").pathname.replace(/\/+$/, "") || "/";
	for (const [ruta, item] of Object.entries<Nodo>(contrato.paths ?? {})) {
		if (!new RegExp(`^${ruta.replace(/\{[^}]+\}/g, "[^/]+")}$`).test(camino) || !item[metodo]) continue;
		return { ruta, op: item[metodo] };
	}
	return undefined;
}

// Sigue un $ref interno hasta el nodo de verdad
function resolver(nodo: Nodo): Nodo {
	let actual = nodo;
	while (actual?.$ref) actual = actual.$ref.replace(/^#\//, "").split("/").reduce((n: Nodo, k: string) => n?.[k], contrato);
	return actual;
}

const escapar = (s: string) => s.replace(/~/g, "~0").replace(/\//g, "~1");

export function cumpleContrato(res: Response): string[] {
	const req = (res as unknown as { req: { method: string; path: string } }).req;
	const metodo = req.method.toLowerCase();
	const donde = `${req.method} ${req.path} → ${res.status}`;

	const encontrada = buscarOperacion(metodo, req.path);
	if (!encontrada) return [`${donde}: el contrato no tiene la operación ${req.method} ${req.path}`];

	const codigos = encontrada.op.responses ?? {};
	const clave = [String(res.status), `${String(res.status)[0]}XX`, "default"].find((c) => codigos[c]);
	if (!clave) return [`${donde}: el contrato no declara el código ${res.status} para ${req.method} ${encontrada.ruta}`];

	const respuesta = resolver(codigos[clave]);
	if (!respuesta.content) return res.text ? [`${donde}: el contrato dice que va sin cuerpo, y lleva uno`] : [];

	const tipo = String(res.headers["content-type"] ?? "").split(";")[0].trim();
	if (!respuesta.content[tipo]) return [`${donde}: llega Content-Type «${tipo}» y el contrato dice ${Object.keys(respuesta.content).join(" o ")}`];

	// Se valida con el esquema tal como está en el contrato, para que sus $ref funcionen
	const ruta = codigos[clave].$ref
		? `contrato${codigos[clave].$ref}/content/${escapar(tipo)}/schema`
		: `contrato#/paths/${escapar(encontrada.ruta)}/${metodo}/responses/${clave}/content/${escapar(tipo)}/schema`;
	const validar = ajv.getSchema(ruta);
	if (!validar) return [`${donde}: no encuentro el esquema de la respuesta en el contrato`];
	if (validar(res.body)) return [];
	return (validar.errors ?? []).map((e) => `${donde}: ${e.instancePath || "(cuerpo)"} ${enEspanol(e)}`);
}

// Los fallos más habituales, en español; el resto, como los cuenta Ajv
function enEspanol(e: { keyword: string; params: Record<string, unknown>; message?: string }) {
	const p = e.params;
	switch (e.keyword) {
		case "required":
			return `no trae el campo obligatorio «${p.missingProperty}»`;
		case "additionalProperties":
			return `trae un campo que el contrato no tiene: «${p.additionalProperty}»`;
		case "type":
			return `tendría que ser de tipo ${p.type}`;
		case "enum":
			return `tendría que ser uno de: ${(p.allowedValues as unknown[]).join(", ")}`;
		default:
			return e.message ?? e.keyword;
	}
}
