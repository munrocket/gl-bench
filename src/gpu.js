export default class GPU {

  constructor(gl, ext, fpsLogger, gpuLogger) {
    this.fpsLogger = fpsLogger ? fpsLogger : () => {};
    this.gpuLogger = gpuLogger ? gpuLogger : () => {};

    this.frameId = 0;
    this.namedAccums = [];
    this.measureMode = 0;

    this.queryId = 0;
    this.queryQueue = [];
    this.totalAccum = 0;

    // unify webgl & webgl2 api
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

  begin(nameId) {
    if (nameId === 0) this.frameId++;
    if (this.namedAccums.length <= nameId) this.namedAccums.push(0);
    
    if (this.queryQueue.length > 0) {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      while (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT) &&
            this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT_AVAILABLE)) {
              
        const dt = this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT);
        this.totalAccum += dt;
        const binaryFlags = this.queryQueue[this.queryId].measureMode.toString(2);
        for (let i = 0; i < binaryFlags.length; i++) {
          if (binaryFlags[i] == '1') this.namedAccums[binaryFlags.length - i - 1] += dt;
        }

        this.queryId++;
        let seconds = this.totalAccum / 1e9;
        if (seconds >= 1) {
          const frames = this.queryQueue[this.queryId-1].frameId - this.queryQueue[0].frameId;
          const fps = frames / seconds;
          const frametime = this.totalAccum / frames / 1e6;
          for (let i = 0; i < this.namedAccums.length; i++) {
            const accum = this.namedAccums[i];
            const gpu = accum / this.totalAccum * 100;
            const ms = accum / frames / 1e6;
            this.gpuLogger(gpu, ms, i);
            this.fpsLogger(fps, frametime, i);
          }
          this.queryQueue.slice(0, this.queryId).forEach(q => this.gl.deleteQuery(q.query));
          this.queryQueue.splice(0, this.queryId);
          let i = this.namedAccums.length;
          while (i--) this.namedAccums[i] = 0;
          this.totalAccum = 0;
          this.queryId = 0;
        }
      }
    }
    
    this.measureMode += 1 << nameId;
    this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
  }

  end(nameId) {
    this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
    this.measureMode -= 1 << nameId;

    this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
  }
}