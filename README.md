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
Add script on page from CDN ([jsdelivr](https://cdn.jsdelivr.net/npm/gl-bench/dist/gl-bench.min.js), [unpkg](https://unpkg.com/gl-bench/dist/gl-bench.min.js)) and wrap monitored code with begin/end marks
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

### Performance analysis
Steps in the diagram below may seem obvious, but beginners and experienced developers have in the past
made simple mistakes that have cost large amounts of development time to resolve. Developers tend
to run their analysis tools, identify a bottleneck, modify their application and consider the work done.
One of the most important stages of optimisation though is to verify the change has actually improved
performance. Without analysing performance after a modification, it's easy for new, and possibly
worse, bottlenecks to creep their way into a renderer.
<p align="center">
<img align="center" src="https://habrastorage.org/webt/su/ua/8_/suua8_j95osi16-6bs6jqcfiwoa.jpeg"/>
</p>

### Profiling with gl-bench
```javascript
let bench = new GLBench();
let gl = document.getElementsByTagName('canvas')[0].getContext('webgl');
bench.init(gl, 2); // <-- init two boxes

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
![](https://habrastorage.org/webt/pf/hu/gx/pfhugxwkz0z4knd8tczrs9r6h4c.png)

### Examples / e2e tests
- [webgl](https://munrocket.github.io/gl-bench/examples/webgl.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)
- [named-measuring](https://munrocket.github.io/gl-bench/examples/named-measuring.html)

### Contributing
If you want to contribute to a project, fork this repository and install the dependencies,
after that you can start dev server with `npm run dev` and open examples in browser `localhost:1234`
or run `npm run test`.

[//]: # (=== further improvements ===)
[//]: # (workers, better ui, in one frame, emulate EXT)
