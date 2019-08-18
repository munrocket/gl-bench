var GlBench = (function () {
  'use strict';

  function updateGPU() {
    if (this.gpuFrames === undefined) {
      this.queries = [ this.gl.createQuery() ];
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queries[0]);
      this.gpuFrames = 0;
      this.nanosec = [];
      this.duration = 0;
    } else {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);

      if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
        for (let i = this.gpuFrames; i < this.queries.length; i++) {
          if (!this.gl.getQueryParameter(this.queries[i], this.gl.QUERY_RESULT_AVAILABLE)) {
            break;
          }
          this.gpuFrames++;
          this.nanosec.push(this.gl.getQueryParameter(this.queries[i], this.gl.QUERY_RESULT));
          this.duration += this.nanosec[this.nanosec.length-1];
          let seconds = this.duration / 1e9;
          if (seconds >= 1) {
            const fps = this.gpuFrames / seconds;
            while (seconds >= 1) {
              this.fpsLogger(fps);
              seconds--;
            }

            if (this.startCounter && this.endCounter) {
              calcCounter.bind(this)(i);
            }

            for (let j = 0; j < i; i++) {
              this.gl.deleteQuery(this.queries[i]);
            }
            this.queries.splice(0, i);
            this.nanosec.splice(0, i);
            this.gpuFrames = 0;
            this.duration = 0;
          }
        }
      }
      
      this.queries.push(this.gl.createQuery());
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queries[this.queries.length-1]);
    }
  }

  function beginGPU() {
    if (this.startCounter === undefined) {
      this.startCounter = [ ];
      this.finishCounter = [ ];
    }
    this.startCounter.push(this.gl.createQuery());
    this.finishCounter.push(this.gl.createQuery());
    this.ext.queryCounterEXT(this.startCounter[this.startCounter.length-1], this.ext.TIMESTAMP_EXT);
  }

  function endGPU() {
    this.ext.queryCounterEXT(this.finishCounter[this.finishCounter.length-1], this.ext.TIMESTAMP_EXT);
  }

  function calcCounter(index) {
    let counterDuration = 0;
    let framesDuration = 0;
    for (let i = 0, len = Math.min(this.startCounter.length, this.finishCounter.length, this.nanosec.length); i < len; i++) {
      const startFree = this.gl.getQueryParameter(this.finishCounter[i], this.gl.QUERY_RESULT_AVAILABLE);
      const finishFree = this.gl.getQueryParameter(this.finishCounter[i], this.gl.QUERY_RESULT_AVAILABLE);
      if (startFree && finishFree) {
        const startResult = this.gl.getQueryParameter(this.startCounter[i], this.gl.QUERY_RESULT);
        const finishResult = this.gl.getQueryParameter(this.finishCounter[i], this.gl.QUERY_RESULT);
        counterDuration += (finishResult - startResult) / 1e9;
        framesDuration += this.nanosec[i];
      }
    }
    this.counterLogger(counterDuration / framesDuration);
    for (let i = 0; i < index; i++) {
      this.gl.deleteQuery(this.startCounter[index]);
      this.gl.deleteQuery(this.finishCounter[index]);
    }
    this.startCounter.splice(0, index);
    this.finishCounter.splice(0, index);
  }

  function now() {
    return (window.performance || Date).now();
  }

  function updateCPU() {
    if (this.frames === undefined) {
      this.frames = 0;
      this.prevTime = now();
    } else {
      this.frames++;
      let time = now();
      this.ms = time - this.prevTime;
      let seconds = this.ms / 1000;
      if (seconds >= 1) {
        let fps = this.frames / seconds;
        while (seconds >= 1) {
          this.fpsLogger(fps);
          seconds--;
        }
        this.frames = 0;
        this.prevTime = time;
      }
    }
  }

  function beginCPU() {
    this.counterBegin = now();
  }

  function endCPU() {
    if (this.prevframes === undefined) {
      this.counterDuration = 0;
    } else if (this.frames === 0) {
      this.counterLogger(this.counterDuration / this.ms);
      this.counterDuration = 0;
    } else {
      this.counterDuration += now() - this.counterBegin;
    }
    this.prevframes = this.frames;
  }

  class GlBench {

    constructor(fpsLogger, counterLogger) {
      this.fpsLogger = (typeof fpsLogger == 'function') ? fpsLogger : null;
      this.counterLogger = (typeof fpsLogger == 'function') ? counterLogger : null;
    }

    initCanvas(canvas) {
      if (!canvas) {
        let cs = document.getElementsByTagName('canvas');
        for (let i = 0; i < cs.length; i++) {
          if (i == 0 || canvas.width * canvas.height < cs[i].width * cs[i].height) {
            canvas = cs[i];
          }
        }
      }
      if (canvas && typeof canvas.getContext == 'function') {
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (this.gl) {
          this.ext = this.gl.getExtension('EXT_disjoint_timer_query');
          this.gl.createQuery = this.ext.createQueryEXT.bind(this.ext);
          this.gl.deleteQuery = this.ext.deleteQueryEXT.bind(this.ext);
          this.gl.beginQuery = this.ext.beginQueryEXT.bind(this.ext);
          this.gl.endQuery = this.ext.endQueryEXT.bind(this.ext);
          this.gl.getQueryParameter = this.ext.getQueryObjectEXT.bind(this.ext);
          this.gl.QUERY_RESULT_AVAILABLE = this.ext.QUERY_RESULT_AVAILABLE_EXT;
          this.gl.QUERY_RESULT = this.ext.QUERY_RESULT_EXT;
        } else {
          this.gl = canvas.getContext('webgl2');
          this.ext = (this.gl) ? this.gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
        }
      } else {
        console.log('CPU fallback');
      }
      this.inited = true;
    }

    update() {
      if (this.ext) {
        updateGPU.bind(this)();
      } else if (this.inited) {
        updateCPU.bind(this)();
      } else {
        this.initCanvas();
        this.update();
      }
    }

    begin() {
      if (this.ext) {
        beginGPU.bind(this)();
      } else if (this.inited) {
        beginCPU.bind(this)();
      } else {
        this.initCanvas();
        this.begin();
      }
    }

    end() {
      if (this.ext) {
        endGPU.bind(this)();
      } else if (this.inited) {
        endCPU.bind(this)();
      }
    }
  }

  return GlBench;

}());
