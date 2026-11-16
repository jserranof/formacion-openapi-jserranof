// Calentamiento de JavaScript y TypeScript: funciones sobre una lista de tareas.
// Cada función tiene su ejercicio. Cambia solo el cuerpo (lo que hay entre { y }):
// el nombre, los parámetros y el tipo que devuelve ya están bien.

export type Prioridad = "baja" | "media" | "alta";

export interface Tarea {
	id: number;
	titulo: string;
	completada: boolean;
	prioridad: Prioridad;
}

export const tareas: Tarea[] = [
	{ id: 1, titulo: "Instalar Node", completada: true, prioridad: "alta" },
	{ id: 2, titulo: "Arrancar la API", completada: true, prioridad: "alta" },
	{ id: 3, titulo: "Leer el contrato", completada: false, prioridad: "media" },
	{ id: 4, titulo: "Diseñar las rutas", completada: false, prioridad: "alta" },
	{ id: 5, titulo: "Añadir paginación", completada: false, prioridad: "baja" },
	{ id: 6, titulo: "Escribir pruebas", completada: true, prioridad: "media" },
];

// Ejercicio 1: devuelve solo las tareas que NO están completadas (pista: filter)
export function pendientes(lista: Tarea[]): Tarea[] {
	return [];
}

// Ejercicio 2: devuelve la tarea con ese id, o undefined si no está (pista: find)
export function buscar(lista: Tarea[], id: number): Tarea | undefined {
	return undefined;
}

// Ejercicio 3: devuelve solo los títulos, en el mismo orden (pista: map)
export function titulos(lista: Tarea[]): string[] {
	return [];
}

// Ejercicio 4: devuelve un objeto { total, completadas, pendientes } con las cuentas
// (pista: .length, y filter para contar)
export function resumen(lista: Tarea[]): { total: number; completadas: number; pendientes: number } {
	return { total: 0, completadas: 0, pendientes: 0 };
}

// Ejercicio 5: devuelve una tarea NUEVA con los cambios aplicados, sin tocar la original
// (pista: { ...tarea, ...cambios })
export function cambiar(tarea: Tarea, cambios: Partial<Tarea>): Tarea {
	return tarea;
}

// Ejercicio 6 (reto): las tareas cuyo título contiene el texto, sin distinguir
// mayúsculas (pista: filter, includes y toLowerCase)
export function buscarTexto(lista: Tarea[], texto: string): Tarea[] {
	return [];
}

// Ejercicio 7 (reto): una lista NUEVA ordenada por título, de la A a la Z, sin
// desordenar la original (pista: [...lista], sort y localeCompare)
export function ordenarPorTitulo(lista: Tarea[]): Tarea[] {
	return lista;
}
