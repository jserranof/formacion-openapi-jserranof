// Ejercicio 5: los esquemas de validación con Zod.
//
// import { z } from "zod";
// import { PRIORIDADES } from "../datos.js";
//
// export const TareaNueva = z.object({ ... }).strict();   // POST y PUT
// export const CambiosTarea = ...                          // PATCH: todo opcional
// export type TareaNueva = z.infer<typeof TareaNueva>;
//
// Ejercicio 6 (reto): el esquema del parámetro de ruta, { id }: un entero de 1 en adelante.
//
// Ejercicios 7 y 8: el esquema de la consulta (prioridad, completada, orden, pagina, limite).
// Ojo: todo lo que llega en la query string es texto. z.coerce.number() lo convierte.
export {};
