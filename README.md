# gl-bench [![Bundlephobia](https://badgen.net/bundlephobia/minzip/gl-bench)](https://bundlephobia.com/result?p=gl-bench) [![CircleCI](https://badgen.net/github/status/munrocket/gl-bench)](https://circleci.com/gh/munrocket/gl-bench) [![Codecov](https://img.shields.io/codecov/c/github/munrocket/gl-bench.svg)](https://codecov.io/gh/munrocket/gl-bench)

WebGL performance monitor that showing percentage of GPU/CPU load.

### Screenshots
![](https://habrastorage.org/webt/vb/ys/pz/vbyspz0emcxkslj0c-u0toxbom0.png)

### Examples / e2e tests
- [webgl](https://munsocket.github.io/gl-bench/examples/webgl.html)
- [webgl2](https://munsocket.github.io/gl-bench/examples/webgl2.html)
- [new-loggers](https://munsocket.github.io/gl-bench/examples/new-loggers.html)
- [named-measuring](https://munsocket.github.io/gl-bench/examples/named-measuring.html)
- [instanced-arrays](https://munsocket.github.io/gl-bench/examples/instanced-arrays.html)
- [float-textures](https://munsocket.github.io/gl-bench/examples/float-textures.html)
- [web-workers](https://munsocket.github.io/gl-bench/examples/web-workers.html)

### Pros and cons
|                        Pros                                      |             Cons                         |
|------------------------------------------------------------------|------------------------------------------|
| CPU/GPU percentage load                                          | Shipped only with ES6 classes            |
| Cool themes and loggers                                          | Size not so tiny                         |
| Chart show inactive page or significant performance drop         |                                          |
| Two and more measuring in one loop                               |                                          |
| Support for devices with 120+ FPS                                |                                          |
| Web workers support                                              |                                          |
| Typescript support                                               |                                          | 
| It is 2x faster than Stats.js in Chrome accorging to stress test |                                          |

### How it works
For GPU/CPU synchronization I am use gl.getError(), it is better than gl.readPixels() at least for me. Code is asynchronous and not stall rendering pipeline by hitting CPU limit due to waiting GPU answer, so you can calculate your heavy physics on CPU with this monitor. If you want turn off GPU tracking just press on it with one click. Check online examples/e2e tests to find out how it works. Version 1 used the EXT_disjoint_timer_query extension, but it [not supported](https://caniuse.com/#search=disjoint_timer_query) on some pc anymore.

### Usage with Three.js
Add script on page from [npm](https://www.npmjs.com/package/gl-bench) or [jsdelivr](https://cdn.jsdelivr.net/npm/gl-bench/dist/gl-bench.min.js)/[unpkg](https://unpkg.com/gl-bench/dist/gl-bench.min.js) and wrap monitored code with begin/end marks
```javascript
import GLBench from 'gl-bench/dist/gl-bench';
let bench = new GLBench(renderer.getContext());

function draw(now) {
  bench.begin();
  // monitored code
  bench.end();
  bench.nextFrame(now);
}

renderer.setAnimationLoop((now) => draw(now));
```

### Using TypeScript
Replace ``import GLBench from 'gl-bench/dist/gl-bench';`` into ``import GLBench from 'gl-bench/dist/gl-bench.module';``

### Profiling with another WebGL frameworks
```javascript
let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
let bench = new GLBench(gl);

// engine initialization with instanced_arrays/draw_buffers webgl1 extensions goes after!

function draw(now) {
  bench.begin('first measure');
  // some bottleneck
  bench.end('first measure');

  bench.begin('second measure');
  // some bottleneck
  bench.end('second measure');

  bench.nextFrame(now);
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Custom settings
```javascript
let bench = new GLBench(gl, {
  css: 'newStyleString',
  svg: 'newSvgString',
  dom: newDomContainer,
  withoutUI: false,
  trackGPU: false,      // don't track GPU load by default
  chartHz: 20,          // chart update speed
  chartLen: 20,
  paramLogger: (i, cpu, gpu, mem, fps, totalTime, frameId) => { console.log(cpu, gpu) },
  chartLogger: (i, chart, circularId) => { console.log('chart circular buffer=', chart) },
};
```

### Contributing
Fork this repository and install the dependencies, after that you can start dev server with `npm run dev`
and open examples in browser `localhost:1234`.

[//]: # (posible optimizations: delete array clone, get rid of self)
