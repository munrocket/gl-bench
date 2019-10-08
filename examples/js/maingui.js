let settings = {
  count: 100000,
  width: window.innerWidth,
  height: window.innerHeight,
  'unit testing': () => window.location.replace("../test/index.html"),
  'webgl': () => window.location.replace("../examples/webgl.html"),
  'webgl2': () => window.location.replace("../examples/webgl2.html"),
  'named measuring': () => window.location.replace("../examples/named-measuring.html"),
  'new loggers': () => window.location.replace("../examples/new-loggers.html"),
  'web workers': () => window.location.replace("../examples/web-workers.html"),
  'instanced arrays': () => window.location.replace("../examples/instanced-arrays.html"),
};
let gui = new dat.GUI();
let unitTest = gui.addFolder('Unit testing')
unitTest.add(settings, 'unit testing');
let e2eTest = gui.addFolder('E2E testing');
e2eTest.add(settings, 'webgl');
e2eTest.add(settings, 'webgl2');
e2eTest.add(settings, 'new loggers');
e2eTest.add(settings, 'named measuring');
e2eTest.add(settings, 'web workers');
e2eTest.add(settings, 'instanced arrays');
let countControl = gui.add(settings, 'count', 10000, 15000000);
unitTest.open();
e2eTest.open();
let count = settings.count,
  width = settings.innerWidth,
  height = settings.innerHeight;