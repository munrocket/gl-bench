export default class CPU {

  constructor(fpsLogger, cpuLogger) {
    this.fpsLogger = fpsLogger ? fpsLogger : () => {};
    this.cpuLogger = cpuLogger ? cpuLogger : () => {};

    this.frameId = 0;
    this.namedAccums = [];
    this.measureMode = 0;

    this.zerotime = null;
  }

  begin(nameId) {
    if (nameId === 0) this.frameId++;
    if (this.namedAccums.length <= nameId) this.namedAccums.push(0);
    
    this.update();
    this.measureMode += 1 << nameId;
  }

  end(nameId) {
    this.update();
    this.measureMode -= 1 << nameId;
  }

  update() {
    const now = (performance && performance.now) ? performance.now() : Date.now();
    if (this.zerotime == null) {
      this.zerotime = now;
    } else {
      const dt = now - this.timestamp;
      const binaryFlags = this.measureMode.toString(2);
      for (let i = 0; i < binaryFlags.length; i++) {
        if (binaryFlags[i] == '1') {
          this.namedAccums[binaryFlags.length - i - 1] += dt;
        }
      }

      const totalAccum = this.timestamp - this.zerotime;
      let seconds = totalAccum / 1e3;
      if (seconds >= 1) {
        const fps = this.frameId / seconds;
        const frametime = totalAccum / this.frameId;
        for (let i = 0; i < this.namedAccums.length; i++) {
          const accum = this.namedAccums[i];
          const cpu = accum / totalAccum * 100;
          const ms = accum / this.frameId;
          this.cpuLogger(cpu, ms, i);
          this.fpsLogger(fps, frametime, i);
        }
        let j = this.namedAccums.length;
        while (j--) this.namedAccums[j] = 0;
        this.frameId = 0;
        this.zerotime = this.timestamp;
      }
    }
    this.timestamp = now;
  }
}