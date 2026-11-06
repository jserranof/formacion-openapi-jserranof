# Puesta en marcha

Trabajamos en **GitHub Codespaces**: un VS Code en el navegador con todo instalado. Solo
necesitas una cuenta de GitHub y Chrome, Edge o Firefox. Son 5 minutos.

## §1 · Tu copia del repositorio

1. Abre el enlace de la invitación que te ha mandado el formador y acéptala. GitHub crea
   **tu** repositorio con el material del curso.
2. En tu repositorio: botón verde **Code** → pestaña **Codespaces** → **Create codespace
   on main**.
3. Espera a que termine de preparar (la primera vez, 2–3 minutos). Se abre
   `ejercicios/README.md`.

**Comprobar:** en la terminal de abajo (`Ctrl+ñ` o menú → Terminal → New Terminal):

```bash
# desde la raíz del repositorio
node --version                         # v24.x
cd ejercicios && npm run comprobar s01 # 0 de 4 ejercicios superados: es lo esperado
```

## §2 · Abrir tu API en el navegador

Cuando arrancas la API (`npm run dev:s01`), Codespaces avisa abajo a la derecha de que el
puerto 3000 está disponible: **Open in Browser**. También está en la pestaña **Ports**.
La dirección es del estilo `https://<nombre>-3000.app.github.dev`. Desde la terminal del
codespace sigue valiendo `curl http://localhost:3000/...`.

## §3 · Guardar tu trabajo

El codespace se para solo tras 30 minutos sin uso, y tus cambios siguen ahí al volver.
Aun así, sube tu trabajo al acabar cada sesión:

```bash
# desde la raíz del repositorio
git add -A && git commit -m "s01: ejercicios" && git push
```

Para volver otro día: tu repositorio → **Code** → **Codespaces** → el que ya tienes (no
crees otro).

## §4 · Sin Codespaces (en tu equipo)

Si prefieres trabajar en local: Node 24 LTS (o 22.12 o superior), Git y VS Code. Después:

```bash
# desde la carpeta donde guardes tus proyectos
git clone <URL-DE-TU-REPOSITORIO> curso-api
cd curso-api && bash .devcontainer/instalar.sh
```

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| El codespace no arranca o pide pagar | Se han gastado las horas gratuitas del mes | Avisa al formador; mientras, usa §4 |
| `npm run comprobar` dice «No he podido ejecutar las pruebas» | Faltan dependencias | `bash .devcontainer/instalar.sh` desde la raíz |
| El enlace del puerto da 404 o «no disponible» | La API no está arrancada | Mira la terminal donde ejecutaste `npm run dev:s01` |
| `EADDRINUSE :3000` | Ya tienes la API arrancada en otra terminal | Ciérrala (`Ctrl+C`) o usa `PORT=3001 npm run dev:s01` |
