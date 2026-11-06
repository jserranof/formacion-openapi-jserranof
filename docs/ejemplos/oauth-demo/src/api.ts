// API protegida: valida el token Bearer contra el JWKS del servidor de autorización
// y exige un permiso (scope) por operación.
import express, { type NextFunction, type Request, type Response } from "express";
import { createRemoteJWKSet, errors, jwtVerify, type JWTPayload } from "jose";

const PUERTO = Number(process.env.PORT ?? 3000);
const EMISOR = process.env.EMISOR ?? "http://localhost:9000";
const AUDIENCIA = "api-curso";

// Descarga las claves públicas una vez y las cachea; si llega un kid nuevo, vuelve a pedirlas
const claves = createRemoteJWKSet(new URL(`${EMISOR}/jwks`));

declare module "express-serve-static-core" {
	interface Request {
		token?: JWTPayload & { scope?: string; client_id?: string };
	}
}

function problema(res: Response, status: number, title: string, detail: string) {
	if (status === 401) res.set("WWW-Authenticate", `Bearer error="invalid_token", error_description="${detail}"`);
	res.status(status).type("application/problem+json").json({ title, status, detail });
}

// 401: no sé quién eres (falta el token o no es válido)
async function autenticar(req: Request, res: Response, next: NextFunction) {
	const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
	if (!token) return problema(res, 401, "No autenticado", "Falta la cabecera Authorization: Bearer <token>");
	try {
		const { payload } = await jwtVerify(token, claves, { issuer: EMISOR, audience: AUDIENCIA });
		req.token = payload;
		next();
	} catch (err) {
		const motivo = err instanceof errors.JWTExpired ? "El token ha caducado" : "El token no es válido";
		problema(res, 401, "No autenticado", motivo);
	}
}

// 403: sé quién eres, pero no tienes este permiso
function exigir(permiso: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		const permisos = (req.token?.scope ?? "").split(" ");
		if (!permisos.includes(permiso)) return problema(res, 403, "Sin permiso", `Hace falta el permiso «${permiso}»`);
		next();
	};
}

const tareas = [{ id: 1, titulo: "Validar tokens", completada: false }];

const app = express();
app.use(express.json());

app.get("/salud", (_req, res) => {
	res.json({ estado: "ok" });
});

app.use("/tareas", autenticar);

app.get("/tareas", exigir("tareas:leer"), (req, res) => {
	res.json({ items: tareas, cliente: req.token?.client_id });
});

app.post("/tareas", exigir("tareas:escribir"), (req, res) => {
	const tarea = { id: tareas.length + 1, titulo: String(req.body?.titulo ?? "Sin título"), completada: false };
	tareas.push(tarea);
	res.status(201).location(`/tareas/${tarea.id}`).json(tarea);
});

app.listen(PUERTO, () => {
	console.log(`API protegida en http://localhost:${PUERTO} · emisor de confianza ${EMISOR}`);
});
