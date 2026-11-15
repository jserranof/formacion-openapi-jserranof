import type { Tarea } from "../datos.js";
import { ErrorApi } from "../errores.js";
import type { RepositorioTareas } from "./repositorio.js";

// Las reglas del negocio. No sabe nada de HTTP salvo los errores que lanza.
export class ServicioTareas {
	constructor(private repo: RepositorioTareas) {}

	// Ejercicios 7 y 8: filtrar, ordenar y paginar. Devuelve { items, total, pagina, limite }
	listar() {
		return { items: this.repo.todas() };
	}

	obtener(id: number): Tarea {
		const tarea = this.repo.buscar(id);
		if (!tarea) throw new ErrorApi(404, "Tarea no encontrada", `No hay ninguna tarea con id ${id}`);
		return tarea;
	}

	// Ejercicio 2: crear, reemplazar, cambiar y borrar (el repositorio ya sabe guardar)
}
