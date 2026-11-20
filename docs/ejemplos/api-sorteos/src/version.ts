// La API se arranca en dos versiones: «estable» (la que está en producción) y
// «candidata» (la nueva, que el equipo de QA tiene que validar antes de publicarla).

export type Version = "estable" | "candidata";

export interface Comportamiento {
	sorteoInexistenteResponde200: boolean;
	admiteNumerosRepetidos: boolean;
	numeroFueraDeRangoRompe: boolean;
	admiteApuestaEnSorteoCerrado: boolean;
	muestraApuestasAjenas: boolean;
	aceptaTokenCaducado: boolean;
	precioComoTexto: boolean;
	omiteLocation: boolean;
}

export function comportamientoDe(version: Version): Comportamiento {
	const candidata = version === "candidata";
	return {
		sorteoInexistenteResponde200: candidata,
		admiteNumerosRepetidos: candidata,
		numeroFueraDeRangoRompe: candidata,
		admiteApuestaEnSorteoCerrado: candidata,
		muestraApuestasAjenas: candidata,
		aceptaTokenCaducado: candidata,
		precioComoTexto: candidata,
		omiteLocation: candidata,
	};
}
