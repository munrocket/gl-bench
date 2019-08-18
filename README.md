# ⏱ gl-bench

WebGL performance benchmark with GPU timers from `EXT_disjoint_timer_query` extension.

### Motivation
CPU timers are not synchronized with the graphics rendering pipeline and not guarantee the completion of a potentially
large amount of graphics work accumulated before the timer is read, and will thus produce wildly inaccurate results.
glFinish() or readPixels() can be used to determine when previous rendering commands have been completed,
but will idle the graphics pipeline and adversely affect application performance.

### Usage
```
/* define loggers */
function fpsLogger(fps) {
  updateUI(fps);
}
function mesureLogger(percent) {
  console.log(percent);
}

/* init benchmark */
let bench = new GlBench(fpsLogger, mesureLogger);

function draw(now) {

  // ...some other code in loop

  bench.begin();
  // < monitored code >
  bench.end();

  // ...some other code in loop

  bench.update();
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Examples
- [webgl fps](https://munrocket.github.io/gl-bench/examples/fps-webgl1.html)
- [other examples](https://munrocket.github.io/gl-bench/examples/)

### 2do list
- [x] update()
- [x] examples
- [x] webgl2 support
- [ ] mesure into loop
- [ ] tests
- [ ] deal with GLuint64EXT
- [ ] own ui