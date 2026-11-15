// Un cliente de la API, tipado con el contrato (anexo S3, bloque B).
// Se copia a ejercicios/s03/src/ y, con la API arrancada (npm run dev:s03), desde ejercicios:
//   npx tsx s03/src/cliente.ts
import createClient from "openapi-fetch";
import type { paths } from "./tipos/api.js";

// paths sale de «npm run tipos:s03»: el cliente sabe qué rutas, parámetros y respuestas hay
const api = createClient<paths>({ baseUrl: process.env.API ?? "http://localhost:3000" });

// 1. Listar: la consulta y la respuesta, comprobadas por TypeScript
const { data: pagina } = await api.GET("/tareas", { params: { query: { prioridad: "alta", limite: 3 } } });
console.log("Prioridad alta:", pagina?.items.map((t) => t.titulo));

// 2. Crear: el cuerpo tiene que ser una TareaNueva
const { data: creada, response } = await api.POST("/tareas", { body: { titulo: "Desde el cliente tipado", prioridad: "baja" } });
console.log("Creada:", response.status, response.headers.get("location"), creada);

// 3. Un error: data viene vacío y error trae el problem+json
const { data: ninguna, error } = await api.GET("/tareas/{id}", { params: { path: { id: 999 } } });
console.log("La 999:", ninguna, error?.title, error?.status);
