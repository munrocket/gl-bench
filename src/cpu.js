/**
 * CPU benchmark
 * @param { (x: string) => void } fpsLogger 
 * @param { (x: string) => void } measureLogger 
 */
export default class CPU {

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