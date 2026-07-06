import TinySDF from "@mapbox/tiny-sdf"

export const ATLAS_FONT_SIZE = 24
const SDF_BUFFER = 3

export interface GlyphInfo {
  char: string
  adv: number
  left: number
  width: number
  height: number
  atlasU: number
  atlasV: number
  uvW: number
  uvH: number
}

export interface SdfAtlas {
  key: string
  texture: WebGLTexture
  spriteWidth: number
  spriteHeight: number
  fontSize: number
  glyphMap: Map<string, GlyphInfo>
  fallback: GlyphInfo
}

const DEFAULT_CHARSET = "0123456789.-"

function glyphToImageData(alphas: Uint8ClampedArray, width: number, height: number): ImageData {
  const image = new ImageData(width, height)
  for (let i = 0; i < alphas.length; i++) {
    const a = alphas[i]
    const idx = i * 4
    image.data[idx] = a
    image.data[idx + 1] = a
    image.data[idx + 2] = a
    image.data[idx + 3] = a
  }
  return image
}

export function buildSdfAtlas(
  gl: WebGL2RenderingContext,
  fontSize = ATLAS_FONT_SIZE,
  fontFamily = "sans-serif",
  charset = DEFAULT_CHARSET,
): SdfAtlas {
  const sdf = new TinySDF({ fontSize, fontFamily, fontWeight: "normal" })
  const chars = [...new Set([...charset, "?"])]

  const raw = chars.map((char) => {
    const g = sdf.draw(char)
    return {
      char,
      adv: g.glyphAdvance,
      left: g.glyphLeft,
      top: g.glyphTop,
      width: g.width,
      height: g.height,
      image: glyphToImageData(g.data, g.width, g.height),
    }
  })

  let maxAdv = 0
  let maxTop = 0
  let maxBottom = 0
  let maxWidth = 0
  for (const g of raw) {
    maxAdv = Math.max(maxAdv, g.adv)
    maxTop = Math.max(maxTop, g.top)
    maxBottom = Math.max(maxBottom, g.height - g.top)
    maxWidth = Math.max(maxWidth, g.width)
  }

  const cellWidth = Math.ceil(Math.max(maxWidth, maxAdv + 2))
  const cellHeight = Math.ceil(maxTop + maxBottom)
  const baseline = Math.ceil((cellHeight - (maxTop + maxBottom)) / 2) + maxTop
  const cols = Math.ceil(Math.sqrt(raw.length))
  const rows = Math.ceil(raw.length / cols)
  const spriteWidth = cols * cellWidth
  const spriteHeight = rows * cellHeight

  const canvas = document.createElement("canvas")
  canvas.width = spriteWidth
  canvas.height = spriteHeight
  const ctx = canvas.getContext("2d")!
  ctx.clearRect(0, 0, spriteWidth, spriteHeight)

  const glyphMap = new Map<string, GlyphInfo>()
  raw.forEach((item, i) => {
    const ox = (i % cols) * cellWidth
    const oy = Math.floor(i / cols) * cellHeight
    const gx = ox + Math.floor((cellWidth - item.width) / 2)
    const gy = oy + baseline - item.top
    ctx.putImageData(item.image, gx, gy)

    glyphMap.set(item.char, {
      char: item.char,
      adv: item.adv,
      left: item.left,
      width: item.width,
      height: item.height,
      atlasU: gx / spriteWidth,
      atlasV: 1.0 - (gy + item.height) / spriteHeight,
      uvW: item.width / spriteWidth,
      uvH: item.height / spriteHeight,
    })
  })

  const fallback = glyphMap.get("?")!

  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  return {
    key: `${fontFamily}|${fontSize}|${charset}`,
    texture,
    spriteWidth,
    spriteHeight,
    fontSize,
    glyphMap,
    fallback,
  }
}

/** pen 按 adv 推进；quad 尺寸=位图尺寸，中心按 TinySDF 度量对齐 */
export function layoutText(
  text: string,
  atlas: SdfAtlas,
): { char: string; offsetX: number; offsetY: number; glyph: GlyphInfo }[] {
  let pen = 0
  const placed: { char: string; offsetX: number; offsetY: number; glyph: GlyphInfo }[] = []
  for (const c of text) {
    const g = atlas.glyphMap.get(c) ?? atlas.fallback
    const cx = pen + g.left - SDF_BUFFER + g.width / 2
    placed.push({ char: c, offsetX: cx, offsetY: 0, glyph: g })
    pen += g.adv
  }
  const half = pen / 2
  return placed.map((item) => ({ ...item, offsetX: item.offsetX - half }))
}
