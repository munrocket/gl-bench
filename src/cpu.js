export default class CPU {

  constructor(fpsLogger, cpuLogger) {
    this.fpsLogger = fpsLogger ? fpsLogger : () => {};
    this.cpuLogger = cpuLogger ? cpuLogger : () => {};

    this.frameId = 0;
    this.namedAccums = [];
    this.measureMode = 0;

    this.zerotime = null;
    this.namedBegins = [];
  }

  now() {
    return (performance && performance.now) ? performance.now() : Date.now();
  }

  begin(nameId) {
    if (nameId === 0) this.frameId++;
    if (this.namedAccums.length <= nameId) this.namedAccums.push(0);
    if (this.namedBegins.length <= nameId) this.namedBegins.push(0);

    this.namedBegins[nameId] = this.now();
    if (this.zerotime == null) {
      this.zerotime = this.namedBegins[nameId];
    } else {
      const totalAccum = this.namedBegins[nameId] - this.zerotime;
      let seconds = totalAccum / 1e3;
      if (seconds >= 1) {
        const fps = this.frameId / seconds;
        const frametime = totalAccum / this.frameId;
        for (let i = 0; i < this.namedAccums.length; i++) {
          const accum = this.namedAccums[i];
          const cpu = accum / totalAccum * 100;
          const ms = accum / this.frameId;
          this.fpsLogger(fps, frametime, i);
          this.cpuLogger(cpu, ms, i);
        }
        let j = this.namedAccums.length;
        while (j--) this.namedAccums[j] = 0;
        this.frameId = 0;
        this.zerotime = this.namedBegins[nameId];
      }
    }
    this.measureMode += 1 << nameId;
  }

  end(nameId) {
    const dt = this.now() - this.namedBegins[nameId];
    const binaryFlags = this.measureMode.toString(2);
    for (let i = 0; i < binaryFlags.length; i++) {
      if (binaryFlags[i] == '1') this.namedAccums[binaryFlags.length - i - 1] += dt;
    }
    this.measureMode -= 1 << nameId;
  }
}