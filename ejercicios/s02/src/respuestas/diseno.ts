// Ejercicio 1 · Arregla un diseño (Bloque 1)
//
// Alguien diseñó estas rutas sin conocer REST. Para cada una, escribe el verbo y la ruta
// que usarías tú para hacer lo mismo. Después contesta las preguntas de abajo.
// El recurso son las tareas de un equipo (/tareas) y sus proyectos (/proyectos).
// Comprueba: cd ejercicios && npm run comprobar s02 e01

type Verbo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | null;
interface Ruta {
	verbo: Verbo;
	ruta: string;
}
const pendiente: Ruta = { verbo: null, ruta: "" };

export const arreglos: Record<string, Ruta> = {
	/** 1. GET /obtenerTareas → ver todas las tareas */
	listar: { ...pendiente },
	/** 2. GET /tarea?id=7 → ver la tarea 7 */
	verUna: { ...pendiente },
	/** 3. POST /tareas/borrar/7 → borrar la tarea 7 */
	borrar: { ...pendiente },
	/** 4. GET /tareas/7/eliminar → borrar la tarea 7 (sí, con un GET) */
	borrarConGet: { ...pendiente },
	/** 5. POST /actualizarTitulo/7 → cambiar solo el título de la tarea 7 */
	cambiarTitulo: { ...pendiente },
	/** 6. POST /tareas/7 con la tarea entera en el cuerpo → sustituir la tarea 7 */
	sustituir: { ...pendiente },
	/** 7. POST /proyectos/3/nuevaTarea → crear una tarea en el proyecto 3 */
	crearEnProyecto: { ...pendiente },
	/** 8. GET /Proyectos/3/ListaTareas → ver las tareas del proyecto 3 */
	tareasDeProyecto: { ...pendiente },
};

type Nivel = 0 | 1 | 2 | 3 | null;

export const preguntas = {
	/**
	 * 4 bis. ¿Por qué la ruta 4 es peligrosa, además de fea?
	 *   "a": porque GET no admite parámetros en la ruta
	 *   "b": porque un GET debe ser seguro: buscadores, precargas y reintentos lo lanzan sin preguntar
	 *   "c": porque GET es más lento que DELETE
	 */
	porQueGetNoBorra: null as "a" | "b" | "c" | null,
	/** 9. Una API donde todo es POST /api con {"accion":"listarTareas"}. ¿Nivel de Richardson (0 a 3)? */
	nivelTodoPost: null as Nivel,
	/** 10. Una API con /tareas y /tareas/7, pero todo con POST y siempre 200. ¿Nivel? */
	nivelRecursosSinVerbos: null as Nivel,
	/** 11. Nuestra API al terminar hoy: recursos, verbos y códigos, sin enlaces. ¿Nivel? */
	nivelNuestra: null as Nivel,
	/** 12. Al crear con POST, ¿qué cabecera de la respuesta dice dónde está lo creado? */
	cabeceraCreado: null as string | null,
};
