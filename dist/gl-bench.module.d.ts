export default class GLBench {
  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext | null, settings?: object);

  addUI(name?: string): void;

  nextFrame(now?: number): void;
  begin(name?: string): void;
  end(name?: string): void;
}