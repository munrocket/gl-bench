import CPU from '../src/cpu.js';
import { test } from '../node_modules/zora/dist/bundle/module.js';

test('CPU', async (t) => {
  let fps = null;
  let cpu = new CPU(log => { fps = log });
  let frameId = 0;
  async function draw() {
    if (frameId < 13) {
      frameId++;
      cpu.update();
      setTimeout(draw(), 100);
    } else {
      return true;
    }
  }
  await draw();
  setTimeout(() => {
    t.ok(fps !== null, 'fps calculated')
  }, 1200);

});