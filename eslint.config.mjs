import { defineConfig, globalIgnores } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';


export default defineConfig(
    tseslint.configs.recommended,
    globalIgnores(['**/node_modules', '**/dist', '**/tests', '**/gulpfile.js', '**/*.js']),
    {
        rules: {
            '@typescript-eslint/no-explicit-any': "warn",
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/explicit-function-return-type': 2,
            '@typescript-eslint/no-inferrable-types': 0,
            '@typescript-eslint/no-var-requires': 0,
            '@typescript-eslint/no-duplicate-enum-values': 'off',
            '@typescript-eslint/no-this-alias': 'off',

            'max-lines-per-function': ['warn', {
                max: 30,
                skipBlankLines: true,
                skipComments: true,
                IIFEs: true,
            }],

            'max-depth': ['warn', {
                max: 4,
            }],

            'max-nested-callbacks': ['warn', 3],
            'max-params': ['warn', 5],
            'array-type': 'off',
            'member-ordering': 0,
            'arrow-parens': 2,

            'max-len': [2, {
                code: 120,
                ignorePattern: '^import .*',
                ignoreStrings: true,
                ignoreRegExpLiterals: true,
                ignoreTemplateLiterals: true,
                ignoreTrailingComments: true,
            }],

            'new-parens': 2,
            'no-control-regex': 'off',
            'no-bitwise': 0,
            'no-cond-assign': 2,
            'no-consecutive-blank-lines': 0,
            'no-useless-escape': 0,

            '@typescript-eslint/no-empty-function': [2, {
                allow: ['constructors'],
            }],

            quotes: [2, 'single'],
            'no-trailing-spaces': 2,
            'object-literal-sort-keys': [0],
            'ordered-imports': [0],
            'max-classes-per-file': 0,
            'no-string-literal': 0,
            'no-async-promise-executor': 0,
            'space-before-function-paren': 0,
            semi: 2,

            '@typescript-eslint/naming-convention': ['error', {
                selector: 'variable',
                format: ['camelCase', 'PascalCase'],
            }],

            eqeqeq: 2,
            'default-case': 2,
            'no-var': 2,
            'no-shadow-restricted-names': 2,
            'no-case-declarations': 0,
            'guard-for-in': 2,
            '@typescript-eslint/prefer-for-of': 2,
        },
    },
);