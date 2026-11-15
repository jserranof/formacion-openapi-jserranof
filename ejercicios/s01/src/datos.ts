// Ejercicio 5: añade a Tarea el campo opcional prioridad ("alta", "media" o "baja")
// y pon prioridad "alta" a la tarea 2.
export interface Tarea {
	id: number;
	titulo: string;
	completada: boolean;
}

export const tareas: Tarea[] = [
	{ id: 1, titulo: "Instalar Node", completada: true },
	{ id: 2, titulo: "Arrancar la API", completada: false },
	{ id: 3, titulo: "Leer el contrato", completada: false },
];

export interface Etiqueta {
	id: number;
	nombre: string;
}

export const etiquetas: Etiqueta[] = [
	{ id: 1, nombre: "urgente" },
	{ id: 2, nombre: "revisar" },
];
