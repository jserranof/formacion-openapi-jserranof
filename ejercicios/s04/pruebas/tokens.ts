// Firma tokens de prueba con una clave propia, para no depender del servidor de autorización
import { generateKeyPair, SignJWT } from "jose";
import { crearApp } from "../src/app.js";

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
	caducaEn?: string | number;
	conOtraClave?: boolean;
}

export async function token({ sub = "ana", scope = TODOS, iss = EMISOR, aud = AUDIENCIA, caducaEn = "10m", conOtraClave = false }: Token = {}) {
	const jwt = new SignJWT({ scope }).setProtectedHeader({ alg: "RS256" }).setIssuer(iss).setAudience(aud).setIssuedAt().setExpirationTime(caducaEn);
	if (sub) jwt.setSubject(sub);
	return jwt.sign(conOtraClave ? otra.privateKey : buena.privateKey);
}

export const appDePrueba = () => crearApp({ auth: { claves: buena.publicKey, emisor: EMISOR, audiencia: AUDIENCIA } });
export const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });
