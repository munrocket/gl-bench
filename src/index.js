import { updateGPU, beginGPU, endGPU } from './gpu';
import { updateCPU, beginCPU, endCPU } from './cpu';

export default class GlBench {

  constructor(fpsLogger, counterLogger) {
    this.fpsLogger = (typeof fpsLogger == 'function') ? fpsLogger : null;
    this.counterLogger = (typeof fpsLogger == 'function') ? counterLogger : null;
  }

  initCanvas(canvas) {
    if (!canvas) {
      let cs = document.getElementsByTagName('canvas');
      for (let i = 0; i < cs.length; i++) {
        if (i == 0 || canvas.width * canvas.height < cs[i].width * cs[i].height) {
          canvas = cs[i];
        }
      }
    }
    if (canvas && typeof canvas.getContext == 'function') {
      this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (this.gl) {
        this.ext = this.gl.getExtension('EXT_disjoint_timer_query');
        this.gl.createQuery = this.ext.createQueryEXT.bind(this.ext);
        this.gl.deleteQuery = this.ext.deleteQueryEXT.bind(this.ext);
        this.gl.beginQuery = this.ext.beginQueryEXT.bind(this.ext);
        this.gl.endQuery = this.ext.endQueryEXT.bind(this.ext);
        this.gl.getQueryParameter = this.ext.getQueryObjectEXT.bind(this.ext);
        this.gl.QUERY_RESULT_AVAILABLE = this.ext.QUERY_RESULT_AVAILABLE_EXT;
        this.gl.QUERY_RESULT = this.ext.QUERY_RESULT_EXT;
      } else {
        this.gl = canvas.getContext('webgl2');
        this.ext = (this.gl) ? this.gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
      }
    } else {
      console.log('CPU fallback');
    }
    this.inited = true;
  }

  update() {
    if (this.ext) {
      updateGPU.bind(this)();
    } else if (this.inited) {
      updateCPU.bind(this)();
    } else {
      this.initCanvas();
      this.update();
    }
  }

  begin() {
    if (this.ext) {
      beginGPU.bind(this)();
    } else if (this.inited) {
      beginCPU.bind(this)();
    } else {
      this.initCanvas();
      this.begin();
    }
  }

  end() {
    if (this.ext) {
      endGPU.bind(this)();
    } else if (this.inited) {
      endCPU.bind(this)();
    }
  }
}