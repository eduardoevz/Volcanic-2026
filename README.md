<div align="center">

  <img src="assets/logo.png" alt="Logo Acompáñame" width="140" height="140" />

  # 🌸 Acompáñame
  **Plataforma móvil integral para el acompañamiento y autocuidado de la mujer en todas sus etapas de vida.**

  [![Hackathon Nicaragua 2026](https://img.shields.io/badge/Hackathon_Nicaragua-2026-blueviolet?style=for-the-badge)](https://hackathonnicaragua.com.ni/)
  [![Categoría](https://img.shields.io/badge/Categoría-Aficionado-orange?style=for-the-badge)](#)
  [![Temática](https://img.shields.io/badge/Temática-Salud-red?style=for-the-badge)](#)

</div>

---

## 📌 Sobre el Reto

* **Nombre del Reto:** Aplicación móvil para el acompañamiento integral a mujeres.
* **Problema:** Existencia de brechas de información, mitos y falta de soluciones tecnológicas integrales adaptadas al contexto local y lenguas originarias que acompañen la salud de la mujer (menstruación, embarazo y menopausia).
* **Solución:** **Acompáñame** es una solución móvil inclusiva que combina seguimiento de salud por etapas, educación multilingüe (Español/Miskito/Mayangna), orientación asistida por IA y módulos de acompañamiento para la familia.

---

## 🎯 Estrategia y Marketing

* **Propuesta Única de Valor:** Acompañamiento continuo en una sola app para todas las etapas de la mujer, adaptada al contexto multicultural de Nicaragua con soporte offline y en lenguas originarias.
* **Público Objetivo:** Mujeres adolescentes, adultas, adultas mayores y sus familias en comunidades urbanas y rurales.

---

## 🛠️ Stack Tecnológico

* **Frontend Mobile / Web:** React / Next.js (o React Native / Flutter para entorno móvil).
* **Backend:** Python (FastAPI / Flask) con arquitectura RESTful.
* **Base de Datos:** PostgreSQL / SQL Server para registro de usuarios y métricas de salud.
* **IA & Lenguaje:** Integración de API de IA entrenada con base de conocimiento médica oficial y motor de audio para lenguas originarias.

---

## 👥 Equipo de Trabajo

| Rol | Integrante | Responsabilidad |
| :--- | :--- | :--- |
| **PM & Documentación** | Integrante 1 | Gestión Trello, Lean Canvas, Pitch y README |
| **Backend & BD** | Integrante 2 | API, Base de Datos y Lógica de Negocio |
| **Frontend Mobile** | Integrante 3 | Desarrollo de Interfaces y UX Responsivo |
| **Diseño UX/UI** | Integrante 4 | Figma, Branding, Logo y Manual de Marca |
| **Marketing & Contenido** | Integrante 5 | Buyer Persona, Traducciones y Video Demo |

---

## 🚀 Cómo correr la app (Android Studio / emulador)

La app vive en la carpeta `cora/` (Expo + React Native). Las carpetas nativas
`android/` e `ios/` **no están versionadas** (se generan localmente), así que
hace falta un paso de `prebuild` antes de abrir el proyecto en Android Studio.

1. **Clonar e instalar dependencias**
   ```bash
   git clone https://github.com/eduardoevz/Volcanic-2026.git
   cd Volcanic-2026/cora
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Editar `.env.local` y completar `EXPO_PUBLIC_SUPABASE_URL` y
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` con las credenciales del proyecto de
   Supabase (pedirlas al equipo — no se suben al repo por seguridad).

3. **Generar el proyecto nativo de Android**
   ```bash
   npx expo prebuild
   ```
   Esto crea la carpeta `android/` a partir de `app.json`.

4. **Abrir en Android Studio**
   - Abrir Android Studio → *Open* → seleccionar la carpeta `cora/android`.
   - Levantar un emulador (AVD Manager) o conectar un dispositivo físico con
     depuración USB activada.

5. **Ejecutar la app**
   - Desde Android Studio: botón ▶️ Run, o
   - Desde terminal (más rápido, hace build + instala + abre Metro):
     ```bash
     npx expo run:android
     ```

6. **Otros comandos útiles** (dentro de `cora/`)
   ```bash
   npm run start   # solo Metro bundler (requiere dev client ya instalado)
   npm run lint    # eslint
   npm test        # jest
   npx tsc --noEmit  # chequeo de tipos
   ```

> Nota: si `EXPO_PUBLIC_AI_MOCK=true` está activo en `.env.local`, Cora IA
> responde con respuestas pregrabadas en vez de llamar a la Edge Function
> (ver `.env.example`) — útil si el proveedor de IA falla o va lento.
