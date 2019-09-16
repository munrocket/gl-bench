# ⏱ gl-bench

WebGL performance benchmark with GPU timers from `EXT_disjoint_timer_query` extension.

### Motivation
CPU timers are not synchronized with the graphics rendering pipeline and not guarantee the completion of a potentially
large amount of graphics work accumulated before the timer is read, and will thus produce wildly inaccurate results.
readPixels() can be used to determine when previous rendering commands have been completed,
but will idle the graphics pipeline and adversely affect application performance.

### Screenshots
![](https://habrastorage.org/webt/so/mp/lj/sompljgylzi9y4nqm5cx221or9w.png)

### Usage
Add script from [jsdelivr](https://www.jsdelivr.com/package/npm/gl-bench) or [unpkg](https://unpkg.com/gl-bench) on your page and wrap monitored code with benchmark marks
```javascript
let bench = new GlBench();
function draw(now) {
  
  bench.begin();
  // monitored code
  bench.end();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

### Examples
- [cpu](https://munrocket.github.io/gl-bench/examples/cpu.html)
- [webgl1](https://munrocket.github.io/gl-bench/examples/webgl1.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)

### 2do list
- [x] update()
- [x] examples
- [x] webgl2 support
- [x] tests
- [x] measure into loop
- [x] own ui
- [ ] several measurements & better ui