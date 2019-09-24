import closure from '@ampproject/rollup-plugin-closure-compiler';
import pkg from './package.json';
import { string } from 'rollup-plugin-string';

export default [
  {
    input: 'src/index',
    output: [
      { file: pkg.browser, name: 'GLBench', format: 'umd' },
      { file: pkg.module, name: 'GLBench', format: 'module', sourcemap: 'inline' },
    ],
    plugins: [ string({ include: ['**/*.svg', '**/*.css'] }) ]
  },
  {
    input: 'src/index',
    output: { file: pkg.main, name: 'GLBench', format: 'iife' },
    plugins: [ string({ include: ['**/*.svg', '**/*.css'] }), closure() ]
  }
]