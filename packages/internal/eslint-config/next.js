/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'turbo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@next/next/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  env: {
    es2022: true,
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  globals: {
    React: 'writable',
  },
  settings: {
    react: { version: 'detect' },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {},
  ignorePatterns: [
    'node_modules/',
    'dist',
    '*.js',
    '*.mjs',
    '*.d.ts',
    '*.d.mts',
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // TODO: Work on removing the need for these rules
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    // '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
  },
};
