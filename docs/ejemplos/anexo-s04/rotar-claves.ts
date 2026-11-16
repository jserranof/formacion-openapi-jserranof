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
