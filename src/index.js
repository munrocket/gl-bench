import GPU from './gpu.js';
import CPU from './cpu.js';

import UIFull from './ui/ui-full.svg';
import UIMin from './ui/ui-min.svg';
import UIStyle from './ui/ui.css';

/**
* WebGL benchmark
* @param { Object | undefined } extraLoggers
*/
export default class GLBench {
  constructor(extraLoggers = {}) {
    Object.assign(this, extraLoggers);
    this.showMS = false;
    this.names = [];
  }

  /**
   * Context and UI initialization
   * @param { WebGLRenderingContext | WebGL2RenderingContext } webglContext 
   * @param { number | undefined } uiCount
   */
  init(webglContext, uiCount = 1) {
    let ext;
    if (webglContext instanceof WebGLRenderingContext) {
      ext = webglContext.getExtension('EXT_disjoint_timer_query');
    } else if (webglContext instanceof WebGL2RenderingContext) {
      ext = webglContext.getExtension('EXT_disjoint_timer_query_webgl2');
    }

    if (uiCount > 0) {
      const rootNode = document.body;
      let domNode = document.getElementById('gl-bench-dom');
      if (!domNode) {
        domNode = document.createElement('div');
        domNode.id = 'gl-bench-dom';
        domNode.style.cssText = 'position:absolute;left:0;top:0;z-index:1000';
        let styleNode = document.createElement('style');
        styleNode.innerHTML = UIStyle;
        domNode.appendChild(styleNode);
      }
      let svgNode = document.createElement('template');
      svgNode.innerHTML = ext ? UIFull : UIMin;
      svgNode = svgNode.content.firstChild;
      domNode.addEventListener('click', () => { this.showMS = !this.showMS; })
      while (uiCount--) domNode.appendChild(svgNode.cloneNode(true));
      rootNode.appendChild(domNode);

      function loggerTemplate(extraLogger, elm, elmChanger, pct, pctChanger) {
        this.elm = domNode.getElementsByClassName(elm);
        this.pct = domNode.getElementsByClassName(pct);
        return (x, y, i) => {
          this.elm[i].innerHTML = elmChanger(x, y);
          this.pct[i].style[pct == 'gl-box' ? 'fill' : 'strokeDasharray'] = pctChanger(x);
          if (extraLogger) extraLogger(x);
        }
      }
      this.fpsLogger = loggerTemplate.bind({}) (this.fpsLogger,
        'gl-fps', (fps, ms) => !this.showMS ? fps.toFixed(0) + ' FPS' : ms.toFixed(2) + ' MS',
        'gl-box', fps => 'hsla(' + Math.min(120, Math.max(0, 2.182*(fps-5))) + ',50%,60%,0.65)'
      );
      this.cpuLogger = loggerTemplate.bind({}) (this.cpuLogger,
        'gl-cpu', (cpu, ms) => !this.showMS ? cpu.toFixed(0) + '%' : ms.toFixed(2),
        'gl-cpu-arc', cpu => cpu.toFixed(0) + ', 100'
      );
      this.gpuLogger = !ext ? null : loggerTemplate.bind({}) (this.gpuLogger,
        'gl-gpu', (gpu, ms) => !this.showMS ? gpu.toFixed(0) + '%' : ms.toFixed(2),
        'gl-gpu-arc', gpu => gpu.toFixed(0) + ', 100'
      );
    }

    if (!ext) {
      this.cpu = new CPU(this.fpsLogger, this.cpuLogger);
    } else {
      this.cpu = new CPU(null, this.cpuLogger);
      this.gpu = new GPU(webglContext, ext, this.fpsLogger, this.gpuLogger);
    }
  }

  /**
   * Begin named measure
   * @param { string | undefined } name
   */
  begin(name) {
    let nameId = this.names.indexOf(name);
    if (this.names.indexOf(name) == -1) {
      nameId = this.names.length;
      this.names.push(name);
    }

    this.cpu.begin(nameId);
    if (this.gpu) this.gpu.begin(nameId);
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name) {
    const nameId = this.names.indexOf(name);
    this.cpu.end(nameId);
    if (this.gpu) this.gpu.end(nameId);
  }

  /**
   * Probably should be removed
   */
  update() {
    if (!this.firstUpdate) this.firstUpdate = true;
    else this.end();
    this.begin();
  }
}