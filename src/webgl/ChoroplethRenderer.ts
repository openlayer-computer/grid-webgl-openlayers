import { CHOROPLETH_FS, CHOROPLETH_VS } from "./shaders"
import type { LegendTexture } from "./ColorRamp"
import type { GridTile } from "../data/gridDataCore"

export interface RenderUniforms {
  transform: number[]
  size: [number, number]
  delta: [number, number]
  pixelRatio: number
  dataBbox: [number, number, number, number]
  nativeCellSize: [number, number]
  gridOrigin: [number, number]
  gridLod: number
  opacity: number
  showGrid: boolean
  projMercator: boolean
  displayRange: [number, number]
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile error")
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const program = gl.createProgram()!
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vs))
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program link error")
  }
  return program
}

export class ChoroplethRenderer {
  readonly gl: WebGL2RenderingContext
  private program: WebGLProgram
  private vao: WebGLVertexArrayObject
  private dataTexture: WebGLTexture | null = null
  private legend: LegendTexture | null = null
  private lastTileKey = ""
  private loc: Record<string, WebGLUniformLocation | null> = {}

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) throw new Error("WebGL2 not supported")
    this.gl = gl
    this.program = createProgram(gl, CHOROPLETH_VS, CHOROPLETH_FS)
    this.vao = this.initQuad()
    for (const n of [
      "u_data", "u_legend", "u_transform", "u_size", "u_delta", "u_pixel_ratio",
      "u_data_bbox", "u_cell_size", "u_native_cell_size", "u_grid_origin", "u_data_size",
      "u_legend_meta", "u_display_range", "u_nodata", "u_opacity", "u_show_grid", "u_grid_lod", "u_proj_mercator",
    ]) {
      this.loc[n] = gl.getUniformLocation(this.program, n)
    }
  }

  private initQuad(): WebGLVertexArrayObject {
    const gl = this.gl
    const vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)
    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(this.program, "a_position")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
    return vao
  }

  resize(w: number, h: number): void {
    const gl = this.gl
    gl.canvas.width = Math.max(1, Math.floor(w))
    gl.canvas.height = Math.max(1, Math.floor(h))
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }

  setLegend(legend: LegendTexture): void {
    this.legend = legend
  }

  uploadTile(tile: GridTile): void {
    const key = `${tile.width}x${tile.height}-${tile.lodStep}-${tile.bbox.join(",")}`
    if (key === this.lastTileKey && this.dataTexture) return

    const gl = this.gl
    if (!this.dataTexture) {
      this.dataTexture = gl.createTexture()
    }
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, tile.width, tile.height, 0, gl.RED, gl.FLOAT, tile.data)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.lastTileKey = key
  }

  render(tile: GridTile, uniforms: RenderUniforms): void {
    if (!this.dataTexture || !this.legend) return

    const gl = this.gl
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture)
    gl.uniform1i(this.loc.u_data!, 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.legend.texture)
    gl.uniform1i(this.loc.u_legend!, 1)

    const [minLon, minLat, maxLon, maxLat] = tile.bbox
    const [resLon, resLat] = tile.resolution

    gl.uniformMatrix3fv(this.loc.u_transform!, false, uniforms.transform)
    gl.uniform2f(this.loc.u_size!, uniforms.size[0], uniforms.size[1])
    gl.uniform2f(this.loc.u_delta!, uniforms.delta[0], uniforms.delta[1])
    gl.uniform1f(this.loc.u_pixel_ratio!, uniforms.pixelRatio)
    gl.uniform4f(this.loc.u_data_bbox!, minLon, minLat, maxLon, maxLat)
    gl.uniform2f(this.loc.u_cell_size!, resLon, resLat)
    gl.uniform2f(this.loc.u_native_cell_size!, uniforms.nativeCellSize[0], uniforms.nativeCellSize[1])
    gl.uniform2f(this.loc.u_grid_origin!, uniforms.gridOrigin[0], uniforms.gridOrigin[1])
    gl.uniform2f(this.loc.u_data_size!, tile.width, tile.height)
    gl.uniform2f(this.loc.u_legend_meta!, this.legend.min, this.legend.max)
    gl.uniform2f(this.loc.u_display_range!, uniforms.displayRange[0], uniforms.displayRange[1])
    gl.uniform1f(this.loc.u_nodata!, -9999)
    gl.uniform1f(this.loc.u_opacity!, uniforms.opacity)
    gl.uniform1f(this.loc.u_show_grid!, uniforms.showGrid ? 1 : 0)
    gl.uniform1f(this.loc.u_grid_lod!, uniforms.gridLod)
    gl.uniform1f(this.loc.u_proj_mercator!, uniforms.projMercator ? 1 : 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)
  }

  dispose(): void {
    const gl = this.gl
    if (this.dataTexture) gl.deleteTexture(this.dataTexture)
    if (this.legend) gl.deleteTexture(this.legend.texture)
    gl.deleteProgram(this.program)
    gl.deleteVertexArray(this.vao)
  }
}

export function affineToMat3(affine: number[]): Float32Array {
  return new Float32Array([affine[0], affine[1], 0, affine[2], affine[3], 0, affine[4], affine[5], 1])
}

export function computeDelta(viewExtent: number[], frameExtent: number[], resolution: number): [number, number] {
  return [
    (viewExtent[0] - frameExtent[0]) / resolution,
    (frameExtent[3] - viewExtent[3]) / resolution,
  ]
}
