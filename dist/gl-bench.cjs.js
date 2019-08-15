'use strict';

class GlBench {

  constructor(uiUpdate, canvas = null) {
    if (typeof uiUpdate == 'function') {
      this.uiUpdate = uiUpdate;
    } else {
      console.error('Wrong fist parameter in new GlBench()');
    }
    if (canvas && typeof canvas.getContext == 'function') {
      this.canvas = canvas;
    }
  }

  init() {
    if (!this.canvas) {
      let cs = document.getElementsByTagName('canvas');
      for (let i = 0; i < cs.length; i++) {
        if (i == 0 || this.canvas.width * this.canvas.height < cs[i].width * cs[i].height) {
          this.canvas = cs[i];
        }
      }
    }
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
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
      this.gl = this.canvas.getContext('webgl2');
      this.ext = (this.gl) ? this.gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
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
          this.uiUpdate(fps);
          elapsed--;
        }
        this.cpuFrame = 0;
        this.prevTime = time;
      }
    }
  }

  updateGPU() {
    if (this.gpuFrame === undefined) {
      this.query = [ this.gl.createQuery() ];
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.query[0]);
      this.gpuFrame = 0;
      this.elapsed = 0;
    } else {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
        for (var i = this.gpuFrame; i < this.query.length; i++) {          if (this.gl.getQueryParameter(this.query[i], this.gl.QUERY_RESULT_AVAILABLE)) {
            this.elapsed += this.gl.getQueryParameter(this.query[i], this.gl.QUERY_RESULT) / 1e9;
            this.gpuFrame++;
            if (this.elapsed > 1) {
              let fps = this.gpuFrame / this.elapsed;
              while (this.elapsed > 1) {
                this.uiUpdate(fps);
                this.elapsed--;
              }
              for (let i = 0; i < this.gpuFrame; i++) {
                this.gl.deleteQuery(this.query[i]);
              }
              this.query.splice(0, this.gpuFrame);
              this.gpuFrame = 0;
              this.elapsed = 0;
            }
          }
        }
      }
      this.query.push(this.gl.createQuery());
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.query[this.query.length-1]);
    }
  }

}

module.exports = GlBench;
