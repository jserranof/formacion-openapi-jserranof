// Pasa la guía de estilo (estilo.yaml) a un contrato. Desde ejercicios:
//   npx tsx ../docs/ejemplos/anexo-s03/lint-estilo.ts s03/openapi.yaml
import { fileURLToPath } from "node:url";
import { formatProblems, getTotals, lint, loadConfig } from "@redocly/openapi-core";

const ref = process.argv[2] ?? "s03/openapi.yaml";
const config = await loadConfig({ configPath: fileURLToPath(new URL("./estilo.yaml", import.meta.url)) });
const problemas = await lint({ ref, config });
const totales = getTotals(problemas);
if (problemas.length > 0) formatProblems(problemas, { format: "stylish", totals: totales, version: "curso" });
console.log(problemas.length === 0 ? `${ref} cumple la guía de estilo.` : `\n${totales.errors} errores y ${totales.warnings} avisos en ${ref}.`);
process.exit(totales.errors > 0 ? 1 : 0);
