import { describe, expect, it } from "vitest";

// Compara sin enseñar la respuesta correcta: solo la pista
const bien = (acierto: boolean, pista: string) => expect(acierto, pista).toBe(true);
import { arreglos as a, preguntas as p } from "../src/respuestas/diseno.js";

// «/Tareas/7/» y «/tareas/7» valen igual
const ruta = (v: string) => v.trim().toLowerCase().replace(/\/+$/, "");

describe("Ejercicio 1 · Arregla un diseño", () => {
	it("1. GET /obtenerTareas: ver todas las tareas", () => {
		bien(a.listar.verbo === "GET", "leer sigue siendo…");
		bien(ruta(a.listar.ruta) === "/tareas", "nada de verbos en la ruta: el recurso, en plural");
	});

	it("2. GET /tarea?id=7: ver la tarea 7", () => {
		bien(a.verUna.verbo === "GET", "revisa el verbo");
		bien(ruta(a.verUna.ruta) === "/tareas/7", "cada cosa, su dirección: /coleccion/id, no ?id=");
	});

	it("3. POST /tareas/borrar/7: borrar la tarea 7", () => {
		bien(a.borrar.verbo === "DELETE", "la acción va en el verbo");
		bien(ruta(a.borrar.ruta) === "/tareas/7", "quita la acción de la ruta");
	});

	it("4. GET /tareas/7/eliminar: borrar con un GET", () => {
		bien(a.borrarConGet.verbo === "DELETE", "borrar nunca es un GET");
		bien(ruta(a.borrarConGet.ruta) === "/tareas/7", "revisa la ruta");
		bien(p.porQueGetNoBorra === "b", "piensa en quién hace GET sin preguntarte: buscadores, precargas del navegador, reintentos");
	});

	it("5. POST /actualizarTitulo/7: cambiar solo el título", () => {
		bien(a.cambiarTitulo.verbo === "PATCH", "solo cambia una parte: ¿PUT o PATCH?");
		bien(ruta(a.cambiarTitulo.ruta) === "/tareas/7", "revisa la ruta");
	});

	it("6. POST /tareas/7 con la tarea entera: sustituirla", () => {
		bien(a.sustituir.verbo === "PUT", "sustituir entera: ¿PUT o PATCH?");
		bien(ruta(a.sustituir.ruta) === "/tareas/7", "revisa la ruta");
	});

	it("7. POST /proyectos/3/nuevaTarea: crear una tarea en el proyecto 3", () => {
		bien(a.crearEnProyecto.verbo === "POST", "crear es…");
		bien((["/proyectos/3/tareas", "/tareas"] as unknown[]).includes(ruta(a.crearEnProyecto.ruta)), "se lee como carpetas: proyectos → 3 → tareas, sin «nueva»");
	});

	it("8. GET /Proyectos/3/ListaTareas: ver las tareas del proyecto 3", () => {
		bien(a.tareasDeProyecto.verbo === "GET", "revisa el verbo");
		bien((["/proyectos/3/tareas", "/tareas?proyecto=3"] as unknown[]).includes(ruta(a.tareasDeProyecto.ruta)), "minúsculas y sin «Lista»: la colección ya es una lista");
	});

	it("9 a 11. Los niveles de Richardson", () => {
		bien(p.nivelTodoPost === 0, "9: una sola dirección y todo POST: es el nivel más bajo");
		bien(p.nivelRecursosSinVerbos === 1, "10: ya hay recursos con dirección, pero no usa los verbos ni los códigos");
		bien(p.nivelNuestra === 2, "11: recursos, verbos y códigos, pero sin enlaces");
	});

	it("12. la cabecera que dice dónde está lo creado", () => {
		bien(p.cabeceraCreado?.trim().toLowerCase() === "location", "la viste ayer en el 201 del POST");
	});
});
