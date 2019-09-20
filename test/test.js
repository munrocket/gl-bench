import GLBench from '../dist/gl-bench.module.js';
import { test } from 'https://cdn.jsdelivr.net/npm/zora@3.0.3/dist/bundle/module.js';

test('CPU', async (t) => {
  let fps = null, cpu = null;
  const bench = new GLBench({
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x}
  });
  bench.init(document.createElement('p'), 0);
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
  const bench = new GLBench({
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x},
    gpuLogger: x => { gpu = x },
  });
  const canvas = document.getElementsByTagName('canvas')[1];
  bench.init(canvas.getContext('webgl'), 0);
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
  const bench = new GLBench({
    fpsLogger: x => { fps = x },
    cpuLogger: x => { cpu = x},
    gpuLogger: x => { gpu = x },
  });
  const canvas = document.getElementsByTagName('canvas')[3];
  bench.init(canvas.getContext('webgl2'), 0);
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.begin();
    await new Promise(resolve => setTimeout(resolve, 1000));
    bench.end();
  }
  t.ok(fps != null, 'fps = ' + (fps != null ? fps.toFixed(1) : 'null'));
  t.ok(cpu != null, 'cpu measure = ' + (cpu != null ? cpu.toFixed(1) : 'null'));
  t.ok(gpu != null, 'gpu measure = ' + (gpu != null ? gpu.toFixed(1) : 'null'));
});

test('User Interface', async (t) => {
  async function fullUI(t) {
    let fps = null, cpu = null, gpu = null;
    const bench = new GLBench({
      fpsLogger: x => { fps = x },
      cpuLogger: x => { cpu = x },
      gpuLogger: x => { gpu = x }
    });
    const canvas = document.getElementsByTagName('canvas')[4];
    bench.init(canvas.getContext('webgl'));
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.begin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.end();
    }
    t.ok(document.getElementsByClassName('gl-bench')[0].
      getElementsByClassName('gl-fps')[0].innerHTML != '00 FPS', 'full fps');
      t.ok(document.getElementsByClassName('gl-bench')[0].
      getElementsByClassName('gl-cpu')[0].innerHTML != '00%', 'full cpu');
    t.ok(document.getElementsByClassName('gl-bench')[0].
      getElementsByClassName('gl-gpu')[0].innerHTML != '00%', 'full gpu');
    t.ok(fps != null && gpu != null && cpu != null, 'additional loggers');
  }

  async function miniUI(t) {
    const bench = new GLBench();
    bench.init(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.cpu.begin(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.cpu.end(1);
    }
    t.ok(document.getElementsByClassName('gl-bench')[1].
      getElementsByClassName('gl-fps')[0].innerHTML != '00 FPS',  'mini fps');
    t.ok(document.getElementsByClassName('gl-bench')[1].
      getElementsByClassName('gl-cpu')[0].innerHTML != '00%',  'mini cpu');
  }

  await Promise.all([fullUI(t), miniUI(t)]);
});