# gl-bench

WebGL performance benchmark with GPU timers from `EXT_disjoint_timer_query` extension.
It has fallback to CPU timers but they are not synchronized with the graphics rendering pipeline.

### Usage
```
// init without passing canvas
let bench = new GlBench(fps => updateUI(fps));

function step(timestamp) {
  // update timer
  bech.update();

  // ...some monitored code

  requestAnimationFrame(step);
}
requestAnimationFrame(step);

```

### 2do list
-[x] update()
-[x] examples
-[x] webgl2 support
-[ ] begin()+end()
-[ ] own ui