// Ejercicio 2 · ¿Qué verbo y qué código? (Bloque 2)
//
// Para cada situación, rellena el verbo, la ruta y el código de respuesta.
// El recurso son las tareas de un equipo (/tareas) y sus proyectos (/proyectos).
// Comprueba: cd ejercicios && npm run comprobar s01 e02

type Verbo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | null;
interface Respuesta {
	verbo: Verbo;
	ruta: string;
	codigo: number | null;
}
const pendiente: Respuesta = { verbo: null, ruta: "", codigo: null };

export const situaciones: Record<string, Respuesta> = {
	/** 1. Ver todas las tareas */
	verTodas: { ...pendiente },
	/** 2. Ver la tarea 7, que existe */
	verUna: { ...pendiente },
	/** 3. Ver la tarea 700, que no existe */
	verNoExiste: { ...pendiente },
	/** 4. Crear una tarea nueva, y todo va bien */
	crear: { ...pendiente },
	/** 5. Crear una tarea sin título (el título es obligatorio) */
	crearSinTitulo: { ...pendiente },
	/** 6. Marcar la tarea 7 como completada, sin tocar nada más */
	completar: { ...pendiente },
	/** 7. Sustituir la tarea 7 entera por otra versión */
	sustituir: { ...pendiente },
	/** 8. Borrar la tarea 7, y no hay nada que devolver */
	borrar: { ...pendiente },
	/** 9. Ver las tareas del proyecto 3 */
	tareasDeProyecto: { ...pendiente },
	/** 10. Crear una tarea sin haberte identificado, en una API que lo exige */
	crearSinIdentificarte: { ...pendiente },
};
