/**
 * GPU benchmark
 * @param { WebGLRenderingContext | WebGL2RenderingContext } gl 
 * @param { EXT_disjoint_timer_query | EXT_disjoint_timer_query_webgl2 } ext 
 * @param { (x: string) => void } fpsLogger 
 * @param { (x: string) => void } measureLogger 
 */
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