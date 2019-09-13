export default class GPU {

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
      while (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT) && this.queue[this.queryId] &&
          this.gl.getQueryParameter(this.queue[this.queryId].query, this.gl.QUERY_RESULT_AVAILABLE)) {
        
        const dt = this.gl.getQueryParameter(this.queue[this.queryId].query, this.gl.QUERY_RESULT);
        this.elapsedAccum += dt;
        this.measureAccum += this.queue[this.queryId].isMeasure ? dt : 0;
        let seconds = this.elapsedAccum / 1e9;

        this.queryId++;
        
        if (seconds >= 1) {
          const fps = (this.queue[this.queryId-1].frameId - this.queue[0].frameId) / seconds;
          while (seconds >= 1) {
            this.fpsLogger(fps);
            this.measureLogger(this.measureAccum / this.elapsedAccum);
            seconds--;
          }
          this.queue.slice(0, this.queryId).forEach(q => this.gl.deleteQuery(q));
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