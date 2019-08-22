'use strict';

function updateGPU() {
  if (this.gpuFrames === undefined) {
    this.queries = [ this.gl.createQuery() ];
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queries[0]);
    this.gpuFrames = 0;
    this.nanosecs = [];
    this.duration = 0;
  } else {
    this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);

    if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
      for (let frameId = this.gpuFrames; frameId < this.queries.length; frameId++) {
        if (!this.gl.getQueryParameter(this.queries[frameId], this.gl.QUERY_RESULT_AVAILABLE)) {
          break;
        }

        if (this.startCounter && this.finishCounter) ;

        this.gpuFrames++;
        const ns = this.gl.getQueryParameter(this.queries[frameId], this.gl.QUERY_RESULT);
        this.nanosecs.push(ns);
        this.duration += ns;
        let seconds = this.duration / 1e9;
        if (seconds >= 1) {
          const fps = this.gpuFrames / seconds;
          while (seconds >= 1) {
            this.fpsLogger(fps);
            seconds--;
          }

          if (this.startCounter && this.finishCounter) ;

          for (let i = 0; i < frameId + 1; i++) {
            this.gl.deleteQuery(this.queries[i]);
          }
          this.queries.splice(0, frameId + 1);
          this.nanosecs.splice(0, frameId + 1);
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
  //calcCounter.bind(this)(this.gpuFrames);
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

module.exports = GlBench;
