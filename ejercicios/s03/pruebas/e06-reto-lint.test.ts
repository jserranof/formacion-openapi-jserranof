import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { lint, loadConfig } from "@redocly/openapi-core";
import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import { RUTA_CONTRATO, deTareas, leerContrato } from "./contrato.js";

const CONFIG = fileURLToPath(new URL("../redocly.yaml", import.meta.url));

async function pasarLint(ref: string) {
	const problemas = await lint({ ref, config: await loadConfig({ configPath: CONFIG }) });
	return problemas.filter((p) => p.ignored !== true);
}

describe("Ejercicio 6 (reto) · El contrato pasa el lint", () => {
	it("npm run lint:s03 no da ni errores ni avisos", async () => {
		deTareas(leerContrato());
		const problemas = await pasarLint(RUTA_CONTRATO);
		const lista = problemas.map((p) => `${p.ruleId}: ${p.message}`);
		expect(lista, "ejecuta npm run lint:s03 y arregla lo que diga (o apaga la regla en redocly.yaml, con un comentario que diga por qué)").toEqual([]);
	});

	it("tu regla propia (rule/…) rechaza un operationId que no empieza por un verbo", async () => {
		const config = parse(readFileSync(CONFIG, "utf8"));
		const propias = Object.keys(config?.rules ?? {}).filter((r) => r.startsWith("rule/"));
		expect(propias.length, "añade a redocly.yaml una regla «rule/…» con subject Operation y property operationId").toBeGreaterThan(0);

		// El mismo contrato, con un operationId que no empieza por un verbo
		const malo = leerContrato();
		malo.paths["/salud"].get.operationId = "saludGet";
		const dir = mkdtempSync(join(tmpdir(), "lint-"));
		try {
			const ref = join(dir, "openapi.yaml");
			writeFileSync(ref, stringify(malo));
			const problemas = await pasarLint(ref);
			expect(problemas.some((p) => p.ruleId.startsWith("rule/")), "con «operationId: saludGet», tu regla tendría que quejarse: revisa el pattern").toBe(true);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});
