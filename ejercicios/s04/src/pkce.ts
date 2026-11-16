// Ejercicio 6 (reto) · PKCE: lo que hace la aplicación cliente (la web o el móvil), no la API.
//
//   - crearVerificador(): un secreto aleatorio de un solo uso, de 43 a 128 caracteres seguros
//     para una URL. Pista: randomBytes(32) de node:crypto, en base64url.
//   - retoDe(verificador): el SHA-256 del verificador, en base64url (el método «S256»).
//
// La app manda el reto al pedir el code (en el navegador, a la vista de todos) y el
// verificador solo al canjearlo (de servidor a servidor). Quien robe el code no tiene el verificador.
export function crearVerificador(): string {
	return "";
}

export function retoDe(_verificador: string): string {
	return "";
}
