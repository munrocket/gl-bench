# ⏱ gl-bench

WebGL performance benchmark with GPU timers from `EXT_disjoint_timer_query` extension.

### Motivation
CPU timers are not synchronized with the graphics rendering pipeline and not guarantee the completion of a potentially
large amount of graphics work accumulated before the timer is read, and will thus produce wildly inaccurate results.
readPixels() can be used to determine when previous rendering commands have been completed,
but will idle the graphics pipeline and adversely affect application performance.

### Usage
```javascript
/* define loggers */
function fpsLogger(fps) {
  updateUI(fps);
}
function measureLogger(percent) {
  console.log(percent);
}

/* init benchmark */
let bench = new GlBench(fpsLogger, measureLogger);

function draw(now) {
  
  bench.begin();
  // monitored code
  bench.end();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Examples
- [webgl fps](https://munrocket.github.io/gl-bench/examples/webgl1-fps.html)
- [webgl measure](https://munrocket.github.io/gl-bench/examples/webgl1-measure.html)

### 2do list
- [x] update()
- [x] examples
- [x] webgl2 support
- [x] tests
- [x] measure into loop
- [ ] own ui
- [ ] several measurements