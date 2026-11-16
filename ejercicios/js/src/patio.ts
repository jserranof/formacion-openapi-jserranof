// Tu zona de pruebas. Escribe aquí y mira el resultado en la terminal:
//
//   npm run patio        (desde ejercicios/; se vuelve a ejecutar cada vez que guardas)
//
// Nada de este fichero se comprueba: rómpelo cuanto quieras.
import { tareas } from "./tareas.js";

const nombre = "Ana";
let contador = 0;
contador = contador + 1;

console.log(`Hola, ${nombre}. Contador: ${contador}`);
console.log("Hay", tareas.length, "tareas");
console.log(tareas.filter((t) => t.completada));
