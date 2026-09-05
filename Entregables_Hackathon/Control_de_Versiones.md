# Control de versiones — Cora

**Hackathon Nicaragua 2026 — Entregable "Control de versiones"**

> Evidencia real tomada del repositorio del proyecto, no simulada: historial de commits, ramas,
> colaboradores y salida real de terminal de los comandos de Git usados durante el desarrollo.
> Repositorio: https://github.com/eduardoevz/Volcanic-2026

## Resumen

- **72 commits** en la rama `main` al momento de este entregable.
- **2 personas** con commits en el historial (`git shortlog`): Cora Bot (66 commits, pair-programming
  con IA) y Eduardo Velasquez (6 commits).
- **3 Pull Requests fusionados** a `main` vía GitHub (no solo commits directos) — ver detalle abajo.
- **6 ramas locales/remotas** además de `main`: `develop`, `docs/readme-rewrite`,
  `fix/auth-google-password-reset`, `test/qa-suite`, y ramas remotas por colaborador
  (`origin/EduardoDEV`, `origin/JostinDEV`).
- Convención de mensajes de commit: `tipo(alcance): descripción` (`feat`, `fix`, `chore`, `docs`),
  en español, describiendo el cambio real — no mensajes genéricos como "update" o "cambios".

## Historial de commits recientes (`git log`)

```
7e4d23c 2026-09-05 fix(docs): corregir el estudio de BD contra el esquema real en Supabase
6287317 2026-09-05 fix(hackathon): corregir columnas y relación faltante en el Diagrama ER
6233929 2026-09-05 fix(hackathon): quitar header/footer de impresión de los 6 PDFs y ajustar diagrama ER
d94de41 2026-09-05 docs(hackathon): agregar entregable "Ejecución de la solución"
d0451b4 2026-09-05 docs(hackathon): agregar entregable "Seguridad y Buenas Prácticas" con modelo de 3 roles
cb11a09 2026-09-05 docs(hackathon): agregar entregable "Control de versiones" con evidencia real de Git/GitHub
af405c5 2026-09-05 docs(hackathon): agregar entregable "Interfaz y Desarrollo" con evidencia real de navegación
49e7bd5 2026-09-05 docs(hackathon): agregar diagrama ER y el estudio de normalización de BD
03f5635 2026-09-05 docs(hackathon): agregar carpeta de entregables oficiales del hackathon
5c8a085 2026-09-05 chore(releases): actualizar APK 2026-09-05 con los cambios de la Fase 35
16613a0 2026-09-05 feat(theme): agregar color sky y unificar anillo de progreso en Embarazo
87bf74d 2026-09-05 chore(releases): agregar APK 2026-09-05 con los fixes de la Fase 33
fe10b46 2026-09-05 fix(auth,onboarding,reminders): login roto en pantallas chicas, cita con fecha pasada, slides fijas y forms sin scroll
b4ed8c7 2026-09-05 feat(onboarding,welcome): historial de ciclos, rediseño de bienvenida y fix de conexión
d12b911 2026-09-05 fix(welcome): botón "Iniciemos" invisible en pantallas de poca altura
892ac8f 2026-09-04 docs(progreso): documentar el paso a Git LFS del APK en Fase 30
7f140ee 2026-09-04 chore(releases): agregar APK al repo vía Git LFS para descarga directa
6af2075 2026-09-04 feat(icon): reemplazar ícono placeholder por el logo real de Cora
244b1bd 2026-09-04 docs(release): publicar APK de instalación directa como GitHub Release
12ffb9b 2026-09-04 fix(pregnancy,calendar): sincronizar etapa de vida con embarazo + predicción/periodo/relaciones/ovulación en calendario
```

## Pull Requests fusionados (`gh pr list --state all`)

No todo el trabajo llega a `main` por commit directo: hay 3 Pull Requests reales, cada uno desde
su propia rama de feature, revisados y fusionados vía GitHub:

| # | Título | Rama → base | Archivos | Cambios |
| --- | --- | --- | --- | --- |
| [#1](https://github.com/eduardoevz/Volcanic-2026/pull/1) | test: suite de pruebas QA (unit, widget, integracion, IA, RLS, E2E) + CI | `test/qa-suite` → `main` | 39 | +2575 / −211 |
| [#2](https://github.com/eduardoevz/Volcanic-2026/pull/2) | fix(auth): diagnostico de Google sign-in y recuperacion de clave | `fix/auth-google-password-reset` → `main` | 3 | +93 / −0 |
| [#3](https://github.com/eduardoevz/Volcanic-2026/pull/3) | docs: reescribir README con informacion real del proyecto | `docs/readme-rewrite` → `main` | 1 | +124 / −67 |

Las 3 ramas de feature mencionadas en la sección anterior no son ramas abandonadas: son el origen
real de estos 3 PRs, ya fusionados.

## Ramas del proyecto (`git branch -a`)

```
  develop
  docs/readme-rewrite
  fix/auth-google-password-reset
* main
  test/qa-suite
  remotes/origin/EduardoDEV
  remotes/origin/HEAD -> origin/main
  remotes/origin/JostinDEV
  remotes/origin/develop
  remotes/origin/main
```

Ramas por feature (`fix/auth-google-password-reset`, `docs/readme-rewrite`, `test/qa-suite`) y
ramas personales por colaborador (`EduardoDEV`, `JostinDEV`) conviviendo con `main` y `develop`.

## Los 3 comandos mínimos exigidos, con evidencia real

### 1. `git commit`

Commit real creado para el entregable anterior de este mismo hackathon:

```
$ git commit -m "docs(hackathon): agregar entregable \"Interfaz y Desarrollo\"..."
[main af405c5] docs(hackathon): agregar entregable "Interfaz y Desarrollo" con evidencia real de navegación
 15 files changed, 132 insertions(+)
 create mode 100644 Entregables_Hackathon/Interfaz_y_Desarrollo.md
 create mode 100644 Entregables_Hackathon/Interfaz_y_Desarrollo.pdf
 create mode 100644 Entregables_Hackathon/img/01_welcome.png
 ...
```

### 2. `git push`

Ese mismo commit subido al repositorio remoto en GitHub:

```
$ git push origin main
To https://github.com/eduardoevz/Volcanic-2026.git
   49e7bd5..af405c5  main -> main
```

### 3. `git pull`

Sincronización con el remoto antes de continuar trabajando:

```
$ git pull origin main
From https://github.com/eduardoevz/Volcanic-2026
 * branch            main       -> FETCH_HEAD
Already up to date.
```

## Otras prácticas de control de versiones usadas en el proyecto

- **Git LFS** para los binarios de release (`releases/*.apk`, declarado en `.gitattributes`), en
  vez de versionar binarios grandes directo en el historial de Git (ver `docs/PROGRESO.md`,
  Fase 30).
- **2 GitHub Releases** publicados (`android-2026-09-04`, `android-2026-09-05`) con el APK
  descargable directamente, sin pasar por el repositorio de código.
- **GitHub Actions**: dos workflows activos en `.github/workflows/` — `ci.yml` (lint, typecheck y
  pruebas con cobertura en cada push/PR a `main`) y `rls-tests.yml` (suite pgTAP de Row Level
  Security) — como puerta de calidad antes de integrar a `main`.
- **`cora/AGENTS.md`** con convenciones de commit acordadas para todo el equipo, incluida la IA
  que colabora en el proyecto.
