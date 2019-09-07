import GPU from './gpu.js';
import CPU from './cpu.js';

/**
* WebGL Benchmark Class
* @param { (x: string) => void } fpsLogger
* @param { (x: string) => void } counterLogger 
*/
export default class GlBench {
  constructor(fpsLogger, counterLogger) {
    this.fpsLogger = fpsLogger;
    this.counterLogger = counterLogger;
  }

  /**
   * Explicit canvas initialization
   * @param { ?HTMLCanvasElement } canvas 
   */
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
      let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        [
          'ANGLE_instanced_arrays',
          'EXT_blend_minmax',
          'EXT_color_buffer_half_float',
          'EXT_disjoint_timer_query',
          'EXT_float_blend',
          'EXT_frag_depth',
          'EXT_shader_texture_lod',
          'EXT_texture_filter_anisotropic',
          'WEBKIT_EXT_texture_filter_anisotropic',
          'EXT_sRGB',
          'OES_element_index_uint',
          'OES_standard_derivatives',
          'OES_texture_float',
          'OES_texture_float_linear',
          'OES_texture_half_float',
          'OES_texture_half_float_linear',
          'OES_vertex_array_object',
          'WEBGL_color_buffer_float',
          'WEBGL_compressed_texture_s3tc',
          'WEBKIT_WEBGL_compressed_texture_s3tc',
          'WEBGL_compressed_texture_s3tc_srgb',
          'WEBGL_debug_renderer_info',
          'WEBGL_debug_shaders',
          'WEBGL_depth_texture',
          'WEBKIT_WEBGL_depth_texture',
          'WEBGL_draw_buffers',
          'WEBGL_lose_context',
          'WEBKIT_WEBGL_lose_context',
          'WEBGL_multi_draw',
          'WEBGL_multi_draw_instanced',
          'WEBGL_video_texture',
        ].forEach( x => { if (!gl.getExtension(x)) console.log(x) });
        let ext = gl.getExtension('EXT_disjoint_timer_query');
        if (ext) {
          gl.createQuery = ext.createQueryEXT.bind(ext);
          gl.deleteQuery = ext.deleteQueryEXT.bind(ext);
          gl.beginQuery = ext.beginQueryEXT.bind(ext);
          gl.endQuery = ext.endQueryEXT.bind(ext);
          gl.getQueryParameter = ext.getQueryObjectEXT.bind(ext);
          gl.QUERY_RESULT_AVAILABLE = ext.QUERY_RESULT_AVAILABLE_EXT;
          gl.QUERY_RESULT = ext.QUERY_RESULT_EXT;
          this.gpu = new GPU(this.fpsLogger, this.counterLogger, gl, ext);
        }
      } else {
        gl = canvas.getContext('webgl2');
        [
          'EXT_color_buffer_float',
          'EXT_disjoint_timer_query_webgl2',
          'EXT_float_blend',
          'EXT_texture_filter_anisotropic',
          'OES_texture_float_linear',
          'WEBGL_compressed_texture_s3tc',
          'WEBGL_compressed_texture_s3tc_srgb',
          'WEBGL_debug_renderer_info',
          'WEBGL_debug_shaders',
          'WEBGL_lose_context',
          'WEBGL_multi_draw',
          'WEBGL_multi_draw_instanced',
          'WEBGL_video_texture',
        ].forEach( x => { if (!gl.getExtension(x)) console.log('2' + x) });
        let ext = (gl) ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
        if (ext) {
          this.gpu = new GPU(this.fpsLogger, this.counterLogger, gl, ext);
        }
      }
      this.gl = gl;
    }
    this.cpu = new CPU(this.fpsLogger, this.counterLogger);
  }

  /**
   * Update fps
   */
  update() {
    if (this.gpu) {
      this.gpu.update();
    } else if (this.cpu) {
      this.cpu.update();
    } else {
      this.initCanvas();
      this.update();
    }
  }

  /**
   * Begin bottleneck measurement
   */
  begin() {
    if (this.ext) {
      this.gpu.begin();
    } else if (this.cpu) {
      this.cpu.begin();
    } else {
      this.initCanvas();
      this.begin();
    }
  }

  /**
   * End bottleneck measurement
   */
  end() {
    if (this.ext) {
      this.gpu.end();
    } else if (this.cpu) {
      this.cpu.end();
    }
  }
}