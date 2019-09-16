var GlBench = (function () {
  'use strict';

  class GPU {

    constructor(fpsLogger, measureLogger, gl, ext) {
      this.fpsLogger = fpsLogger;
      this.measureLogger = measureLogger;
      this.gl = gl;
      this.ext = ext;

      this.frameId = 0;
      this.elapsedAccum = 0;
      this.measureAccum = 0;
      this.queue = [{ query: this.gl.createQuery(), isMeasure: false, frameId: this.frameId }];
    }

    begin() {
      if (typeof this.queryId == 'undefined') {
        this.queryId = 0;
        this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queue[0].query);
      } else {
        this.frameId++;
        this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
        while (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT) && this.queue[this.queryId] &&
            this.gl.getQueryParameter(this.queue[this.queryId].query, this.gl.QUERY_RESULT_AVAILABLE)) {
          
          const dt = this.gl.getQueryParameter(this.queue[this.queryId].query, this.gl.QUERY_RESULT);
          this.elapsedAccum += dt;
          this.measureAccum += this.queue[this.queryId].isMeasure ? dt : 0;
          let seconds = this.elapsedAccum / 1e9;

          this.queryId++;
          
          if (seconds >= 1) {
            const fps = (this.queue[this.queryId-1].frameId - this.queue[0].frameId) / seconds;
            const avgMeasure = 100 * this.measureAccum / this.elapsedAccum;
            while (seconds >= 1) {
              this.fpsLogger(fps);
              this.measureLogger(avgMeasure);
              seconds--;
            }
            this.queue.slice(0, this.queryId).forEach(q => this.gl.deleteQuery(q.query));
            this.queue.splice(0, this.queryId);
            this.elapsedAccum = 0;
            this.measureAccum = 0;
            this.queryId = 0;
          }
        }

        this.queue.push({ query: this.gl.createQuery(), isMeasure: false, frameId: this.frameId });
        this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queue[this.queue.length-1].query);
      }
    }

    end() {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      this.queue[this.queue.length-1].isMeasure = true;

      this.queue.push({ query: this.gl.createQuery(), isMeasure: false, frameId: this.frameId });
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queue[this.queue.length-1].query);
    }
  }

  class CPU {

    constructor(fpsLogger, measureLogger) {
      this.fpsLogger = fpsLogger;
      this.measureLogger = measureLogger;
      this.frameCount = 0;
      this.measureAccum = 0;
    }

    now() {
      return (typeof performance == 'undefined') ? Date.now() : performance.now();
    }

    begin() {
      if (typeof this.zerotime == 'undefined') {
        this.zerotime = this.now();
        this.timestamp = this.zerotime;
      } else {
        this.frameCount++;
        this.timestamp = this.now();

        const elapsed = this.timestamp - this.zerotime;
        let seconds = elapsed / 1e3;
        if (seconds >= 1) {
          const fps = this.frameCount / seconds;
          const avgMeasure = 100 * this.measureAccum / elapsed;
          while (seconds >= 1) {
            this.fpsLogger(fps);
            this.measureLogger(avgMeasure);
            seconds--;
          }
          this.measureAccum = 0;
          this.frameCount = 0;
          this.zerotime = this.timestamp;
        }
      }
    }

    end() {
      this.measureAccum += this.now() - this.timestamp;
    }
  }

  var UIFull = "<svg viewBox=\"0 0 100 70\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"70\" rx=\"25\" ry=\"25\" id=\"gl-bench-rect\"\n  style=\"fill:#999;stroke-width:0;opacity:0.7\"/>\n\n<text x=\"25\" y=\"22\" class=\"gl-bench-text\" font-size=\"0.7em\" id=\"gl-bench-cpu\">00%</text>\n<text x=\"25\" y=\"33\" class=\"gl-bench-text\" font-size=\"0.7em\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\"\n  fill=\"none\" stroke=\"black\" style=\"opacity:0.4\"/>\n\n<circle cx=\"74.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\"\n  fill=\"none\" stroke=\"black\" style=\"opacity:0.4\"/>\n<text x=\"75\" y=\"22\" class=\"gl-bench-text\" font-size=\"0.7em\" id=\"gl-bench-gpu\">00%</text>\n<text x=\"75\" y=\"33\" class=\"gl-bench-text\" font-size=\"0.7em\">GPU</text>\n\n<text x=\"50\" y=\"59\" class=\"gl-bench-text\" font-size=\".8em\" id=\"gl-bench-fps\">00 FPS</text>\n<circle cx=\"18\" cy=\"58\" r=\"3\" style=\"opacity:0.4\"/>\n<circle cx=\"82\" cy=\"58\" r=\"3\" style=\"opacity:0.4\"/>\n\n</svg>";

  var UIMin = "<svg viewBox=\"0 0 95 50\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"95\" height=\"50\" rx=\"25\" ry=\"25\" id=\"gl-bench-rect\"\n  style=\"fill:#999;stroke:black;stroke-width:0;opacity:0.7\" />\n\n<text x=\"25\" y=\"20\" class=\"gl-bench-text\" font-size=\"0.7em\" id=\"gl-bench-cpu\">00%</text>\n<text x=\"25\" y=\"33\" class=\"gl-bench-text\" font-size=\"0.7em\">CPU</text>\n<circle cx=\"25\" cy=\"25\" r=\"20\" fill=\"none\"\n  stroke-width=\"3\" stroke=\"black\" style=\"opacity:0.4\"/>\n\n<text x=\"70\" y=\"27\" class=\"gl-bench-text\" font-size=\"0.75em\" id=\"gl-bench-fps\">00 FPS</text>\n\n</svg>";

  var UIStyle = "#gl-bench-dom {\n  position: absolute;\n  left: 0;\n  top: 0;\n  margin: 0;\n}\n\n.gl-bench {\n  position: relative;\n  display: block;\n  margin: 5px;\n  cursor: pointer;\n  width: 100px;\n}\n\n.gl-bench-text {\n  font-family: sans-serif;\n  font-weight: 700;\n  dominant-baseline: middle;\n  text-anchor: middle;\n  opacity: 0.7;\n}\n";

  /**
  * WebGL-Benchmark Class
  * @param { Boolean | undefined } isDefaultUI
  * @param { Object | undefined } specificLoggers
  */
  class GlBench {
    constructor(isDefaultUI = true, specificLoggers = null) {
      this.isDefaultUI = isDefaultUI;
      this.isDefaultLoggers = !specificLoggers;
      this.loggers = specificLoggers ? specificLoggers : {};
    }

    /**
     * Expicit initialization
     * @param { HTMLCanvasElement | undefined } targetCanvas 
     */
    init(targetCanvas = null) {

      // chose biggest canvas if not specified
      if (!targetCanvas) {
        let cs = document.getElementsByTagName('canvas');
        for (let i = 0; i < cs.length; i++) {
          if (i == 0 || targetCanvas.width * targetCanvas.height < cs[i].width * cs[i].height) {
            targetCanvas = cs[i];
          }
        }
      }

      // polyfill for webgl1 api
      let ext, gl;
      if (targetCanvas instanceof HTMLCanvasElement) {
        gl = targetCanvas.getContext('webgl') || targetCanvas.getContext('experimental-webgl');
        if (gl) {
          ext = gl.getExtension('EXT_disjoint_timer_query');
          if (ext) {
            gl.createQuery = ext.createQueryEXT.bind(ext);
            gl.deleteQuery = ext.deleteQueryEXT.bind(ext);
            gl.beginQuery = ext.beginQueryEXT.bind(ext);
            gl.endQuery = ext.endQueryEXT.bind(ext);
            gl.getQueryParameter = ext.getQueryObjectEXT.bind(ext);
            gl.QUERY_RESULT_AVAILABLE = ext.QUERY_RESULT_AVAILABLE_EXT;
            gl.QUERY_RESULT = ext.QUERY_RESULT_EXT;
          }
        } else {
          gl = targetCanvas.getContext('webgl2');
          ext = gl ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
        }
      }

      // add default ui on page
      if (this.isDefaultUI) {
        let rootNode = targetCanvas instanceof HTMLCanvasElement ? targetCanvas.parentNode : document.body;
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
        domNode.appendChild(svgNode.content.firstChild);
        rootNode.appendChild(domNode);
      }

      // set default loggers
      if (this.isDefaultLoggers && this.isDefaultUI) {
        function setDomText(id, val) { document.getElementById(id).innerHTML = val; } //<------optimize DOM invoke
        this.loggers.cpuMeasure = (x) => { setDomText('gl-bench-cpu', x.toFixed(0) + '%'); };
        this.loggers.cpuFps = (x) => { setDomText('gl-bench-fps', x.toFixed(0) + ' FPS'); };
        if (ext) {
          this.loggers.gpuMeasure = (x) => { setDomText('gl-bench-gpu', x.toFixed(0) + '%'); };
          this.loggers.gpuFps = (x) => { setDomText('gl-bench-fps', x.toFixed(0) + ' FPS'); };
          this.loggers.cpuFps = () => { };
        }
      }

      // init benchmarks
      this.cpu = new CPU(this.loggers.cpuFps, this.loggers.cpuMeasure);
      this.gpu = (ext) ? new GPU(this.loggers.gpuFps, this.loggers.gpuMeasure, gl, ext) : null;
    }

    /**
     * Begin bottleneck measurement
     */
    begin() {
      if (this.gpu) {
        this.gpu.begin();
        this.cpu.begin();
      } else if (this.cpu) {
        this.cpu.begin();
      } else {
        this.init();
        this.begin();
      }
    }

    /**
     * End bottleneck measurement
     */
    end() {
      if (this.gpu) {
        this.gpu.end();
        this.cpu.end();
      } else if (this.cpu) {
        this.cpu.end();
      }
    }

    /**
     * Nothing interesting here, only fps
     */
    update() {
      this.begin();
      if (this.gpu) {
        this.cpu.fpsLogger = () => {};
      }
    }
  }

  return GlBench;

}());
