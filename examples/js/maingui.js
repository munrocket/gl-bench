let settings = {
  count: 100000,
  width: window.innerWidth,
  height: window.innerHeight,
  'unit testing': () => window.location.replace("../test/unit-test.html"),
  'stress testing': () => window.location.replace("../test/stress-test.html"),
  'webgl': () => window.location.replace("../examples/webgl.html"),
  'webgl2': () => window.location.replace("../examples/webgl2.html"),
  'named measuring': () => window.location.replace("../examples/named-measuring.html"),
  'new loggers': () => window.location.replace("../examples/new-loggers.html"),
  'instanced arrays': () => window.location.replace("../examples/instanced-arrays.html"),
  'float textures': () => window.location.replace("../examples/float-textures.html"),
  'framebuffer': () => window.location.replace("../examples/framebuffer.html"),
  'web workers': () => window.location.replace("../examples/web-workers.html"),
};
let gui = new dat.GUI();
let unitStresTest = gui.addFolder('Unit / Stress');
unitStresTest.add(settings, 'unit testing');
unitStresTest.add(settings, 'stress testing');
unitStresTest.open();
let e2eTest = gui.addFolder('E2E testing');
e2eTest.add(settings, 'webgl');
e2eTest.add(settings, 'webgl2');
e2eTest.add(settings, 'new loggers');
e2eTest.add(settings, 'named measuring');
e2eTest.add(settings, 'instanced arrays');
e2eTest.add(settings, 'float textures');
e2eTest.add(settings, 'framebuffer');
e2eTest.add(settings, 'web workers');
e2eTest.open();
let countControl = gui.add(settings, 'count', 10000, 15000000);
let count = settings.count,
  width = settings.innerWidth,
  height = settings.innerHeight;