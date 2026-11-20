import { crearApp } from "./app.js";
import type { Version } from "./version.js";

const version = (process.env.VERSION ?? "estable") as Version;
if (version !== "estable" && version !== "candidata") {
	console.error(`VERSION debe ser «estable» o «candidata», no «${version}»`);
	process.exit(1);
}
const puerto = Number(process.env.PUERTO ?? (version === "estable" ? 3000 : 3001));

crearApp(version).listen(puerto, () => {
	console.log(`API de Sorteos (${version}) en http://localhost:${puerto} · documentación en /docs`);
});
