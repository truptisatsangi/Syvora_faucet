import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = await (async () => {
  const simpleImportSort = await import('eslint-plugin-simple-import-sort')
  const eslintPluginImport = await import('eslint-plugin-import')

  return [
    ...compat.extends(
      'next/core-web-vitals',
      'next/typescript',
      'plugin:import/recommended',
      'plugin:import/typescript'
    ),
    {
      plugins: {
        'simple-import-sort': simpleImportSort.default,
        import: eslintPluginImport.default
      },
      rules: {
        'simple-import-sort/imports': 'warn',
        'simple-import-sort/exports': 'warn',

        'import/order': [
          'warn',
          {
            groups: [
              ['builtin', 'external'],
              ['internal', 'parent', 'sibling', 'index', 'type']
            ],
            alphabetize: {
              order: 'asc',
              caseInsensitive: true
            },
            'newlines-between': 'always'
          }
        ],

        '@typescript-eslint/no-require-imports': 'error'
      }
    }
  ]
})()

export default eslintConfig
