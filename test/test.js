import Bench from '../dist/gl-bench.module.js';
import { test } from '../node_modules/zora/dist/bundle/module.js';

test('CPU', async (t) => {
  async function fps(t) {
    const bench = new Bench();
    bench.init(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    t.ok(document.getElementById('gl-bench-fps').innerHTML != '00 FPS', 'fps calculated');
  }
  
  async function measure(t) {
    const bench = new Bench();
    bench.init(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.begin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.end();
    }
    t.ok(document.getElementById('gl-bench-fps').innerHTML != '00 FPS', 'fps with measure calculated');
    t.ok(document.getElementById('gl-bench-cpu').innerHTML != '00%', 'measure calculated');
  }

  await Promise.all([fps(t), measure(t)]);
});

test('WebGL1', async (t) => {
  async function fps(t) {
    const bench = new Bench();
    try {
      const canvas = document.getElementsByTagName('canvas')[0];
      bench.init(canvas);
      t.ok(bench.gpu.gl instanceof WebGLRenderingContext, 'webgl context exists');
      t.ok(bench.gpu, 'disjoint timer exists');
      for(let frameId = 0; frameId < 4; frameId++) {
        bench.update();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (e) {
      console.log(e.toString());
    }
    t.ok(document.getElementById('gl-bench-fps').innerHTML != '00 FPS', 'standalone fps calculated');
  }

  async function measure(t) {
    let fps = null;
    const bench = new Bench();
    try {
      const canvas = document.getElementsByTagName('canvas')[1];
      bench.init(canvas);
      for(let frameId = 0; frameId < 4; frameId++) {
        bench.update();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch(e) {
      console.log(e.toString());
    }
    t.ok(document.getElementById('gl-bench-fps').innerHTML != '00 FPS', 'fps with measure calculated');
    t.ok(document.getElementById('gl-bench-gpu').innerHTML != '00%', 'measure calculated');
  }

  await Promise.all([fps(t), measure(t)]);
});

test('WebGL2', async (t) => {
  async function fps(t) {
    let fps = null;
    const bench = new Bench();
    const canvas = document.getElementsByTagName('canvas')[2];
    canvas.getContext('webgl2');
    bench.init(canvas);
    t.ok(bench.gpu.gl instanceof WebGL2RenderingContext, 'webgl2 context exists');
    t.ok(bench.gpu, 'disjoint timer exists');
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    t.ok(document.getElementById('gl-bench-fps').innerHTML != '00 FPS', 'fps calculated');
  }

  async function measure(t) {
    let fps = null;
    const bench = new Bench();
    try {
      const canvas = document.getElementsByTagName('canvas')[3];
      canvas.getContext('webgl2');
      bench.init(canvas);
      for(let frameId = 0; frameId < 4; frameId++) {
        bench.update();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch(e) {
      console.log(e.toString());
    }
    t.ok(document.getElementById('gl-bench-fps').innerHTML != '00 FPS', 'fps with measure calculated');
    t.ok(document.getElementById('gl-bench-gpu').innerHTML != '00%', 'measure calculated');
  }

  await Promise.all([fps(t), measure(t)]);
});