# Interfaz y Desarrollo — Cora

**Hackathon Nicaragua 2026 — Entregable "Interfaz y Desarrollo"**

> Evidencia real de navegación: capturas tomadas ejecutando la app Cora (Expo + React Native) en
> un emulador Android, con Metro Bundler corriendo en vivo contra el proyecto de Supabase real —
> no son mockups estáticos de diseño. Se registró una cuenta nueva (`hackathon.demo2026@cora.test`)
> y se completó el flujo completo desde cero: bienvenida, registro, onboarding de 7 pasos, y las
> pantallas principales de la app ya autenticada. Repositorio completo:
> https://github.com/eduardoevz/Volcanic-2026

## Resumen del flujo probado

| # | Pantalla | Qué se comprobó |
| --- | --- | --- |
| 1 | Bienvenida | Navegación inicial funcional |
| 2 | Inicio de sesión | Formulario de login con campos reales |
| 3 | Crear cuenta | Registro funcional con validación de formato de correo y contraseña |
| 4 | Onboarding — Etapa de vida | Selección funcional, define personalización de toda la app |
| 5 | Onboarding — Últimos períodos | Selector de fecha (date picker) funcional en dos calendarios encadenados |
| 6 | Onboarding — Avatar | Grid seleccionable + hoja de detalle educativo sobre fauna nicaragüense |
| 7 | Onboarding — Antecedentes médicos | Formulario multi-campo + chips de selección única (tipo de sangre) |
| 8 | Onboarding — Privacidad y Cora IA | Switches funcionales, consentimiento explícito antes de continuar |
| 9 | Inicio (Home) | Datos reales de la cuenta recién creada: mascota, estado de ciclo, artículo recomendado |
| 10 | Calendario | Calendario de ciclo poblado con las fechas ingresadas en el onboarding |
| 11 | Biblioteca | Buscador y filtro de contenido educativo |
| 12 | Perfil | Ajustes de cuenta: privacidad, idioma, tema, accesos a submódulos |
| 13 | Directorio de salud | Filtros por tipo y departamento, carga de datos desde Supabase |

---

## 1. Bienvenida

Pantalla de entrada de la app, con la identidad visual de Cora y navegación hacia el flujo de
acceso.

![Bienvenida](img/01_welcome.png)

## 2. Inicio de sesión

Formulario de login con campos de correo y contraseña, recuperación de contraseña y acceso con
Google.

![Inicio de sesión](img/02_login.png)

## 3. Crear cuenta (registro funcional)

Formulario de registro real: se completó con un correo y una contraseña, y el botón "Registrarme"
se habilita solo cuando el formato es válido. Este formulario creó la cuenta de prueba usada para
todas las capturas siguientes.

![Registro](img/03_registro_form.png)

## 4. Onboarding — ¿En qué etapa estás? (Paso 2 de 7)

Selección de etapa de vida (Adolescencia, Adultez, Embarazo, Perimenopausia/Menopausia, Adultez
mayor). Esta elección redefine el contenido, el Home y el calendario de toda la cuenta.

![Selección de etapa de vida](img/04_onboarding_etapa.png)

## 5. Onboarding — Tus últimos períodos (Paso 3 de 7)

Dos selectores de fecha encadenados (inicio de la última regla e inicio de la regla anterior) más
un campo de duración de período, para que Cora pueda calcular predicciones desde el primer día.

![Selector de fechas de ciclo](img/05_onboarding_ciclos.png)

## 6. Onboarding — Elegí tu avatar (Paso 4 de 7)

Grid de 8 especies de fauna nicaragüense seleccionables. Cada una abre una hoja de detalle con
nombre científico, hábitat y estado de conservación antes de confirmar la elección.

![Selección de avatar con hoja de detalle](img/06_onboarding_avatar.png)

## 7. Onboarding — Antecedentes médicos (Paso 5 de 7)

Formulario opcional de alergias, antecedentes familiares, condiciones crónicas y medicamentos
actuales, más un selector de tipo de sangre por chips de selección única.

![Antecedentes médicos](img/07_onboarding_antecedentes.png)

## 8. Onboarding — Privacidad y Cora IA (Paso 7 de 7)

Último paso: switches funcionales para notificaciones y para compartir contexto con la IA
(apagado por defecto), con aviso explícito de que Cora no diagnostica ni sustituye atención médica.

![Privacidad y consentimiento](img/08_onboarding_privacidad.png)

## 9. Inicio (Home)

Al terminar el onboarding, la cuenta nueva llega a un Home ya personalizado: estado del ciclo,
chequeo de ánimo del día, progreso de la mascota "pitahaya" y un artículo recomendado real de la
biblioteca (Ley 779).

![Home tras completar el onboarding](img/09_home.png)

## 10. Calendario

El calendario de ciclo se pobló automáticamente con las fechas ingresadas en el onboarding
(período, fértil, ovulación estimada), con leyenda y acceso a estadísticas.

![Calendario de ciclo](img/10_calendario.png)

## 11. Biblioteca

Buscador funcional de artículos educativos con filtro por categoría.

![Biblioteca](img/11_biblioteca.png)

## 12. Perfil

Pantalla de ajustes de cuenta: switch de privacidad de IA, selector de idioma (Español/Miskitu/
Mayangna), selector de tema, y accesos a Resumen médico, Expediente médico, Recordatorios,
Directorio de salud, Círculo familiar y Agenda de citas.

![Perfil](img/12_perfil.png)

## 13. Directorio de salud

Listado de centros y especialistas de salud, con filtros funcionales por tipo de centro y por
departamento de Nicaragua, cargado en vivo desde la base de datos de Supabase.

![Directorio de salud](img/13_directorio.png)

---

## Estructura visual

Toda la app comparte un mismo sistema visual: paleta cálida (marfil, rosa malva, verde salvia,
terracota), tipografía consistente, tarjetas con esquinas redondeadas y sombra suave, y una barra
de navegación inferior fija con 5 pestañas (Inicio, Calendario, Biblioteca, Cora, Perfil) presente
en toda la sección autenticada de la app.
