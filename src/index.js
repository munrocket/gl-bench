import UIFull from './ui/ui-full.svg';
import UIStyle from './ui/ui.css';

export default class GLBench {

  /**
   * @param { WebGLRenderingContext | WebGL2RenderingContext } gl 
   * @param { Object | undefined } settings
   */
  constructor(gl, settings = {}) {
    this.names = [];
    Object.assign(this, settings);

    // add gpu profilers
    const addProfiler = (fn, self) => function() {
      const begin = self.now();
      fn.apply(gl, arguments);
      const temp = new Uint8Array(4);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, temp);
      const dt = self.now() - begin;
      const binaryFlags = self.measureMode.toString(2);
      for (let i = 0; i < binaryFlags.length; i++) {
        if (binaryFlags[i] == '1') {
          const index = binaryFlags.length - i - 1;
          self.cpuAccums[index] -= dt;
          self.gpuAccums[index] += dt;
        }
      }
    }
    if (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext) {
      ['drawArrays', 'drawElements', 'drawArraysInstanced',
        'drawBuffers', 'drawElementsInstanced', 'drawRangeElements']
        .forEach(fn => { if (gl[fn]) gl[fn] = addProfiler(gl[fn], this) });
    }

    // init ui and attach loggers
    if (!this.withoutUI) {
      this.dom = document.getElementById('gl-bench-dom');
      if (!this.dom) {
        document.body.insertAdjacentHTML('afterbegin',
          '<div id="gl-bench-dom" style="position:absolute;left:0;top:0;z-index:1000"></div>');
        this.dom = document.getElementById('gl-bench-dom');
        let styleNode = document.createElement('style');
        styleNode.innerHTML = UIStyle;
        this.dom.appendChild(styleNode);
      }
      this.dom.addEventListener('click', () => { this.showMS = !this.showMS; });

      function addLogger(elm, elmChanger, pct, pctChanger, extraLogger, dom, names) {
        this.elm = dom.getElementsByClassName(elm);
        this.pct = dom.getElementsByClassName(pct);
        this.names = names;
        return (x, y, i) => {
          this.elm[i].innerHTML = elmChanger(x, y);
          this.pct[i].style[pct == 'gl-box' ? 'fill' : 'strokeDasharray'] = pctChanger(x);
          if (extraLogger) extraLogger(x, y, this.names[i]);
        }
      }
      this.fpsLogger = addLogger.bind({}) (
        'gl-fps', (fps, ms) => !this.showMS ? fps.toFixed(0) + ' FPS' : ms.toFixed(2) + ' MS',
        'gl-box', fps => 'hsla(' + Math.min(120, Math.max(0, 2.182*(fps-5))) + ',50%,60%,0.65)',
        this.fpsLogger, this.dom, this.names
      );
      this.cpuLogger = addLogger.bind({}) (
        'gl-cpu', (cpu, ms) => !this.showMS ? cpu.toFixed(0) + '%' : ms.toFixed(2),
        'gl-cpu-arc', cpu => cpu.toFixed(0) + ', 100',
        this.cpuLogger, this.dom, this.names
      );
      this.gpuLogger = addLogger.bind({}) (
        'gl-gpu', (gpu, ms) => !this.showMS ? gpu.toFixed(0) + '%' : ms.toFixed(2),
        'gl-gpu-arc', gpu => gpu.toFixed(0) + ', 100',
        this.gpuLogger, this.dom, this.names
      );
    }
    if (!this.cpuLogger) this.cpuLogger = () => {};
    if (!this.gpuLogger) this.gpuLogger = () => {};
    if (!this.fpsLogger) this.fpsLogger = () => {};

    this.now = () => (performance && performance.now) ? performance.now() : Date.now();
    this.frameId = 0;
    this.cpuAccums = [];
    this.gpuAccums = [];
    this.measureMode = 0;
  }

  /**
   * Add UI in dom
   * @param { string } name 
   */
  addUI(name) {
    this.names.push(name);
    if (this.dom) this.dom.insertAdjacentHTML('beforeend', UIFull);
  }

  /**
   * Begin named measure
   * @param { string | undefined } name
   */
  begin(name) {
    let nameId = this.names.indexOf(name);
    if (this.names.indexOf(name) == -1) {
      nameId = this.names.length;
      this.addUI(name);
    }

    if (nameId === 0) this.frameId++;
    if (this.cpuAccums.length <= nameId) this.cpuAccums.push(0);
    if (this.gpuAccums.length <= nameId) this.gpuAccums.push(0);
    
    this.update();
    this.measureMode += 1 << nameId;
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name) {
    const nameId = this.names.indexOf(name);

    this.update();
    this.measureMode -= 1 << nameId;
  }

  /**
   * Accumulators updater
   */
  update() {
    const now = this.now();
    if (typeof this.zerotime == 'undefined') {
      this.zerotime = now;
    } else {
      const dt = now - this.prevNow;
      const binaryFlags = this.measureMode.toString(2);
      for (let i = 0; i < binaryFlags.length; i++) {
        if (binaryFlags[i] == '1') {
          const index = binaryFlags.length - i - 1;
          this.cpuAccums[index] += dt;
        }
      }

      const totalAccum = now - this.zerotime;
      let seconds = totalAccum / 1e3;
      if (seconds >= 1) {
        const fps = this.frameId / seconds;
        const frametime = totalAccum / this.frameId;
        for (let i = 0; i < this.cpuAccums.length; i++) {
          this.cpuLogger(this.cpuAccums[i] / totalAccum * 100, this.cpuAccums[i] / this.frameId, i);
          this.gpuLogger(this.gpuAccums[i] / totalAccum * 100, this.gpuAccums[i] / this.frameId, i);
          this.fpsLogger(fps, frametime, i);
        }
        let j = this.cpuAccums.length;
        while (j--) {
          this.cpuAccums[j] = 0;
          this.gpuAccums[j] = 0;
        }
        this.frameId = 0;
        this.zerotime = now;
      }
    }
    this.prevNow = now;
  }
}