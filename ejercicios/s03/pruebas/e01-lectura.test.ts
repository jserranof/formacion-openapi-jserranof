import { describe, expect, it } from "vitest";
import { enfoques as e, lectura as l } from "../src/respuestas/contrato.js";

// Compara sin enseñar la respuesta correcta: solo la pista
const bien = (acierto: boolean, pista: string) => expect(acierto, pista).toBe(true);
const texto = (v: string | null) => (v ?? "").trim().toLowerCase();

describe("Ejercicio 1 · Lee un contrato (s03/carta.yaml)", () => {
	it("1 y 2. dónde están las rutas y cuántas operaciones hay", () => {
		bien(texto(l.seccionRutas) === "paths", "1: busca la sección que contiene /platos y /pedidos");
		bien(l.operaciones === 3, "2: cuenta los verbos (get, post…) dentro de cada ruta, no las rutas");
	});

	it("3 y 4. qué operación llamar y qué pasa si no existe", () => {
		bien(l.operacionVerPlato?.trim() === "obtenerPlato", "3: el operationId de la operación que lee un plato por su id, tal cual");
		bien(l.codigoPlatoQueNoExiste === 404, "4: mira las respuestas que declara GET /platos/{id}");
	});

	it("5. los campos obligatorios de un pedido", () => {
		const lista = (l.obligatoriosPedido ?? []).map((c) => c.trim()).sort();
		bien(JSON.stringify(lista) === JSON.stringify(["mesa", "platos"]), "5: busca «required» en el esquema PedidoNuevo");
	});

	it("6 y 7. qué pedidos cumplen el contrato", () => {
		bien(l.pedidoMesa40Vale === false, "6: mira «minimum» y «maximum» de la mesa");
		bien(l.pedidoConPropinaVale === false, "7: ¿qué dice «additionalProperties» de un campo que no está en la lista?");
	});

	it("8 y 9. la cabecera del 201 y el tipo de los errores", () => {
		bien(texto(l.cabeceraPedidoCreado) === "location", "8: mira «headers» en la respuesta 201 de crearPedido");
		bien(texto(l.tipoDeLosErrores) === "application/problem+json", "9: mira el «content» de las respuestas 400, 404 y 409");
	});

	it("10. para qué sirve $ref", () => {
		bien(l.queHaceRef === "b", "10: fíjate en cuántos sitios aparece «#/components/schemas/Plato»");
	});

	it("11 a 13. contract-first frente a code-first", () => {
		bien(e.equipoA === "contract-first", "11: ¿qué existe primero, el contrato o el código?");
		bien(e.equipoB === "code-first", "12: ¿qué existe primero, el contrato o el código?");
		bien(e.ventajaContratoPrimero === "b", "13: piensa en el equipo de la app móvil del caso 11");
	});
});
