[![Bundlephobia](https://badgen.net/bundlephobia/min/gl-bench)](https://bundlephobia.com/result?p=gl-bench)
[![CircleCI](https://badgen.net/github/status/munrocket/gl-bench/master/ci)](https://circleci.com/gh/munrocket/gl-bench)

# ⏱ gl-bench

WebGL performance monitor that showing percentage of GPU/CPU load.

### Motivation
This package was created in order to use EXT_disjoint_timer_query extension, but this extension
[was removed](https://caniuse.com/#search=EXT_disjoint_timer_query) from browsers due to the exploit.
Anyway after shifting to GPU tracking on CPU, it still can measure GPU/CPU load independently
and now have better device support.

### Screenshots
![](https://habrastorage.org/webt/t1/xc/wu/t1xcwu802qy4c0wt1ioormzpudq.png)

### Examples / e2e tests
- [webgl](https://munrocket.github.io/gl-bench/examples/webgl.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)
- [new-loggers](https://munrocket.github.io/gl-bench/examples/new-loggers.html)
- [named-measuring](https://munrocket.github.io/gl-bench/examples/named-measuring.html)
- [web-workers](https://munrocket.github.io/gl-bench/examples/web-workers.html)

### Basic usage
Add script on page from NPM or CDN([jsdelivr](https://cdn.jsdelivr.net/npm/gl-bench/dist/gl-bench.min.js),
[unpkg](https://unpkg.com/gl-bench/dist/gl-bench.min.js)) and wrap monitored code with begin/end marks
```javascript
let gl = renderer.getContext();
let bench = new GLBench(gl);

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
let gl = renderer.getContext();
let bench = new GLBench(gl);

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

### Changing settings
```
let bench = new GLBench(gl, {
  css: newStyle,
  svg: newDom,
  paramLogger: () => {},
  chartLogger: () => {},
  withoutUI: true
};
```

### Contributing
Fork this repository and install the dependencies, after that you can start dev server with `npm run dev`
and open examples in browser `localhost:1234`. Also you can open issue.

[//]: # (track instanced arrays, optimize code size, gl = null, without rAF)
