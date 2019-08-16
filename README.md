# ⏱ gl-bench

WebGL performance benchmark with GPU timers from `EXT_disjoint_timer_query` extension.

### Motivation
CPU timers are not synchronized with the graphics rendering pipeline and not guarantee the completion of a potentially
large amount of graphics work accumulated before the timer is read, and will thus produce wildly inaccurate results.
glFinish() or readPixels() can be used to determine when previous rendering commands have been completed,
but will idle the graphics pipeline and adversely affect application performance.

### Usage
```
/* define logger */
function logger(fps) {
  updateUI(fps); //console.log(fps);
}

/* init benchmark */
let bench = new GlBench(logger);

function step(timestamp) {
  /* update timer */
  bech.update();

  // ...some monitored code

  requestAnimationFrame(step);
}
requestAnimationFrame(step);
```

### Examples
- [webgl1 fps](https://munrocket.github.io/gl-bench/examples/fps-webgl1.html)
- [webgl2 fps](https://munrocket.github.io/gl-bench/examples/fps-webgl1.html)

### 2do list
- [x] update()
- [x] examples
- [x] webgl2 support
- [ ] begin/end into query
- [ ] deal with GLuint64EXT
- [ ] own ui