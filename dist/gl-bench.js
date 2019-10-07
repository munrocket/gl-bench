(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.GLBench = factory());
}(this, function () { 'use strict';

  var UISVG = "<div class=\"gl-box\">\n  <svg viewBox=\"0 0 55 60\">\n    <text x=\"27\" y=\"56\" font-size=\"0.75em\" class=\"gl-fps\">00 FPS</text>\n    <text x=\"28\" y=\"8\" font-size=\"0.55rem\" class=\"gl-mem\"></text>\n    <rect x=\"0\" y=\"14\" rx=\"4\" ry=\"4\" width=\"55\" height=\"32\" opacity=\"0.4\"/>\n    <polyline points=\"0 0 0 0\" class=\"gl-chart\"/>\n  </svg>\n  <svg viewBox=\"0 0 14 60\">\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" opacity=\"0.4\"/>\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" opacity=\"0.7\" stroke-dasharray=\"0 27\" class=\"gl-cpu\"/>\n    <path transform=\"translate(1,43) scale(.29)\" d=\"m15 0c-1.6 3e-16 -2.8 1.3-2.8 2.8v4c-2.7 0.68-4.9 2.8-5.5 5.6h-4c-1.5 0-2.8 1.2-2.8 2.8s1.2 2.8 2.8 2.8h3.8v5.7h-3.7c-1.6 0-2.8 1.3-2.8 2.8 3e-16 1.6 1.3 2.8 2.8 2.8h3.9c0.67 2.7 2.8 4.8 5.5 5.5v3.9c0 1.6 1.3 2.8 2.8 2.8 1.6 0 2.8-1.3 2.8-2.8v-3.7h5.7v3.7c0 1.6 1.3 2.8 2.8 2.8 1.6 0 2.8-1.3 2.8-2.8v-3.9c2.7-0.67 4.8-2.8 5.5-5.5h3.9c1.6 0 2.8-1.3 2.8-2.8 0-1.6-1.3-2.8-2.8-2.8h-3.7v-5.7h3.8c1.5 0 2.8-1.2 2.8-2.8s-1.2-2.8-2.8-2.8h-4c-0.65-2.7-2.8-4.9-5.5-5.6v-3.9c0-1.6-1.3-2.8-2.8-2.8-1.6 3e-16 -2.8 1.3-2.8 2.8v3.7h-5.7v-3.7c0-1.6-1.3-2.8-2.8-2.8zm2 12h7.2c2.6 0 4.7 2.1 4.7 4.7v7.2c0 2.6-2.1 4.7-4.7 4.7h-7.2c-2.6 0-4.7-2.1-4.7-4.7v-7.2c0-2.6 2.1-4.7 4.7-4.7z\"/>\n  </svg>\n  <svg viewBox=\"0 0 14 60\" class=\"gl-gpu-svg\">\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" opacity=\"0.4\"/>\n    <line x1=\"7\" y1=\"38\" x2=\"7\" y2=\"11\" opacity=\"0.7\" stroke-dasharray=\"0 27\" class=\"gl-gpu\"/>\n    <path transform=\"translate(0.93,43) scale(1.15)\" d=\"m0.885 0.328a0.64 0.64 0 1 0-0.00362 1.28c0.509 0.00201 0.491 0.112 0.552 0.278 0.061 0.165 0.0429 0.379 0.0429 0.379l-0.00568 0.047v7.54a0.64 0.64 0 1 0 1.28 0v-1.23c0.22 0.0828 0.459 0.13 0.711 0.13h4.58c1.09 0 1.96-0.848 1.96-1.9v-2.7c0-1.05-0.875-1.9-1.96-1.9h-4.58c-0.251 0-0.49 0.047-0.71 0.13 0.0157-0.143 0.0366-0.52-0.118-0.938-0.195-0.528-0.826-1.11-1.75-1.11zm2.53 3.17c0.369 0 0.666 0.315 0.666 0.706v2.59c0 0.391-0.297 0.706-0.666 0.706s-0.666-0.315-0.666-0.706v-2.59c0-0.391 0.297-0.706 0.666-0.706zm3.58 0a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z\"/>\n  </svg>\n</div>";

  var UICSS = "#gl-bench {\n  position:absolute;\n  left:0;\n  top:0;\n  z-index:1000;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  user-select: none;\n}\n\n#gl-bench svg {\n  height: 60px;\n  margin: 0 -1px;\n}\n\n#gl-bench div {\n  position: relative;\n  display: block;\n  margin: 5px;\n  padding: 0 7px 0 10px;\n  background: hsla(120, 50%, 60%, 1);\n  border-radius: 15px;\n  cursor: pointer;\n  opacity: 0.9;\n}\n\n#gl-bench text {\n  font-family: Helvetica,Arial,sans-serif;\n  font-weight: 700;\n  dominant-baseline: middle;\n  text-anchor: middle;\n}\n\n#gl-bench line {\n  stroke-width: 5;\n  stroke: black;\n  stroke-linecap: round;\n}\n\n#gl-bench polyline {\n  fill: none;\n  stroke: black;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n  stroke-width: 3.5;\n  opacity: 0.8;\n}";

  class GLBench {

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
          .forEach(fn => { if (gl[fn]) gl[fn] = addProfiler(gl[fn], this); });
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
            });
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
      }    this.activeAccums[nameId] = !this.activeAccums[nameId];
      this.t0 = t;
    }
  }

  return GLBench;

}));
