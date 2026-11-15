import { type Request, type Response, Router } from "express";
import type { Usuario } from "../auth.js";
import { problema } from "../errores.js";
import { CambiosTarea, Consulta, IdRuta, TareaNueva } from "./esquemas.js";
import type { ServicioTareas } from "./servicio.js";

// Quién hace la petición: lo deja autenticar() en res.locals.usuario (ejercicio 1)
const quien = (res: Response) => (res.locals.usuario as Usuario | undefined)?.sub ?? "anonimo";

// El id de la ruta, ya validado: «abc», 0 o 2.5 son un 400 con campo «id»
const idDe = (req: Request) => IdRuta.parse(req.params).id;

// 405: el recurso existe, pero no admite ese verbo. Allow dice cuáles sí
const noPermitido = (permitidos: string) => (req: Request, res: Response) => {
	res.set("Allow", permitidos);
	problema(res, 405, "Método no permitido", `${req.method} no se admite aquí. Usa ${permitidos}`);
};

// Cabecera Link (RFC 8288) con la página siguiente y la anterior, conservando filtros y orden
function enlaces(req: Request, pagina: number, limite: number, total: number) {
	const url = (p: number) => {
		const q = new URLSearchParams(req.query as Record<string, string>);
		q.set("pagina", String(p));
		q.set("limite", String(limite));
		return `<${req.baseUrl}?${q}>`;
	};
	const partes: string[] = [];
	if (pagina * limite < total) partes.push(`${url(pagina + 1)}; rel="next"`);
	if (pagina > 1) partes.push(`${url(pagina - 1)}; rel="prev"`);
	return partes.join(", ");
}

// Ejercicio 3: ETag fuerte en GET, PUT y PATCH; 304 con If-None-Match; 412 con un If-Match viejo.
// Traduce HTTP a llamadas al servicio. Express 5 pasa al manejador de errores lo que se lance aquí.
export function crearRutasTareas(servicio: ServicioTareas) {
	const rutas = Router();

	rutas.get("/", (req, res) => {
		const resultado = servicio.listar(Consulta.parse(req.query));
		const link = enlaces(req, resultado.pagina, resultado.limite, resultado.total);
		if (link) res.set("Link", link);
		res.json(resultado);
	});

	rutas.get("/:id", (req, res) => {
		res.json(servicio.obtener(idDe(req)));
	});

	rutas.post("/", (req, res) => {
		const tarea = servicio.crear(quien(res), TareaNueva.parse(req.body));
		res.status(201).location(`/tareas/${tarea.id}`).json(tarea);
	});

	rutas.put("/:id", (req, res) => {
		res.json(servicio.reemplazar(idDe(req), TareaNueva.parse(req.body)));
	});

	rutas.patch("/:id", (req, res) => {
		res.json(servicio.cambiar(idDe(req), CambiosTarea.parse(req.body)));
	});

	rutas.delete("/:id", (req, res) => {
		servicio.borrar(idDe(req));
		res.status(204).end();
	});

	// Después de todas: lo que llega hasta aquí es un verbo que no existe
	rutas.all("/", noPermitido("GET, POST"));
	rutas.all("/:id", noPermitido("GET, PUT, PATCH, DELETE"));

	return rutas;
}
