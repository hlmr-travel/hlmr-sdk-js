module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended'
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    node: true,
    browser: true,
    es2020: true,
    jest: true
  },
  rules: {
    // Règles ESLint de base
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-unused-vars': 'off', // Désactivé pour TypeScript
    
    // Règles TypeScript (seulement si le plugin est disponible)
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn'
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    'coverage/',
    'rollup.config.js'
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'eslint:recommended'
      ],
      rules: {
        // Règles spécifiques TypeScript
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    }
  ]
};
