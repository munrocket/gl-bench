export default class GlBench {

  constructor(canvas) {
    function getExt() {
      let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        return gl.getExtension('EXT_disjoint_timer_query');
      } else {
        gl = canvas.getContext('webgl2');
        if (gl) {
          return gl.getExtension('EXT_disjoint_timer_query_webgl2');
        }
      }
      return null;
    }
    if (!canvas) {
      setTimeout(() => {
        let cs = document.getElementsByTagName('canvas');
        for (let i = 0; i < cs.length; i++) {
          if (!canvas || canvas.width * canvas.height < cs[i].width * cs[i].height) {
            canvas = cs[i];
          }
        }
        this.ext = getExt();
        this.query = ext.createQueryEXT();
      }, 200);
    } else {
      if (typeof canvas.getContext == 'function') {
        this.ext = getExt();
      }
    }
  }

  start() {
    this.ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, this.query);
  }

  end() {
    this.ext.endQueryEXT(ext.TIME_ELAPSED_EXT);
    console.log(this.query);
  }

}