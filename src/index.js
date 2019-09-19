import GPU from './gpu.js';
import CPU from './cpu.js';

import UIFull from './ui/ui-full.svg';
import UIMin from './ui/ui-min.svg';
import UIStyle from './ui/ui.css';

/**
* WebGL-Benchmark Class
* @param { Object | undefined } newLoggers
* @param { boolean | undefined } isDefaultUI
*/
export default class GLBench {
  constructor(newLoggers = {}, isDefaultUI = true) {
    this.isDefaultUI = isDefaultUI;
    Object.assign(this, newLoggers);
    this.names = [];
  }

  /**
   * Initialization
   * @param { WebGLRenderingContext | WebGL2RenderingContext | HTMLCanvasElement } target 
   */
  init(target) {

    let ext, gl;
    if (target instanceof HTMLCanvasElement) target = target.getContext('webgl')
      || target.getContext('experimental-webgl') || target.getContext('webgl2');
    if (target instanceof WebGLRenderingContext) {
      gl = target;
      ext = gl.getExtension('EXT_disjoint_timer_query');
    } else if (target instanceof WebGL2RenderingContext) {
      gl = target;
      ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    }

    if (this.isDefaultUI) {
      const rootNode = target instanceof HTMLCanvasElement ? target.parentNode : document.body;
      let domNode = document.getElementById('gl-bench-dom');
      if (!domNode) {
        domNode = document.createElement('div');
        domNode.id = 'gl-bench-dom';
        domNode.style.cssText = 'position:absolute;left:0;top:0;margin:0;';
        let styleNode = document.createElement('style');
        styleNode.innerHTML = UIStyle;
        domNode.appendChild(styleNode);
      }
      let svgNode = document.createElement('template');
      svgNode.innerHTML = ext ? UIFull : UIMin;
      svgNode = svgNode.content.firstChild;
      domNode.appendChild(svgNode);
      rootNode.appendChild(domNode);

      function uiChangerTemplate(elm, elmChanger, prgr, prgrChanger, newLogger) {
        this.elm = svgNode.getElementsByClassName(elm);
        this.prgr = svgNode.getElementsByClassName(prgr);
        return (val, i) => {
          this.elm[i].innerHTML = elmChanger(val);
          this.prgr[i].style.fill = prgrChanger(val);
          if (newLogger) newLogger(val);
        }
      }
      this.cpuLogger = uiChangerTemplate.bind({})(
        'gl-cpu', cpu => cpu.toFixed(0) + '%',
        'gl-cpu-arc', pct => pct.toFixed(0) + ', 100',
        this.cpuLogger
      );
      this.fpsLogger = uiChangerTemplate.bind({})(
        'gl-fps', fps => fps.toFixed(0) + ' FPS',
        'gl-box', fps => 'hsla(' + Math.min(120, Math.max(0, 2.182 * (fps-5))).toFixed(0) + ', 50%, 60%, 0.65)',
        this.fpsLogger
      );
      this.gpuLogger = !ext ? null : uiChangerTemplate.bind({})(
        'gl-gpu', gpu => gpu.toFixed(0) + '%',
        'gl-gpu-arc', pct => pct.toFixed(0) + ', 100',
        this.gpuLogger
      );
    }

    if (!ext) {
      this.cpu = new CPU(this.fpsLogger, this.cpuLogger);
    } else {
      this.cpu = new CPU(null, this.cpuLogger);
      this.gpu = new GPU(gl, ext, this.fpsLogger, this.gpuLogger);
    }
  }

  /**
   * Begin named measurement
   * @param { string } name
   */
  begin(name) {
    let nameId = this.names.indexOf(name);
    if (this.names.indexOf(name) == -1) {
      nameId = this.names.length;
      this.names.push(name);
    }

    if (this.gpu) {
      this.cpu.begin(nameId);
      this.gpu.begin(nameId);
    } else if (this.cpu) {
      this.cpu.begin(nameId);
    } else {
      this.init();
      this.begin(nameId);
    }
  }

  /**
   * End named measurement
   * @param { string } name
   */
  end(name) {
    const nameId = this.names.indexOf(name);
    if (this.gpu) {
      this.cpu.end(nameId);
      this.gpu.end(nameId);
    } else if (this.cpu) {
      this.cpu.end(nameId);
    }
  }

  /**
   * Only fps update
   */
  update() {
    this.begin();
    this.end();
  }
}