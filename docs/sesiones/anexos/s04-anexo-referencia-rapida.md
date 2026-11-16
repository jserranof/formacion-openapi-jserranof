# S4 · Anexo · Referencia rápida — Webhooks, operaciones largas y claves que rotan

> Material de ampliación de S4. Parte de `ejercicios/s04` (no hace falta tener los
> ejercicios hechos: los tres bloques se ejecutan solos, sin la API ni el servidor de
> autorización). El código está en `docs/ejemplos/anexo-s04/`: se copia a
> `ejercicios/s04/src` y se quita al final (§0).
>
> Tres bloques independientes: **A** (webhooks firmados con HMAC), **B** (operaciones que
> tardan: 202 y un recurso que dice cómo va) y **C** (rotar las claves de firma).

| § | Dónde | Qué |
|---|---|---|
| 0 | Terminal | Antes y después: copiar el código y dejarlo como estaba |
| A1 | Chat | Que la API avise: webhooks |
| A2 | `ejercicios/s04/src/webhooks.ts` | Firmar y verificar con HMAC-SHA256 y la hora |
| A3 | Terminal | Cuatro avisos: el bueno, el cambiado, el viejo y el de otro secreto |
| B1 | Chat | Lo que no cabe en una petición |
| B2 | `ejercicios/s04/src/operaciones.ts` | 202, `Location`, `Retry-After` y `GET /operaciones/{id}` |
| C1 | Chat | Las claves también caducan |
| C2 | `ejercicios/s04/src/rotar-claves.ts` | Una rotación entera con `kid` y JWKS |
| C3 | Chat | Qué cambia en la API de clase: nada |

## §0 · Antes y después

**Antes de empezar**, guarda tus ejercicios y copia el código del anexo:

```bash
# desde la raíz del repositorio
git add -A && git commit -m "s04: ejercicios" && git push
cp docs/ejemplos/anexo-s04/webhooks.ts docs/ejemplos/anexo-s04/operaciones.ts docs/ejemplos/anexo-s04/rotar-claves.ts ejercicios/s04/src/
```

**Al terminar**, deja `s04` como estaba:

```bash
# desde la raíz del repositorio
rm -f ejercicios/s04/src/webhooks.ts ejercicios/s04/src/operaciones.ts ejercicios/s04/src/rotar-claves.ts
```

**Comprobar:** `git status` no lista nada nuevo bajo `ejercicios/s04` y
`npm run comprobar s04` da lo mismo que antes del anexo.

---

# A · Webhooks firmados con HMAC

## §A1 · Que la API avise: webhooks

Otro sistema quiere saber cuándo se completa una tarea. Puede preguntar cada minuto (casi
siempre para nada), o la API le avisa: un `POST` a una URL suya cada vez que pasa algo.
Eso es un **webhook**. El problema: esa URL es pública. Cualquiera le puede mandar un aviso
falso, cambiar uno de verdad por el camino o repetir uno viejo.

La solución: un secreto que solo conocen la API y el receptor, y una firma HMAC del cuerpo
y de la hora en una cabecera: `X-Firma: t=<segundos>,v1=<firma en hexadecimal>`.

## §A2 · Firmar y verificar

**Fichero:** `ejercicios/s04/src/webhooks.ts` (copiado en el §0):

```ts
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
```

1. `firmar` calcula el HMAC-SHA256 de `"<hora>.<cuerpo>"` con el secreto.
2. `verificar` lo recalcula y lo compara; si la hora tiene más de cinco minutos, rechaza.
3. El receptor lee el cuerpo **como texto** (`express.text`): si lo parseara y lo volviera
   a serializar, un espacio de más cambiaría la firma.
4. `timingSafeEqual` tarda lo mismo acierte o falle: no da pistas a quien prueba firmas.

## §A3 · Cuatro avisos

**Terminal:**

```bash
# desde ejercicios
npx tsx s04/src/webhooks.ts
```

**Comprobar:**

```
  receptor: ACEPTA (firma buena)
1. Aviso bien firmado → 204
  receptor: RECHAZA (la firma no cuadra)
2. Alguien cambia el cuerpo por el camino → 401
  receptor: RECHAZA (la firma es demasiado vieja)
3. Alguien repite un aviso de hace una hora → 401
  receptor: RECHAZA (la firma no cuadra)
4. Firmado con otro secreto → 401
```

Probado el 15/11. Stripe firma así (con la hora); GitHub firma solo el cuerpo, en
`X-Hub-Signature-256`. Y el secreto, como cualquier secreto: en una variable de entorno,
nunca en el código ni en el repositorio.

---

# B · Operaciones que tardan: 202

## §B1 · Lo que no cabe en una petición

Un informe que tarda un minuto no cabe en una petición: el navegador, el proxy o el
cliente se cansan antes. La API responde enseguida **202 Accepted** («lo he aceptado, aún
no está») con `Location: /operaciones/<id>`, un recurso que dice cómo va. El cliente
pregunta ahí, cuando dice `Retry-After`, hasta que está terminada.

## §B2 · 202, `Location`, `Retry-After` y la operación

**Fichero:** `ejercicios/s04/src/operaciones.ts` (copiado en el §0):

```ts
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
```

**Terminal:**

```bash
# desde ejercicios
npx tsx s04/src/operaciones.ts
```

**Comprobar** (el id y los porcentajes cambian en cada ejecución):

```
POST /informes → 202 en 16 ms · Location: /operaciones/9f1c… · Retry-After: 1
GET /operaciones/… → 200 · en-curso · 34 %
GET /operaciones/… → 200 · en-curso · 61 %
GET /operaciones/… → 200 · en-curso · 94 %
GET /operaciones/… → 200 · terminada · 100 % · resultado: /informes/9f1c….csv
```

Probado el 15/11. Para montarlo en la API de clase: `app.use(crearRutasOperaciones())`
antes de `noEncontrado`, con su contrato (la respuesta 202 con `Location` y el esquema de
la operación). En la vida real, la operación se guarda en una base de datos y el trabajo
lo hace otro proceso; y si el receptor tiene un webhook (bloque A), se le avisa al acabar.

---

# C · Rotar las claves de firma

## §C1 · Las claves también caducan

El servidor de autorización cambia su clave de firma de vez en cuando, o de golpe si se
filtra. Si nuestra API tuviera la clave pública escrita en el código, habría que
desplegarla cada vez. Con JWKS, no: el servidor publica las claves vigentes, cada una con
un `kid`, y cada token dice en su cabecera con cuál se firmó.

## §C2 · Una rotación entera

**Fichero:** `ejercicios/s04/src/rotar-claves.ts` (copiado en el §0):

```ts
// Anexo S4 · C · Rotar las claves de firma: kid y JWKS
// El servidor de autorización cambia de clave de vez en cuando (o de golpe, si se la roban).
// Publica en /jwks las claves vigentes, cada una con su «kid», y cada token dice en su cabecera
// con cuál se firmó. La API no se toca: busca en el JWKS la clave de ese kid.
//   npx tsx s04/src/rotar-claves.ts         (desde ejercicios, después de copiarlo)
import { createLocalJWKSet, exportJWK, generateKeyPair, jwtVerify, SignJWT, type JWK } from "jose";

async function claveNueva(kid: string) {
	const { publicKey, privateKey } = await generateKeyPair("RS256");
	return { kid, privada: privateKey, publica: { ...(await exportJWK(publicKey)), kid, alg: "RS256", use: "sig" } as JWK };
}

const firmar = (clave: Awaited<ReturnType<typeof claveNueva>>) =>
	new SignJWT({ scope: "tareas:leer" }).setProtectedHeader({ alg: "RS256", kid: clave.kid }).setIssuer("http://localhost:9000").setAudience("api-curso").setSubject("ana").setExpirationTime("10m").sign(clave.privada);

// Lo que hace la API con cada token: buscar la clave por su kid en el JWKS publicado
async function comprobar(nombre: string, token: string, jwks: JWK[]) {
	try {
		const { protectedHeader } = await jwtVerify(token, createLocalJWKSet({ keys: jwks }), { issuer: "http://localhost:9000", audience: "api-curso" });
		console.log(`  ${nombre}: vale (kid ${protectedHeader.kid})`);
	} catch (e) {
		console.log(`  ${nombre}: NO vale (${(e as Error).name})`);
	}
}

const enero = await claveNueva("2026-01");
const junio = await claveNueva("2026-06");
const deEnero = await firmar(enero);

console.log("1. Antes de rotar: el JWKS tiene la clave de enero");
await comprobar("token firmado en enero", deEnero, [enero.publica]);

console.log("2. Rotación: se publica la de junio junto a la de enero, y se firma con la nueva");
const deJunio = await firmar(junio);
await comprobar("token firmado en enero", deEnero, [enero.publica, junio.publica]);
await comprobar("token firmado en junio", deJunio, [enero.publica, junio.publica]);

console.log("3. Cuando ya han caducado todos los de enero, se retira su clave");
await comprobar("token firmado en enero", deEnero, [junio.publica]);
await comprobar("token firmado en junio", deJunio, [junio.publica]);
```

**Terminal:**

```bash
# desde ejercicios
npx tsx s04/src/rotar-claves.ts
```

**Comprobar:**

```
1. Antes de rotar: el JWKS tiene la clave de enero
  token firmado en enero: vale (kid 2026-01)
2. Rotación: se publica la de junio junto a la de enero, y se firma con la nueva
  token firmado en enero: vale (kid 2026-01)
  token firmado en junio: vale (kid 2026-06)
3. Cuando ya han caducado todos los de enero, se retira su clave
  token firmado en enero: NO vale (JWKSNoMatchingKey)
  token firmado en junio: vale (kid 2026-06)
```

Probado el 15/11. El orden importa: primero se **publica** la clave nueva, después se
**firma** con ella, y solo cuando han caducado los tokens viejos se **retira** la
anterior.

## §C3 · Qué cambia en la API de clase: nada

La API de S4 usa `createRemoteJWKSet(new URL(".../jwks"))` (en `src/app.ts`). Esa función
guarda el JWKS en caché y, si llega un token con un `kid` que no conoce, vuelve a pedirlo
(como mucho una vez cada 30 segundos: su `cooldownDuration`; comprobado en el código de `jose` 6).
Rotar las claves en el servidor de autorización no cambia ni una línea de la API.

> ⚠️ POR VERIFICAR contra el servidor del curso: `oauth2-mock-server` no rota claves solo,
> y no se ha probado añadir una clave en caliente. Lo probado es el §C2, en local.

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| `Cannot find package 'express'` (o `jose`) | Se ha ejecutado desde `docs/ejemplos/anexo-s04` | Cópialo a `ejercicios/s04/src` (§0) y ejecútalo desde `ejercicios` |
| A: el aviso bueno da 401 «la firma no cuadra» | El receptor parsea el JSON antes de verificar | `express.text({ type: "application/json" })`, no `express.json()` |
| A: todo da «la firma es demasiado vieja» | La hora del ordenador del emisor y la del receptor no coinciden | Sincroniza la hora; o sube la tolerancia |
| B: el bucle no acaba | `duracionMs` muy alto | `crearRutasOperaciones(1500)` |
| C: `JWKSNoMatchingKey` con un token nuevo | Se firmó con la clave nueva antes de publicarla | Publicar primero, firmar después |
