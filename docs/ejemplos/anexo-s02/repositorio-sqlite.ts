// Anexo S2 · B. Copia este fichero en ejercicios/s02/src/tareas/.
// Hace lo mismo que RepositorioTareas, pero guarda en SQLite (node:sqlite, sin instalar nada).
import { DatabaseSync } from "node:sqlite";
import { datosIniciales, type Prioridad, type Tarea } from "../datos.js";

interface Fila {
	id: number;
	titulo: string;
	completada: number;
	prioridad: string;
}

// SQLite no tiene booleanos: guarda 0 o 1
const aTarea = (f: Fila): Tarea => ({ id: f.id, titulo: f.titulo, completada: f.completada === 1, prioridad: f.prioridad as Prioridad });

export class RepositorioSqlite {
	private bd: DatabaseSync;

	// ":memory:" para las pruebas (cada app, su base de datos); un fichero para guardar de verdad
	constructor(ruta = ":memory:") {
		this.bd = new DatabaseSync(ruta);
		this.bd.exec(`CREATE TABLE IF NOT EXISTS tareas (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			titulo TEXT NOT NULL,
			completada INTEGER NOT NULL,
			prioridad TEXT NOT NULL
		)`);
		const { n } = this.bd.prepare("SELECT COUNT(*) AS n FROM tareas").get() as { n: number };
		if (n === 0) for (const { id: _id, ...t } of datosIniciales()) this.crear(t);
	}

	todas(): Tarea[] {
		return (this.bd.prepare("SELECT * FROM tareas ORDER BY id").all() as unknown as Fila[]).map(aTarea);
	}

	buscar(id: number): Tarea | undefined {
		const fila = this.bd.prepare("SELECT * FROM tareas WHERE id = ?").get(id) as Fila | undefined;
		return fila && aTarea(fila);
	}

	crear(datos: Omit<Tarea, "id">): Tarea {
		// Los ? evitan la inyección SQL: los valores nunca se pegan dentro del texto de la consulta
		const r = this.bd.prepare("INSERT INTO tareas (titulo, completada, prioridad) VALUES (?, ?, ?)").run(datos.titulo, datos.completada ? 1 : 0, datos.prioridad);
		return { id: Number(r.lastInsertRowid), ...datos };
	}

	guardar(tarea: Tarea): Tarea {
		this.bd.prepare("UPDATE tareas SET titulo = ?, completada = ?, prioridad = ? WHERE id = ?").run(tarea.titulo, tarea.completada ? 1 : 0, tarea.prioridad, tarea.id);
		return tarea;
	}

	borrar(id: number): boolean {
		return this.bd.prepare("DELETE FROM tareas WHERE id = ?").run(id).changes > 0;
	}
}
