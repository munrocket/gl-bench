var GLBench = (function () {
  'use strict';

  class GPU {

    constructor(gl, ext, fpsLogger, measureLogger) {
      this.fpsLogger = fpsLogger ? fpsLogger : () => {};
      this.measureLogger = measureLogger ? measureLogger : () => {};

      this.frameId = 0;
      this.names = [ null ];
      this.namedAccums = { };
      this.measureMode = 0;
      
      this.totalAccum = 0;
      this.queryId = 0;
      this.queryQueue = [ ];

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

    begin(name) {
      if (name === this.names[0]) {
        this.frameId++;
      }

      if(this.names.indexOf(name) == -1) {
        if (this.frameId == 0) {
          this.names[0] = name;
        } else {
          this.names.push(name);
        }
        this.namedAccums[name] = 0;
      }
      
      if (this.frameId != 0) {
        this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
        
        while (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT) && this.queryQueue[this.queryId] &&
              this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT_AVAILABLE)) {
          const dt = this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT);
          this.totalAccum += dt;
          const binaryFlags = this.queryQueue[this.queryId].measureMode.toString(2);
          for (let i = 0; i < binaryFlags.length; i++) {
            if (binaryFlags[i] == '1') {
              this.namedAccums[this.names[binaryFlags.length - i - 1]] += dt;
            }
          }

          this.queryId++;
          let seconds = this.totalAccum / 1e9;
          if (seconds >= 1) {
            const fps = (this.queryQueue[this.queryId-1].frameId - this.queryQueue[0].frameId) / seconds;
            const averageMeasures = this.names.map(name => 100 * this.namedAccums[name] / this.totalAccum);
            while (seconds >= 1) {
              for (let i = 0; i < this.names.length; i++) {
                this.fpsLogger(fps, i);
                this.measureLogger(averageMeasures[i], i);
              }
              seconds--;
            }
            this.queryQueue.slice(0, this.queryId).forEach(q => this.gl.deleteQuery(q.query));
            this.queryQueue.splice(0, this.queryId);
            this.names.forEach(name => this.namedAccums[name] = 0);
            this.totalAccum = 0;
            this.queryId = 0;
          }
        }
      }
      
      this.measureMode += 1 << this.names.indexOf(name);
      this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
    }

    end(name) {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      this.measureMode -= 1 << this.names.indexOf(name);

      this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
    }
  }

  class CPU {

    constructor(fpsLogger, measureLogger) {
      this.fpsLogger = fpsLogger ? fpsLogger : () => {};
      this.measureLogger = measureLogger ? measureLogger : () => {};

      this.frameId = 0;
      this.names = [ null ];
      this.namedAccums = { };
      this.measureMode = 0;
    }

    now() {
      return (performance && performance.now) ? performance.now() : Date.now();
    }

    begin(name) {
      if (name === this.names[0]) {
        this.frameId++;
      }

      if (this.names.indexOf(name) == -1) {
        if (this.frameId == 0) {
          this.names[0] = name;
        } else {
          this.names.push(name);
        }
        this.namedAccums[name] = 0;
        this.zerotime = this.now();
        this.timestamp = this.zerotime;
      }
      
      if (this.frameId != 0) {
        this.timestamp = this.now();
        const elapsed = this.timestamp - this.zerotime;
        let seconds = elapsed / 1e3;
        if (seconds >= 1) {
          const fps = this.frameId / seconds;
          const averageMeasures = this.names.map(name => 100 * this.namedAccums[name] / elapsed);
          while (seconds >= 1) {
            for (let i = 0; i < this.names.length; i++) {
              this.fpsLogger(fps, i);
              this.measureLogger(averageMeasures[i], i);
            }
            seconds--;
          }
          this.names.forEach(name => this.namedAccums[name] = 0);
          this.frameId = 0;
          this.zerotime = this.timestamp;
        }
      }
      
      this.measureMode += 1 << this.names.indexOf(name);
    }

    end(name) {
      const dt = this.now() - this.timestamp;
      const binaryFlags = this.measureMode.toString(2);
      for (let i = 0; i < binaryFlags.length; i++) {
        if (binaryFlags[i] == '1') {
          this.namedAccums[this.names[binaryFlags.length - i - 1]] += dt;
        }
      }

      this.measureMode -= 1 << this.names.indexOf(name);
    }
  }

  var UIFull = "<svg viewBox=\"0 0 100 70\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"70\" rx=\"26.5\" ry=\"26.5\" class=\"gl-bench-rect\"/>\n\n<text x=\"26.5\" y=\"22\" class=\"gl-bench-text gl-bench-cpu\">00%</text>\n<text x=\"26.5\" y=\"34\" class=\"gl-bench-text\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\" class=\"gl-bench-circle\"/>\n<path d=\"M21.0 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  class=\"gl-bench-progress gl-bench-cpu-progress\"/>\n\n<circle cx=\"73.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\" class=\"gl-bench-circle\"/>\n<text x=\"73.5\" y=\"22\" class=\"gl-bench-text gl-bench-gpu\">00%</text>\n<text x=\"73.5\" y=\"34\" class=\"gl-bench-text\">GPU</text>\n<path d=\"M21.0 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  class=\"gl-bench-progress gl-bench-gpu-progress\"/>\n\n<text x=\"50\" y=\"59\" font-size=\".8em\" class=\"gl-bench-text gl-bench-fps\">00 FPS</text>\n<circle cx=\"18\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n<circle cx=\"82\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n\n</svg>";

  var UIMin = "<svg viewBox=\"0 0 100 52.632\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"52.632\" rx=\"26.5\" ry=\"26.5\" class=\"gl-bench-rect\"/>\n\n<text x=\"26.5\" y=\"22\" class=\"gl-bench-text gl-bench-cpu\">00%</text>\n<text x=\"26.5\" y=\"34\" class=\"gl-bench-text\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\" class=\"gl-bench-circle\"/>\n<path d=\"M21.0 37 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 15.9155 0 0 1 0 31.831\"\n  class=\"gl-bench-progress gl-bench-cpu-progress\"/>\n\n<text x=\"74\" y=\"28\" font-size=\"0.8em\" class=\"gl-bench-text gl-bench-fps\">00 FPS</text>\n\n</svg>";

  var UIStyle = "#gl-bench-dom {\n  position: absolute;\n  left: 0;\n  top: 0;\n  margin: 0;\n}\n\n.gl-bench {\n  position: relative;\n  display: block;\n  margin: 5px;\n  width: 100px;\n}\n\n.gl-bench-rect {\n  fill: hsla(120, 50%, 60%, 0.65);\n}\n\n.gl-bench-text {\n  font-family: sans-serif;\n  font-weight: 700;\n  font-size: 0.7em;\n  dominant-baseline: middle;\n  text-anchor: middle;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  opacity: 0.7;\n}\n\n.gl-bench-progress {\n  fill: none;  \n  stroke: black;\n  stroke-width: 2.6;\n  opacity: 0.5;  \n  transform: scale(1.25663);\n  stroke-dasharray: 0, 100;\n}\n\n.gl-bench-circle {\n  fill: none;\n  stroke: black;\n  opacity: 0.4;\n}";

  /**
  * WebGL-Benchmark Class
  * @param { Object | undefined } newLoggers
  * @param { boolean | undefined } isDefaultUI
  */
  class GLBench {
    constructor(newLoggers = null, isDefaultUI = true) {
      this.isDefaultUI = isDefaultUI;
      this.loggers = newLoggers ? { new : newLoggers } : {};
    }

    /**
     * Initialization
     * @param { WebGLRenderingContext | WebGL2RenderingContext | HTMLCanvasElement } target 
     */
    init(target) {

      let ext, gl;
      if (target instanceof HTMLCanvasElement) target = target.getContext('webgl')
        || target.getContext('experimental-webgl') || target.getContext('webgl2');
      if (target instanceof WebGLRenderingContext) {
        gl = target;
        ext = gl.getExtension('EXT_disjoint_timer_query');
      } else if (target instanceof WebGL2RenderingContext) {
        gl = target;
        ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
      }

      if (this.isDefaultUI) {
        const rootNode = target instanceof HTMLCanvasElement ? target.parentNode : document.body;
        let domNode = document.getElementById('gl-bench-dom');
        if (!domNode) {
          domNode = document.createElement('div');
          domNode.id = 'gl-bench-dom';
          let styleNode = document.createElement('style');
          styleNode.innerHTML = UIStyle;
          rootNode.appendChild(styleNode);
        }
        let svgNode = document.createElement('template');
        svgNode.innerHTML = ext ? UIFull : UIMin;
        svgNode = svgNode.content.firstChild;

        this.loggers.cpuMeasure = (() => {
          const cpuUIs = svgNode.getElementsByClassName('gl-bench-cpu'),
            cpuProgressUIs = svgNode.getElementsByClassName('gl-bench-cpu-progress');
          return (percent, i) => {
            cpuUIs[i].innerHTML = percent.toFixed(0) + '%';
            cpuProgressUIs[i].style.strokeDasharray = percent.toFixed(0) + ', 100';
            if (this.loggers.new && this.loggers.new.cpuMeasure) this.loggers.new.cpuMeasure(percent);
          }
        })();
        this.loggers.cpuFps = (() => {
          const fpsUIs = svgNode.getElementsByClassName('gl-bench-fps'),
            rectUIs = svgNode.getElementsByClassName('gl-bench-rect');
          return (fps, i) => {
            fpsUIs[i].innerHTML = fps.toFixed(0) + ' FPS';
            rectUIs[i].style.fill = 'hsla(' + Math.min(120, Math.max(0, 2.182 * (fps-5))).toFixed(0) + ', 50%, 60%, 0.65)';
            if (this.loggers.new && this.loggers.new.cpuFps) this.loggers.new.cpuFps(fps);
          }
        })();
        if (ext) {
          this.loggers.gpuMeasure = (() => {
            const gpuUIs = svgNode.getElementsByClassName('gl-bench-gpu'),
              gpuProgressUIs = svgNode.getElementsByClassName('gl-bench-gpu-progress');
            return (percent, i) => {
              gpuUIs[i].innerHTML = percent.toFixed(0) + '%';
              gpuProgressUIs[i].style.strokeDasharray = percent.toFixed(0) + ', 100';
              if (this.loggers.new && this.loggers.new.gpuMeasure) this.loggers.new.gpuMeasure(percent);
            }
          })();
          this.loggers.gpuFps = (() => {
            const fpsUIs = svgNode.getElementsByClassName('gl-bench-fps'), //<--------------DRY
              rectUIs = svgNode.getElementsByClassName('gl-bench-rect');
            return (fps, i) => {
              fpsUIs[i].innerHTML = fps.toFixed(0) + ' FPS';
              rectUIs[i].style.fill = 'hsla(' + Math.min(120, Math.max(0, 2.182 * (fps-5))).toFixed(0) + ', 50%, 60%, 0.65)';
              if (this.loggers.new && this.loggers.new.cpuFps) this.loggers.new.cpuFps(fps);
            }
          })();
          this.loggers.cpuFps = () => { };
        }
        domNode.appendChild(svgNode);
        rootNode.appendChild(domNode);
      } else if (this.loggers.new) {
        Object.assign(this.loggers, this.loggers.new);
      }

      this.cpu = new CPU(this.loggers.cpuFps, this.loggers.cpuMeasure);
      this.gpu = (ext) ? new GPU(gl, ext, this.loggers.gpuFps, this.loggers.gpuMeasure) : null;
    }

    /**
     * Begin named measurement
     * @param { string } name
     */
    begin(name) {
      if (this.gpu) {
        this.cpu.begin(name);
        this.gpu.begin(name);
      } else if (this.cpu) {
        this.cpu.begin(name);
      } else {
        this.init();
        this.begin(name);
      }
    }

    /**
     * End named measurement
     * @param { string } name
     */
    end(name) {
      if (this.gpu) {
        this.cpu.end(name);
        this.gpu.end(name);
      } else if (this.cpu) {
        this.cpu.end(name);
      }
    }

    /**
     * Only fps update
     */
    update() {
      this.begin();
    }
  }

  return GLBench;

}());
