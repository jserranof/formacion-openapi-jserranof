// Anexo S2 · C. Sirve cors.html en otro puerto, para que sea «otro origen».
//   node docs/ejemplos/anexo-s02/servir.mjs 5173     (el origen permitido en crearApp)
//   node docs/ejemplos/anexo-s02/servir.mjs 5174     (uno que no está en la lista)
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const puerto = Number(process.argv[2] ?? 5173);
const pagina = readFileSync(new URL("./cors.html", import.meta.url));

createServer((_req, res) => {
	res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
	res.end(pagina);
}).listen(puerto, () => console.log(`Página en http://localhost:${puerto}`));
