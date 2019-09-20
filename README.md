# ⏱ gl-bench

Proper WebGL performance benchmark with GPU timers from `EXT_disjoint_timer_query` extension.

### Motivation
CPU timers are not synchronized with the graphics rendering pipeline and not guarantee the completion
of a potentially large amount of graphics work accumulated before the timer is read, and will thus produce
wildly inaccurate results. readPixels() can be used to determine when previous rendering commands have been
completed, but will idle the graphics pipeline and adversely affect application performance.

### Screenshots
![](https://habrastorage.org/webt/kf/ef/tk/kfeftk9mbebg7okddc5_i9qohjy.png)

### Basic usage
Add script on page from [jsdelivr](https://cdn.jsdelivr.net/npm/gl-bench/dist/gl-bench.min.js) or [unpkg](https://unpkg.com/gl-bench/dist/gl-bench.min.js) and wrap monitored code with begin/end marks
```javascript
let bench = new GLBench();
let gl = document.getElementsByTagName('canvas')[0].getContext('webgl');
bench.init(gl);

function draw(now) {  

  bench.begin();
  // monitored code
  bench.end();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Analysing performance

Steps in the diagram below may seem obvious, but beginners and experienced developers have in the past
made simple mistakes that have cost large amounts of development time to resolve. Developers tend
to run their analysis tools, identify a bottleneck, modify their application and consider the work done.
One of the most important stages of optimisation though is to verify the change has actually improved
performance. Without analysing performance after a modification, it's easy for new, and possibly
worse, bottlenecks to creep their way into a renderer.

<img align="center src="https://habrastorage.org/webt/rz/wc/rt/rzwcrtvknewotsdidh8il5bb080.png"/>

### Profiling with gl-bench

<img align="left" src="https://habrastorage.org/webt/i7/qp/m6/i7qpm6rbift4ho9v45doncekrte.png"/>

```javascript
let bench = new GLBench();
let gl = document.getElementsByTagName('canvas')[0].getContext('webgl');
bench.init(gl, 2); // <-- two boxes

function draw() {  

  bench.begin('wow');
  // some code
  bench.end('wow');

  bench.begin('such laggy');
  // some code
  bench.end('such laggy');

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Examples / e2e tests

- [cpu-fallback](https://munrocket.github.io/gl-bench/examples/cpu.html)
- [webgl](https://munrocket.github.io/gl-bench/examples/webgl.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)
- [named-measures](https://munrocket.github.io/gl-bench/examples/named-measures.html)

### Contributing

Fork this repository, install the dependencies and start dev server with `npm run dev`.
You can quickly verify code with unit/e2e tests on address `localhost:1234`.

### 2do list
- [x] update()
- [x] webgl2 support
- [x] ci tests
- [x] own ui
- [x] named measures
- [ ] further improvements

[//]: # (=== further improvements ===)
[//]: # (refactor gpu, workers, better ui, in one frame, emulate EXT)
