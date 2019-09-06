import Bench from '../src/index.js';
import { test } from '../node_modules/zora/dist/bundle/module.js';

test('CPU', async (t) => {
  async function fps(t) {
    let fps = null;
    const bench = new Bench(log => { fps = log });
    bench.initCanvas(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return t.ok(fps !== null, 'fps calculated');
  }
  
  async function counter(t) {
    let counter = null;
    const bench = new Bench(() => {}, log => { counter = log });
    bench.initCanvas(document.createElement('p'));
    for(let frameId = 0; frameId < 2; frameId++) {
      bench.update();
      bench.begin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      bench.end();
    }
    return t.ok(counter !== null, 'counter calculated');
  }

  await Promise.all([fps(t), counter(t)]);
});

test('WebGL1', async (t) => {
  let fps = null;
  const bench = new Bench(log => { fps = log; });
  try {
    const canvas = document.getElementsByTagName('canvas')[0];
    bench.initCanvas(canvas);
    t.ok(bench.gl instanceof WebGLRenderingContext, 'webgl context exists');
    t.ok(bench.gpu, 'disjoint timer exists');
    for(let frameId = 0; frameId < 4; frameId++) {
      bench.update();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch(e) {
    console.log(e.toString());
  }
  t.ok(fps !== null, 'fps calculated');
});

test('WebGL2', async (t) => {
  let fps = null;
  const bench = new Bench(log => { fps = log; });
  const canvas = document.getElementsByTagName('canvas')[1];
  canvas.getContext('webgl2');
  bench.initCanvas(canvas);
  t.ok(bench.gl instanceof WebGL2RenderingContext, 'webgl2 context exists');
  t.ok(bench.gpu, 'disjoint timer exists');
  for(let frameId = 0; frameId < 4; frameId++) {
    bench.update();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  t.ok(fps !== null, 'fps calculated');
});