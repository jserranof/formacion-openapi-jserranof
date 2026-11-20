// Imprime un token de «ana» que caducó hace una hora, para probar que la API lo rechaza.
import { firmarToken } from "./auth.js";

const haceUnaHora = Math.floor(Date.now() / 1000) - 3600;
console.log(await firmarToken("ana", ["apuestas:leer", "apuestas:escribir"], haceUnaHora));
