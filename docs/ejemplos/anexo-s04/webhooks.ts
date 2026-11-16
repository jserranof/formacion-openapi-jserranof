// Anexo S4 · A · Webhooks firmados con HMAC
// La API avisa a otro sistema (POST a su URL) cuando pasa algo. ¿Cómo sabe el receptor que el
// aviso viene de nosotros y que nadie lo ha cambiado ni lo repite? Con una firma HMAC del cuerpo
// y de la hora, con un secreto que solo conocen los dos.
//   npx tsx s04/src/webhooks.ts            (desde ejercicios, después de copiarlo)
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AddressInfo } from "node:net";
import express from "express";

/** La cabecera: t=<segundos>,v1=<HMAC-SHA256 de "t.cuerpo" en hex> */
export function firmar(secreto: string, cuerpo: string, ahora = Math.floor(Date.now() / 1000)) {
	const firma = createHmac("sha256", secreto).update(`${ahora}.${cuerpo}`).digest("hex");
	return `t=${ahora},v1=${firma}`;
}

/** Comprueba la firma y que no es vieja (si lo es, alguien está repitiendo un aviso capturado) */
export function verificar(secreto: string, cuerpo: string, cabecera: string | undefined, toleranciaSeg = 300) {
	const partes = Object.fromEntries((cabecera ?? "").split(",").map((p) => p.split("=") as [string, string]));
	const t = Number(partes.t);
	if (!t || !partes.v1) return { ok: false, motivo: "falta la firma" };
	if (Math.abs(Math.floor(Date.now() / 1000) - t) > toleranciaSeg) return { ok: false, motivo: "la firma es demasiado vieja" };
	const esperada = Buffer.from(firmar(secreto, cuerpo, t).split("v1=")[1]!, "hex");
	const recibida = Buffer.from(partes.v1, "hex");
	// timingSafeEqual tarda lo mismo acierte o falle: no da pistas a quien prueba firmas
	if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return { ok: false, motivo: "la firma no cuadra" };
	return { ok: true, motivo: "firma buena" };
}

// --- Demo: un receptor (el sistema del cliente) y tres avisos ---
if (import.meta.url === `file://${process.argv[1]}`) {
	const SECRETO = "whsec_compartido_solo_por_los_dos"; // en la vida real, en una variable de entorno
	const receptor = express();
	// El cuerpo hay que leerlo TAL CUAL llega (texto): si se parsea y se vuelve a serializar, la firma ya no cuadra
	receptor.post("/avisos", express.text({ type: "application/json" }), (req, res) => {
		const r = verificar(SECRETO, req.body, req.get("X-Firma"));
		console.log(`  receptor: ${r.ok ? "ACEPTA" : "RECHAZA"} (${r.motivo})`);
		res.status(r.ok ? 204 : 401).end();
	});
	const servidor = receptor.listen(0);
	await new Promise((r) => servidor.once("listening", r));
	const url = `http://localhost:${(servidor.address() as AddressInfo).port}/avisos`;

	const avisar = async (cuerpo: string, firma: string) =>
		(await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "X-Firma": firma }, body: cuerpo })).status;

	const evento = JSON.stringify({ tipo: "tarea.completada", tarea: { id: 3, titulo: "Leer el contrato" } });
	console.log("1. Aviso bien firmado →", await avisar(evento, firmar(SECRETO, evento)));
	const cambiado = evento.replace("Leer el contrato", "Borrar todo");
	console.log("2. Alguien cambia el cuerpo por el camino →", await avisar(cambiado, firmar(SECRETO, evento)));
	const haceUnaHora = Math.floor(Date.now() / 1000) - 3600;
	console.log("3. Alguien repite un aviso de hace una hora →", await avisar(evento, firmar(SECRETO, evento, haceUnaHora)));
	console.log("4. Firmado con otro secreto →", await avisar(evento, firmar("otro-secreto", evento)));
	servidor.close();
}
