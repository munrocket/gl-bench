function now() {
  return (window.performance || Date).now();
}

export function updateCPU() {
  if (this.frames === undefined) {
    this.frames = 0;
    this.prevTime = now();
  } else {
    this.frames++;
    let time = now();
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

export function beginCPU() {
  this.counterBegin = now();
}

export function endCPU() {
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