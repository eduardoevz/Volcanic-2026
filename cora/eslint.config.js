const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    // Deno runtime (Edge Functions): usa especificadores npm:/import maps
    // que no resuelve el linter de Node — se revisa manualmente y en
    // ejecución real, no con este linter.
    ignores: ['dist/*', 'android/*', 'ios/*', 'supabase/functions/**'],
  },
];
