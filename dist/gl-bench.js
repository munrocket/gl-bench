var GlBench = (function () {
  'use strict';

  /**
   * GPU benchmark
   * @param { WebGLRenderingContext | WebGL2RenderingContext } gl 
   * @param { EXT_disjoint_timer_query | EXT_disjoint_timer_query_webgl2 } ext 
   * @param { (x: string) => void } fpsLogger 
   * @param { (x: string) => void } measureLogger 
   */
  class GPU {

    constructor(fpsLogger, measureLogger, gl, ext) {
      this.fpsLogger = fpsLogger;
      this.measureLogger = measureLogger ? measureLogger : () => {};
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
        if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
          for (let i = this.queryId; i < this.queue.length; i++) {
            if (!this.gl.getQueryParameter(this.queue[i].query, this.gl.QUERY_RESULT_AVAILABLE)) {
              break;
            }
            
            this.queryId++;
            const dt = this.gl.getQueryParameter(this.queue[i].query, this.gl.QUERY_RESULT);
            this.elapsedAccum += dt;
            if (this.queue[i].isMeasure) {
              this.measureAccum += dt;
            }

            let seconds = this.elapsedAccum / 1e9;
            if (seconds >= 1) {
              const fps = (this.queue[this.queryId].frameId - this.queue[0].frameId) / seconds;
              while (seconds >= 1) {
                this.fpsLogger(fps);
                this.measureLogger(this.measureAccum / this.elapsedAccum);
                seconds--;
              }
              for (let j = 0; j < i + 1; j++) {
                this.gl.deleteQuery(this.queue[j].query);
              }
              this.queue.splice(0, i + 1);
              this.measureAccum = 0;
              this.elapsedAccum = 0;
              this.queryId = 0;
            }
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

  /**
   * CPU benchmark
   * @param { (x: string) => void } fpsLogger 
   * @param { (x: string) => void } measureLogger 
   */
  class CPU {

    constructor(fpsLogger, measureLogger) {
      this.fpsLogger = fpsLogger;
      this.measureLogger = measureLogger ? measureLogger : () => {};
      this.frameCount = 0;
      this.measureAccum = 0;
    }

    now() {
      return (typeof performance == 'undefined') ? Date.now() : performance.now();
    }

    begin() {
      if (typeof this.secStart == 'undefined') {
        this.secStart = this.now();
        this.currTime = this.secStart;
      } else {
        this.frameCount++;
        this.currTime = this.now();

        const elapsed = this.currTime - this.secStart;
        let seconds = elapsed / 1e3;
        if (seconds >= 1) {
          const fps = this.frameCount / seconds;
          while (seconds >= 1) {
            this.fpsLogger(fps);
            this.measureLogger(this.measureAccum / elapsed);
            seconds--;
          }
          this.measureAccum = 0;
          this.frameCount = 0;
          this.secStart = this.currTime;
        }
      }
    }

    end() {
      this.measureAccum += this.now() - this.currTime;
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
    init(canvas) {
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
        this.gl = gl;
      }
      this.cpu = new CPU(this.fpsLogger, this.counterLogger);
    }

    /**
     * Begin bottleneck measurement
     */
    begin() {
      if (this.gpu) {
        this.gpu.begin();
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
      } else if (this.cpu) {
        this.cpu.end();
      }
    }

    /**
     * Update fps
     */
    update() {
      this.begin();
    }
  }

  return GlBench;

}());
