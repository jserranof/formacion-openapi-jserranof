import { fileURLToPath } from "node:url";
import { lint, loadConfig } from "@redocly/openapi-core";
import { describe, expect, it } from "vitest";
import { leerContrato } from "./contrato.js";

const CONFIG = fileURLToPath(new URL("../redocly.yaml", import.meta.url));
const CONTRATO = fileURLToPath(new URL("../openapi.yaml", import.meta.url));

type Requisito = Record<string, string[]>;
interface Operacion {
	security?: Requisito[];
	responses?: Record<string, unknown>;
}

// Las operaciones de /tareas y /tareas/{id}, con su verbo
function operacionesDeTareas() {
	const c = leerContrato();
	const ops: { nombre: string; verbo: string; op: Operacion }[] = [];
	for (const ruta of ["/tareas", "/tareas/{id}"])
		for (const [verbo, op] of Object.entries<Operacion>(c.paths?.[ruta] ?? {}))
			if (["get", "post", "put", "patch", "delete"].includes(verbo)) ops.push({ nombre: `${verbo.toUpperCase()} ${ruta}`, verbo, op });
	return ops;
}

describe("Ejercicio 5 · La seguridad, en el contrato", () => {
	it("declara un securityScheme oauth2 con los flujos clientCredentials y authorizationCode", () => {
		const esquemas = Object.values<{ type: string; flows?: Record<string, { tokenUrl?: string; authorizationUrl?: string; scopes?: Record<string, string> }> }>(leerContrato().components?.securitySchemes ?? {});
		const oauth2 = esquemas.find((e) => e.type === "oauth2");
		expect(oauth2, "en components.securitySchemes, uno con type: oauth2").toBeDefined();
		expect(oauth2?.flows?.clientCredentials?.tokenUrl, "flows.clientCredentials con su tokenUrl (máquina a máquina)").toBeTruthy();
		expect(oauth2?.flows?.authorizationCode?.authorizationUrl, "flows.authorizationCode con authorizationUrl y tokenUrl (con usuario)").toBeTruthy();
		expect(Object.keys(oauth2?.flows?.clientCredentials?.scopes ?? {}).sort(), "los cuatro permisos, cada uno con su descripción").toEqual(["proyectos:escribir", "proyectos:leer", "tareas:escribir", "tareas:leer"]);
	});

	it("la seguridad vale para toda la API («security» en la raíz) y /salud es pública", () => {
		const c = leerContrato();
		expect(c.security?.length ?? 0, "aplica la seguridad a toda la API con «security» en la raíz").toBeGreaterThan(0);
		expect(c.paths?.["/salud"]?.get?.security, "/salud es pública: security: []").toEqual([]);
	});

	it("cada operación de /tareas dice qué permiso pide: tareas:leer para GET, tareas:escribir para el resto", () => {
		const ops = operacionesDeTareas();
		expect(ops.length, "faltan operaciones de /tareas en el contrato").toBe(6);
		for (const { nombre, verbo, op } of ops) {
			const permiso = verbo === "get" ? "tareas:leer" : "tareas:escribir";
			const pide = (op.security ?? []).some((r) => Object.values(r).some((p) => p.includes(permiso)));
			expect(pide, `${nombre}: security: [{ oauth2: [${permiso}] }]`).toBe(true);
		}
	});

	it("cada operación de /tareas declara el 401 y el 403", () => {
		for (const { nombre, op } of operacionesDeTareas()) {
			expect(Object.keys(op.responses ?? {}), `${nombre}: añade "401" y "403" (mejor con $ref a components/responses)`).toEqual(expect.arrayContaining(["401", "403"]));
		}
	});

	it("npm run lint:s04 no da ni errores ni avisos (security-defined ya está encendida)", async () => {
		const problemas = (await lint({ ref: CONTRATO, config: await loadConfig({ configPath: CONFIG }) })).filter((p) => p.ignored !== true);
		expect(problemas.map((p) => `${p.ruleId}: ${p.message}`), "ejecuta npm run lint:s04 y arregla lo que diga").toEqual([]);
	});
});
