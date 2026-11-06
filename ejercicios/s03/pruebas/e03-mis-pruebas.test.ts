import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const RAIZ = fileURLToPath(new URL("../..", import.meta.url));
const FICHERO = join(RAIZ, "s03/mis-pruebas/tareas.test.ts");
const CONFIG = fileURLToPath(new URL("./mutantes/vitest.config.ts", import.meta.url));

// Pasa tus pruebas con la API real (sin MUTANTE) o con una versión rota
function pasarMisPruebas(mutante?: string) {
	const dir = mkdtempSync(join(tmpdir(), "mis-pruebas-"));
	const salida = join(dir, "r.json");
	spawnSync("npx", ["vitest", "run", "--config", CONFIG, "--reporter=json", `--outputFile=${salida}`], {
		cwd: RAIZ,
		env: { ...process.env, MUTANTE: mutante ?? "" },
		stdio: "ignore",
		shell: process.platform === "win32",
	});
	try {
		const r = JSON.parse(readFileSync(salida, "utf8"));
		return { total: r.numTotalTests as number, fallan: r.numFailedTests as number };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

describe("Ejercicio 3 · Tus propias pruebas", { timeout: 60_000 }, () => {
	it("existe s03/mis-pruebas/tareas.test.ts", () => {
		expect(existsSync(FICHERO)).toBe(true);
	});

	it("tiene al menos 5 pruebas y todas pasan con la API de verdad", () => {
		const r = pasarMisPruebas();
		expect(r.total, "escribe al menos 5 it(...)").toBeGreaterThanOrEqual(5);
		expect(r.fallan, "tus pruebas tienen que pasar con la API buena").toBe(0);
	});

	it("detectan una API que no valida (acepta un POST sin título)", () => {
		expect(pasarMisPruebas("sin-validacion").fallan, "prueba que un POST no válido responde 400").toBeGreaterThan(0);
	});

	it("detectan una API que responde 200 a lo que no existe", () => {
		expect(pasarMisPruebas("404-como-200").fallan, "prueba que una tarea inexistente responde 404").toBeGreaterThan(0);
	});
});
