import { PRIORIDADES, type Tarea } from "../datos.js";
import { ErrorApi } from "../errores.js";
import type { CambiosTarea, Consulta, TareaNueva } from "./esquemas.js";
import type { RepositorioTareas } from "./repositorio.js";

// Las reglas del negocio. No sabe nada de HTTP salvo los errores que lanza.
export class ServicioTareas {
	constructor(private repo: RepositorioTareas) {}

	listar(c: Consulta) {
		let items = this.repo.todas();
		if (c.prioridad) items = items.filter((t) => t.prioridad === c.prioridad);
		if (c.completada !== undefined) items = items.filter((t) => t.completada === c.completada);

		const campo = c.orden.replace("-", "") as "id" | "titulo" | "prioridad";
		const signo = c.orden.startsWith("-") ? -1 : 1;
		const valor = (t: Tarea) => (campo === "prioridad" ? PRIORIDADES.indexOf(t.prioridad) : t[campo]);
		items = [...items].sort((a, b) => {
			const [x, y] = [valor(a), valor(b)];
			return signo * (typeof x === "string" ? x.localeCompare(String(y), "es") : x - Number(y));
		});

		const inicio = (c.pagina - 1) * c.limite;
		return { items: items.slice(inicio, inicio + c.limite), total: items.length, pagina: c.pagina, limite: c.limite };
	}

	obtener(id: number): Tarea {
		const tarea = this.repo.buscar(id);
		if (!tarea) throw new ErrorApi(404, "Tarea no encontrada", `No hay ninguna tarea con id ${id}`);
		return tarea;
	}

	crear(datos: TareaNueva): Tarea {
		return this.repo.crear(datos);
	}

	reemplazar(id: number, datos: TareaNueva): Tarea {
		this.obtener(id);
		return this.repo.guardar({ id, ...datos });
	}

	cambiar(id: number, cambios: CambiosTarea): Tarea {
		return this.repo.guardar({ ...this.obtener(id), ...cambios });
	}

	borrar(id: number): void {
		if (!this.repo.borrar(id)) throw new ErrorApi(404, "Tarea no encontrada", `No hay ninguna tarea con id ${id}`);
	}
}
