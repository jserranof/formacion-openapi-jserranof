#!/usr/bin/env bash
# Arranca las dos versiones de la API de Sorteos: la estable (puerto 3000) y la
# candidata (puerto 3001). Se paran las dos con Ctrl+C.
set -euo pipefail
cd "$(dirname "$0")"

[[ -d node_modules ]] || npm ci --no-audit --no-fund

VERSION=estable PUERTO=3000 npx tsx src/server.ts &
VERSION=candidata PUERTO=3001 npx tsx src/server.ts &
trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM

# Espera a que respondan las dos
for puerto in 3000 3001; do
	for _ in $(seq 1 30); do
		curl -sf "http://localhost:$puerto/salud" >/dev/null && break
		sleep 0.5
	done
done

if [[ -n "${CODESPACE_NAME:-}" ]]; then
	# ReadyAPI o SoapUI, en tu equipo, solo llegan a la API si los puertos son públicos
	if ! { command -v gh >/dev/null && gh codespace ports visibility 3000:public 3001:public -c "$CODESPACE_NAME" >/dev/null 2>&1; }; then
		cat <<'AVISO'

  Para usar ReadyAPI o SoapUI desde tu equipo, haz públicos los puertos 3000 y 3001:
  pestaña PUERTOS → clic derecho en la fila del puerto → Visibilidad del puerto → Public
  (en inglés: PORTS → Port Visibility → Public). Para Swagger UI no hace falta.
AVISO
	fi
	base="https://$CODESPACE_NAME"
	dominio="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
	estable="$base-3000.$dominio"
	candidata="$base-3001.$dominio"
else
	estable="http://localhost:3000"
	candidata="http://localhost:3001"
fi

cat <<EOF

  API de Sorteos lista

  Versión estable   → $estable/docs
  Versión candidata → $candidata/docs

  Contrato para SoapUI (Swagger 2.0):
    $estable/swagger2.json
    $candidata/swagger2.json

  Ctrl+C para pararlas.

EOF
wait
