// Enseña lo que lleva un JWT por dentro, sin comprobar la firma (cualquiera puede leerlo).
//   npm run token:s04                   el de s04/token-ejemplo.txt
//   npm run token:s04 -- <token>        otro token
import { readFileSync } from "node:fs";

const jwt = (process.argv[2] ?? readFileSync(new URL("../token-ejemplo.txt", import.meta.url), "utf8")).trim();
const [cabecera, contenido, firma] = jwt.split(".");
if (!cabecera || !contenido || !firma) {
	console.error("Eso no es un JWT: tiene que tener tres partes separadas por puntos");
	process.exit(1);
}
const leer = (parte: string) => JSON.parse(Buffer.from(parte, "base64url").toString("utf8"));
const fecha = (s: unknown) => (typeof s === "number" ? `${s}  (${new Date(s * 1000).toISOString()})` : s);

console.log("Cabecera:", leer(cabecera));
const datos = leer(contenido);
console.log("Contenido:", { ...datos, iat: fecha(datos.iat), exp: fecha(datos.exp) });
console.log(`Firma: ${firma.slice(0, 20)}… (${Buffer.from(firma, "base64url").length} bytes; sin la clave no se puede rehacer)`);
