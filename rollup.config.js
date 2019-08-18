import closure from '@ampproject/rollup-plugin-closure-compiler';
import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, name: 'GlBench', format: 'esm' },
      { file: pkg.browser, name: 'GlBench', format: 'iife' }
    ]
  },
  {
    input: 'src/index.js',
    output: { file: 'gl-bench.min.js', name: 'GlBench', format: 'iife' },
    plugins: [ closure() ]
  }
]