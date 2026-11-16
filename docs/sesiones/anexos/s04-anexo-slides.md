# S4 · Anexo — Webhooks, operaciones largas y claves que rotan · diapositivas

Fuente de la presentación `presentaciones/s04-anexo-presentacion.pptx`.

> Material de ampliación de S4, para usar si sobra tiempo. Tres bloques independientes:
> se pueden dar en cualquier orden. Los valores exactos, en
> `s04-anexo-referencia-rapida.md` (§A1–§C3). El código, en `docs/ejemplos/anexo-s04/`.

@pie Anexo S4 · Webhooks, 202 y claves

---

## @portada Curso APIs REST y OpenAPI con Node y TypeScript
### Sesión 4 · Anexo: webhooks, operaciones largas y claves que rotan

Martes 24 de noviembre de 2026

Alejandro Muñoz · Julditec

---

## Nos sobra tiempo: tres extras

@diagrama rejilla
A · Webhooks firmados* | La API avisa a otros, y nadie puede falsificar el aviso
B · Lo que tarda | 202, Location y un recurso que dice cómo va
C · Rotar las claves | kid y JWKS, sin tocar la API

Tres ficheros que se copian y se borran al final: `ejercicios/s04` queda como estaba.

---

## @seccion A · Webhooks firmados con HMAC

---

## Que la API avise

@diagrama comparacion
Preguntar cada minuto | El otro sistema llama sin parar | Casi siempre, «no hay nada»
Webhook | La API llama cuando pasa algo | Un POST a la URL del otro

---

## El problema: cualquiera puede llamar

- La URL del receptor es pública: cualquiera le manda un `POST`
- Alguien puede **cambiar** el aviso por el camino
- O **repetir** uno viejo que capturó

> ¿Cómo sabe el receptor que el aviso es nuestro, entero y de ahora?

---

## La firma: HMAC del cuerpo y la hora

@diagrama flujo
Secreto compartido + hora + cuerpo -> HMAC-SHA256 -> Cabecera X-Firma -> El receptor la recalcula!

- Cuerpo cambiado: la firma no cuadra
- Aviso viejo: la hora se pasa de cinco minutos

---

## En la terminal: cuatro avisos

![FOTO 1] webhooks.ts: el bueno se acepta (204); cambiado, viejo o con otro secreto, 401

Referencia rápida · §A2 y §A3

---

## Dos detalles que fallan siempre

- El cuerpo se firma **tal cual llega**: si lo parseas y lo vuelves a serializar, cambia
- Se compara con `timingSafeEqual`: tarda lo mismo acierte o falle

> Stripe firma así, con la hora; GitHub firma solo el cuerpo (X-Hub-Signature-256).

---

## @seccion B · Operaciones que tardan: 202

---

## Lo que no cabe en una petición

- Un informe que tarda un minuto: la petición se corta antes
- Mejor: **202 Accepted** enseguida, y un recurso que dice cómo va

@diagrama flujo
POST /informes -> 202 + Location -> GET /operaciones/id -> terminada!

---

## En la terminal: pedir y preguntar

![FOTO 2] operaciones.ts: 202 en milisegundos, y el progreso hasta «terminada» con el resultado

Referencia rápida · §B2

---

## Retry-After: cuándo volver

- Cada respuesta «en curso» dice **cuándo** volver a preguntar
- El cliente no martillea la API
- Al terminar: el resultado, o un error en `problem+json`

> Con un webhook (bloque A), la API avisaría al acabar, sin preguntas.

---

## @seccion C · Rotar las claves de firma

---

## Las claves también caducan

- Se cambian de vez en cuando, o de golpe si se filtran
- Si la API tuviera la clave escrita en el código, habría que desplegarla
- Con **JWKS** y `kid`, la API no se toca

---

## kid: con qué clave se firmó

@diagrama flujo
Solo enero -> Enero y junio -> Solo junio!

El token dice su `kid`; la API busca esa clave en el JWKS publicado.

---

## En la terminal: una rotación entera

![FOTO 3] rotar-claves.ts: los tokens de enero valen mientras su clave está publicada; después, no

Referencia rápida · §C2

---

## Lo que hace jose por ti

- `createRemoteJWKSet` guarda el JWKS en caché
- Si llega un `kid` que no conoce, lo vuelve a pedir
- Nuestra API de clase ya lo usa: rotar no cambia ni una línea

---

## @fin Gracias

¿Dudas?
