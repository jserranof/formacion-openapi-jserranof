// Comprueba tus ejercicios y te dice, en español, qué te falta.
//
//   npm run comprobar              todos los ejercicios
//   npm run comprobar s01          los de la sesión 1
//   npm run comprobar s01 e02      solo el ejercicio 2 de la sesión 1
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

interface Comprobacion { title: string; status: string; failureMessages: string[] }
interface Fichero { name: string; assertionResults: Comprobacion[]; message?: string }

const [sesion, ejercicio] = process.argv.slice(2);
const filtro = sesion ? `${sesion}/pruebas/${ejercicio ?? ""}` : "";

const carpeta = mkdtempSync(join(tmpdir(), "comprobar-"));
const salida = join(carpeta, "resultado.json");
spawnSync("npx", ["vitest", "run", ...(filtro ? [filtro] : []), "--reporter=json", `--outputFile=${salida}`], {
	stdio: "ignore",
	shell: process.platform === "win32",
});

let ficheros: Fichero[];
try {
	ficheros = JSON.parse(readFileSync(salida, "utf8")).testResults;
} catch {
	console.error("No he podido ejecutar las pruebas. Prueba con: npx vitest run " + filtro);
	process.exit(2);
} finally {
	rmSync(carpeta, { recursive: true, force: true });
}

if (ficheros.length === 0) {
	console.error(`No hay ningún ejercicio que coincida con «${[sesion, ejercicio].filter(Boolean).join(" ")}».`);
	process.exit(2);
}

// Primera línea útil del error: lo que se esperaba y lo que ha llegado
function motivo(c: Comprobacion) {
	const texto = (c.failureMessages[0] ?? "").replace(/\u001b\[[0-9;]*m/g, "");
	const linea = texto.split("\n").find((l) => l.trim() !== "")?.trim() ?? "";
	return linea.replace(/^AssertionError: /, "").replace(" // Object.is equality", "").replace(/expected (.+) to (deeply )?(be|equal|match|contain) /, "llega $1 y se esperaba ").replace("greater than or equal to ", "al menos ").replace("greater than ", "más de ").replace(/ to (be )?(defined|truthy)$/, ": falta").replace(/: llega false y se esperaba true$/, "");
}

let superados = 0;
let retos = 0;
let retosSuperados = 0;
for (const f of ficheros.sort((a, b) => a.name.localeCompare(b.name))) {
	const nombre = relative(process.cwd(), f.name).replace(/\\/g, "/").replace("/pruebas/", " · ").replace(".test.ts", "");
	const fallos = f.assertionResults.filter((c) => c.status !== "passed");
	const ok = f.assertionResults.length > 0 && fallos.length === 0;
	// Los retos («eNN-reto-…») son para quien acaba antes: se cuentan aparte y no hacen fallar
	const esReto = /\/e\d+-reto-/.test(f.name.replace(/\\/g, "/"));
	if (esReto) {
		retos++;
		if (ok) retosSuperados++;
	} else if (ok) superados++;
	console.log(`\n${ok ? "[ OK ]" : "[FALTA]"} ${nombre}  (${f.assertionResults.length - fallos.length}/${f.assertionResults.length})`);
	if (f.assertionResults.length === 0 && f.message) console.log(`        No compila o no arranca: ${f.message.split("\n")[0]}`);
	for (const c of fallos) {
		console.log(`        - ${c.title}`);
		const m = motivo(c);
		if (m) console.log(`          ${m}`);
	}
}

const obligatorios = ficheros.length - retos;
const resumenRetos = retos > 0 ? ` · retos: ${retosSuperados} de ${retos}` : "";
console.log(`\n${superados} de ${obligatorios} ejercicios superados${resumenRetos}.`);
process.exit(superados === obligatorios ? 0 : 1);
