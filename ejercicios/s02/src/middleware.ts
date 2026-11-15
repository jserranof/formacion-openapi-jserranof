// Ejercicios 10 y 11: los middleware propios.
//
// idPeticion(req, res, next)        lee X-Request-Id o genera uno con randomUUID() (node:crypto),
//                                   lo guarda en res.locals.idPeticion y lo devuelve en la cabecera
// corsConLista(origenes)            cors({ origin: origenes, exposedHeaders: [...] })
// limitePeticiones(porMinuto)       rateLimit({ windowMs, limit, standardHeaders: "draft-8", handler })
// registroPeticiones(registro)      apunta la hora, y en res.on("finish") llama a
//                                   registro({ requestId, metodo, ruta, status, ms })
export {};
