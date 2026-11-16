// Ejercicio 1 · Lee un token (Bloque 1)
//
// s04/token-ejemplo.txt es un JWT como los que emite el servidor de autorización del
// curso. Léelo por dentro con `npm run token:s04` y contesta. No hay que programar nada.
// Comprueba: cd ejercicios && npm run comprobar s04 e01

type Letra = "a" | "b" | "c" | null;

export const contenido = {
	/** 1. ¿Quién lo ha emitido (iss)? Cópialo tal cual */
	emisor: null as string | null,

	/** 2. ¿De quién es (sub)? */
	usuario: null as string | null,

	/** 3. ¿Para qué API es (aud)? */
	audiencia: null as string | null,

	/** 4. ¿Qué aplicación lo pidió (client_id)? */
	aplicacion: null as string | null,

	/** 5. ¿Qué permisos da (scope)? En una lista: ["…"] */
	permisos: null as string[] | null,

	/** 6. ¿Cuántos minutos dura, desde que se emite (iat) hasta que caduca (exp)? */
	minutosDeVida: null as number | null,

	/** 7. ¿Con qué algoritmo está firmado (alg, en la cabecera)? */
	algoritmo: null as string | null,
};

export const conceptos = {
	/** 8. Lo has leído sin ninguna clave. ¿Por qué?
	 *  a) Porque el token es de prueba: los de verdad van cifrados
	 *  b) Porque un JWT va firmado, no cifrado: cualquiera lo lee, pero nadie lo puede cambiar sin la clave
	 *  c) Porque `npm run token:s04` conoce la clave del servidor */
	porQueSeLee: null as Letra,

	/** 9. Cambias "ana" por "luis" en el contenido y lo mandas a la API. ¿Qué código responde? */
	codigoSiLoCambias: null as number | null,

	/** 10. Con este token (sin caducar), ¿qué responde POST /tareas? */
	codigoPostConEsteToken: null as number | null,

	/** 11. ¿Y GET /tareas sin ningún token? */
	codigoSinToken: null as number | null,

	/** 12. El servidor firma con RS256. ¿Qué necesita nuestra API para comprobar la firma?
	 *  a) La clave pública del servidor, que publica en /jwks: no puede firmar con ella
	 *  b) La misma clave secreta con la que firma el servidor
	 *  c) Nada: basta con leer el contenido */
	queNecesitaLaApi: null as Letra,

	/** 13. ¿Por qué no lleva datos secretos, como una contraseña?
	 *  a) Porque ocuparía demasiado
	 *  b) Porque caduca en una hora
	 *  c) Porque cualquiera que lo tenga puede leerlo */
	porQueSinSecretos: null as Letra,
};
