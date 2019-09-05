import closure from '@ampproject/rollup-plugin-closure-compiler';
import pkg from './package.json';

export default [
  {
    input: 'src/index',
    output: [
      { file: pkg.main, name: 'GlBench', format: 'iife' },
      { file: pkg.module, name: 'GlBench', format: 'module' },
    ]
  },
  {
    input: 'src/index',
    output: { file: pkg.minimized, name: 'GlBench', format: 'iife' },
    plugins: [ closure() ]
  }
]