import GLBench from '../dist/gl-bench.module.js';
import { test } from '../node_modules/zora/dist/bundle/module.js';

test('CPU', async (t) => {
  async function fps(t) {
    let fps = null;
    const bench = new GLBench({
      fpsLogger: x => { fps = x },
      cpuLogger: () => {},
      gpuLogger: () => {}
    }, false);
    bench.init(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    t.ok(fps != null, 'standalone fps = ' + (fps != null ? fps.toFixed(1) : 'null'));
  }
  
  async function measure(t) {
    let fps = null;
    let measure = null;
    const bench = new GLBench({
      fpsLogger: x => { fps = x },
      cpuLogger: x => { measure = x},
      gpuLogger: () => {}
    }, false);
    bench.init(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.begin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.end();
    }
    t.ok(fps != null, 'fps with measure = ' + (fps != null ? fps.toFixed(1) : 'null'));
    t.ok(measure != null, 'cpu measure = ' + (measure != null ? measure.toFixed(1) : 'null'));
  }

  await Promise.all([fps(t), measure(t)]);
});

test('WebGL1', async (t) => {
  async function fps(t) {
    let fps = null;
    const bench = new GLBench({
      fpsLogger: x => { fps = x }
    }, false);
    bench.init(document.getElementsByTagName('canvas')[0]);
    t.ok(bench.gpu.gl instanceof WebGLRenderingContext, 'webgl version one');
    t.ok(bench.gpu.ext, 'disjoint timer exists');
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    t.ok(fps != null, 'standalone fps = ' + (fps != null ? fps.toFixed(1) : 'null'));
  }

  async function measure(t) {
    let fps = null;
    let measure = null;
    const bench = new GLBench({
      fpsLogger: x => { fps = x },
      gpuLogger: x => { measure = x }
    }, false);
    bench.init(document.getElementsByTagName('canvas')[1]);
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.begin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.end();
    }
    t.ok(fps != null, 'fps with measure = ' + (fps != null ? fps.toFixed(1) : 'null'));
    t.ok(measure != null, 'gpu measure = ' + (measure != null ? measure.toFixed(1) : 'null'));
  }

  await Promise.all([fps(t), measure(t)]);
});

test('WebGL2', async (t) => {
  async function fps(t) {
    let fps = null;
    const bench = new GLBench({
      fpsLogger: x => { fps = x }
    }, false);
    const canvas = document.getElementsByTagName('canvas')[2];
    canvas.getContext('webgl2');
    bench.init(canvas);
    t.ok(bench.gpu.gl instanceof WebGL2RenderingContext, 'webgl version two');
    t.ok(bench.gpu, 'disjoint timer exists');
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    t.ok(fps != null, 'fps = ' + (fps != null ? fps.toFixed(1) : 'null'));
  }

  async function measure(t) {
    let fps = null;
    let measure = null;
    const bench = new GLBench({
      fpsLogger: x => { fps = x },
      gpuLogger: x => { measure = x }
    }, false);
    const canvas = document.getElementsByTagName('canvas')[3];
    canvas.getContext('webgl2');
    bench.init(canvas);
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.begin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.end();
    }
    t.ok(fps != null, 'fps with measure = ' + (fps != null ? fps.toFixed(1) : 'null'));
    t.ok(measure != null, 'gpu measure = ' + (measure != null ? measure.toFixed(1) : 'null'));
  }

  await Promise.all([fps(t), measure(t)]);
});

test('User Interface', async (t) => {
  async function miniUI(t) {
    const bench = new GLBench();
    bench.init(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    t.ok(document.getElementsByClassName('gl-bench')[0].
      getElementsByClassName('gl-fps')[0].innerHTML != '00 FPS',  'mini fps');
    t.ok(document.getElementsByClassName('gl-bench')[0].
      getElementsByClassName('gl-cpu')[0].innerHTML != '00%',  'mini cpu');
  }

  async function fullUI(t) {
    let fps, cpu, gpu;
    const bench = new GLBench({
      fpsLogger: x => { fps = x },
      cpuLogger: x => { cpu = x },
      gpuLogger: x => { gpu = x }
    });
    const canvas = document.getElementsByTagName('canvas')[4];
    canvas.getContext('webgl2');
    bench.init(canvas);
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.begin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.end();
    }
    t.ok(document.getElementsByClassName('gl-bench')[1].
      getElementsByClassName('gl-fps')[0].innerHTML != '00 FPS', 'full fps');
      t.ok(document.getElementsByClassName('gl-bench')[1].
      getElementsByClassName('gl-cpu')[0].innerHTML != '00%', 'full cpu');
    t.ok(document.getElementsByClassName('gl-bench')[1].
      getElementsByClassName('gl-gpu')[0].innerHTML != '00%', 'full gpu');
    t.ok(fps != null && gpu != null && cpu != null, 'additional loggers');
  }

  await Promise.all([miniUI(t), fullUI(t)]);
});