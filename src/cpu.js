export default class CPU {

  constructor(fpsLogger, measureLogger) {
    this.fpsLogger = fpsLogger;
    this.measureLogger = measureLogger;
    this.frameCount = 0;
    this.measureAccum = 0;
  }

  now() {
    return (typeof performance == 'undefined') ? Date.now() : performance.now();
  }

  begin() {
    if (typeof this.zerotime == 'undefined') {
      this.zerotime = this.now();
      this.timestamp = this.zerotime;
    } else {
      this.frameCount++;
      this.timestamp = this.now();

      const elapsed = this.timestamp - this.zerotime;
      let seconds = elapsed / 1e3;
      if (seconds >= 1) {
        const fps = this.frameCount / seconds;
        const avgMeasure = 100 * this.measureAccum / elapsed;
        while (seconds >= 1) {
          this.fpsLogger(fps);
          this.measureLogger(avgMeasure);
          seconds--;
        }
        this.measureAccum = 0;
        this.frameCount = 0;
        this.zerotime = this.timestamp;
      }
    }
  }

  end() {
    this.measureAccum += this.now() - this.timestamp;
  }
}