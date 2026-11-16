import { describe, expect, it } from "vitest";
import { conceptos as c, contenido as t } from "../src/respuestas/token.js";

// Compara sin enseñar la respuesta correcta: solo la pista
const bien = (acierto: boolean, pista: string) => expect(acierto, pista).toBe(true);
const texto = (v: string | null) => (v ?? "").trim();

describe("Ejercicio 1 · Lee un token (s04/token-ejemplo.txt)", () => {
	it("1 a 4. quién lo emite, de quién es, para qué API y qué aplicación lo pidió", () => {
		bien(texto(t.emisor).replace(/\/$/, "") === "http://localhost:9000", "1: copia el valor de «iss»");
		bien(texto(t.usuario) === "ana", "2: el valor de «sub»");
		bien(texto(t.audiencia) === "api-curso", "3: el valor de «aud»");
		bien(texto(t.aplicacion) === "app-lectura", "4: el valor de «client_id»");
	});

	it("5. qué permisos da", () => {
		const lista = (t.permisos ?? []).map((p) => p.trim()).sort();
		bien(JSON.stringify(lista) === JSON.stringify(["tareas:leer"]), "5: «scope» es una lista de permisos separados por espacios");
	});

	it("6 y 7. cuánto dura y con qué se firma", () => {
		bien(t.minutosDeVida === 60, "6: resta exp − iat: son segundos");
		bien(texto(t.algoritmo).toUpperCase() === "RS256", "7: «alg», en la cabecera (la primera parte)");
	});

	it("8. firmado no es cifrado", () => {
		bien(c.porQueSeLee === "b", "8: ¿has necesitado alguna clave para leerlo?");
	});

	it("9 a 11. 401 o 403", () => {
		bien(c.codigoSiLoCambias === 401, "9: si cambia el contenido, la firma ya no cuadra: ¿sabe la API quién eres?");
		bien(c.codigoPostConEsteToken === 403, "10: la API sabe quién eres, pero ¿qué permisos tiene el token?");
		bien(c.codigoSinToken === 401, "11: sin token, la API no sabe quién eres");
	});

	it("12 y 13. las claves y los secretos", () => {
		bien(c.queNecesitaLaApi === "a", "12: en RS256 hay dos claves: una firma y la otra solo comprueba");
		bien(c.porQueSinSecretos === "c", "13: piensa en la respuesta 8");
	});
});
