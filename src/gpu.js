export default class GPU {

  constructor(gl, ext, fpsLogger, measureLogger) {
    this.fpsLogger = fpsLogger ? fpsLogger : () => {};
    this.measureLogger = measureLogger ? measureLogger : () => {};

    this.frameId = 0;
    this.names = [ null ];
    this.namedAccums = { };
    this.measureMode = 0;
    
    this.totalAccum = 0;
    this.queryId = 0;
    this.queryQueue = [ ];

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

  begin(name) {
    if (name === this.names[0]) {
      this.frameId++;
    }

    if(this.names.indexOf(name) == -1) {
      if (this.frameId == 0) {
        this.names[0] = name;
      } else {
        this.names.push(name);
      }
      this.namedAccums[name] = 0;
    }
    
    if (this.frameId != 0) {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      
      while (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT) && this.queryQueue[this.queryId] &&
            this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT_AVAILABLE)) {
        const dt = this.gl.getQueryParameter(this.queryQueue[this.queryId].query, this.gl.QUERY_RESULT);
        this.totalAccum += dt;
        const binaryFlags = this.queryQueue[this.queryId].measureMode.toString(2);
        for (let i = 0; i < binaryFlags.length; i++) {
          if (binaryFlags[i] == '1') {
            this.namedAccums[this.names[binaryFlags.length - i - 1]] += dt;
          }
        }

        this.queryId++;
        let seconds = this.totalAccum / 1e9;
        if (seconds >= 1) {
          const fps = (this.queryQueue[this.queryId-1].frameId - this.queryQueue[0].frameId) / seconds;
          const averageMeasures = this.names.map(name => 100 * this.namedAccums[name] / this.totalAccum);
          while (seconds >= 1) {
            for (let i = 0; i < this.names.length; i++) {
              this.fpsLogger(fps, i);
              this.measureLogger(averageMeasures[i], i);
            }
            seconds--;
          }
          this.queryQueue.slice(0, this.queryId).forEach(q => this.gl.deleteQuery(q.query));
          this.queryQueue.splice(0, this.queryId);
          this.names.forEach(name => this.namedAccums[name] = 0);
          this.totalAccum = 0;
          this.queryId = 0;
        }
      }
    }
    
    this.measureMode += 1 << this.names.indexOf(name);
    this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
  }

  end(name) {
    this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
    this.measureMode -= 1 << this.names.indexOf(name);

    this.queryQueue.push({ query: this.gl.createQuery(), measureMode: this.measureMode, frameId: this.frameId });
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queryQueue[this.queryQueue.length-1].query);
  }
}