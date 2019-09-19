export default class CPU {

  constructor(fpsLogger, measureLogger) {
    this.fpsLogger = fpsLogger ? fpsLogger : () => {};
    this.measureLogger = measureLogger ? measureLogger : () => {};

    this.frameId = 0;
    this.names = [ null ];
    this.namedAccums = { };
    this.measureMode = 0;
  }

  now() {
    return (performance && performance.now) ? performance.now() : Date.now();
  }

  begin(name) {
    if (name === this.names[0]) {
      this.frameId++;
    }

    if (this.names.indexOf(name) == -1) {
      if (this.frameId == 0) {
        this.names[0] = name;
      } else {
        this.names.push(name);
      }
      this.namedAccums[name] = 0;
      this.zerotime = this.now();
      this.timestamp = this.zerotime;
    }
    
    if (this.frameId != 0) {
      this.timestamp = this.now();
      const elapsed = this.timestamp - this.zerotime;
      let seconds = elapsed / 1e3;
      if (seconds >= 1) {
        const fps = this.frameId / seconds;
        const averageMeasures = this.names.map(name => 100 * this.namedAccums[name] / elapsed);
        while (seconds >= 1) {
          for (let i = 0; i < this.names.length; i++) {
            this.fpsLogger(fps, i);
            this.measureLogger(averageMeasures[i], i);
          }
          seconds--;
        }
        this.names.forEach(name => this.namedAccums[name] = 0);
        this.frameId = 0;
        this.zerotime = this.timestamp;
      }
    }
    
    this.measureMode += 1 << this.names.indexOf(name);
  }

  end(name) {
    const dt = this.now() - this.timestamp;
    const binaryFlags = this.measureMode.toString(2);
    for (let i = 0; i < binaryFlags.length; i++) {
      if (binaryFlags[i] == '1') {
        this.namedAccums[this.names[binaryFlags.length - i - 1]] += dt;
      }
    }

    this.measureMode -= 1 << this.names.indexOf(name);
  }
}