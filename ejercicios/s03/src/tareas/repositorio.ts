import { datosIniciales, type Tarea } from "../datos.js";

// Guarda las tareas. Hoy en memoria; mañana una base de datos, sin tocar rutas ni servicio.
export class RepositorioTareas {
	private tareas: Tarea[] = datosIniciales();
	private siguienteId = this.tareas.length + 1;

	todas(): Tarea[] {
		return this.tareas;
	}

	buscar(id: number): Tarea | undefined {
		return this.tareas.find((t) => t.id === id);
	}

	crear(datos: Omit<Tarea, "id">): Tarea {
		const tarea = { id: this.siguienteId++, ...datos };
		this.tareas.push(tarea);
		return tarea;
	}

	guardar(tarea: Tarea): Tarea {
		const i = this.tareas.findIndex((t) => t.id === tarea.id);
		this.tareas[i] = tarea;
		return tarea;
	}

	borrar(id: number): boolean {
		const antes = this.tareas.length;
		this.tareas = this.tareas.filter((t) => t.id !== id);
		return this.tareas.length < antes;
	}
}
