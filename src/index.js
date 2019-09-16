import GPU from './gpu.js';
import CPU from './cpu.js';

import UIFull from './ui/ui-full.svg';
import UIMin from './ui/ui-min.svg';
import UIStyle from './ui/ui.css';

/**
* WebGL-Benchmark Class
* @param { Boolean | undefined } isDefaultUI
* @param { Object | undefined } specificLoggers
*/
export default class GlBench {
  constructor(isDefaultUI = true, specificLoggers = null) {
    this.isDefaultUI = isDefaultUI;
    this.isDefaultLoggers = !specificLoggers;
    this.loggers = specificLoggers ? specificLoggers : {};
  }

  /**
   * Expicit initialization
   * @param { HTMLCanvasElement | undefined } targetCanvas 
   */
  init(targetCanvas = null) {

    // chose biggest canvas if not specified
    if (!targetCanvas) {
      let cs = document.getElementsByTagName('canvas');
      for (let i = 0; i < cs.length; i++) {
        if (i == 0 || targetCanvas.width * targetCanvas.height < cs[i].width * cs[i].height) {
          targetCanvas = cs[i];
        }
      }
    }

    // polyfill for webgl1 api
    let ext, gl;
    if (targetCanvas instanceof HTMLCanvasElement) {
      gl = targetCanvas.getContext('webgl') || targetCanvas.getContext('experimental-webgl');
      if (gl) {
        ext = gl.getExtension('EXT_disjoint_timer_query');
        if (ext) {
          gl.createQuery = ext.createQueryEXT.bind(ext);
          gl.deleteQuery = ext.deleteQueryEXT.bind(ext);
          gl.beginQuery = ext.beginQueryEXT.bind(ext);
          gl.endQuery = ext.endQueryEXT.bind(ext);
          gl.getQueryParameter = ext.getQueryObjectEXT.bind(ext);
          gl.QUERY_RESULT_AVAILABLE = ext.QUERY_RESULT_AVAILABLE_EXT;
          gl.QUERY_RESULT = ext.QUERY_RESULT_EXT;
        }
      } else {
        gl = targetCanvas.getContext('webgl2');
        ext = gl ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
      }
    }

    // add default ui on page
    if (this.isDefaultUI) {
      let rootNode = targetCanvas instanceof HTMLCanvasElement ? targetCanvas.parentNode : document.body;
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
      domNode.appendChild(svgNode.content.firstChild);
      rootNode.appendChild(domNode);
    }

    // set default loggers
    if (this.isDefaultLoggers && this.isDefaultUI) {
      function setDomText(id, val) { document.getElementById(id).innerHTML = val; } //<------optimize DOM invoke
      this.loggers.cpuMeasure = (x) => { setDomText('gl-bench-cpu', x.toFixed(0) + '%') };
      this.loggers.cpuFps = (x) => { setDomText('gl-bench-fps', x.toFixed(0) + ' FPS') };
      if (ext) {
        this.loggers.gpuMeasure = (x) => { setDomText('gl-bench-gpu', x.toFixed(0) + '%') };
        this.loggers.gpuFps = (x) => { setDomText('gl-bench-fps', x.toFixed(0) + ' FPS') };
        this.loggers.cpuFps = () => { };
      }
    }

    // init benchmarks
    this.cpu = new CPU(this.loggers.cpuFps, this.loggers.cpuMeasure);
    this.gpu = (ext) ? new GPU(this.loggers.gpuFps, this.loggers.gpuMeasure, gl, ext) : null;
  }

  /**
   * Begin bottleneck measurement
   */
  begin() {
    if (this.gpu) {
      this.gpu.begin();
      this.cpu.begin();
    } else if (this.cpu) {
      this.cpu.begin();
    } else {
      this.init();
      this.begin();
    }
  }

  /**
   * End bottleneck measurement
   */
  end() {
    if (this.gpu) {
      this.gpu.end();
      this.cpu.end();
    } else if (this.cpu) {
      this.cpu.end();
    }
  }

  /**
   * Nothing interesting here, only fps
   */
  update() {
    this.begin();
    if (this.gpu) {
      this.cpu.fpsLogger = () => {};
    }
  }
}