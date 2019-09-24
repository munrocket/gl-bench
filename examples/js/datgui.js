let settings = {
  count: 1000000,
  width: window.innerWidth,
  height: window.innerHeight,
  'unit testing': () => window.location.replace("../test/index.html"),
  'cpu': () => window.location.replace("../examples/cpu.html"),
  'webgl': () => window.location.replace("../examples/webgl.html"),
  'webgl2': () => window.location.replace("../examples/webgl2.html"),
  'named measuring': () => window.location.replace("../examples/named-measuring.html"),
  'new loggers': () => window.location.replace("../examples/new-loggers.html"),
  'web worker': () => window.location.replace("../examples/web-worker.html"),
  'with statsjs ui': () => window.location.replace("../examples/with-statsjs-ui.html"),
};
let gui = new dat.GUI();
let unitTest = gui.addFolder('Unit testing')
unitTest.add(settings, 'unit testing');
let e2eTest = gui.addFolder('E2E testing');
e2eTest.add(settings, 'cpu');
e2eTest.add(settings, 'webgl');
e2eTest.add(settings, 'webgl2');
e2eTest.add(settings, 'named measuring');
e2eTest.add(settings, 'new loggers');
e2eTest.add(settings, 'web worker');
e2eTest.add(settings, 'with statsjs ui');
gui.add(settings, 'count', 10000, 5000000).onChange((val) => { if (typeof settingsChanged == 'function') settingsChanged(val) });
unitTest.open();
e2eTest.open();
let count = settings.count,
  width = settings.innerWidth,
  height = settings.innerHeight;