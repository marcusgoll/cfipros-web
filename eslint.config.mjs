import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'build/',
      'coverage/',
      '*.config.js',
      '*.config.mjs', // This will ignore eslint.config.mjs itself, which is usually intended.
      'src/lib/types/database.types.ts',
    ],
  },
  ...compat.config({
    extends: ['eslint-config-prettier', 'next/core-web-vitals', 'next/typescript'],
  }),
];

export default eslintConfig;
