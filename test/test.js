import GLBench from '../dist/gl-bench.module.js';
import { test } from 'https://cdn.jsdelivr.net/npm/zora@3.0.3/dist/bundle/module.js';

test('CPU', async (t) => {
  let fps = null, cpu = null;
  const bench = new GLBench(null, {
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x },
    withoutUI: true
  });
  for(let frameId = 0; frameId < 2; frameId++) {
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end();
  }
  t.ok(fps != null, 'fps with measure = ' + (fps != null ? fps.toFixed(1) : 'null'));
  t.ok(cpu != null, 'cpu measure = ' + (cpu != null ? cpu.toFixed(1) : 'null'));
});

test('WebGL1', async (t) => {
  let fps = null, cpu = null, gpu = null;
  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(context, {
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x },
    gpuLogger: x => { gpu = x },
    withoutUI: true
  });
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end();
  }
  t.ok(fps != null, 'fps = ' + (fps != null ? fps.toFixed(1) : 'null'));
  t.ok(cpu != null, 'cpu measure = ' + (cpu != null ? cpu.toFixed(1) : 'null'));
  t.ok(gpu != null, 'gpu measure = ' + (gpu != null ? gpu.toFixed(1) : 'null'));
});

test('WebGL2', async (t) => {
  let fps = null, cpu = null, gpu = null;
  const canvas = document.querySelectorAll('canvas')[1];
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(context, {
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x},
    gpuLogger: x => { gpu = x },
    withoutUI: true
  });
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end();
  }
  t.ok(fps != null, 'fps = ' + (fps != null ? fps.toFixed(1) : 'null'));
  t.ok(cpu != null, 'cpu measure = ' + (cpu != null ? cpu.toFixed(1) : 'null'));
  t.ok(gpu != null, 'gpu measure = ' + (gpu != null ? gpu.toFixed(1) : 'null'));
});
  
test('Full UI', async (t) => {
  let fps = null, cpu = null, gpu = null;
  const canvas = document.querySelectorAll('canvas')[2];
  const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const bench = new GLBench(context, {
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x },
    gpuLogger: x => { gpu = x }
  });
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end();
  }
  const benchNode = document.querySelector('.gl-bench');
  let fpsUI = benchNode.querySelector('.gl-fps');
  let cpuUI = benchNode.querySelector('.gl-cpu');
  let gpuUI = benchNode.querySelector('.gl-gpu');
  if (fpsUI) fpsUI = fpsUI.innerHTML;
  if (cpuUI) cpuUI = cpuUI.innerHTML;
  if (gpuUI) gpuUI = gpuUI.innerHTML;
  t.ok(fpsUI != '00 FPS', 'fps = ' + fpsUI);
  t.ok(cpuUI != '00%', 'cpu = ' + cpuUI);
  t.ok(gpuUI != '00%', 'gpu = ' + gpuUI);
  t.ok(fps != null, 'fps additional logger = ' + fps.toFixed(1));
  t.ok(cpu != null, 'cpu additional logger = ' + cpu.toFixed(1));
  t.ok(gpu != null, 'gpu additional logger = ' + gpu.toFixed(1));
});

test('Mini UI', async (t) => {
  let fps = null, cpu = null;
  const bench = new GLBench(null, {
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x },
    names: ['skip one']
  });
  bench.begin('skip one');
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.begin('two');
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end('two');
  }
  const benchUI = document.querySelectorAll('.gl-bench')[1];
  let fpsUI = benchUI.querySelector('.gl-fps');
  let cpuUI = benchUI.querySelector('.gl-cpu');
  if (fpsUI) fpsUI = fpsUI.innerHTML;
  if (cpuUI) cpuUI = cpuUI.innerHTML;
  t.ok(fpsUI != '00 FPS', 'fps ui = ' + fpsUI);
  t.ok(cpuUI != '00%', 'cpu ui = ' + cpuUI);
  t.ok(fps != null, 'fps additional logger = ' + fps.toFixed(1));
  t.ok(cpu != null, 'cpu additional logger = ' + cpu.toFixed(1));
});