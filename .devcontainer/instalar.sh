#!/usr/bin/env bash
# Instala las dependencias de cada proyecto del curso al crear el codespace.
set -euo pipefail
for d in ejercicios docs/ejemplos/*/; do
	[[ -f "$d/package.json" ]] || continue
	echo "→ npm ci en $d"
	(cd "$d" && npm ci --no-audit --no-fund)
done
echo "Listo. Abre ejercicios/README.md para empezar."
