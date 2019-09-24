importScripts('../../dist/gl-bench.js')
importScripts('https://cdn.jsdelivr.net/npm/three@0.107.0/build/three.min.js');

let canvas;
let context;
let settings;
let rafID;

let bench;
let scene;
let camera;
let renderer;

self.onmessage = function(e) {
  if (rafID) self.cancelAnimationFrame(rafID);
  if (e.data.msg == 'init') {
    canvas = e.data.canvas;
    settings = e.data.settings;
    setup();
  } else if (e.data.msg == 'settings') {
    settings = e.data.settings;
  }
  rafID = self.requestAnimationFrame(draw);
}

function setup() {
  setupScene();
  setupRenderer();
  setupParticles();
}

function setupScene() {
  scene = new THREE.Scene();
  let ratio = settings.width / settings.height;
  camera = new THREE.PerspectiveCamera(70, ratio, 1, 10000);
}

function setupRenderer() {
  context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  let maxI = -1;
  function checkName(bench, i) {
    if (maxI < i) {
      self.postMessage({ msg: 'initUI', gpu: !!bench.gpu, name: bench.names[i] });
      maxI = i;
    }
    return i;
  }

  //GLBench initialization
  bench = new GLBench(context, {
    fpsLogger: (x, y, i) => self.postMessage({ msg: 'fpsLogger', x: x, y: y, i: checkName(bench, i) }),
    cpuLogger: (x, y, i) => self.postMessage({ msg: 'cpuLogger', x: x, y: y, i: checkName(bench, i) }),
    gpuLogger: (x, y, i) => self.postMessage({ msg: 'gpuLogger', x: x, y: y, i: checkName(bench, i) }),
    nameLogger: (name) => self.postMessage({ msg: 'nameLogger', name: name }),
    withoutEXT: true
  });

  renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context } );
}

function setupParticles() {
  let geometry = new THREE.Geometry();
  addLorenzVertices(geometry);
  let color = new THREE.Color(0xbb00ff);
  for (let i = 0; i < settings.count; i++) {
    geometry.colors.push(color);
  }
  let material = new THREE.PointsMaterial({ size: 1, vertexColors: THREE.VertexColors, depthTest: false, opacity: 0.3, sizeAttenuation: false, transparent: true });
  let mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
}

function addLorenzVertices(geometry) {
  let x0 = 0.1;
  let y0 = 0;
  let z0 = 0; 
  let x1, y1, z1;
  let h = 0.001;
  let a = 10.0;
  let b = 28.0;
  let c = 8.0 / 3.0;

  for (let i = 0; i < settings.count; i++) {
    x1 = x0 + h * a * (y0 - x0);
    y1 = y0 + h * (x0 * (b - z0) - y0);
    z1 = z0 + h * (x0 * y0 - c * z0);
    x0 = x1;
    y0 = y1;
    z0 = z1;
    let vertex = new THREE.Vector3(
      x0, 
      y0, 
      z0-24);
    geometry.vertices.push(vertex);
  }
}

let width, height;
function updateRenderer() {
  if (width != settings.width || height != settings.height) {
    width = settings.width;
    height = settings.height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height, false );
  }
}

function movePosition(position, phase) {
  let r = 40;
  let θ = new Date() * 0.0005 + 10;
  let φ = new Date() * 0.0005;    
  let x = r * Math.sin(φ + phase) * Math.cos(θ + phase);
  let y = r * Math.sin(φ + phase) * Math.sin(θ + phase);
  let z = r * Math.cos(φ + phase);
  position.set(x, y, z);
}

let count;
function heavyCpuUpdate() {
  if (count != settings.count) {
    scene.remove(scene.children[0]);
    setupParticles();
    count = settings.count;
  }
}

function draw() {
  bench.begin('A');
  movePosition(camera.position, 0);
  camera.lookAt(scene.position);
  heavyCpuUpdate();
  updateRenderer();
  renderer.render(scene, camera);
  bench.end('A');

  rafID = self.requestAnimationFrame(draw);
}