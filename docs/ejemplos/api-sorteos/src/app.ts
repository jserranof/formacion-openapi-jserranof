import { readFileSync } from "node:fs";
import express, { type NextFunction, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";
import { DURACION_S, autenticar, exigirPermiso, firmarToken } from "./auth.js";
import { type Apuesta, type Sorteo, clientes, crearDatos, usuarios } from "./datos.js";
import { type Version, comportamientoDe } from "./version.js";

const leerYaml = (fichero: string) => parse(readFileSync(new URL(`../${fichero}`, import.meta.url), "utf8"));

function problema(res: Response, status: number, title: string, detail: string, errores?: { campo: string; motivo: string }[]) {
	res.status(status).type("application/problem+json").json({ title, status, detail, ...(errores ? { errores } : {}) });
}

// Lee un id de la ruta: un entero positivo, o null si no lo es.
function leerId(valor: unknown): number | null {
	const n = Number(valor);
	return Number.isInteger(n) && n >= 1 && /^\d+$/.test(String(valor)) ? n : null;
}

export function crearApp(version: Version) {
	const c = comportamientoDe(version);
	const datos = crearDatos();
	const app = express();
	app.use(express.json());

	// El contrato, para personas en /docs y para herramientas en /openapi.json y /swagger2.json
	const contrato = leerYaml("openapi.yaml");
	const contrato2 = leerYaml("swagger2.yaml");
	// Las herramientas que importan el contrato (ReadyAPI, SoapUI) necesitan la dirección completa:
	// se pone la de quien lo pide (también detrás del proxy del Codespace)
	const origen = (req: Request) => ({
		host: req.get("x-forwarded-host") ?? req.get("host"),
		esquema: (req.get("x-forwarded-proto") ?? req.protocol).split(",")[0],
	});
	app.get("/openapi.json", (req, res) => {
		const { host, esquema } = origen(req);
		res.json({ ...contrato, servers: [{ url: `${esquema}://${host}`, description: "Esta instancia de la API" }] });
	});
	app.get("/swagger2.json", (req, res) => {
		const { host, esquema } = origen(req);
		res.json({ ...contrato2, host, schemes: [esquema] });
	});
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(contrato, { customSiteTitle: `API de Sorteos (${version})` }));

	app.get("/salud", (_req, res) => {
		res.json({ estado: "ok", version });
	});

	// ---- Autenticación ----
	app.post("/auth/token", async (req, res) => {
		const { usuario, clave } = req.body ?? {};
		if (typeof usuario !== "string" || typeof clave !== "string") {
			return problema(res, 400, "Datos no válidos", "Hacen falta usuario y clave");
		}
		const u = usuarios.find((x) => x.usuario === usuario && x.clave === clave);
		if (!u) return problema(res, 401, "No autenticado", "Usuario o clave incorrectos");
		res.json({
			access_token: await firmarToken(u.usuario, u.permisos),
			token_type: "Bearer",
			expires_in: DURACION_S,
			scope: u.permisos.join(" "),
		});
	});

	// OAuth2, flujo Client Credentials: una aplicación pide un token en su propio nombre
	app.post("/oauth/token", express.urlencoded({ extended: false }), async (req, res) => {
		const errorOAuth = (status: number, error: string, descripcion: string) =>
			res.status(status).json({ error, error_description: descripcion });
		// Las credenciales llegan en el cuerpo o en la cabecera Authorization: Basic
		let { client_id: id, client_secret: secreto } = req.body ?? {};
		const basic = req.get("authorization");
		if (basic?.toLowerCase().startsWith("basic ")) {
			[id, secreto] = Buffer.from(basic.slice(6), "base64").toString().split(":");
		}
		if (req.body?.grant_type !== "client_credentials") {
			return errorOAuth(400, "unsupported_grant_type", "Solo se admite grant_type=client_credentials");
		}
		const cliente = clientes.find((x) => x.id === id && x.secreto === secreto);
		if (!cliente) return errorOAuth(401, "invalid_client", "client_id o client_secret incorrectos");
		const pedidos = String(req.body?.scope ?? "").split(" ").filter(Boolean);
		const noPermitidos = pedidos.filter((s) => !cliente.permisos.includes(s));
		if (noPermitidos.length) return errorOAuth(400, "invalid_scope", `El cliente no tiene: ${noPermitidos.join(", ")}`);
		const concedidos = pedidos.length ? pedidos : cliente.permisos;
		res.json({
			access_token: await firmarToken(cliente.usuario, concedidos),
			token_type: "Bearer",
			expires_in: DURACION_S,
			scope: concedidos.join(" "),
		});
	});

	// ---- Sorteos (públicos) ----
	const verSorteo = (s: Sorteo) => (c.precioComoTexto ? { ...s, precioApuesta: s.precioApuesta.toFixed(2) } : s);

	app.get("/sorteos", (req, res) => {
		const { estado } = req.query;
		if (estado !== undefined && !["abierto", "cerrado", "celebrado"].includes(String(estado))) {
			return problema(res, 400, "Datos no válidos", "estado debe ser abierto, cerrado o celebrado", [
				{ campo: "estado", motivo: "valor no permitido" },
			]);
		}
		const items = datos.sorteos.filter((s) => estado === undefined || s.estado === estado).map(verSorteo);
		res.json({ items, total: items.length });
	});

	app.get("/sorteos/:id", (req, res) => {
		const id = leerId(req.params.id);
		if (id === null) return problema(res, 400, "Datos no válidos", "El id debe ser un entero positivo");
		const s = datos.sorteos.find((x) => x.id === id);
		if (!s) {
			if (c.sorteoInexistenteResponde200) return res.json({});
			return problema(res, 404, "No encontrado", `No existe el sorteo ${id}`);
		}
		res.json(verSorteo(s));
	});

	app.get("/sorteos/:id/resultado", (req, res) => {
		const id = leerId(req.params.id);
		if (id === null) return problema(res, 400, "Datos no válidos", "El id debe ser un entero positivo");
		if (!datos.sorteos.some((x) => x.id === id)) return problema(res, 404, "No encontrado", `No existe el sorteo ${id}`);
		const r = datos.resultados.find((x) => x.sorteoId === id);
		if (!r) return problema(res, 404, "Sin resultado", `El sorteo ${id} todavía no se ha celebrado`);
		res.json(r);
	});

	// ---- Apuestas (con token) ----
	const conToken = autenticar({ aceptaCaducados: c.aceptaTokenCaducado });
	const verApuesta = ({ usuario: _u, ...a }: Apuesta) => a;

	app.get("/apuestas", conToken, exigirPermiso("apuestas:leer"), (req, res) => {
		const items = datos.apuestas.filter((a) => a.usuario === req.identidad!.usuario).map(verApuesta);
		res.json({ items, total: items.length });
	});

	app.post("/apuestas", conToken, exigirPermiso("apuestas:escribir"), (req, res) => {
		const { sorteoId, numeros } = req.body ?? {};
		const errores: { campo: string; motivo: string }[] = [];
		if (!Number.isInteger(sorteoId) || sorteoId < 1) errores.push({ campo: "sorteoId", motivo: "debe ser un entero positivo" });
		if (!Array.isArray(numeros) || numeros.length !== 6 || !numeros.every(Number.isInteger)) {
			errores.push({ campo: "numeros", motivo: "deben ser 6 números enteros" });
		} else {
			if (numeros.some((n: number) => n < 1 || n > 49)) {
				if (c.numeroFueraDeRangoRompe) throw new RangeError(`Índice fuera de rango en el bombo: ${numeros.join(",")}`);
				errores.push({ campo: "numeros", motivo: "cada número debe estar entre 1 y 49" });
			}
			if (new Set(numeros).size !== 6 && !c.admiteNumerosRepetidos) {
				errores.push({ campo: "numeros", motivo: "los 6 números deben ser distintos" });
			}
		}
		if (errores.length) return problema(res, 400, "Datos no válidos", "La apuesta no es válida", errores);

		const sorteo = datos.sorteos.find((x) => x.id === sorteoId);
		if (!sorteo) return problema(res, 404, "No encontrado", `No existe el sorteo ${sorteoId}`);
		if (sorteo.estado !== "abierto" && !c.admiteApuestaEnSorteoCerrado) {
			return problema(res, 409, "Sorteo no abierto", `El sorteo ${sorteoId} está ${sorteo.estado} y no admite apuestas`);
		}
		const apuesta: Apuesta = {
			id: datos.siguienteApuesta++,
			usuario: req.identidad!.usuario,
			sorteoId,
			numeros: [...numeros].sort((a, b) => a - b),
			importe: sorteo.precioApuesta,
			estado: "activa",
			creadaEn: new Date().toISOString(),
		};
		datos.apuestas.push(apuesta);
		if (!c.omiteLocation) res.location(`/apuestas/${apuesta.id}`);
		res.status(201).json(verApuesta(apuesta));
	});

	const buscarApuesta = (req: Request, res: Response) => {
		const id = leerId(req.params.id);
		if (id === null) {
			problema(res, 400, "Datos no válidos", "El id debe ser un entero positivo");
			return null;
		}
		const a = datos.apuestas.find((x) => x.id === id && (c.muestraApuestasAjenas || x.usuario === req.identidad!.usuario));
		if (!a) {
			problema(res, 404, "No encontrado", `No existe la apuesta ${id}`);
			return null;
		}
		return a;
	};

	app.get("/apuestas/:id", conToken, exigirPermiso("apuestas:leer"), (req, res) => {
		const a = buscarApuesta(req, res);
		if (a) res.json(verApuesta(a));
	});

	app.delete("/apuestas/:id", conToken, exigirPermiso("apuestas:escribir"), (req, res) => {
		const a = buscarApuesta(req, res);
		if (!a) return;
		const sorteo = datos.sorteos.find((x) => x.id === a.sorteoId);
		if (sorteo?.estado !== "abierto") {
			return problema(res, 409, "Sorteo no abierto", `El sorteo ${a.sorteoId} ya no admite anular apuestas`);
		}
		a.estado = "anulada";
		res.status(204).end();
	});

	// ---- Errores ----
	app.use((req, res) => {
		problema(res, 404, "No encontrado", `No existe ${req.method} ${req.path}`);
	});

	app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
		if (err.type === "entity.parse.failed") return problema(res, 400, "Datos no válidos", "El cuerpo no es un JSON válido");
		console.error(err);
		res.status(500).type("application/problem+json").json({ title: "Error interno", status: 500, detail: err.message });
	});

	return app;
}
