// Ejercicio 4: los middleware propios.
//
//   idPeticion(req, res, next)   lee X-Request-Id o genera uno con randomUUID() (node:crypto),
//                                lo guarda en res.locals.idPeticion y lo devuelve en la cabecera
//   corsConLista(origenes)       cors({ origin: origenes, exposedHeaders: [...] })
//   limitePeticiones(porMinuto)  rateLimit({ windowMs, limit, standardHeaders: "draft-8", handler })

export {};
