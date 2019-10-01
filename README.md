[![Bundlephobia](https://badgen.net/bundlephobia/min/gl-bench)](https://bundlephobia.com/result?p=gl-bench)
[![CircleCI](https://badgen.net/github/status/munrocket/gl-bench/master/ci)](https://circleci.com/gh/munrocket/gl-bench)

# ⏱ gl-bench

WebGL performance monitor that showing percentage of GPU/CPU load

### Motivation
This package was created in order to use EXT_disjoint_timer_query extension, but this extension
[was removed](https://caniuse.com/#search=EXT_disjoint_timer_query) from browsers due to the exploit,
strange but it still working on some machines. Version 2 of this package tracks GPU calls on the CPU.

### Screenshots
![](https://habrastorage.org/webt/t1/xc/wu/t1xcwu802qy4c0wt1ioormzpudq.png)

### Examples / e2e tests
- [webgl](https://munrocket.github.io/gl-bench/examples/webgl.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)
- [named-measuring](https://munrocket.github.io/gl-bench/examples/named-measuring.html)
- [new-loggers](https://munrocket.github.io/gl-bench/examples/new-loggers.html)
- [web-workers](https://munrocket.github.io/gl-bench/examples/web-workers.html)

### Basic usage
Add script on page from NPM or CDN([jsdelivr](https://cdn.jsdelivr.net/npm/gl-bench/dist/gl-bench.min.js),
[unpkg](https://unpkg.com/gl-bench/dist/gl-bench.min.js)) and wrap monitored code with begin/end marks
```javascript
let gl = document.querySelector('canvas').getContext('webgl');
let bench = new GLBench(gl);

function draw(now) {

  bench.begin();
  // monitored code
  bench.end();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Profiling
```javascript
let gl = document.querySelector('canvas').getContext('webgl');
let bench = new GLBench(gl);

function draw() {  

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

[//]: # (### Contributing)
[//]: # (If you want to contribute to a project, fork this repository and install the dependencies,)
[//]: # (after that you can start dev server with `npm run dev` and open examples in browser `localhost:1234`)
[//]: # (or run `npm run test`.)

[//]: # (without rAF, better ui)
