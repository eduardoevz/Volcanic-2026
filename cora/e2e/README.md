# Pruebas E2E (Maestro)

Flujos escritos contra las rutas reales de `app/` (expo-router) y los textos
reales de `locales/es/*.json`. **No se instaló ni se corrió Maestro en esta
sesión** (no está disponible en este entorno) — quedan como flujos listos
para correr localmente contra un build de desarrollo, no verificados en este
PR. Antes de confiar en ellos, correrlos una vez contra un emulador/dispositivo
real y ajustar los `testID`/textos que no calcen (se escribieron leyendo el
código de las pantallas, no ejecutando la app).

## Cómo correrlos

```bash
# 1. Instalar Maestro (una sola vez): https://maestro.mobile.dev/getting-started/installing-maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# 2. Levantar un build de desarrollo (emulador Android o simulador iOS)
cd cora
npx expo run:android   # o run:ios

# 3. Correr un flujo
maestro test e2e/auth.yaml

# Correr todos los flujos
maestro test e2e/
```

## Flujos

- `auth.yaml` — registro → login → logout → recuperación de sesión (volver a
  abrir la app ya logueada).
- `tracking-and-alert.yaml` — registrar síntomas varios días → ver
  estadísticas del ciclo.
- `appointments-and-summary.yaml` — crear una cita → generar resumen médico.
- `family-circle.yaml` — invitar a alguien al círculo familiar.
- `settings-language-darkmode.yaml` — cambiar idioma y activar modo oscuro,
  verificar que persistan tras reiniciar la app.

## Por qué no corren en CI en cada PR

Maestro necesita un emulador/simulador (o un dispositivo real) levantado, lo
que implica un runner con más recursos y tiempo de ejecución que el resto de
la suite (~minutos por flujo vs. segundos de Jest). Para el alcance de este
hackathon se documentan y se corren manualmente antes de una demo/release, en
vez de bloquear cada PR con ellos. Si más adelante se quiere automatizar,
Maestro tiene una GitHub Action oficial (`mobile-dev-inc/action-maestro-cloud`)
que se puede agregar como un workflow `workflow_dispatch` adicional, igual que
se hizo con `rls-tests.yml`.
