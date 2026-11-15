// El camino contrario, code-first: el esquema del contrato sale de Zod (anexo S3, bloque C).
// Se copia a ejercicios/s03/src/ y, desde ejercicios:
//   npx tsx s03/src/code-first.ts
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";
import { CambiosTarea, TareaNueva } from "./tareas/esquemas.js";

type Esquema = { required?: string[]; additionalProperties?: unknown; properties?: Record<string, Record<string, unknown>> };

const contrato = parse(readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8"));
// Sigue un $ref y conserva lo que va a su lado (en 3.1 se puede: { $ref, default })
function resolver({ $ref, ...resto }: Record<string, unknown>): Record<string, unknown> {
	return typeof $ref === "string" ? { ...contrato.components.schemas[$ref.split("/").pop()!], ...resto } : resto;
}

for (const [nombre, zod] of Object.entries({ TareaNueva, CambiosTarea })) {
	// io: "input": lo que el cliente puede mandar (con los valores por defecto, opcional)
	const generado = z.toJSONSchema(zod, { io: "input" }) as Esquema;
	const escrito = contrato.components.schemas[nombre] as Esquema;

	console.log(`\n${nombre}, generado desde Zod:`);
	console.log(JSON.stringify(generado.properties));
	console.log(`  obligatorios   Zod: ${JSON.stringify(generado.required ?? [])}   contrato: ${JSON.stringify(escrito.required ?? [])}`);
	console.log(`  campos de más  Zod: ${JSON.stringify(generado.additionalProperties)}   contrato: ${JSON.stringify(escrito.additionalProperties)}`);
	for (const campo of Object.keys(generado.properties ?? {})) {
		const a = generado.properties![campo];
		const b = resolver(escrito.properties?.[campo] ?? {});
		const distintos = ["type", "minLength", "maxLength", "enum", "default"].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
		if (distintos.length) console.log(`  ${campo}: distinto en ${distintos.map((k) => `${k} (Zod ${JSON.stringify(a[k])}, contrato ${JSON.stringify(b[k])})`).join(", ")}`);
	}
}
