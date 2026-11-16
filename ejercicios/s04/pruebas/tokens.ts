// Firma tokens de prueba con una clave propia, para no depender del servidor de autorización
import { generateKeyPair, SignJWT } from "jose";
import { crearApp, type Opciones } from "../src/app.js";

export const EMISOR = "https://auth.curso.test";
export const AUDIENCIA = "api-curso";

const buena = await generateKeyPair("RS256");
const otra = await generateKeyPair("RS256");

export const TODOS = "tareas:leer tareas:escribir proyectos:leer proyectos:escribir";

interface Token {
	sub?: string;
	scope?: string;
	iss?: string;
	aud?: string;
	/** Cuándo caduca: "10m", un instante en segundos, o null para un token sin «exp» */
	caducaEn?: string | number | null;
	/** Cuándo se emitió, en segundos (por defecto, ahora) */
	emitidoEn?: number;
	/** Identificador del token (jti) */
	jti?: string;
	clienteId?: string;
	conOtraClave?: boolean;
}

export async function token({ sub = "ana", scope = TODOS, iss = EMISOR, aud = AUDIENCIA, caducaEn = "10m", emitidoEn, jti, clienteId, conOtraClave = false }: Token = {}) {
	const jwt = new SignJWT({ scope, ...(clienteId ? { client_id: clienteId } : {}) }).setProtectedHeader({ alg: "RS256" }).setIssuer(iss).setAudience(aud).setIssuedAt(emitidoEn);
	if (caducaEn !== null) jwt.setExpirationTime(caducaEn);
	if (sub) jwt.setSubject(sub);
	if (jti) jwt.setJti(jti);
	return jwt.sign(conOtraClave ? otra.privateKey : buena.privateKey);
}

/** La app con nuestras claves de prueba. `auth` permite añadir opciones (como `revocados`) */
export const appDePrueba = (opciones: Omit<Opciones, "auth"> & { auth?: { revocados?: Set<string> } } = {}) =>
	crearApp({ ...opciones, auth: { claves: buena.publicKey, emisor: EMISOR, audiencia: AUDIENCIA, ...opciones.auth } });

export const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });
