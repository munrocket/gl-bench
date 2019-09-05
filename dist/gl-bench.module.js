/**
 * GPU benchmark
 * @param { WebGLRenderingContext | WebGL2RenderingContext } gl 
 * @param { EXT_disjoint_timer_query | EXT_disjoint_timer_query_webgl2 } ext 
 * @param { (x: string) => void } fpsLogger 
 * @param { (x: string) => void } counterLogger 
 */
class GPU {

  constructor(fpsLogger, counterLogger, gl, ext) {
    this.fpsLogger = fpsLogger;
    this.counterLogger = counterLogger;
    this.gl = gl;
    this.ext = ext;
  }

  update() {
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

  begin() {
    if (this.startCounter === undefined) {
      this.startCounter = [ ];
      this.finishCounter = [ ];
    }
    this.startCounter.push(this.gl.createQuery());
    this.finishCounter.push(this.gl.createQuery());
    this.ext.queryCounterEXT(this.startCounter[this.startCounter.length-1], this.ext.TIMESTAMP_EXT);
  }

  end() {
    this.ext.queryCounterEXT(this.finishCounter[this.finishCounter.length-1], this.ext.TIMESTAMP_EXT);
  }

  calcCounter(frameId) {
    let counterDuration = 0;
    let framesDuration = 0;
    if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
      for (let i = 0, len = Math.min(this.startCounter.length, this.finishCounter.length); i < len; i++) {
        const startAvailable = this.gl.getQueryParameter(this.startCounter[i], this.gl.QUERY_RESULT_AVAILABLE);
        const finishAvailable = this.gl.getQueryParameter(this.finishCounter[i], this.gl.QUERY_RESULT_AVAILABLE);
        console.log(startAvailable, finishAvailable);
        if (startAvailable && finishAvailable) {
          const startResult = this.gl.getQueryParameter(this.startCounter[i], this.gl.QUERY_RESULT);
          const finishResult = this.gl.getQueryParameter(this.finishCounter[i], this.gl.QUERY_RESULT);
          counterDuration += (finishResult - startResult) / 1e9;
          framesDuration += this.nanosecs[i];
        }
      }
    }
    if (framesDuration != 0) {
      this.counterLogger(counterDuration / framesDuration);
    }
  }
}

/**
 * CPU benchmark
 * @param { (x: string) => void } fpsLogger 
 * @param { (x: string) => void } counterLogger 
 */
class CPU {

  constructor(fpsLogger, counterLogger) {
    this.fpsLogger = fpsLogger;
    this.counterLogger = counterLogger;
  }

  now() {
    return (typeof performance != 'undefined') ? performance.now() : Date.now();
  }

  update() {
    if (this.frames === undefined) {
      this.frames = 0;
      this.prevTime = this.now();
    } else {
      this.frames++;
      let time = this.now();
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

  begin() {
    this.counterBegin = this.now();
  }

  end() {
    if (this.prevframes === undefined) {
      this.counterDuration = 0;
    } else if (this.frames === 0) {
      this.counterLogger(this.counterDuration / this.ms);
      this.counterDuration = 0;
    } else {
      this.counterDuration += this.now() - this.counterBegin;
    }
    this.prevframes = this.frames;
  }
}

/**
* WebGL Benchmark Class
* @param { (x: string) => void } fpsLogger
* @param { (x: string) => void } counterLogger 
*/
class GlBench {
  constructor(fpsLogger, counterLogger) {
    this.fpsLogger = fpsLogger;
    this.counterLogger = counterLogger;
  }

  /**
   * Explicit canvas initialization
   * @param { ?HTMLCanvasElement } canvas 
   */
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
      let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        let ext = gl.getExtension('EXT_disjoint_timer_query');
        if (ext) {
          gl.createQuery = ext.createQueryEXT.bind(ext);
          gl.deleteQuery = ext.deleteQueryEXT.bind(ext);
          gl.beginQuery = ext.beginQueryEXT.bind(ext);
          gl.endQuery = ext.endQueryEXT.bind(ext);
          gl.getQueryParameter = ext.getQueryObjectEXT.bind(ext);
          gl.QUERY_RESULT_AVAILABLE = ext.QUERY_RESULT_AVAILABLE_EXT;
          gl.QUERY_RESULT = ext.QUERY_RESULT_EXT;
          this.gpu = new GPU(this.fpsLogger, this.counterLogger, gl, ext);
        }
      } else {
        gl = canvas.getContext('webgl2');
        let ext = (gl) ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
        if (ext) {
          this.gpu = new GPU(this.fpsLogger, this.counterLogger, gl, ext);
        }
      }
    }
    this.cpu = new CPU(this.fpsLogger, this.counterLogger);
  }

  /**
   * Update fps
   */
  update() {
    if (this.gpu) {
      this.gpu.update();
    } else if (this.cpu) {
      this.cpu.update();
    } else {
      this.initCanvas();
      this.update();
    }
  }

  /**
   * Begin bottleneck measurement
   */
  begin() {
    if (this.ext) {
      this.gpu.begin();
    } else if (this.cpu) {
      this.cpu.begin();
    } else {
      this.initCanvas();
      this.begin();
    }
  }

  /**
   * End bottleneck measurement
   */
  end() {
    if (this.ext) {
      this.gpu.end();
    } else if (this.cpu) {
      this.cpu.end();
    }
  }
}

export default GlBench;
