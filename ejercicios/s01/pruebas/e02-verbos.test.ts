import { describe, expect, it } from "vitest";

// Compara sin enseñar la respuesta correcta: solo la pista
const bien = (acierto: boolean, pista: string) => expect(acierto, pista).toBe(true);
import { situaciones as s } from "../src/respuestas/verbos.js";

// «/Tareas/7/» y «/tareas/7» valen igual
const ruta = (v: string) => v.trim().toLowerCase().replace(/\/+$/, "");

describe("Ejercicio 2 · ¿Qué verbo y qué código?", () => {
	it("1. ver todas las tareas", () => {
		bien(s.verTodas.verbo === "GET", "leer es…");
		bien(ruta(s.verTodas.ruta) === "/tareas", "el recurso, en plural");
		bien(s.verTodas.codigo === 200, "revisa el código");
	});

	it("2. ver la tarea 7, que existe", () => {
		bien(s.verUna.verbo === "GET", "revisa el verbo");
		bien(ruta(s.verUna.ruta) === "/tareas/7", "la colección y el id: /coleccion/id");
		bien(s.verUna.codigo === 200, "revisa el código");
	});

	it("3. ver la tarea 700, que no existe", () => {
		bien(s.verNoExiste.verbo === "GET", "revisa el verbo");
		bien(ruta(s.verNoExiste.ruta) === "/tareas/700", "revisa la ruta");
		bien(s.verNoExiste.codigo === 404, "no es 200 con el cuerpo vacío: hay un código para «no existe»");
	});

	it("4. crear una tarea", () => {
		bien(s.crear.verbo === "POST", "crear es…");
		bien(ruta(s.crear.ruta) === "/tareas", "la acción va en el verbo, no en la ruta: nada de /crear");
		bien(s.crear.codigo === 201, "hay un código específico para «creado»");
	});

	it("5. crear una tarea sin título", () => {
		bien(s.crearSinTitulo.verbo === "POST", "revisa el verbo");
		bien(ruta(s.crearSinTitulo.ruta) === "/tareas", "revisa la ruta");
		bien(([400, 422] as unknown[]).includes(s.crearSinTitulo.codigo), "no falta el recurso, falta un dato: la culpa es de lo que mandas (4xx)");
	});

	it("6. marcar la tarea 7 como completada", () => {
		bien(s.completar.verbo === "PATCH", "solo cambia un campo: ¿PUT o PATCH?");
		bien(ruta(s.completar.ruta) === "/tareas/7", "revisa la ruta");
		bien(([200, 204] as unknown[]).includes(s.completar.codigo), "ha ido bien");
	});

	it("7. sustituir la tarea 7 entera", () => {
		bien(s.sustituir.verbo === "PUT", "sustituir entera: ¿PUT o PATCH?");
		bien(ruta(s.sustituir.ruta) === "/tareas/7", "revisa la ruta");
		bien(([200, 204] as unknown[]).includes(s.sustituir.codigo), "revisa el código");
	});

	it("8. borrar la tarea 7", () => {
		bien(s.borrar.verbo === "DELETE", "revisa el verbo");
		bien(ruta(s.borrar.ruta) === "/tareas/7", "revisa la ruta");
		bien(s.borrar.codigo === 204, "«hecho, y no hay nada que devolver» tiene su propio código");
	});

	it("9. ver las tareas del proyecto 3", () => {
		bien(s.tareasDeProyecto.verbo === "GET", "revisa el verbo");
		bien((["/proyectos/3/tareas", "/tareas?proyecto=3"] as unknown[]).includes(ruta(s.tareasDeProyecto.ruta)), "se lee como carpetas: proyectos → 3 → tareas");
		bien(s.tareasDeProyecto.codigo === 200, "revisa el código");
	});

	it("10. crear sin identificarte", () => {
		bien(s.crearSinIdentificarte.verbo === "POST", "revisa el verbo");
		bien(ruta(s.crearSinIdentificarte.ruta) === "/tareas", "revisa la ruta");
		bien(s.crearSinIdentificarte.codigo === 401, "«no sé quién eres» no es lo mismo que «no puedes»");
	});
});
