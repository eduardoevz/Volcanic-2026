# Guion de demo — Cora (4 minutos)

> Ver `docs/PLAN_DE_IMPLEMENTACION.md` §27. Las 3 cuentas demo se siembran
> con `cora/supabase/seed/demo.sql` (re-ejecutable — correrlo antes de cada
> ensayo o presentación deja el estado exactamente igual).

## Cuentas demo

| Cuenta | Etapa | Nivel de la pitahaya | Uso en el guion |
|---|---|---|---|
| `demo-adolescente@cora.test` | Adolescencia | 2 · Brote | Se muestra el Home, no se usa para el onboarding en vivo |
| `demo-adulta@cora.test` | Adultez | 4 · Cactus florecido · 3 meses de ciclo sembrados | Sección de seguimiento (calendario, predicción, registro rápido) |
| `demo-perimenopausia@cora.test` | Perimenopausia | 3 · Cactus joven | Sección "el diferencial" (Home distinto) |

Contraseña de las 3: `DemoCora2026!`

**Para el onboarding en vivo (0:30–1:15) se crea una cuenta nueva de verdad**
en el momento (correo cualquiera `@cora.test`, no una de las 3 sembradas) —
es la única parte del guion con una acción en vivo, y es intencional: mostrar
el flujo real de alta.

## Guion (§27, adaptado con las cuentas reales)

| Tiempo | Sección | Qué se muestra | Qué se dice |
|---|---|---|---|
| 0:00–0:30 | El problema | Pantalla de inicio | "En Nicaragua, la mayoría de apps de salud femenina son solo calendarios menstruales, en inglés, pensadas para otra realidad. Cora acompaña a la mujer en cada etapa de su vida." |
| 0:30–1:15 | Onboarding en vivo | Cuenta nueva → etapa Adolescencia → avatar Guardabarrando (ficha educativa) → pitahaya semilla → Home | "Cora pregunta una sola cosa esencial: en qué etapa estás. El avatar es fauna nicaragüense y enseña algo sobre nuestra biodiversidad. Y esta pitahaya va a crecer con ella." |
| 1:15–1:45 | El diferencial | Cambiar a `demo-perimenopausia@cora.test` → Home visiblemente distinto | "Mismo código, misma app. Pero para ella Cora habla de sofocos y salud ósea, no de la primera menstruación. Esto es Cora creciendo junto a la mujer." |
| 1:45–2:25 | Seguimiento | `demo-adulta@cora.test` (3 meses de datos ya sembrados) → Calendario con predicción → registro diario rápido → la pitahaya sube de nivel | "Registra su día en menos de un minuto. Cora estima su próximo ciclo como un rango, no como una certeza. Y cada momento de cuidado hace crecer a la pitahaya — sin rachas, sin culpa." |
| 2:25–3:00 | Contenido | Biblioteca filtrada por etapa → abrir un artículo → mostrar fuentes y revisor | "Todo el contenido está clasificado por etapa, tiene autor, fecha y fuentes citadas. Nada de información sin respaldo." |
| 3:00–3:40 | Cora IA | Pregunta ensayada: "¿Por qué me duele tanto la espalda antes del período?" → respuesta con chips de fuente → luego "¿tengo endometriosis?" → respuesta de no-diagnóstico + derivación | "Cora IA educa, cita los artículos de su propia biblioteca, y nunca diagnostica. Cuando le piden un diagnóstico, deriva a un profesional. Ese límite está implementado en cuatro capas, no en un párrafo del prompt." |
| 3:40–4:00 | Cierre | Resumen médico compartible | "Puede llevar un resumen a su consulta médica — con el aviso de que no es un diagnóstico siempre visible." |

## Reglas de oro

1. **Nunca escribir texto en vivo**, salvo la única cuenta nueva del
   onboarding. Cambiar de cuenta demo es cerrar sesión y volver a entrar con
   una de las 3 ya sembradas, no teclear datos de seguimiento.
2. **Las preguntas a la IA son las dos de arriba, ensayadas.** Improvisar
   es el mayor riesgo de la demo.
3. **La IA va al final.** Si falla, ya se mostró el resto del producto.
   Si el proveedor de IA falla o va lento, activar `EXPO_PUBLIC_AI_MOCK=true`
   (ver `.env.example`) antes de la demo — Cora IA sigue respondiendo con
   las mismas 2 preguntas ensayadas, con streaming simulado y citas reales,
   sin depender de la red del proveedor de IA.
4. **Modo avión 15 segundos** en la sección de seguimiento: registrar sin
   red y ver la sincronización al volver — momento fuerte y de bajo riesgo,
   ya verificado que no crashea (Fase 9).
5. **Video de respaldo grabado** — si el emulador se cuelga, se continúa
   con el video sin perder el ritmo.
6. **Una persona conduce, otra narra. La tercera vigila el reloj.**

## Preparación técnica antes de presentar

```text
□ Correr cora/supabase/seed/demo.sql contra el proyecto real (deja el
  estado idéntico sin importar cuántas veces se corra antes)
□ Verificar que las 3 cuentas demo abren sesión con DemoCora2026!
□ Sesión ya iniciada en la cuenta de partida (demo-adolescente, antes del
  onboarding en vivo con la cuenta nueva)
□ Notificaciones del sistema silenciadas en la laptop/emulador
□ Video de respaldo listo para abrir
□ Este documento impreso o en un segundo dispositivo
□ Ensayo cronometrado en voz alta × 3 — pendiente, es una acción humana
  que no se puede sustituir; el flujo ya está verificado funcionando de
  punta a punta (ver docs/PROGRESO.md, Fase 10)
```

## Sobre el build de release

El plan pide un APK de release instalado en el emulador (no el dev build
con Metro corriendo) para la presentación final. En este entorno de
desarrollo, `./gradlew assembleRelease` está bloqueado por la política de
Application Control de Windows del equipo (el mismo tipo de bloqueo que ya
impidió usar la CLI de Supabase en fases anteriores — ver `docs/PROGRESO.md`
Fase 10 para el detalle). El comando es correcto y debería completar sin
cambios en una máquina sin esa restricción:

```bash
cd cora/android
./gradlew assembleRelease
# APK en: cora/android/app/build/outputs/apk/release/app-release.apk
```

El release actual firma con el keystore de debug incluido por Expo
(`android/app/debug.keystore`) — suficiente para una demo en emulador, que
no se publica en ninguna tienda de aplicaciones.
