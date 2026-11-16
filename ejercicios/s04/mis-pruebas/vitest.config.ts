// Ejecuta tus pruebas de s04/mis-pruebas (práctica 4):  npm run pruebas:s04
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		root: fileURLToPath(new URL("../..", import.meta.url)),
		include: ["s04/mis-pruebas/**/*.test.ts"],
	},
});
