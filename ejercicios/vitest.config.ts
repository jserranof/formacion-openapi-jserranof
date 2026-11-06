import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["s*/pruebas/**/*.test.ts"],
		// Cada fichero de pruebas arranca su propia app: sin puertos, sin servidor encendido
		isolate: true,
	},
});
