(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.GLBench = factory());
}(this, function () { 'use strict';

  var UISVG = "<svg viewBox=\"0 0 100 70\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"70\" rx=\"26.5\" ry=\"26.5\" class=\"gl-box\"/>\n\n<text x=\"26.5\" y=\"22\" class=\"gl-text gl-cpu\">00%</text>\n<text x=\"26.5\" y=\"34\" class=\"gl-text\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" class=\"gl-circle\"/>\n<path d=\"M21.0 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  class=\"gl-arc gl-cpu-arc\"/>\n\n<circle cx=\"73.5\" cy=\"26.5\" r=\"20\" class=\"gl-circle\"/>\n<text x=\"73.5\" y=\"22\" class=\"gl-text gl-gpu\">00%</text>\n<text x=\"73.5\" y=\"34\" class=\"gl-text\">GPU</text>\n<path d=\"M58.5 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  class=\"gl-arc gl-gpu-arc\"/>\n\n<text x=\"50\" y=\"59\" font-size=\".8em\" class=\"gl-text gl-fps\">00 FPS</text>\n<circle cx=\"18\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n<circle cx=\"82\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n\n</svg>";

  var UICSS = ".gl-bench {\n  position: relative;\n  display: block;\n  margin: 5px;\n  width: 100px;\n  cursor: pointer;\n}\n\n.gl-box {\n  fill: hsla(120, 50%, 60%, 0.65);\n}\n\n.gl-text {\n  font-family: sans-serif;\n  font-weight: 700;\n  font-size: 0.7em;\n  text-anchor: middle;\n  dominant-baseline: middle;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  opacity: 0.7;\n}\n\n.gl-arc {\n  fill: none;  \n  stroke: black;\n  stroke-width: 2.6;\n  stroke-dasharray: 0, 100;\n  opacity: 0.5;  \n  transform: scale(1.25663);\n}\n\n.gl-circle {\n  fill: none;\n  stroke-width: 3.5;\n  stroke: black;\n  opacity: 0.4;\n}";

  class GLBench {

    /**
     * @param { WebGLRenderingContext | WebGL2RenderingContext } gl 
     * @param { Object | undefined } settings
     */
    constructor(gl, settings = {}) {
      this.names = [];
      this.frameId = 0;

      this.cpuAccums = [];
      this.gpuAccums = [];
      this.activeAccums = [];

      this.cpuLogger = () => {};
      this.gpuLogger = () => {};
      this.fpsLogger = () => {};

      this.now = () => (performance && performance.now) ? performance.now() : Date.now();
      Object.assign(this, settings);

      // add gpu profilers
      if (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext) {
        const addProfiler = (fn, self) => function() {
          const begin = self.now();
          fn.apply(gl, arguments);
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
          const dt = self.now() - begin;
          self.activeAccums.forEach((active, i) => {
            if (active) {
              self.gpuAccums[i] += dt;
              self.cpuAccums[i] -= dt;
            }
          });
        };
        ['drawArrays', 'drawElements', 'drawArraysInstanced',
          'drawBuffers', 'drawElementsInstanced', 'drawRangeElements']
          .forEach(fn => { if (gl[fn]) gl[fn] = addProfiler(gl[fn], this); });
      }

      // init ui and attach loggers
      if (!this.withoutUI) {
        this.dom = document.getElementById('gl-bench-dom');
        if (!this.dom) {
          document.body.insertAdjacentHTML('afterbegin',
            '<div id="gl-bench-dom" style="position:absolute;left:0;top:0;z-index:1000"></div>');
          this.dom = document.getElementById('gl-bench-dom');
          let styleNode = document.createElement('style');
          styleNode.innerHTML = UICSS;
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
            extraLogger(x, y, this.names[i]);
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
    }

    /**
     * Add UI in dom
     * @param { string } name 
     */
    addUI(name) {
      this.names.push(name);
      if (this.dom) this.dom.insertAdjacentHTML('beforeend', UISVG);
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
      if (this.cpuAccums.length <= nameId) {
        this.cpuAccums.push(0);
        this.gpuAccums.push(0);
        this.activeAccums.push(false);
      }
      
      this.update();
      this.activeAccums[nameId] = !this.activeAccums[nameId];
    }

    /**
     * End named measure
     * @param { string | undefined } name
     */
    end(name) {
      const nameId = this.names.indexOf(name);

      this.update();
      this.activeAccums[nameId] = !this.activeAccums[nameId];
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
        this.activeAccums.forEach((active, i) => {
          if (active) {
            this.cpuAccums[i] += dt;
          }
        });

        const totalAccum = now - this.zerotime;
        let seconds = totalAccum / 1e3;
        if (seconds >= 1) {
          const fps = this.frameId / seconds;
          const frametime = totalAccum / this.frameId;
          for (let i = 0; i < this.cpuAccums.length; i++) {
            this.cpuLogger(this.cpuAccums[i] / totalAccum * 100, this.cpuAccums[i] / this.frameId, i);
            this.gpuLogger(this.gpuAccums[i] / totalAccum * 100, this.gpuAccums[i] / this.frameId, i);
            this.fpsLogger(fps, frametime, i);
            this.cpuAccums[i] = 0;
            this.gpuAccums[i] = 0;
          }
          this.frameId = 0;
          this.zerotime = now;
        }
      }
      this.prevNow = this.now();
    }
  }

  return GLBench;

}));
