# ⏱ gl-bench

Proper WebGL performance benchmark with GPU timers from `EXT_disjoint_timer_query` extension.

### Motivation
CPU timers are not synchronized with the graphics rendering pipeline and not guarantee the completion of a potentially
large amount of graphics work accumulated before the timer is read, and will thus produce wildly inaccurate results.
readPixels() can be used to determine when previous rendering commands have been completed,
but will idle the graphics pipeline and adversely affect application performance.

### Screenshots
![](https://habrastorage.org/webt/sj/_c/kl/sj_cklrwga2mhfzl6lt0cwvnhpe.png)

### Usage
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

Also you can compare two named measures and find bottleneck
<img align="right" src="https://habrastorage.org/webt/dj/7t/rc/dj7trcda4kry1k0btsxc7kbyn0k.png"/>

```javascript
let bench = new GLBench();
let gl = document.getElementsByTagName('canvas')[0].getContext('webgl');
bench.init(gl, 2);

function draw(now) {  

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

### Examples
- [cpu](https://munrocket.github.io/gl-bench/examples/cpu.html)
- [webgl1](https://munrocket.github.io/gl-bench/examples/webgl1.html)
- [webgl2](https://munrocket.github.io/gl-bench/examples/webgl2.html)
- [named-measures](https://munrocket.github.io/gl-bench/examples/named-measures.html)

### 2do list
- [x] update()
- [x] examples
- [x] webgl2 support
- [x] ci tests
- [x] begin()/end()
- [x] own ui
- [x] named measures
- [ ] further improvements

[//]: # refactor gpu, workers, better ui, in one frame, emulate EXT
