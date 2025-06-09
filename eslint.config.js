import vue from 'eslint-plugin-vue';

export default [
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: { vue },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended'
    ],
  },
];
