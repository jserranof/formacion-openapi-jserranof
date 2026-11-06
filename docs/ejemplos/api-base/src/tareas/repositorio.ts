import type { Tarea } from "./modelo.js";

const tareas: Tarea[] = [
	{ id: 1, titulo: "Instalar Node 22", completada: true, creadaEn: "2026-11-16T09:00:00.000Z" },
	{ id: 2, titulo: "Arrancar la API", completada: false, creadaEn: "2026-11-16T09:05:00.000Z" },
];
let siguienteId = 3;

export function listar(): Tarea[] {
	return tareas;
}

export function buscar(id: number): Tarea | undefined {
	return tareas.find((t) => t.id === id);
}

export function crear(titulo: string): Tarea {
	const tarea: Tarea = { id: siguienteId++, titulo, completada: false, creadaEn: new Date().toISOString() };
	tareas.push(tarea);
	return tarea;
}
