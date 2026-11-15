// Ejercicio 1 · Lee un contrato (Bloque 1)
//
// Abre s03/carta.yaml: el contrato de la API de un restaurante. Sin programar nada,
// contesta lo que se pregunta. Todo se responde leyendo el contrato.
// Comprueba: cd ejercicios && npm run comprobar s03 e01

type Letra = "a" | "b" | "c" | null;
type Enfoque = "contract-first" | "code-first" | null;

export const lectura = {
	/** 1. ¿En qué sección del contrato están las rutas (las URL) de la API? Escribe su nombre */
	seccionRutas: null as string | null,

	/** 2. ¿Cuántas operaciones (verbo + ruta) declara la carta? */
	operaciones: null as number | null,

	/** 3. Un programa quiere ver un plato concreto. ¿Qué operationId tiene que llamar? */
	operacionVerPlato: null as string | null,

	/** 4. GET /platos/99 y ese plato no existe. ¿Qué código responde, según el contrato? */
	codigoPlatoQueNoExiste: null as number | null,

	/** 5. ¿Qué campos son obligatorios para crear un pedido? Escríbelos en una lista: ["…", "…"] */
	obligatoriosPedido: null as string[] | null,

	/** 6. POST /pedidos con { "mesa": 40, "platos": [3] }. ¿Cumple el contrato? */
	pedidoMesa40Vale: null as boolean | null,

	/** 7. POST /pedidos con { "mesa": 4, "platos": [3], "propina": 5 }. ¿Cumple el contrato? */
	pedidoConPropinaVale: null as boolean | null,

	/** 8. Cuando se crea un pedido, ¿qué cabecera de la respuesta dice dónde está? */
	cabeceraPedidoCreado: null as string | null,

	/** 9. ¿Qué Content-Type llevan los errores de esta API? */
	tipoDeLosErrores: null as string | null,

	/**
	 * 10. ¿Qué hace `$ref: "#/components/schemas/Plato"`?
	 * "a": copia el esquema Plato en otro fichero
	 * "b": apunta a la definición de Plato que hay en components: se escribe una vez y se usa en muchos sitios
	 * "c": crea un plato nuevo en la carta
	 */
	queHaceRef: null as Letra,
};

export const enfoques = {
	/** 11. El equipo de la app móvil y el del servidor acuerdan el openapi.yaml el lunes; el martes programan los dos a la vez. */
	equipoA: null as Enfoque,

	/** 12. Se programa la API y una librería genera el openapi.yaml leyendo el código. */
	equipoB: null as Enfoque,

	/**
	 * 13. ¿Cuál es la ventaja principal de escribir el contrato primero?
	 * "a": se escribe menos código
	 * "b": el contrato se revisa antes de programar, y quien usa la API puede empezar sin esperar
	 * "c": ya no hace falta probar la API
	 */
	ventajaContratoPrimero: null as Letra,
};
