import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    'dist/',
    'public/',
    'next-env.d.ts',
    'scripts/',
    '.env*',
  ]),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            [
              '^react',
              '^@?\\w',
              '^assets/',
              '^test/',
              '^configs/',
              '^services/',
              '^routes/',
              '^api/',
              '^store/',
              '^contexts/',
              '^hooks/',
              '^types/',
              '^interfaces/',
              '^constants/',
              '^helpers/',
              '^utils/',
              '^components/',
              '^styles/',
              '^\\.',
              '^\\.\\.',
              '\\.css',
            ],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
])
