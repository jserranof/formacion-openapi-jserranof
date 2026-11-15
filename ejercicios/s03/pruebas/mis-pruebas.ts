// Pasa las pruebas del alumno (s03/mis-pruebas) contra la API real o contra una versión rota
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("../..", import.meta.url));
const CONFIG = fileURLToPath(new URL("./mutantes/vitest.config.ts", import.meta.url));

export const MIS_PRUEBAS = join(RAIZ, "s03/mis-pruebas");

export interface Resultado {
	total: number;
	fallan: number;
	/** Con espía: las peticiones que han hecho las pruebas («GET /tareas/7 404») */
	peticiones: string[];
}

export function pasarMisPruebas(fichero: string, mutante?: "sin-validacion" | "404-como-200" | "respuesta-rota" | "espia"): Resultado {
	if (!fichero.includes("*") && !existsSync(join(MIS_PRUEBAS, fichero))) return { total: 0, fallan: 0, peticiones: [] };
	const dir = mkdtempSync(join(tmpdir(), "mis-pruebas-"));
	const salida = join(dir, "r.json");
	const espia = join(dir, "espia.txt");
	spawnSync("npx", ["vitest", "run", "--config", CONFIG, "--reporter=json", `--outputFile=${salida}`], {
		cwd: RAIZ,
		env: { ...process.env, MUTANTE: mutante ?? "", FICHEROS: fichero, ESPIA: espia },
		stdio: "ignore",
		shell: process.platform === "win32",
	});
	try {
		const r = JSON.parse(readFileSync(salida, "utf8"));
		const peticiones = existsSync(espia) ? readFileSync(espia, "utf8").split("\n").filter(Boolean) : [];
		// Un fichero que no compila cuenta como fallido aunque no tenga pruebas
		return { total: r.numTotalTests, fallan: r.numFailedTests + (r.numFailedTestSuites ?? 0), peticiones };
	} catch {
		return { total: 0, fallan: 1, peticiones: [] };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}
