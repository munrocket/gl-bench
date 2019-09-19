export default class CPU {

  constructor(fpsLogger, cpuLogger) {
    this.fpsLogger = fpsLogger ? fpsLogger : () => {};
    this.cpuLogger = cpuLogger ? cpuLogger : () => {};

    this.frameId = 0;
    this.namedAccums = [];
    this.measureMode = 0;

    this.zerotime = null;
    this.timestamp = 0;
  }

  now() {
    return (performance && performance.now) ? performance.now() : Date.now();
  }

  begin(nameId) {
    if (nameId === 0) this.frameId++;
    if (this.namedAccums.length <= nameId) this.namedAccums.push(0);

    this.timestamp = this.now();
    if (this.zerotime == null) {
      this.zerotime = this.timestamp;
    } else {
      const totalAccum = this.timestamp - this.zerotime;
      let seconds = totalAccum / 1e3;
      if (seconds >= 1) {
        const fps = this.frameId / seconds;
        const averageMeasures = this.namedAccums.map(accum => 100 * accum / totalAccum);
        while (seconds >= 1) {
          for (let i = 0; i < this.namedAccums.length; i++) {
            this.fpsLogger(fps, i);
            this.cpuLogger(averageMeasures[i], i);
          }
          seconds--;
        }
        let j = this.namedAccums.length;
        while (j--) this.namedAccums[j] = 0;
        this.frameId = 0;
        this.zerotime = this.timestamp;
      }
    }
    this.measureMode += 1 << nameId;
  }

  end(nameId) {
    const dt = this.now() - this.timestamp;
    const binaryFlags = this.measureMode.toString(2);
    for (let i = 0; i < binaryFlags.length; i++) {
      if (binaryFlags[i] == '1') {
        this.namedAccums[binaryFlags.length - i - 1] += dt;
      }
    }
    this.measureMode -= 1 << nameId;
  }
}