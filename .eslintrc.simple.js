// Configuration ESLint simplifiée pour éviter les problèmes de dépendances
module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-undef': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    'coverage/',
    'rollup.config.js'
  ]
};




