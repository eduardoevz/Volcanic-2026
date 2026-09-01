const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const i18nextPlugin = require('eslint-plugin-i18next');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    // Deno runtime (Edge Functions): usa especificadores npm:/import maps
    // que no resuelve el linter de Node — se revisa manualmente y en
    // ejecución real, no con este linter. (guardrails.ts es TS puro y corre
    // bajo Jest igual, ver docs/TESTING.md, pero se deja fuera del linter
    // de Node junto con el resto de la carpeta por consistencia.)
    ignores: ['dist/*', 'android/*', 'ios/*', 'supabase/functions/**'],
  },
  {
    files: ['jest.setup.js', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: { jest: 'readonly' },
    },
  },
  {
    // Fase 12 (docs/PLAN_DE_IMPLEMENTACION.md §29): evita regresiones de
    // strings en español escritos directo en JSX en vez de vía t().
    // `app/dev/**` queda afuera por ser una pantalla de desarrollo interna,
    // no UI de producción.
    files: ['app/**/*.tsx', 'src/features/**/*.tsx'],
    ignores: ['app/dev/**'],
    plugins: { i18next: i18nextPlugin },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: ['label', 'placeholder', 'title', 'description', 'message', 'accessibilityLabel'],
          },
          // Se parte de la lista default del plugin (símbolos, MAYÚSCULAS,
          // entidades HTML, emoji) y se agregan los patrones propios de esta
          // app: rutas de expo-router y tokens de formato de date-fns.
          words: {
            exclude: [
              '[0-9!-/:-@[-`{-~]+',
              '[A-Z_-]+',
              require('eslint-plugin-i18next/lib/options/htmlEntities'),
              /^[\p{Emoji}️]+$/u,
              /^\/.*/, // rutas de expo-router, ej. "/(auth)/login"
              /^(yyyy|dd|d|MMMM?|EEEE?E?)([-/ .](yyyy|dd|d|MMMM?|EEEE?E?))*$/, // tokens de formato date-fns
            ],
          },
          callees: {
            exclude: [
              'i18n(ext)?',
              't',
              'tStage',
              'require',
              'addEventListener',
              'removeEventListener',
              'postMessage',
              'getElementById',
              'dispatch',
              'commit',
              'includes',
              'indexOf',
              'endsWith',
              'startsWith',
              'format',
              'push',
              'replace',
            ],
          },
        },
      ],
    },
  },
];
