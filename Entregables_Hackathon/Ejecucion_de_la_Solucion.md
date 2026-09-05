# Ejecución de la solución — Cora

**Hackathon Nicaragua 2026 — Entregable "Ejecución de la solución"**

> Este documento da las dos vías reales para ejecutar Cora localmente: instalar el APK ya
> compilado (sin herramientas de desarrollo) o correr el proyecto desde el código fuente. También
> señala dónde está el guion de navegación pensado para grabar el video de demo, ya que la
> grabación en sí es un paso manual que no se genera desde este documento.
> Repositorio: https://github.com/eduardoevz/Volcanic-2026

## Opción A — Instalación directa del APK (la más rápida, sin compilar nada)

1. Descargar el APK más reciente desde [`releases/`](../releases/) en el repositorio, o desde los
   [GitHub Releases](https://github.com/eduardoevz/Volcanic-2026/releases) del proyecto.
2. En un dispositivo o emulador Android, habilitar la instalación de apps de "orígenes
   desconocidos" si el sistema lo pide.
3. Instalar el `.apk` (sideload) y abrir la app "Cora".
4. La app se conecta directo al proyecto real de Supabase (mismo backend que producción) — no
   requiere Metro, cable USB, ni computadora corriendo.

Esta es la vía recomendada para jueces/evaluadores que solo quieren **usar** la app, sin instalar
Node ni Android Studio.

## Opción B — Ejecución desde el código fuente

Requisitos: Node.js 20+, npm, Android Studio (SDK + emulador o dispositivo físico con depuración
USB).

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/eduardoevz/Volcanic-2026.git
cd Volcanic-2026/cora
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# completar EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. Generar el proyecto nativo de Android (android/ e ios/ no están versionados)
npx expo prebuild

# 4. Ejecutar (build + instala + abre Metro)
npx expo run:android
```

Si ya existe una build del dev client instalada, alcanza con `npm run start` para las corridas
siguientes. Detalle completo de variables de entorno y comandos de calidad (`lint`, `typecheck`,
`test`) en [`Entregables_Hackathon/README.md`](README.md), sección 3.

### Modo sin conexión al proveedor de IA

Si el proveedor de IA falla o va lento durante una demo, activar `EXPO_PUBLIC_AI_MOCK=true` en
`.env.local`: Cora IA sigue respondiendo con streaming simulado y citas reales de la biblioteca,
sin depender de la red del proveedor.

## Video de navegación

El proyecto ya tiene un guion de demo real de 4 minutos, ensayado y con cuentas de prueba
sembradas, en [`docs/DEMO_SCRIPT.md`](../docs/DEMO_SCRIPT.md):

- 3 cuentas demo (`demo-adolescente`, `demo-adulta`, `demo-perimenopausia@cora.test`, contraseña
  `DemoCora2026!`) sembradas con `cora/supabase/seed/demo.sql`, re-ejecutable sin dejar residuos.
- Recorrido cronometrado: problema → onboarding en vivo con cuenta nueva → el diferencial por
  etapa de vida → seguimiento de ciclo → biblioteca → Cora IA → resumen médico.
- Reglas de grabación (qué no improvisar, cómo manejar una falla del proveedor de IA, modo avión
  para mostrar sincronización offline).

**Nota de alcance de este entregable**: la grabación del video en sí es un paso manual — requiere
correr la app en un emulador o dispositivo real con un grabador de pantalla y seguir el guion de
arriba. Como evidencia estática de que cada pantalla del guion navega y funciona, este mismo
paquete de entregables incluye
[`Entregables_Hackathon/Interfaz_y_Desarrollo.md`](Interfaz_y_Desarrollo.md), con 13 capturas
reales tomadas ejecutando la app paso a paso (bienvenida → registro → onboarding completo →
Home/Calendario/Biblioteca/Perfil/Directorio), cubriendo el mismo recorrido que describe el guion
de video.
