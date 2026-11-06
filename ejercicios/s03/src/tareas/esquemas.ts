import { z } from "zod";
import { PRIORIDADES } from "../datos.js";

const campos = z.object({
	titulo: z.string({ error: "«titulo» tiene que ser un texto" }).trim().min(1, "«titulo» no puede estar vacío").max(120, "«titulo» admite como mucho 120 caracteres"),
	completada: z.boolean({ error: "«completada» tiene que ser true o false" }),
	prioridad: z.enum(PRIORIDADES, { error: "«prioridad» tiene que ser baja, media o alta" }),
});

// POST y PUT: la tarea entera. strict(): un campo desconocido (como «id») es un error
export const TareaNueva = campos
	.extend({
		completada: campos.shape.completada.default(false),
		prioridad: campos.shape.prioridad.default("media"),
	})
	.strict();

// PATCH: solo lo que cambia, sin valores por defecto
export const CambiosTarea = campos.partial().strict();

export const Consulta = z.object({
	prioridad: z.enum(PRIORIDADES, { error: "«prioridad» tiene que ser baja, media o alta" }).optional(),
	// Llega como texto ("true"); si antes pasa por el validador del contrato (S3), ya como booleano
	completada: z
		.union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")], { error: "«completada» tiene que ser true o false" })
		.optional(),
	orden: z.enum(["id", "-id", "titulo", "-titulo", "prioridad", "-prioridad"], { error: "«orden» admite id, titulo o prioridad, con «-» delante para descendente" }).default("id"),
	pagina: z.coerce.number().int().min(1, "«pagina» empieza en 1").default(1),
	limite: z.coerce.number().int().min(1, "«limite» va de 1 a 100").max(100, "«limite» va de 1 a 100").default(10),
});

export type TareaNueva = z.infer<typeof TareaNueva>;
export type CambiosTarea = z.infer<typeof CambiosTarea>;
export type Consulta = z.infer<typeof Consulta>;
