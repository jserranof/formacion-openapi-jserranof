export const PRIORIDADES = ["baja", "media", "alta"] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export interface Tarea {
	id: number;
	titulo: string;
	completada: boolean;
	prioridad: Prioridad;
	/** El «sub» del token de quien la creó */
	propietario: string;
}

// Las tareas 1–6 son de «ana» y las 7–12 de «luis»
const SEMILLA: Tarea[] = [
	{ id: 1, titulo: "Instalar Node", completada: true, prioridad: "alta", propietario: "ana" },
	{ id: 2, titulo: "Arrancar la API", completada: true, prioridad: "alta", propietario: "ana" },
	{ id: 3, titulo: "Leer el contrato", completada: false, prioridad: "media", propietario: "ana" },
	{ id: 4, titulo: "Diseñar las rutas", completada: false, prioridad: "alta", propietario: "ana" },
	{ id: 5, titulo: "Validar las entradas", completada: false, prioridad: "alta", propietario: "ana" },
	{ id: 6, titulo: "Documentar los errores", completada: false, prioridad: "media", propietario: "ana" },
	{ id: 7, titulo: "Añadir paginación", completada: false, prioridad: "baja", propietario: "luis" },
	{ id: 8, titulo: "Configurar CORS", completada: false, prioridad: "media", propietario: "luis" },
	{ id: 9, titulo: "Limitar peticiones", completada: false, prioridad: "baja", propietario: "luis" },
	{ id: 10, titulo: "Escribir pruebas", completada: true, prioridad: "media", propietario: "luis" },
	{ id: 11, titulo: "Revisar los logs", completada: false, prioridad: "baja", propietario: "luis" },
	{ id: 12, titulo: "Publicar la documentación", completada: false, prioridad: "baja", propietario: "luis" },
];

// Copia nueva en cada llamada: cada app (y cada prueba) empieza con los mismos datos
export function datosIniciales(): Tarea[] {
	return SEMILLA.map((t) => ({ ...t }));
}
