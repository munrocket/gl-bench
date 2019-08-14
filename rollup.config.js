export default {
  input: 'src/gl-bench.js',
  output: [
    { file: "dist/gl-bench.cjs.js", format: 'cjs' },
    { file: "dist/gl-bench.js", name: 'GlBench', format: 'iife' }
  ]
}