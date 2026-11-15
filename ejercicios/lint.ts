// Revisa el contrato con las reglas de sNN/redocly.yaml. Es el mismo motor que `redocly lint`.
//
//   npm run lint:s03
import { formatProblems, getTotals, lint, loadConfig } from "@redocly/openapi-core";

const sesion = process.argv[2] ?? "s03";
const config = await loadConfig({ configPath: `${sesion}/redocly.yaml` });
const problemas = await lint({ ref: `${sesion}/openapi.yaml`, config });
const totales = getTotals(problemas);

if (problemas.length > 0) formatProblems(problemas, { format: "stylish", totals: totales, version: "curso" });
console.log(
	problemas.length === 0
		? `${sesion}/openapi.yaml pasa el lint: ni errores ni avisos.`
		: `\n${totales.errors} errores y ${totales.warnings} avisos en ${sesion}/openapi.yaml.`,
);
process.exit(totales.errors > 0 ? 1 : 0);
