import GLBench from '../dist/gl-bench.module.js';
import { test } from 'https://cdn.jsdelivr.net/npm/zora@3.0.3/dist/bundle/module.js';

function drawTriangle(canvas, gl) {
  gl.viewport(0,0,canvas.width,canvas.height);
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, 'attribute vec3 c;void main(void){gl_Position=vec4(c, 1.0);}');
  gl.compileShader(vertShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, 'void main(void){gl_FragColor=vec4(0,1,1,1);}');
  gl.compileShader(fragShader);
  const prog = gl.createProgram();
  gl.attachShader(prog, vertShader);
  gl.attachShader(prog, fragShader);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const vertexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -0.5,0.5,0.0,  -0.5,-0.5,0.0,  0.5,-0.5,0.0 ]), gl.STATIC_DRAW);
  const coord = gl.getAttribLocation(prog, "c");
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

test('CPU', async (t) => {
  let tfps = null, tcpu = null;
  const bench = new GLBench(null, {
    withoutUI: true,
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tfps = fps;
      tcpu = cpu;
    }
  });
  for(let frameId = 0; frameId < 25; frameId++) {
    bench.nextFrame();
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 100));
    bench.end();
  }
  t.ok(tfps != null, 'fps = ' + (tfps != null ? tfps.toFixed(1) : 'null'));
  t.ok(tcpu != null, 'cpu = ' + (tcpu != null ? tcpu.toFixed(1) : 'null'));
});

test('Memory', async (t) => {
  let tmem = null;
  const bench = new GLBench(null, {
    withoutUI: true,
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tmem = mem;
    }
  });
  for(let frameId = 0; frameId < 25; frameId++) {
    bench.nextFrame();
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 100));
    bench.end();
  }
  t.ok(tmem != null, 'mem = ' + (tmem != null ? tmem.toFixed(1) : 'null'));
});

test('WebGL1', async (t) => {
  let tfps = null, tcpu = null, tgpu = null;
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(gl, {
    trackGPU: true,
    withoutUI: true,
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tfps = fps;
      tcpu = cpu;
      tgpu = gpu;
    }
  });
  for(let frameId = 0; frameId < 100; frameId++) {
    bench.nextFrame();
    bench.begin();
    drawTriangle(canvas, gl);
    await new Promise(resolve => setTimeout(resolve, 30));
    bench.end();
  }
  t.ok(tfps != null, 'fps = ' + (tfps != null ? tfps.toFixed(1) : 'null'));
  t.ok(tcpu != null, 'cpu = ' + (tcpu != null ? tcpu.toFixed(1) : 'null'));
  t.ok(tgpu != null, 'gpu = ' + (tgpu != null ? tgpu.toFixed(1) : 'null'));
});

test('WebGL2', async (t) => {
  let tfps = null, tcpu = null, tgpu = null;
  const canvas = document.querySelectorAll('canvas')[1];
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(gl, {
    trackGPU: true,
    withoutUI: true,
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tfps = fps;
      tcpu = cpu;
      tgpu = gpu;
    }
  });
  for(let frameId = 0; frameId < 100; frameId++) {
    bench.nextFrame();
    bench.begin();
    drawTriangle(canvas, gl);
    await new Promise(resolve => setTimeout(resolve, 30));
    bench.end();
  }
  t.ok(tfps != null, 'fps = ' + (tfps != null ? tfps.toFixed(1) : 'null'));
  t.ok(tcpu != null, 'cpu = ' + (tcpu != null ? tcpu.toFixed(1) : 'null'));
  t.ok(tgpu != null, 'gpu = ' + (tgpu != null ? tgpu.toFixed(1) : 'null'));
});
  
test('UI', async (t) => {
  let tfps = null, tcpu = null, tgpu = null, tmem = null;
  const canvas = document.querySelectorAll('canvas')[2];
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(gl, {
    trackGPU: true,
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tfps = fps;
      tcpu = cpu;
      tgpu = gpu;
      tmem = mem;
    }
  });
  for(let frameId = 0; frameId < 100; frameId++) {
    bench.nextFrame();
    bench.begin();
    drawTriangle(canvas, gl);
    await new Promise(resolve => setTimeout(resolve, 30));
    bench.end();
  }
  let fpsUI = null, cpuUI = null, gpuUI = null, memUI = null;
  const benchNode = document.querySelector('#gl-bench');
  if (benchNode) fpsUI = benchNode.querySelector('.gl-fps');
  if (benchNode) cpuUI = benchNode.querySelector('.gl-cpu');
  if (benchNode) gpuUI = benchNode.querySelector('.gl-gpu');
  if (benchNode) memUI = benchNode.querySelector('.gl-mem');
  if (fpsUI) fpsUI = fpsUI.innerHTML;
  if (cpuUI) cpuUI = cpuUI.style.strokeDasharray;
  if (gpuUI) gpuUI = gpuUI.style.strokeDasharray;
  if (memUI) memUI = memUI.innerHTML;
  t.ok(fpsUI != null, 'fps ui = ' + fpsUI);
  t.ok(cpuUI != null, 'cpu ui = ' + cpuUI);
  t.ok(gpuUI != null, 'gpu ui = ' + gpuUI);
  t.ok(memUI != null, 'mem ui = ' + memUI);
  t.ok(tfps != null, 'fps = ' + (tfps != null ? tfps.toFixed(1) : 'null'));
  t.ok(tcpu != null, 'cpu = ' + (tcpu != null ? tcpu.toFixed(1) : 'null'));
  t.ok(tgpu != null, 'gpu = ' + (tgpu != null ? tgpu.toFixed(1) : 'null'));
  t.ok(tmem != null, 'mem = ' + (tmem != null ? tmem.toFixed(1) : 'null'));
});
