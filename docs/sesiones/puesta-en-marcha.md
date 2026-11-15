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

> Si en vez de una invitación te han añadido como **colaborador** del repositorio, acepta
> la invitación (te llega por correo o en <https://github.com/notifications>), abre el
> repositorio y sigue desde el paso 2. Cuando tengas el codespace abierto, crea tu rama
> (`git switch -c alumno/<tu-nombre> && git push -u origin alumno/<tu-nombre>`) y
> trabaja siempre en ella, nunca en `main`.

**Comprobar:** en la terminal de abajo (`Ctrl+ñ` o menú → Terminal → New Terminal):

```bash
# desde la raíz del repositorio
node --version                         # v24.x
cd ejercicios && npm run comprobar s01 # 0 de 9 ejercicios superados: es lo esperado
```

## §2 · Abrir tu API en el navegador

Cuando arrancas la API (`npm run dev:s01`), Codespaces avisa abajo a la derecha de que el
puerto 3000 está disponible: **Open in Browser**. También está en la pestaña **Ports**.
La dirección es del estilo `https://<nombre>-3000.app.github.dev`. Desde la terminal del
codespace sigue valiendo `curl http://localhost:3000/...`.

## §3 · Guardar tu trabajo

El codespace se para solo tras un rato sin uso (30 minutos por defecto; ver §4), y tus
cambios siguen ahí al volver. Aun así, sube tu trabajo al acabar cada sesión:

```bash
# desde la raíz del repositorio
git add -A && git commit -m "s01: ejercicios" && git push
```

Para volver otro día: tu repositorio → **Code** → **Codespaces** → el que ya tienes (no
crees otro). También los tienes todos en <https://github.com/codespaces>.

## §4 · Que no se te acaben las horas gratis

Codespaces es gratis con cualquier cuenta personal de GitHub, con un cupo mensual:
**120 horas-núcleo y 15 GB de almacenamiento**. Nuestro codespace usa 2 núcleos, así que
son unas **60 horas de uso al mes**, de sobra para el curso. Las horas se descuentan de
la cuenta de quien crea el codespace, es decir, de la tuya. Si no tienes tarjeta
asociada, el límite de gasto es 0 €: al agotar el cupo, el codespace se para y no te
cobran nada.

Las horas solo se gastan mientras el codespace está **encendido**, aunque no lo estés
usando. Para no desperdiciarlas, cambia un ajuste una sola vez:

1. Abre <https://github.com/settings/codespaces>. Es la configuración de **tu cuenta**:
   tu foto (arriba a la derecha) → **Settings** → **Codespaces**, en el menú de la
   izquierda.
2. **Default idle timeout**: pon **15** minutos y pulsa **Save**. Es el tiempo sin
   actividad tras el que el codespace se para solo.

**Default retention period** déjalo como está (30 días). Es cuánto se guarda un
codespace parado antes de borrarse, y el curso tiene casi una semana entre S2 y S3:
con menos días se te podría borrar en medio. Guardarlo apenas gasta almacenamiento.

> **Si el codespace se borra, pierdes todo lo que no hayas subido con `git push`**:
> ficheros sin commit y commits sin subir. Lo que esté en GitHub sigue ahí; basta con
> crear otro codespace (2–3 minutos). Por eso, `git push` al acabar cada sesión (§3).

> Si ves **Prebuild configuration**, estás en los ajustes del **repositorio**
> (`…/settings/codespaces` dentro del repo), no en los de tu cuenta. No lo actives:
> las precompilaciones gastan almacenamiento y no hacen falta en el curso.

Y al terminar de trabajar cada día:

- **Para el codespace** sin esperar al tiempo de inactividad: en
  <https://github.com/codespaces>, menú `···` del codespace → **Stop codespace**.
  También puedes hacerlo desde el propio VS Code: paleta de comandos (`F1`) →
  *Codespaces: Stop Current Codespace*.
- **No crees un codespace nuevo cada día**: reabre el que ya tienes. Cada uno ocupa
  almacenamiento.
- **Mira tu consumo** en **Settings** → **Billing and licensing** → **Usage**, filtrando
  por Codespaces.

## §5 · Sin Codespaces (en tu equipo)

Si prefieres trabajar en local: Node 24 LTS (o 22.12 o superior), Git y VS Code. Después:

```bash
# desde la carpeta donde guardes tus proyectos
git clone <URL-DE-TU-REPOSITORIO> curso-api
cd curso-api && bash .devcontainer/instalar.sh
```

## Si algo falla

| Síntoma | Causa | Arreglo |
|---|---|---|
| El codespace no arranca o pide pagar | Se han gastado las horas gratuitas del mes | Avisa al formador; mientras, usa §5 |
| `npm run comprobar` dice «No he podido ejecutar las pruebas» | Faltan dependencias | `bash .devcontainer/instalar.sh` desde la raíz |
| El enlace del puerto da 404 o «no disponible» | La API no está arrancada | Mira la terminal donde ejecutaste `npm run dev:s01` |
| `EADDRINUSE :3000` | Ya tienes la API arrancada en otra terminal | Ciérrala (`Ctrl+C`) o usa `PORT=3001 npm run dev:s01` |
