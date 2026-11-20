// Datos de prueba en memoria. Se reinician cada vez que se arranca la API.

export type EstadoSorteo = "abierto" | "cerrado" | "celebrado";

export interface Sorteo {
	id: number;
	nombre: string;
	fecha: string;
	estado: EstadoSorteo;
	precioApuesta: number;
	bote: number;
}

export interface Resultado {
	sorteoId: number;
	combinacion: number[];
	complementario: number;
	publicadoEn: string;
}

export interface Apuesta {
	id: number;
	usuario: string;
	sorteoId: number;
	numeros: number[];
	importe: number;
	estado: "activa" | "anulada";
	creadaEn: string;
}

export interface Usuario {
	usuario: string;
	clave: string;
	permisos: string[];
}

// Usuarios de prueba: sus claves están publicadas en el contrato a propósito.
export const usuarios: Usuario[] = [
	{ usuario: "ana", clave: "ana-practicas", permisos: ["apuestas:leer", "apuestas:escribir"] },
	{ usuario: "luis", clave: "luis-practicas", permisos: ["apuestas:leer"] },
];

// Aplicaciones de prueba para OAuth2 Client Credentials (actúan en nombre de su cuenta de servicio).
export interface Cliente {
	id: string;
	secreto: string;
	usuario: string;
	permisos: string[];
}

export const clientes: Cliente[] = [
	{ id: "app-consulta", secreto: "secreto-consulta", usuario: "app-consulta", permisos: ["apuestas:leer"] },
	{ id: "app-gestion", secreto: "secreto-gestion", usuario: "app-gestion", permisos: ["apuestas:leer", "apuestas:escribir"] },
];

export function crearDatos() {
	const sorteos: Sorteo[] = [
		{ id: 1, nombre: "Sorteo Semanal 45", fecha: "2026-11-14T21:30:00Z", estado: "celebrado", precioApuesta: 1.5, bote: 2_500_000 },
		{ id: 2, nombre: "Sorteo Diario 318", fecha: "2026-11-18T21:30:00Z", estado: "celebrado", precioApuesta: 0.5, bote: 400_000 },
		{ id: 3, nombre: "Sorteo Semanal 46", fecha: "2026-11-21T21:30:00Z", estado: "cerrado", precioApuesta: 1.5, bote: 2_800_000 },
		{ id: 4, nombre: "Sorteo Diario 322", fecha: "2026-11-25T21:30:00Z", estado: "abierto", precioApuesta: 0.5, bote: 550_000 },
		{ id: 5, nombre: "Sorteo Semanal 47", fecha: "2026-11-28T21:30:00Z", estado: "abierto", precioApuesta: 1.5, bote: 3_000_000 },
	];
	const resultados: Resultado[] = [
		{ sorteoId: 1, combinacion: [4, 11, 19, 23, 37, 45], complementario: 8, publicadoEn: "2026-11-14T22:05:00Z" },
		{ sorteoId: 2, combinacion: [2, 9, 16, 28, 33, 41], complementario: 30, publicadoEn: "2026-11-18T22:05:00Z" },
	];
	const apuestas: Apuesta[] = [
		{ id: 1, usuario: "ana", sorteoId: 1, numeros: [4, 11, 20, 23, 38, 45], importe: 1.5, estado: "activa", creadaEn: "2026-11-13T10:00:00Z" },
		{ id: 2, usuario: "ana", sorteoId: 5, numeros: [7, 14, 21, 28, 35, 42], importe: 1.5, estado: "activa", creadaEn: "2026-11-19T09:00:00Z" },
		{ id: 3, usuario: "luis", sorteoId: 4, numeros: [1, 2, 3, 4, 5, 6], importe: 0.5, estado: "activa", creadaEn: "2026-11-19T09:30:00Z" },
	];
	return { sorteos, resultados, apuestas, siguienteApuesta: 4 };
}
