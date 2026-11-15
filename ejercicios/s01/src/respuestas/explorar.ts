// Ejercicio 1 · Explora la API de ejemplo (Bloque 1)
//
// 1. Arranca la API de ejemplo:   cd docs/ejemplos/api-base && npm run dev
// 2. En otra terminal, haz las peticiones con curl -i (o con REST Client).
// 3. Cambia cada null por tu respuesta. El editor te propone las opciones válidas.
// 4. Comprueba:                   cd ejercicios && npm run comprobar s01 e01

export const respuestas: {
	/** 1. GET /tareas: ¿qué código de estado vuelve? (un número, por ejemplo 418) */
	codigoListar: number | null;
	/** 1. GET /tareas: ¿qué tipo de contenido dice la cabecera Content-Type? (sin el «; charset…») */
	contentTypeListar: string | null;
	/** 2. GET /tareas/99: ¿qué código vuelve? */
	codigoNoExiste: number | null;
	/** 2. GET /tareas/99: ¿y qué Content-Type? */
	contentTypeNoExiste: string | null;
	/** 3. GET /tareas/abc: ¿qué código vuelve? */
	codigoIdTexto: number | null;
	/** 4. POST /tareas con un título: ¿qué código vuelve? */
	codigoCrear: number | null;
	/** 4. POST /tareas: ¿cómo se llama la cabecera nueva que dice dónde está la tarea creada? */
	cabeceraCrear: string | null;
	/** 5. ¿Quién decide el id de la tarea nueva? */
	quienPoneElId: "el cliente" | "el servidor" | null;
	/** 6. POST /tareas con el cuerpo {}: ¿qué código vuelve? */
	codigoSinTitulo: number | null;
	/** 7. Paras el servidor, lo arrancas otra vez y pides GET /tareas: ¿qué pasa con tu tarea? */
	alReiniciar: "sigue ahí" | "ha desaparecido" | null;
	/** 8. ¿Qué es la página /docs? */
	queEsDocs: "la documentación interactiva de la API" | "una página de error" | "el código fuente de la API" | null;
} = {
	codigoListar: null,
	contentTypeListar: null,
	codigoNoExiste: null,
	contentTypeNoExiste: null,
	codigoIdTexto: null,
	codigoCrear: null,
	cabeceraCrear: null,
	quienPoneElId: null,
	codigoSinTitulo: null,
	alReiniciar: null,
	queEsDocs: null,
};
