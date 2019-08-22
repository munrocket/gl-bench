/**
 * CPU benchmark
 * @param { (x: string) => void } fpsLogger 
 * @param { (x: string) => void } counterLogger 
 */
export default class CPU {

  constructor(fpsLogger, counterLogger) {
    this.fpsLogger = fpsLogger;
    this.counterLogger = counterLogger;
  }

  now() {
    return (typeof performance != 'undefined') ? performance.now() : Date.now();
  }

  update() {
    if (this.frames === undefined) {
      this.frames = 0;
      this.prevTime = this.now();
    } else {
      this.frames++;
      let time = this.now();
      this.ms = time - this.prevTime;
      let seconds = this.ms / 1000;
      if (seconds >= 1) {
        let fps = this.frames / seconds;
        while (seconds >= 1) {
          this.fpsLogger(fps);
          seconds--;
        }
        this.frames = 0;
        this.prevTime = time;
      }
    }
  }

  begin() {
    this.counterBegin = this.now();
  }

  end() {
    if (this.prevframes === undefined) {
      this.counterDuration = 0;
    } else if (this.frames === 0) {
      this.counterLogger(this.counterDuration / this.ms);
      this.counterDuration = 0;
    } else {
      this.counterDuration += now() - this.counterBegin;
    }
    this.prevframes = this.frames;
  }
}