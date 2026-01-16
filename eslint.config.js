const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
  {
    ignores: [],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: js.configs.recommended.rules,
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: js.configs.recommended.rules,
  },
];
