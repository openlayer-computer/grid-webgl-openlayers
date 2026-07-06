import { TEXT_FS, TEXT_VS } from "./textShaders"
import type { SdfAtlas } from "./SdfAtlas"
import { layoutText } from "./SdfAtlas"
import type { GridLabel } from "../data/gridDataCore"
import { lonLatToMapCoord } from "../utils/projBridge"
import { mapCoordToFramePixel } from "../utils/canvasCoords"

export interface TextRenderUniforms {
  size: [number, number]
  fontSize: number
  color: [number, number, number, number]
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader error")
  }
  return shader
}

export class TextInstancedRenderer {
  readonly gl: WebGL2RenderingContext
  private program: WebGLProgram
  private vao: WebGLVertexArrayObject
  private quadBuf: WebGLBuffer
  private instanceBuf: WebGLBuffer | null = null
  private instanceCount = 0
  private uniforms: Record<string, WebGLUniformLocation | null> = {}
  private atlas: SdfAtlas | null = null
  private vaoReady = false

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, preserveDrawingBuffer: true })
    if (!gl) throw new Error("WebGL2 not supported")
    this.gl = gl
    const program = gl.createProgram()!
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, TEXT_VS))
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, TEXT_FS))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "link error")
    }
    this.program = program

    for (const n of ["u_size", "u_font_size", "u_atlas_font_size", "u_atlas", "u_color"]) {
      this.uniforms[n] = gl.getUniformLocation(program, n)
    }

    this.vao = gl.createVertexArray()!
    this.quadBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  }

  setAtlas(atlas: SdfAtlas): void {
    this.atlas = atlas
  }

  resize(w: number, h: number): void {
    const gl = this.gl
    gl.canvas.width = Math.max(1, w)
    gl.canvas.height = Math.max(1, h)
    gl.viewport(0, 0, w, h)
  }

  buildInstances(
    labels: GridLabel[],
    projCode: string,
    frameExtent: number[],
    size: number[],
    pixelRatio: number,
  ): void {
    if (!this.atlas) return
    const stride = 10
    const parts: number[] = []

    for (const label of labels) {
      const [mapX, mapY] = lonLatToMapCoord(label.lon, label.lat, projCode)
      const [sx, sy] = mapCoordToFramePixel(mapX, mapY, frameExtent, size, pixelRatio)
      for (const { offsetX, offsetY, glyph: g } of layoutText(label.text, this.atlas)) {
        parts.push(
          sx, sy,
          offsetX, offsetY,
          g.atlasU, g.atlasV, g.uvW, g.uvH,
          g.width, g.height,
        )
      }
    }

    this.instanceCount = parts.length / stride
    if (this.instanceCount === 0) return

    const gl = this.gl
    const data = new Float32Array(parts)
    if (!this.instanceBuf) this.instanceBuf = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)

    if (!this.vaoReady) {
      gl.bindVertexArray(this.vao)
      const locQuad = gl.getAttribLocation(this.program, "a_quad")
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuf)
      gl.enableVertexAttribArray(locQuad)
      gl.vertexAttribPointer(locQuad, 2, gl.FLOAT, false, 0, 0)
      gl.vertexAttribDivisor(locQuad, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuf)
      const strideBytes = stride * 4
      const bindInst = (name: string, offset: number, size: number) => {
        const loc = gl.getAttribLocation(this.program, name)
        if (loc < 0) throw new Error(`missing attribute ${name}`)
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, strideBytes, offset)
        gl.vertexAttribDivisor(loc, 1)
      }
      bindInst("a_screen_xy", 0, 2)
      bindInst("a_char_offset", 8, 2)
      bindInst("a_atlas_rect", 16, 4)
      bindInst("a_glyph_size", 32, 2)
      gl.bindVertexArray(null)
      this.vaoReady = true
    }
  }

  render(uniforms: TextRenderUniforms): void {
    if (!this.atlas || this.instanceCount === 0) return
    const gl = this.gl
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)

    gl.uniform2f(this.uniforms.u_size!, uniforms.size[0], uniforms.size[1])
    gl.uniform1f(this.uniforms.u_font_size!, uniforms.fontSize)
    gl.uniform1f(this.uniforms.u_atlas_font_size!, this.atlas.fontSize)
    gl.uniform4f(this.uniforms.u_color!, ...uniforms.color)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.atlas.texture)
    gl.uniform1i(this.uniforms.u_atlas!, 0)

    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.instanceCount)
    gl.bindVertexArray(null)
  }

  dispose(): void {
    const gl = this.gl
    if (this.instanceBuf) gl.deleteBuffer(this.instanceBuf)
    gl.deleteBuffer(this.quadBuf)
    gl.deleteVertexArray(this.vao)
    gl.deleteProgram(this.program)
  }
}
