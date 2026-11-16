// Anexo S4 · B · Operaciones que tardan: 202 Accepted y un recurso que dice cómo va
// Generar un informe tarda. En lugar de dejar la petición colgada (y que salte un tiempo de
// espera), la API responde enseguida 202 con Location: /operaciones/{id}, y el cliente pregunta.
//   npx tsx s04/src/operaciones.ts          (desde ejercicios, después de copiarlo)
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import express, { Router } from "express";

interface Operacion {
	id: string;
	estado: "en-curso" | "terminada" | "fallida";
	progreso: number;
	resultado?: string;
}

export function crearRutasOperaciones(duracionMs = 1500) {
	const operaciones = new Map<string, Operacion>();
	const rutas = Router();

	// POST /informes: empieza el trabajo y responde YA, sin esperar a que acabe
	rutas.post("/informes", (_req, res) => {
		const op: Operacion = { id: randomUUID(), estado: "en-curso", progreso: 0 };
		operaciones.set(op.id, op);
		const inicio = Date.now();
		const reloj = setInterval(() => {
			op.progreso = Math.min(100, Math.round(((Date.now() - inicio) / duracionMs) * 100));
			if (op.progreso === 100) {
				op.estado = "terminada";
				op.resultado = `/informes/${op.id}.csv`;
				clearInterval(reloj);
			}
		}, 100);
		res.status(202).location(`/operaciones/${op.id}`).set("Retry-After", "1").json(op);
	});

	// GET /operaciones/:id: cómo va. Mientras no acaba, Retry-After dice cuándo volver a preguntar
	rutas.get("/operaciones/:id", (req, res) => {
		const op = operaciones.get(req.params.id);
		if (!op) return res.status(404).type("application/problem+json").json({ type: "about:blank", title: "Operación no encontrada", status: 404 });
		if (op.estado === "en-curso") res.set("Retry-After", "1");
		res.json(op);
	});

	return rutas;
}

// --- Demo: un cliente que pide el informe y pregunta hasta que está ---
if (import.meta.url === `file://${process.argv[1]}`) {
	const app = express().use(crearRutasOperaciones());
	const servidor = app.listen(0);
	await new Promise((r) => servidor.once("listening", r));
	const base = `http://localhost:${(servidor.address() as AddressInfo).port}`;

	const inicio = Date.now();
	const r = await fetch(`${base}/informes`, { method: "POST" });
	console.log(`POST /informes → ${r.status} en ${Date.now() - inicio} ms · Location: ${r.headers.get("location")} · Retry-After: ${r.headers.get("retry-after")}`);
	let op = (await r.json()) as Operacion;
	while (op.estado === "en-curso") {
		const espera = Number(r.headers.get("retry-after") ?? 1) * 500; // en la demo, la mitad para no aburrir
		await new Promise((ok) => setTimeout(ok, espera));
		const s = await fetch(`${base}/operaciones/${op.id}`);
		op = (await s.json()) as Operacion;
		console.log(`GET /operaciones/… → ${s.status} · ${op.estado} · ${op.progreso} %${op.resultado ? ` · resultado: ${op.resultado}` : ""}`);
	}
	servidor.close();
}
