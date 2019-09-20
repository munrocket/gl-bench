var GLBench = (function () {
  'use strict';

  class GPU {

    constructor(gl, ext, fpsLogger, gpuLogger) {
      this.fpsLogger = fpsLogger ? fpsLogger : () => {};
      this.gpuLogger = gpuLogger ? gpuLogger : () => {};

      this.frameId = 0;
      this.namedAccums = [];
      this.measureMode = 0;

      this.queryId = 0;
      this.queryQueue = [];
      this.totalAccum = 0;

      // unify webgl & webgl2 api
      if (ext && ext.constructor.name == 'EXTDisjointTimerQuery') {
        gl.createQuery = ext.createQueryEXT.bind(ext);
        gl.deleteQuery = ext.deleteQueryEXT.bind(ext);
        gl.beginQuery = ext.beginQueryEXT.bind(ext);
        gl.endQuery = ext.endQueryEXT.bind(ext);
        gl.getQueryParameter = ext.getQueryObjectEXT.bind(ext);
        gl.QUERY_RESULT_AVAILABLE = ext.QUERY_RESULT_AVAILABLE_EXT;
        gl.QUERY_RESULT = ext.QUERY_RESULT_EXT;
      }
      this.gl = gl;
      this.ext = ext;
    }

    begin(nameId) {
      if (nameId === 0) this.frameId++;
      if (this.namedAccums.length <= nameId) this.namedAccums.push(0);
      
      if (this.queryQueue.length > 0) {
        this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
        while (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT) &&
              this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT_AVAILABLE)) {
                
          const dt = this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT);
          this.totalAccum += dt;
          const binaryFlags = this.queryQueue[this.queryId].measureMode.toString(2);
          for (let i = 0; i < binaryFlags.length; i++) {
            if (binaryFlags[i] == '1') this.namedAccums[binaryFlags.length - i - 1] += dt;
          }

          this.queryId++;
          let seconds = this.totalAccum / 1e9;
          if (seconds >= 1) {
            const frames = this.queryQueue[this.queryId-1].frameId - this.queryQueue[0].frameId;
            const fps = frames / seconds;
            const frametime = this.totalAccum / frames / 1e6;
            for (let i = 0; i < this.namedAccums.length; i++) {
              const accum = this.namedAccums[i];
              const gpu = accum / this.totalAccum * 100;
              const ms = accum / frames / 1e6;
              this.gpuLogger(gpu, ms, i);
              this.fpsLogger(fps, frametime, i);
            }
            this.queryQueue.slice(0, this.queryId).forEach(q => this.gl.deleteQuery(q.query));
            this.queryQueue.splice(0, this.queryId);
            let i = this.namedAccums.length;
            while (i--) this.namedAccums[i] = 0;
            this.totalAccum = 0;
            this.queryId = 0;
          }
        }
      }
      
      this.measureMode += 1 << nameId;
      this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
    }

    end(nameId) {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      this.measureMode -= 1 << nameId;

      this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
    }
  }

  class CPU {

    constructor(fpsLogger, cpuLogger) {
      this.fpsLogger = fpsLogger ? fpsLogger : () => {};
      this.cpuLogger = cpuLogger ? cpuLogger : () => {};

      this.frameId = 0;
      this.namedAccums = [];
      this.measureMode = 0;

      this.zerotime = null;
    }

    begin(nameId) {
      if (nameId === 0) this.frameId++;
      if (this.namedAccums.length <= nameId) this.namedAccums.push(0);
      
      this.update();
      this.measureMode += 1 << nameId;
    }

    end(nameId) {
      this.update();
      this.measureMode -= 1 << nameId;
    }

    update() {
      const now = (performance && performance.now) ? performance.now() : Date.now();
      if (this.zerotime == null) {
        this.zerotime = now;
      } else {
        const dt = now - this.timestamp;
        const binaryFlags = this.measureMode.toString(2);
        for (let i = 0; i < binaryFlags.length; i++) {
          if (binaryFlags[i] == '1') {
            this.namedAccums[binaryFlags.length - i - 1] += dt;
          }
        }

        const totalAccum = this.timestamp - this.zerotime;
        let seconds = totalAccum / 1e3;
        if (seconds >= 1) {
          const fps = this.frameId / seconds;
          const frametime = totalAccum / this.frameId;
          for (let i = 0; i < this.namedAccums.length; i++) {
            const accum = this.namedAccums[i];
            const cpu = accum / totalAccum * 100;
            const ms = accum / this.frameId;
            this.cpuLogger(cpu, ms, i);
            this.fpsLogger(fps, frametime, i);
          }
          let j = this.namedAccums.length;
          while (j--) this.namedAccums[j] = 0;
          this.frameId = 0;
          this.zerotime = this.timestamp;
        }
      }
      this.timestamp = now;
    }
  }

  var UIFull = "<svg viewBox=\"0 0 100 70\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"70\" rx=\"26.5\" ry=\"26.5\" class=\"gl-box\"/>\n\n<text x=\"26.5\" y=\"22\" class=\"gl-text gl-cpu\">00%</text>\n<text x=\"26.5\" y=\"34\" class=\"gl-text\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\" class=\"gl-circle\"/>\n<path d=\"M21.0 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  stroke-dasharray=\"0, 100\" class=\"gl-arc gl-cpu-arc\"/>\n\n<circle cx=\"73.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\" class=\"gl-circle\"/>\n<text x=\"73.5\" y=\"22\" class=\"gl-text gl-gpu\">00%</text>\n<text x=\"73.5\" y=\"34\" class=\"gl-text\">GPU</text>\n<path d=\"M58.5 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  stroke-dasharray=\"0, 100\" class=\"gl-arc gl-gpu-arc\"/>\n\n<text x=\"50\" y=\"59\" font-size=\".8em\" class=\"gl-text gl-fps\">00 FPS</text>\n<circle cx=\"18\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n<circle cx=\"82\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n\n</svg>";

  var UIMin = "<svg viewBox=\"0 0 100 52.632\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"52.632\" rx=\"26.5\" ry=\"26.5\" class=\"gl-box\"/>\n\n<text x=\"26.5\" y=\"22\" dominant-baseline=\"middle\" class=\"gl-text gl-cpu\" >00%</text>\n<text x=\"26.5\" y=\"34\" dominant-baseline=\"middle\" class=\"gl-text\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\" class=\"gl-circle\"/>\n<path d=\"M21.0 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  stroke-dasharray=\"0, 100\" class=\"gl-arc gl-cpu-arc\"/>\n\n<text x=\"74\" y=\"28\" dominant-baseline=\"middle\" class=\"gl-text gl-fps\" style=\"font-size:0.8em\">00 FPS</text>\n\n</svg>";

  var UIStyle = ".gl-bench {\n  position: relative;\n  display: block;\n  margin: 5px;\n  width: 100px;\n  cursor: pointer;\n}\n\n.gl-box {\n  fill: hsla(120, 50%, 60%, 0.65);\n}\n\n.gl-text {\n  font-family: sans-serif;\n  font-weight: 700;\n  font-size: 0.7em;\n  text-anchor: middle;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  opacity: 0.7;\n}\n\n.gl-arc {\n  fill: none;  \n  stroke: black;\n  stroke-width: 2.6;\n  opacity: 0.5;  \n  transform: scale(1.25663);\n}\n\n.gl-circle {\n  fill: none;\n  stroke: black;\n  opacity: 0.4;\n}";

  /**
  * WebGL benchmark
  * @param { Object | undefined } extraLoggers
  */
  class GLBench {
    constructor(extraLoggers = {}) {
      Object.assign(this, extraLoggers);
      this.showMS = false;
      this.names = [];
    }

    /**
     * Context and UI initialization
     * @param { WebGLRenderingContext | WebGL2RenderingContext } webglContext 
     * @param { number | undefined } uiCount
     */
    init(webglContext, uiCount = 1) {
      let ext;
      if (webglContext instanceof WebGLRenderingContext) {
        ext = webglContext.getExtension('EXT_disjoint_timer_query');
      } else if (webglContext instanceof WebGL2RenderingContext) {
        ext = webglContext.getExtension('EXT_disjoint_timer_query_webgl2');
      }

      if (uiCount > 0) {
        const rootNode = document.body;
        let domNode = document.getElementById('gl-bench-dom');
        if (!domNode) {
          domNode = document.createElement('div');
          domNode.id = 'gl-bench-dom';
          domNode.style.cssText = 'position:absolute;left:0;top:0;z-index:1000';
          let styleNode = document.createElement('style');
          styleNode.innerHTML = UIStyle;
          domNode.appendChild(styleNode);
        }
        let svgNode = document.createElement('template');
        svgNode.innerHTML = ext ? UIFull : UIMin;
        svgNode = svgNode.content.firstChild;
        domNode.addEventListener('click', () => { this.showMS = !this.showMS; });
        while (uiCount--) domNode.appendChild(svgNode.cloneNode(true));
        rootNode.appendChild(domNode);

        function loggerTemplate(extraLogger, elm, elmChanger, pct, pctChanger) {
          this.elm = domNode.getElementsByClassName(elm);
          this.pct = domNode.getElementsByClassName(pct);
          return (x, y, i) => {
            this.elm[i].innerHTML = elmChanger(x, y);
            this.pct[i].style[pct == 'gl-box' ? 'fill' : 'strokeDasharray'] = pctChanger(x);
            if (extraLogger) extraLogger(x, y, i);
          }
        }
        this.fpsLogger = loggerTemplate.bind({}) (this.fpsLogger,
          'gl-fps', (fps, ms) => !this.showMS ? fps.toFixed(0) + ' FPS' : ms.toFixed(2) + ' MS',
          'gl-box', fps => 'hsla(' + Math.min(120, Math.max(0, 2.182*(fps-5))) + ',50%,60%,0.65)'
        );
        this.cpuLogger = loggerTemplate.bind({}) (this.cpuLogger,
          'gl-cpu', (cpu, ms) => !this.showMS ? cpu.toFixed(0) + '%' : ms.toFixed(2),
          'gl-cpu-arc', cpu => cpu.toFixed(0) + ', 100'
        );
        this.gpuLogger = !ext ? null : loggerTemplate.bind({}) (this.gpuLogger,
          'gl-gpu', (gpu, ms) => !this.showMS ? gpu.toFixed(0) + '%' : ms.toFixed(2),
          'gl-gpu-arc', gpu => gpu.toFixed(0) + ', 100'
        );
      }

      this.cpu = new CPU(!ext ? this.fpsLogger : 0, this.cpuLogger);
      if (ext) this.gpu = new GPU(webglContext, ext, this.fpsLogger, this.gpuLogger);
    }

    /**
     * Begin named measure
     * @param { string | undefined } name
     */
    begin(name) {
      let nameId = this.names.indexOf(name);
      if (this.names.indexOf(name) == -1) {
        nameId = this.names.length;
        this.names.push(name);
      }

      this.cpu.begin(nameId);
      if (this.gpu) this.gpu.begin(nameId);
    }

    /**
     * End named measure
     * @param { string | undefined } name
     */
    end(name) {
      const nameId = this.names.indexOf(name);
      this.cpu.end(nameId);
      if (this.gpu) this.gpu.end(nameId);
    }
  }

  return GLBench;

}());
