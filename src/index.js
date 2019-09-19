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
  constructor(newLoggers = null, isDefaultUI = true) {
    this.isDefaultUI = isDefaultUI;
    this.loggers = newLoggers ? { new : newLoggers } : {};
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
        let styleNode = document.createElement('style');
        styleNode.innerHTML = UIStyle;
        rootNode.appendChild(styleNode);
      }
      let svgNode = document.createElement('template');
      svgNode.innerHTML = ext ? UIFull : UIMin;
      svgNode = svgNode.content.firstChild;

      this.loggers.cpuMeasure = (() => {
        const cpuUIs = svgNode.getElementsByClassName('gl-bench-cpu'),
          cpuProgressUIs = svgNode.getElementsByClassName('gl-bench-cpu-progress');
        return (percent, i) => {
          cpuUIs[i].innerHTML = percent.toFixed(0) + '%';
          cpuProgressUIs[i].style.strokeDasharray = percent.toFixed(0) + ', 100';
          if (this.loggers.new && this.loggers.new.cpuMeasure) this.loggers.new.cpuMeasure(percent);
        }
      })();
      this.loggers.cpuFps = (() => {
        const fpsUIs = svgNode.getElementsByClassName('gl-bench-fps'),
          rectUIs = svgNode.getElementsByClassName('gl-bench-rect');
        return (fps, i) => {
          fpsUIs[i].innerHTML = fps.toFixed(0) + ' FPS';
          rectUIs[i].style.fill = 'hsla(' + Math.min(120, Math.max(0, 2.182 * (fps-5))).toFixed(0) + ', 50%, 60%, 0.65)'
          if (this.loggers.new && this.loggers.new.cpuFps) this.loggers.new.cpuFps(fps);
        }
      })();
      if (ext) {
        this.loggers.gpuMeasure = (() => {
          const gpuUIs = svgNode.getElementsByClassName('gl-bench-gpu'),
            gpuProgressUIs = svgNode.getElementsByClassName('gl-bench-gpu-progress');
          return (percent, i) => {
            gpuUIs[i].innerHTML = percent.toFixed(0) + '%';
            gpuProgressUIs[i].style.strokeDasharray = percent.toFixed(0) + ', 100';
            if (this.loggers.new && this.loggers.new.gpuMeasure) this.loggers.new.gpuMeasure(percent);
          }
        })();
        this.loggers.gpuFps = (() => {
          const fpsUIs = svgNode.getElementsByClassName('gl-bench-fps'), //<--------------DRY
            rectUIs = svgNode.getElementsByClassName('gl-bench-rect');
          return (fps, i) => {
            fpsUIs[i].innerHTML = fps.toFixed(0) + ' FPS';
            rectUIs[i].style.fill = 'hsla(' + Math.min(120, Math.max(0, 2.182 * (fps-5))).toFixed(0) + ', 50%, 60%, 0.65)'
            if (this.loggers.new && this.loggers.new.cpuFps) this.loggers.new.cpuFps(fps);
          }
        })();
        this.loggers.cpuFps = () => { };
      }
      domNode.appendChild(svgNode);
      rootNode.appendChild(domNode);
    } else if (this.loggers.new) {
      Object.assign(this.loggers, this.loggers.new);
    }

    this.cpu = new CPU(this.loggers.cpuFps, this.loggers.cpuMeasure);
    this.gpu = (ext) ? new GPU(gl, ext, this.loggers.gpuFps, this.loggers.gpuMeasure) : null;
  }

  /**
   * Begin named measurement
   * @param { string } name
   */
  begin(name) {
    if (this.gpu) {
      this.cpu.begin(name);
      this.gpu.begin(name);
    } else if (this.cpu) {
      this.cpu.begin(name);
    } else {
      this.init();
      this.begin(name);
    }
  }

  /**
   * End named measurement
   * @param { string } name
   */
  end(name) {
    if (this.gpu) {
      this.cpu.end(name);
      this.gpu.end(name);
    } else if (this.cpu) {
      this.cpu.end(name);
    }
  }

  /**
   * Only fps update
   */
  update() {
    this.begin();
  }
}