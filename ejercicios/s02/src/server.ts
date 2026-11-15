import { crearApp } from "./app.js";

const puerto = Number(process.env.PORT ?? 3000);

// En las pruebas no se registra nada; aquí, una línea JSON por petición (ejercicio 11)
crearApp({ registro: (linea) => console.log(JSON.stringify(linea)) }).listen(puerto, () => {
	console.log(`API en http://localhost:${puerto}`);
});
