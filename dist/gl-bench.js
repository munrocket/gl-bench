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

  var UIFull = "<svg viewBox=\"0 0 100 70\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"70\" rx=\"26.5\" ry=\"26.5\" id=\"gl-bench-rect\"\n  fill=\"hsla(120, 50%, 60%, 0.65)\"/>\n\n<text x=\"26.5\" y=\"22\" class=\"gl-bench-text\" font-size=\"0.7em\" id=\"gl-bench-cpu\">00%</text>\n<text x=\"26.5\" y=\"34\" class=\"gl-bench-text\" font-size=\"0.7em\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\"\n  fill=\"none\" stroke=\"black\" style=\"opacity:0.4\"/>\n<path d=\"M21.09 37.0 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 -15.9155\n  0 0 1 0 31.831\" fill=\"none\" stroke=\"black\" stroke-width=\"2.6\" opacity=\"0.5\"\n  transform=\"scale(1.25663)\" stroke-dasharray=\"0, 100\" id=\"gl-bench-cpu-progress\"/>\n\n<circle cx=\"73.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\"\n  fill=\"none\" stroke=\"black\" style=\"opacity:0.4\"/>\n<text x=\"73.5\" y=\"22\" class=\"gl-bench-text\" font-size=\"0.7em\" id=\"gl-bench-gpu\">00%</text>\n<text x=\"73.5\" y=\"34\" class=\"gl-bench-text\" font-size=\"0.7em\">GPU</text>\n<path d=\"M58.59 37.0 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 -15.9155\n  0 0 1 0 31.831\" fill=\"none\" stroke=\"black\" stroke-width=\"2.6\" opacity=\"0.5\"\n  transform=\"scale(1.25663)\" stroke-dasharray=\"0, 100\" id=\"gl-bench-gpu-progress\"/>\n\n<text x=\"50\" y=\"59\" class=\"gl-bench-text\" font-size=\".8em\" id=\"gl-bench-fps\">00 FPS</text>\n<circle cx=\"18\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n<circle cx=\"82\" cy=\"58\" r=\"3\" style=\"opacity:0.55\"/>\n\n</svg>";

  var UIMin = "<svg viewBox=\"0 0 100 52.632\" class=\"gl-bench\">\n\n<rect x=\"0\" y=\"0\" width=\"100\" height=\"52.632\" rx=\"26.5\" ry=\"26.316\" id=\"gl-bench-rect\"\n  fill=\"hsla(120, 50%, 60%, 0.65)\"/>\n\n<text x=\"26.5\" y=\"22\" class=\"gl-bench-text\" font-size=\"0.7em\" id=\"gl-bench-cpu\">00%</text>\n<text x=\"26.5\" y=\"34\" class=\"gl-bench-text\" font-size=\"0.7em\">CPU</text>\n<circle cx=\"26.5\" cy=\"26.5\" r=\"20\" stroke-width=\"3.5\"\n  fill=\"none\" stroke=\"black\" style=\"opacity:0.4\"/>\n<path d=\"M21.09 37.0 a 15.9155 -15.9155 0 0 1 0 -31.831 a 15.9155 -15.9155\n  0 0 1 0 31.831\" fill=\"none\" stroke=\"black\" stroke-width=\"2.6\" opacity=\"0.5\"\n  transform=\"scale(1.25663)\" stroke-dasharray=\"2, 100\" id=\"gl-bench-cpu-progress\"/>\n\n<text x=\"74\" y=\"28\" class=\"gl-bench-text\" font-size=\"0.8em\" id=\"gl-bench-fps\">00 FPS</text>\n\n</svg>";

  var UIStyle = "#gl-bench-dom {\n  position: absolute;\n  left: 0;\n  top: 0;\n  margin: 0;\n}\n\n.gl-bench {\n  position: relative;\n  display: block;\n  margin: 5px;\n  cursor: pointer;\n  width: 100px;\n}\n\n.gl-bench-text {\n  font-family: sans-serif;\n  font-weight: 700;\n  dominant-baseline: middle;\n  text-anchor: middle;\n  opacity: 0.7;\n}\n";

  /**
  * WebGL-Benchmark Class
  * @param { Boolean | undefined } isDefaultUI
  * @param { Object | undefined } newLoggers
  */
  class GlBench {
    constructor(isDefaultUI = true, newLoggers = null) {
      this.isDefaultUI = isDefaultUI;
      this.loggers = newLoggers ? { new : newLoggers } : {};
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

      if (this.isDefaultUI) {

        // add default ui on page
        const rootNode = targetCanvas instanceof HTMLCanvasElement ? targetCanvas.parentNode : document.body;
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

        // set default loggers
        this.loggers.cpuMeasure = (() => {
          const cpuUI = document.getElementById('gl-bench-cpu'),
            cpuProgressUI = document.getElementById('gl-bench-cpu-progress').style;
          return (percent) => {
            cpuUI.innerHTML = percent.toFixed(0) + '%';
            cpuProgressUI.strokeDasharray = percent.toFixed(0) + ', 100';
            if (this.loggers.new && this.loggers.new.cpuMeasure) this.loggers.new.cpuMeasure(percent);
          }
        })();
        this.loggers.cpuFps = (() => {
          const fpsUI = document.getElementById('gl-bench-fps'),
            rectUI = document.getElementById('gl-bench-rect').style;
          return (fps) => {
            fpsUI.innerHTML = fps.toFixed(0) + ' FPS';
            rectUI.fill = 'hsla(' + Math.min(120, Math.max(0, 2.4 * (fps-10))).toFixed(0) + ', 50%, 60%, 0.65)';
            if (this.loggers.new && this.loggers.new.cpuFps) this.loggers.new.cpuFps(fps);
          }
        })();
        if (ext) {
          this.loggers.gpuMeasure = (() => {
            const gpuUI = document.getElementById('gl-bench-gpu'),
              gpuProgressUI = document.getElementById('gl-bench-gpu-progress').style;
            return (persent) => {
              gpuUI.innerHTML = persent.toFixed(0) + '%';
              gpuProgressUI.strokeDasharray = persent.toFixed(0) + ', 100';
              if (this.loggers.new && this.loggers.new.gpuMeasure) this.loggers.new.gpuMeasure(persent);
            }
          })();
          this.loggers.gpuFps = (() => {
            const fpsUI = document.getElementById('gl-bench-fps'), //<--------------DRY
              rectUI = document.getElementById('gl-bench-rect').style;
            return (fps) => {
              fpsUI.innerHTML = fps.toFixed(0) + ' FPS';
              rectUI.fill = 'hsla(' + Math.min(120, Math.max(0, 2.4 * (fps-10))).toFixed(0) + ', 50%, 60%, 0.65)';
              if (this.loggers.new && this.loggers.new.cpuFps) this.loggers.new.cpuFps(fps);
            }
          })();
          this.loggers.cpuFps = () => { };
        }
        
      } else if (this.new) {
        Object.assign(this.loggers, this.new);
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
