export function updateGPU() {
  if (this.gpuFrames === undefined) {
    this.queries = [ this.gl.createQuery() ];
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.queries[0]);
    this.gpuFrames = 0;
    this.nanosecs = [];
    this.duration = 0
  } else {
    this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);

    if (!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
      for (let frameId = this.gpuFrames; frameId < this.queries.length; frameId++) {
        if (!this.gl.getQueryParameter(this.queries[frameId], this.gl.QUERY_RESULT_AVAILABLE)) {
          break;
        }

        if (this.startCounter && this.finishCounter) {
          //calcCounter.bind(this)(frameId);
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

          if (this.startCounter && this.finishCounter) {
            //console.log(this.gl.getQuery(this.ext.TIMESTAMP_EXT, this.ext.QUERY_COUNTER_BITS_EXT));
            //calcCounter.bind(this)(frameId);
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

export function beginGPU() {
  if (this.startCounter === undefined) {
    this.startCounter = [ ];
    this.finishCounter = [ ];
  }
  this.startCounter.push(this.gl.createQuery());
  this.finishCounter.push(this.gl.createQuery());
  this.ext.queryCounterEXT(this.startCounter[this.startCounter.length-1], this.ext.TIMESTAMP_EXT);
}

export function endGPU() {
  this.ext.queryCounterEXT(this.finishCounter[this.finishCounter.length-1], this.ext.TIMESTAMP_EXT);
  //calcCounter.bind(this)(this.gpuFrames);
}

function calcCounter(frameId) {
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

  if ( /* all bugs are fixed */  false ) {
    for (let i = 0; i < frameId + 1; i++) {
      this.gl.deleteQuery(this.startCounter[i]);
      this.gl.deleteQuery(this.finishCounter[i]);
    }
    this.startCounter.splice(0, frameId + 1);
    this.finishCounter.splice(0, frameId + 1);
  }
}