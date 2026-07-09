module.exports = {
  root: true,
  env: {
    es2022: true,
  },
  ignorePatterns: ['node_modules/', 'client/dist/', 'server/uploads/'],
  overrides: [
    {
      files: ['server/**/*.js'],
      env: { node: true, commonjs: true },
      extends: ['eslint:recommended'],
      rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', args: 'none' }],
        'no-console': 'off',
      },
    },
    {
      files: ['client/src/**/*.{js,jsx}', 'client/e2e/**/*.js', 'client/*.js'],
      env: { browser: true, es2022: true },
      extends: ['eslint:recommended'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      rules: {
        'no-unused-vars': 'off',
      },
    },
  ],
};
