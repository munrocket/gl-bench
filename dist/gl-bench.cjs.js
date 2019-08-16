'use strict';

class GlBench {

  constructor(uiUpdate) {
    if (typeof uiUpdate == 'function') {
      this.uiUpdate = uiUpdate;
    } else {
      console.error('Wrong fist parameter in new GlBench()');
    }
  }

  initCanvas(canvas) {
    if (canvas && typeof canvas.getContext == 'function') {
      if (!canvas) {
        let cs = document.getElementsByTagName('canvas');
        for (let i = 0; i < cs.length; i++) {
          if (i == 0 || canvas.width * canvas.height < cs[i].width * cs[i].height) {
            canvas = cs[i];
          }
        }
      }
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
    }
    this.inited = true;
  }

  update() {
    if (this.ext) {
      this.updateGPU();
    } else if (this.inited) {
      this.updateCPU();
    } else {
      this.initCanvas();
      this.update();
    }
  }

  updateCPU() {
    if (this.cpuFrames === undefined) {
      this.cpuFrames = 0;
      this.prevTime = (performance || Date).now();
    } else {
      this.cpuFrames++;
      let time = (performance || Date).now();
      let duration = (time - this.prevTime) / 1000;
      if (duration > 1) {
        let fps = this.cpuFrames / duration;
        while (duration > 1) {
          this.uiUpdate(fps);
          duration--;
        }
        this.cpuFrames = 0;
        this.prevTime = time;
      }
    }
  }

  updateGPU() {
    if (this.queriesFrames === undefined) {
      this.queries = [ this.gl.createQuery() ];
      this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queries[0]);
      this.queriesFrames = 0;
      this.queriesDuration = 0;
    } else {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) { //check for bugs
        for (var i = this.queriesFrames; i < this.queries.length; i++) {
          if (this.gl.getQueryParameter(this.queries[i], this.gl.QUERY_RESULT_AVAILABLE)) {
            this.queriesDuration += this.gl.getQueryParameter(this.queries[i], this.gl.QUERY_RESULT) / 1e9;
            this.queriesFrames++;
            if (this.queriesDuration > 1) {
              let fps = this.queriesFrames / this.queriesDuration;
              while (this.queriesDuration > 1) {
                this.uiUpdate(fps);
                this.queriesDuration--;
              }
              for (let i = 0; i < this.queriesFrames; i++) {
                this.gl.deleteQuery(this.queries[i]);
              }
              this.queries.splice(0, this.queriesFrames);
              this.queriesFrames = 0;
              this.queriesDuration = 0;
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
