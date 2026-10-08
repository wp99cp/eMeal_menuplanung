// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
    {
        ignores: ['lib/**', 'node_modules/**', 'eslint.config.js'],
    },
    {
        files: ['src/**/*.ts'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
        ],
        rules: {
            // the functions rely on lazily loaded dependencies and loosely typed firestore documents
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            // findings in the existing code, they should not block a deployment
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-case-declarations': 'warn',
            'no-unsafe-optional-chaining': 'warn',
            'prefer-const': 'warn',
            'no-async-promise-executor': 'warn',
        },
    }
);
