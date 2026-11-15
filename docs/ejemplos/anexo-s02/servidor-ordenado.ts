// Anexo S2 · A. Copia este fichero en ejercicios/s02/src/ y arráncalo con:
//   cd ejercicios && npx tsx s02/src/servidor-ordenado.ts
//
// /salud: «estoy vivo» (el proceso responde).  /listo: «puedo recibir tráfico».
// Al recibir SIGTERM (o Ctrl+C), deja de estar listo, termina lo que tiene a medias y sale.
import express from "express";
import { crearApp } from "./app.js";

const puerto = Number(process.env.PORT ?? 3000);
let listo = false;
let cerrando = false;

const raiz = express();

// Antes que la API: el orquestador (Kubernetes, un balanceador) pregunta aquí si mandar tráfico
raiz.get("/listo", (_req, res) => {
	res.status(listo ? 200 : 503).json({ listo });
});

// Solo para la demo: una petición que tarda 3 segundos
raiz.get("/lenta", async (_req, res) => {
	await new Promise((r) => setTimeout(r, 3000));
	res.json({ terminada: true });
});

raiz.use(crearApp({ registro: (linea) => console.log(JSON.stringify(linea)) }));

const servidor = raiz.listen(puerto, () => {
	console.log(`API en http://localhost:${puerto} · calentando…`);
	// Simula lo que tarda en estar lista de verdad (conectar a la base de datos, cargar caché…)
	setTimeout(() => {
		listo = true;
		console.log("Lista para recibir tráfico");
	}, 2000);
});

function cerrar(senal: string) {
	// tsx reenvía la señal: que solo cuente la primera
	if (cerrando) return;
	cerrando = true;
	console.log(`${senal}: dejo de aceptar peticiones y termino las que tengo a medias`);
	listo = false;
	servidor.close(() => {
		console.log("Cerrado sin cortar a nadie");
		process.exit(0);
	});
	// Si algo se queda colgado, no esperar para siempre
	setTimeout(() => {
		console.error("No ha terminado en 10 s: salgo igualmente");
		process.exit(1);
	}, 10_000).unref();
}

process.on("SIGTERM", () => cerrar("SIGTERM"));
process.on("SIGINT", () => cerrar("SIGINT"));
