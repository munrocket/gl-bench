[![Bundlephobia](https://badgen.net/bundlephobia/minzip/gl-bench)](https://bundlephobia.com/result?p=gl-bench)
[![CircleCI](https://badgen.net/github/status/munrocket/gl-bench/master/ci)](https://circleci.com/gh/munrocket/gl-bench)
# gl-bench

WebGL performance monitor that showing percentage of GPU/CPU load.

### Motivation
This package was created in order to use EXT_disjoint_timer_query extension, but this extension
[was removed](https://caniuse.com/#search=EXT_disjoint_timer_query) from browsers due to the exploit.
Anyway after shifting to GPU tracking on CPU, it still can measure GPU/CPU load independently
and now have better device support.

### Screenshots
![](https://habrastorage.org/webt/dk/fc/xf/dkfcxfdlohm2pnr-w1yi_casnvw.png)

### Examples / e2e tests
- [webgl](https://munrocket.github.io/gl-bench/examples/webgl.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)
- [new-loggers](https://munrocket.github.io/gl-bench/examples/new-loggers.html)
- [named-measuring](https://munrocket.github.io/gl-bench/examples/named-measuring.html)
- [web-workers](https://munrocket.github.io/gl-bench/examples/web-workers.html)
- [instanced-arrays](https://munrocket.github.io/gl-bench/examples/web-workers.html)

### Basic usage
Add script on page from [npm](https://www.npmjs.com/package/gl-bench) or [jsdelivr](https://cdn.jsdelivr.net/npm/gl-bench/dist/gl-bench.min.js)/[unpkg](https://unpkg.com/gl-bench/dist/gl-bench.min.js) and wrap monitored code with begin/end marks
```javascript
let bench = new GLBench(renderer.getContext());

function draw(now) {
  bench.newFrame(now);

  bench.begin();
  // monitored code
  bench.end();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Profiling
```javascript
let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
let bench = new GLBench(gl);
//with instanced_arrays/draw_buffers webgl extensions engine initialization goes here

function draw(now) {
  bench.newFrame(now);

  bench.begin('wow');
  // some bottleneck
  bench.end('wow');

  bench.begin('such laggy');
  // some bottleneck
  bench.end('such laggy');

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### New themes and loggers
```javascript
let bench = new GLBench(gl, {
  css: 'newStyleString',
  svg: 'newDomString',
  paramLogger: (i, cpu, gpu, mem, fps, totalTime, frameId) => { console.log(cpu, gpu) },
  chartLogger: (i, chart, circularId) => { console.log('chart circular buffer=', chart) },
  withoutUI: true
};
```

### Contributing
Fork this repository and install the dependencies, after that you can start dev server with `npm run dev`
and open examples in browser `localhost:1234`.

[//]: # (gl = null, without rAF)
