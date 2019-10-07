import UISVG from './ui.svg';
import UICSS from './ui.css';

export default class GLBench {

  /** GLBench constructor
   * @param { WebGLRenderingContext | WebGL2RenderingContext } gl context
   * @param { Object | undefined } settings additional settings
   */
  constructor(gl, settings = {}) {
    this.css = UICSS;
    this.svg = UISVG;
    this.paramLogger = () => {};
    this.chartLogger = () => {};
    this.chartLen = 20;

    this.names = [];
    this.cpuAccums = [];
    this.gpuAccums = [];  
    this.activeAccums = [];
    this.chart = new Array(this.chartLen);
    Object.assign(this, settings);

    this.now = () => (performance && performance.now) ? performance.now() : Date.now();
    this.frameId = -1;

    // attach gpu profilers
    if (gl) {
      const addProfiler = (fn, self) => function() {
        const t = self.now();
        fn.apply(gl, arguments);
        if (!self.withoutGPU) {
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
          const dt = self.now() - t;
          self.activeAccums.forEach((active, i) => {
            if (active) {
              self.gpuAccums[i] += dt;
              self.cpuAccums[i] -= dt;
            }
          });
        }
      };
      ['drawArrays', 'drawElements', 'drawArraysInstanced',
        'drawBuffers', 'drawElementsInstanced', 'drawRangeElements']
        .forEach(fn => { if (gl[fn]) gl[fn] = addProfiler(gl[fn], this) });
    }

    // init ui and ui loggers
    if (!this.withoutUI) {
      this.dom = document.getElementById('gl-bench');
      if (!this.dom) {
        document.body.insertAdjacentHTML('afterbegin', '<div id="gl-bench"></div>');
        document.body.insertAdjacentHTML('afterbegin', '<style id="gl-bench-style">' + this.css + '</style>');
        this.dom = document.getElementById('gl-bench');
      }
      this.dom.addEventListener('click', () => {
        this.withoutGPU = !this.withoutGPU;
        setTimeout(() => {
          [].forEach.call(this.nodes['gl-gpu-svg'], node => {
            node.style.display = this.withoutGPU ? 'none' : 'inline';
          })
        }, 500);
      });

      this.paramLogger = ((logger, dom, names) => {
        this.names = names;
        const classes = ['gl-cpu', 'gl-gpu', 'gl-mem', 'gl-fps', 'gl-gpu-svg', 'gl-chart'];
        this.nodes = Object.assign({}, classes);
        classes.forEach(c => this.nodes[c] = dom.getElementsByClassName(c));
        return (i, cpu, gpu, mem, fps, totalTime, frameId) => {
          this.nodes['gl-cpu'][i].style.strokeDasharray = (cpu * 0.27).toFixed(0) + ' 100';
          this.nodes['gl-gpu'][i].style.strokeDasharray = (gpu * 0.27).toFixed(0) + ' 100';
          this.nodes['gl-mem'][i].innerHTML = this.names[i] ? this.names[i] : 'mem: ' + mem.toFixed(0) + 'mb';
          this.nodes['gl-fps'][i].innerHTML = fps.toFixed(0) + ' FPS';
          logger(this.names[i], cpu, gpu, mem, fps, totalTime, frameId);
        }
      })(this.paramLogger, this.dom, this.names);

      this.chartLogger = ((logger, dom) => {
        this.wtf = Object.assign({}, ['gl-chart']);
        this.wtf['gl-chart'] = dom.getElementsByClassName('gl-chart');
        return (i, chart, circularId) => {
          let points = '';
          for (let i = 0; i < chart.length; i++) {
            let id = (circularId + i + 1) % chart.length;
            if (chart[id] != undefined) {
              points = points + ' ' + (55 * i / (chart.length - 1)).toFixed(1) + ',' + (46 - chart[id] * 24 / 60).toFixed(1);
            }
          }
          this.wtf['gl-chart'][i].setAttribute('points', points);
          logger(this.names[i], chart, circularId);
        }
      })(this.chartLogger, this.dom);
    }
  }

  /**
   * Explicit UI add
   * @param { string | undefined } name 
   */
  addUI(name) {
    if (this.names.indexOf(name) == -1) {
      this.names.push(name);
      if (this.dom) this.dom.insertAdjacentHTML('beforeend', this.svg);
      this.cpuAccums.push(0);
      this.gpuAccums.push(0);
      this.activeAccums.push(false);
    }
  }

  /**
   * Increase frameID
   * @param { number | undefined } now
   */
  nextFrame(now) {
    this.frameId++;
    const t = now ? now : this.now();

    // update params
    if (this.frameId < 2) {
      this.frameStart = this.frameId;
      this.timeStart = t;
    } else {
      const duration = t - this.timeStart;
      if (duration >= 1e3) {
        const frameCount = this.frameId - this.frameStart;
        const fps = frameCount / duration * 1e3;
        for (let i = 0; i < this.names.length; i++) {
          const cpu = this.cpuAccums[i] / duration * 100,
            gpu = this.gpuAccums[i] / duration * 100,
            mem = (performance && performance.memory) ? performance.memory.usedJSHeapSize / (1 << 20) : 0;
          this.paramLogger(i, cpu, gpu, mem, fps, duration, frameCount);
          this.cpuAccums[i] = 0;
          this.gpuAccums[i] = 0;
        }
        this.frameStart = this.frameId;
        this.timeStart = t;
      }
    }

    // update chart
    if (this.frameId < 2) {
      this.circularId = 0;
      this.prevFrame = this.frameId;
      this.zerotime = t;
    } else {
      const duration = t - this.zerotime;
      let hz = 20 * duration / 1e3;
      while (--hz > 0) {
        const frameCount = this.frameId - this.prevFrame;
        const fps = frameCount / duration * 1e3;
        this.chart[this.circularId % this.chartLen] = fps;
        for (let i = 0; i < this.names.length; i++) {
          this.chartLogger(i, this.chart, this.circularId);
        }
        this.circularId++;
        this.prevFrame = this.frameId;
        this.zerotime = t;
      }
    }
  }

  /**
   * Begin named measurement
   * @param { string | undefined } name
   */
  begin(name) {
    this.updateAccums(name);
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name) {
    this.updateAccums(name);
  }

  updateAccums(name) {
    let nameId = this.names.indexOf(name);
    if (nameId == -1) {
      nameId = this.names.length;
      this.addUI(name);
    }

    const t = this.now();
    const dt = t - this.t0;
    for (let i = 0; i < nameId + 1; i++) {
      if (this.activeAccums[i]) {
        this.cpuAccums[i] += dt;
      }
    };
    this.activeAccums[nameId] = !this.activeAccums[nameId];
    this.t0 = t;
  }
}