// Ejecuta las pruebas del alumno (s03/mis-pruebas) contra la API real o contra una versión rota.
// Solo se cambia el import exacto de las pruebas del alumno («../src/app.js»): el mutante
// importa la API real con «../../src/app.js» y así no se sustituye a sí mismo.
//   MUTANTE   nombre del mutante (sin él, la API real)
//   FICHEROS  qué ficheros de mis-pruebas, separados por comas (sin él, todos)
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const mutante = process.env.MUTANTE;
const ficheros = process.env.FICHEROS?.split(",").filter(Boolean);

export default defineConfig({
	test: {
		root: fileURLToPath(new URL("../../..", import.meta.url)),
		include: ficheros?.length ? ficheros.map((f) => `s03/mis-pruebas/${f}`) : ["s03/mis-pruebas/**/*.test.ts"],
	},
	resolve: {
		alias: mutante ? [{ find: /^\.\.\/src\/app\.js$/, replacement: fileURLToPath(new URL(`./${mutante}.ts`, import.meta.url)) }] : [],
	},
});
