import GPU from './gpu.js';
import CPU from './cpu.js';

import UIFull from './ui/ui-full.svg';
import UIMin from './ui/ui-min.svg';
import UIStyle from './ui/ui.css';

export default class GLBench {

  /**
   * @param { WebGLRenderingContext | WebGL2RenderingContext } context 
   * @param { Object | undefined } settings
   */
  constructor(context, settings = {}) {
    this.names = [];
    Object.assign(this, settings);

    // init ui
    if (!this.withoutUI && typeof window != 'undefined') {
      this.dom = document.getElementById('gl-bench-dom');
      if (!this.dom) {
        document.body.insertAdjacentHTML('afterbegin',
          '<div id="gl-bench-dom" style="position:absolute;left:0;top:0;z-index:1000"></div>');
        this.dom = document.getElementById('gl-bench-dom');
        let styleNode = document.createElement('style');
        styleNode.innerHTML = UIStyle;
        this.dom.appendChild(styleNode);
      }
      this.dom.addEventListener('click', () => { this.showMS = !this.showMS; });

      // init ui loggers
      function attachLogger(elm, elmChanger, pct, pctChanger, extraLogger, dom, names) {
        this.elm = dom.getElementsByClassName(elm);
        this.pct = dom.getElementsByClassName(pct);
        this.names = names;
        return (x, y, i) => {
          this.elm[i].innerHTML = elmChanger(x, y);
          this.pct[i].style[pct == 'gl-box' ? 'fill' : 'strokeDasharray'] = pctChanger(x);
          if (extraLogger) extraLogger(x, y, this.names[i]);
        }
      }
      this.fpsLogger = attachLogger.bind({}) (
        'gl-fps', (fps, ms) => !this.showMS ? fps.toFixed(0) + ' FPS' : ms.toFixed(2) + ' MS',
        'gl-box', fps => 'hsla(' + Math.min(120, Math.max(0, 2.182*(fps-5))) + ',50%,60%,0.65)',
        this.fpsLogger, this.dom, this.names
      );
      this.cpuLogger = attachLogger.bind({}) (
        'gl-cpu', (cpu, ms) => !this.showMS ? cpu.toFixed(0) + '%' : ms.toFixed(2),
        'gl-cpu-arc', cpu => cpu.toFixed(0) + ', 100',
        this.cpuLogger, this.dom, this.names
      );
      this.gpuLogger = attachLogger.bind({}) (
        'gl-gpu', (gpu, ms) => !this.showMS ? gpu.toFixed(0) + '%' : ms.toFixed(2),
        'gl-gpu-arc', gpu => gpu.toFixed(0) + ', 100',
        this.gpuLogger, this.dom, this.names
      );
    }

    // init benchmarks
    if (!this.withoutBenchmarks) {
      let ext;
      if (context instanceof WebGLRenderingContext) {
        ext = context.getExtension('EXT_disjoint_timer_query');
      } else if (context instanceof WebGL2RenderingContext) {
        ext = context.getExtension('EXT_disjoint_timer_query_webgl2');
      }
      if (this.withoutEXT) ext = 0;

      this.cpu = new CPU(ext ? 0 : this.fpsLogger, this.cpuLogger);
      if (ext) this.gpu = new GPU(context, ext, this.fpsLogger, this.gpuLogger);
    }
  }

  /**
   * Add UI in dom
   * @param { string } name 
   */
  addUI(name) {
    this.names.push(name);
    if (this.dom) this.dom.insertAdjacentHTML('beforeend', this.gpu ? UIFull : UIMin);
  }

  /**
   * Begin named measure
   * @param { string | undefined } name
   */
  begin(name) {
    let nameId = this.names.indexOf(name);
    if (this.names.indexOf(name) == -1) {
      nameId = this.names.length;
      this.addUI(name);
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
}