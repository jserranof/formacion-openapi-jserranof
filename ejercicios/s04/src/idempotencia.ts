import type { NextFunction, Request, Response } from "express";

// Ejercicio 9 (reto): Idempotency-Key en POST.
//   - Sin cabecera, o si no es POST: next().
//   - La primera vez: deja pasar y guarda la respuesta (status, cuerpo, Location) y una huella
//     del cuerpo de la petición (createHash("sha256") de node:crypto). Pista: envuelve res.json.
//   - Si se repite con el mismo cuerpo: devuelve lo guardado y la cabecera Idempotent-Replayed: true.
//   - Si se repite con otro cuerpo: 422 con problem+json.
//   - La clave es de cada usuario: guárdala como `${sub}:${clave}`.
export function idempotencia() {
	return (_req: Request, _res: Response, next: NextFunction) => next();
}
