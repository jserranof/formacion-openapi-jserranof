import { describe, expect, it } from "vitest";

// Compara sin enseñar la respuesta correcta: solo la pista
const bien = (acierto: boolean, pista: string) => expect(acierto, pista).toBe(true);
import { respuestas as r } from "../src/respuestas/explorar.js";

// «application/json; charset=utf-8» y « Application/JSON » valen igual que «application/json»
const tipo = (v: string | null) => v?.split(";")[0].trim().toLowerCase() ?? null;

describe("Ejercicio 1 · Explora la API de ejemplo", () => {
	it("1. GET /tareas: código y Content-Type", () => {
		bien(r.codigoListar === 200, "mira la primera línea de curl -i localhost:3000/tareas");
		bien(tipo(r.contentTypeListar) === "application/json", "copia el valor de la cabecera Content-Type, sin «; charset=utf-8»");
	});

	it("2. GET /tareas/99: código y Content-Type", () => {
		bien(r.codigoNoExiste === 404, "mira la primera línea de curl -i localhost:3000/tareas/99");
		bien(tipo(r.contentTypeNoExiste) === "application/problem+json", "fíjate: no es el mismo Content-Type que el de la lista");
	});

	it("3. GET /tareas/abc: código", () => {
		bien(r.codigoIdTexto === 404, "pruébalo: curl -i localhost:3000/tareas/abc");
	});

	it("4. POST /tareas: código y cabecera nueva", () => {
		bien(r.codigoCrear === 201, "crear no devuelve el mismo código que leer");
		bien(r.cabeceraCrear?.trim().toLowerCase() === "location", "busca la cabecera que lleva la ruta /tareas/3");
	});

	it("5. quién pone el id", () => {
		bien(r.quienPoneElId === "el servidor", "¿mandaste tú el id en el cuerpo del POST?");
	});

	it("6. POST /tareas sin título: código", () => {
		bien(r.codigoSinTitulo === 400, "curl -i -X POST localhost:3000/tareas -H \"Content-Type: application/json\" -d '{}'");
	});

	it("7. qué pasa al reiniciar", () => {
		bien(r.alReiniciar === "ha desaparecido", "para el servidor con Ctrl+C, arráncalo y vuelve a pedir GET /tareas");
	});

	it("8. qué es /docs", () => {
		bien(r.queEsDocs === "la documentación interactiva de la API", "abre /docs en el navegador: pestaña Puertos, globo del 3000");
	});
});
