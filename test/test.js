import GLBench from '../dist/gl-bench.module.js';
import { test } from 'https://cdn.jsdelivr.net/npm/zora@3.0.3/dist/bundle/module.js';

// test('CPU', async (t) => {
//   let tfps = null, tcpu = null;
//   const bench = new GLBench(null, {
//     withoutUI: true,
//     paramLogger: (i, cpu, gpu, mem, fps) => {
//       tfps = fps;
//       tcpu = cpu;
//     }
//   });
//   for(let frameId = 0; frameId < 2; frameId++) {
//     bench.nextFrame(performance.now());
//     bench.begin();
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     bench.end();
//   }
//   t.ok(tfps != null, 'fps with measure = ' + (tfps != null ? tfps.toFixed(1) : 'null'));
//   t.ok(tfps != null, 'cpu measure = ' + (tcpu != null ? tcpu.toFixed(1) : 'null'));
// });

test('WebGL1', async (t) => {
  let tfps = null, tcpu = null, tgpu = null, tmem = null;
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(context, {
    withoutUI: true,
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tfps = fps;
      tcpu = cpu;
      tgpu = gpu;
      tmem = mem;
    }
  });
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.nextFrame(performance.now());
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end();
  }
  t.ok(tfps != null, 'fps = ' + (tfps != null ? tfps.toFixed(1) : 'null'));
  t.ok(tcpu != null, 'cpu = ' + (tcpu != null ? tcpu.toFixed(1) : 'null'));
  t.ok(tgpu != null, 'gpu = ' + (tgpu != null ? tgpu.toFixed(1) : 'null'));
  t.ok(tmem != null, 'mem = ' + (tmem != null ? tmem.toFixed(1) : 'null'));
});

test('WebGL2', async (t) => {
  let tfps = null, tcpu = null, tgpu = null, tmem = null;
  const canvas = document.querySelectorAll('canvas')[1];
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(context, {
    withoutUI: true,
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tfps = fps;
      tcpu = cpu;
      tgpu = gpu;
      tmem = mem;
    }
  });
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.nextFrame(performance.now());
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end();
  }
  t.ok(tfps != null, 'fps = ' + (tfps != null ? tfps.toFixed(1) : 'null'));
  t.ok(tcpu != null, 'cpu = ' + (tcpu != null ? tcpu.toFixed(1) : 'null'));
  t.ok(tgpu != null, 'gpu = ' + (tgpu != null ? tgpu.toFixed(1) : 'null'));
  t.ok(tmem != null, 'mem = ' + (tmem != null ? tmem.toFixed(1) : 'null'));
});
  
test('UI', async (t) => {
  let tfps = null, tcpu = null, tgpu = null, tmem = null;
  const canvas = document.querySelectorAll('canvas')[2];
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(context, {
    paramLogger: (i, cpu, gpu, mem, fps) => {
      tfps = fps;
      tcpu = cpu;
      tgpu = gpu;
      tmem = mem;
    }
  });
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.nextFrame(performance.now());
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
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
