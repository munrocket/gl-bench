import closure from '@ampproject/rollup-plugin-closure-compiler';
import pkg from './package.json';
import { string } from 'rollup-plugin-string';

export default [
  {
    input: 'src/index',
    output: [
      { file: pkg.main, name: 'GlBench', format: 'iife' },
      { file: pkg.module, name: 'GlBench', format: 'module', sourcemap: 'inline' },
    ],
    plugins: [ string({ include: ['**/*.svg', '**/*.css'] }) ]
  },
  {
    input: 'src/index',
    output: { file: pkg.minimized, name: 'GlBench', format: 'iife' },
    plugins: [ string({ include: ['**/*.svg', '**/*.css'] }), closure() ]
  }
]