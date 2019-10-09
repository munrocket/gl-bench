# gl-bench [![Bundlephobia](https://badgen.net/bundlephobia/minzip/gl-bench)](https://bundlephobia.com/result?p=gl-bench) [![CircleCI](https://badgen.net/github/status/munrocket/gl-bench)](https://circleci.com/gh/munrocket/gl-bench)

WebGL performance monitor that showing percentage of GPU/CPU load.

### Screenshots
![](https://habrastorage.org/webt/vb/ys/pz/vbyspz0emcxkslj0c-u0toxbom0.png)

### Examples / e2e tests
- [webgl](https://munrocket.github.io/gl-bench/examples/webgl.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)
- [new-loggers](https://munrocket.github.io/gl-bench/examples/new-loggers.html)
- [named-measuring](https://munrocket.github.io/gl-bench/examples/named-measuring.html)
- [instanced-arrays](https://munrocket.github.io/gl-bench/examples/web-workers.html)
- [web-workers](https://munrocket.github.io/gl-bench/examples/web-workers.html)

### Comparison table
|                        Pros                                  |             Cons               |
|--------------------------------------------------------------|--------------------------------|
| GPU percentage load                                          | Shipped only with ES6 classes  |
| Cool themes and loggers                                      | Size not so tiny               |
| It is faster than Stats.js even if chart is updated at 20 hz |                                |
| Chart show significant performance drop or inactive page     |                                |
| Two and more measuring in one loop                           |                                |
| Web workers support                                          |                                |
| Support for devices with 120+ FPS                            |                                |

### Usage
Add script on page from [npm](https://www.npmjs.com/package/gl-bench) or [jsdelivr](https://cdn.jsdelivr.net/npm/gl-bench/dist/gl-bench.min.js)/[unpkg](https://unpkg.com/gl-bench/dist/gl-bench.min.js) and wrap monitored code with begin/end marks
```javascript
let bench = new GLBench(renderer.getContext());

function draw(now) {
  bench.begin();
  // monitored code
  bench.end();

  bench.newFrame(now);
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

### Profiling
```javascript
let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
let bench = new GLBench(gl);

// engine initialization with instanced_arrays/draw_buffers webgl1 extensions goes after!

function draw(now) {
  bench.begin('wow');
  // some bottleneck
  bench.end('wow');

  bench.begin('such laggy');
  // some bottleneck
  bench.end('such laggy');

  bench.newFrame(now);
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Contributing
Fork this repository and install the dependencies, after that you can start dev server with `npm run dev`
and open examples in browser `localhost:1234`.