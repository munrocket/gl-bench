var GlBench = (function () {
  'use strict';

  class GlBench {

    constructor(canvas) {
      if (canvas && typeof canvas.getContext == 'function') {
        this.canvas = canvas;
      }
    }

    init() {
      let canvas = this.canvas;
      if (!canvas) {
        let cs = document.getElementsByTagName('canvas');
        for (let i = 0; i < cs.length; i++) {
          if (i == 0 || canvas.width * canvas.height < cs[i].width * cs[i].height) {
            canvas = cs[i];
          }
        }
      }
      let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        this.gl = gl;
        this.ext = gl.getExtension('EXT_disjoint_timer_query');
      } else {
        gl = canvas.getContext('webgl2');
        if (gl) {
          this.gl = gl;
          this.ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
          if (this.ext) {
            if (typeof gl.createQuery == 'function' && typeof gl.deleteQuery == 'function'
                  && typeof gl.beginQuery == 'function' && typeof gl.endQuery == 'function'
                  && typeof gl.getQueryParameter == 'function') {
              this.ext.createQueryEXT = gl.createQuery;
              this.ext.deleteQueryEXT = gl.deleteQuery;
              this.ext.beginQueryEXT = gl.beginQuery;
              this.ext.endQueryEXT = gl.endQuery;
              this.ext.getQueryObjectEXT = gl.getQueryParameter;
            } else if (this.ext.TIMESTAMP_EXT) {
              this.ext.createQueryEXT = () => { return {}; };
              this.ext.deleteQueryEXT = () => null;
              this.ext.beginQueryEXT = (t, o) => { o.t = this.ext.TIMESTAMP_EXT; };
              this.ext.endQueryEXT = (t) => { this.query[this.query.length-1].t -= this.ext.TIMESTAMP_EXT; };
              this.ext.getQueryObjectEXT = (o) => o.t;
            } else {
              this.ext = null;
            }
          }
        }
      }
      this.inited = true;
    }

    update() {
      if (this.ext) {
        this.updateGPU();
      } else if (this.inited) {
        this.updateCPU();
      } else {
        this.init();
        this.update();
      }
    }

    updateCPU() {
      if (this.cpuFrame === undefined) {
        this.cpuFrame = 0;
        this.prevTime = (performance || Date).now();
      } else {
        this.cpuFrame++;
        let time = (performance || Date).now();
        let elapsed = (time - this.prevTime) / 1000;
        if (elapsed > 1) {
          let fps = this.cpuFrame / elapsed;
          while (elapsed > 1) {
            console.log('CPU: ' + fps);
            elapsed--;
          }
          this.cpuFrame = 0;
          this.prevTime = time;
        }
      }
    }

    updateGPU() {
      if (!this.debug) {
        console.log(this.ext);
        this.debug = true;
      }
      if (this.gpuFrame === undefined) {
        this.query = [ this.ext.createQueryEXT() ];
        this.ext.beginQueryEXT(this.ext.TIME_ELAPSED_EXT, this.query[0]);
        this.gpuFrame = 0;
        this.elapsed = 0;
      } else {
        this.ext.endQueryEXT(this.ext.TIME_ELAPSED_EXT);
        if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
          for (var i = this.gpuFrame; i < this.query.length; i++) {          if (this.ext.getQueryObjectEXT(this.query[i], this.ext.QUERY_RESULT_AVAILABLE_EXT)) {
              this.ext;
              this.elapsed += this.ext.getQueryObjectEXT(this.query[i], this.ext.QUERY_RESULT_EXT) / 1e9;
              this.gpuFrame++;
              if (this.elapsed > 1) {
                let fps = this.gpuFrame / this.elapsed;
                while (this.elapsed > 1) {
                  console.log('GPU: ' + fps);
                  this.elapsed--;
                }
                for (let i = 0; i < this.gpuFrame; i++) {
                  this.ext.deleteQueryEXT(this.query[i]);
                }
                this.query.splice(0, this.gpuFrame);
                this.gpuFrame = 0;
                this.elapsed = 0;
              }
            }
          }
        }
        this.query.push(this.ext.createQueryEXT());
        this.ext.beginQueryEXT(this.ext.TIME_ELAPSED_EXT, this.query[this.query.length-1]);
      }
    }

  }

  return GlBench;

}());
