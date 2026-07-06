import type { ColorRampItem } from "../data/gridDataCore"

export interface LegendTexture {
  texture: WebGLTexture
  min: number
  max: number
  width: number
}

const LEGEND_WIDTH = 256

function hexToRgba(hex: string): [number, number, number, number] {
  if (hex.length === 9) {
    const n = parseInt(hex.slice(1, 7), 16)
    const a = parseInt(hex.slice(7, 9), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a]
  }
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]
}

function lerpRgba(
  a: [number, number, number, number],
  b: [number, number, number, number],
  t: number,
): [number, number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t),
  ]
}

function sampleRamp(stops: ColorRampItem[], value: number): [number, number, number, number] {
  if (value <= stops[0][0]) return stops[0][1]
  if (value >= stops[stops.length - 1][0]) return stops[stops.length - 1][1]
  for (let i = 0; i < stops.length - 1; i++) {
    const [v0, c0] = stops[i]
    const [v1, c1] = stops[i + 1]
    if (value >= v0 && value <= v1) {
      const t = v1 === v0 ? 0 : (value - v0) / (v1 - v0)
      return lerpRgba(c0, c1, t)
    }
  }
  return stops[stops.length - 1][1]
}

/** 256×1 连续色带（LINEAR），避免低值 NEAREST 采到透明 */
export function buildLegendTexture(
  gl: WebGL2RenderingContext,
  colorRamp: ColorRampItem[],
): LegendTexture {
  const inner = colorRamp.filter(([v]) => v > -9000 && v < 9000)
  const min = inner[0][0]
  const max = inner[inner.length - 1][0]
  const span = Math.max(max - min, 0.01)

  const pixels = new Uint8Array(LEGEND_WIDTH * 4)
  for (let i = 0; i < LEGEND_WIDTH; i++) {
    const value = min + (span * i) / (LEGEND_WIDTH - 1)
    pixels.set(sampleRamp(inner, value), i * 4)
  }

  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LEGEND_WIDTH, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  return { texture, min, max, width: LEGEND_WIDTH }
}

/** 标准色斑色带：min 起可见浅绿，低值（0~3）也能渲染 */
export function defaultGridColorRamp(min: number, max: number): ColorRampItem[] {
  const span = Math.max(max - min, 0.01)
  const v = (t: number) => min + span * t
  const stops: [number, string][] = [
    [min, "#e8f5e9"],
    [v(0.08), "#c8e6c9"],
    [v(0.2), "#a5d6a7"],
    [v(0.35), "#66bb6a"],
    [v(0.55), "#43a047"],
    [v(0.75), "#2e7d32"],
    [max, "#1b5e20"],
  ]
  return [
    [-9999, [0, 0, 0, 0]],
    ...stops.map(([val, hex]) => [val, hexToRgba(hex)] as ColorRampItem),
    [9999, [0, 0, 0, 0]],
  ]
}

export function defaultTemperatureRamp(min: number, max: number): ColorRampItem[] {
  const stops: [number, string][] = [
    [min, "#313695"],
    [min + (max - min) * 0.15, "#4575b4"],
    [min + (max - min) * 0.3, "#74add1"],
    [min + (max - min) * 0.45, "#abd9e9"],
    [min + (max - min) * 0.55, "#fee090"],
    [min + (max - min) * 0.7, "#fdae61"],
    [min + (max - min) * 0.85, "#f46d43"],
    [max, "#a50026"],
  ]
  return [
    [-9999, [0, 0, 0, 0]],
    ...stops.map(([val, hex]) => [val, hexToRgba(hex)] as ColorRampItem),
    [9999, [0, 0, 0, 0]],
  ]
}

/** 按新 min/max 重采样色带（保留各 stop 相对位置） */
export function colorRampWithRange(
  min: number,
  max: number,
  template?: ColorRampItem[],
): ColorRampItem[] {
  const base = template ?? defaultGridColorRamp(min, max)
  const inner = base.filter(([v]) => v > -9000 && v < 9000)
  if (inner.length < 2) return defaultGridColorRamp(min, max)

  const oldMin = inner[0][0]
  const oldMax = inner[inner.length - 1][0]
  const oldSpan = Math.max(oldMax - oldMin, 0.01)
  const newSpan = Math.max(max - min, 0.01)

  const remapped = inner.map(([v, c]) => {
    const t = (v - oldMin) / oldSpan
    return [min + t * newSpan, c] as ColorRampItem
  })

  return [
    [-9999, [0, 0, 0, 0]],
    ...remapped,
    [9999, [0, 0, 0, 0]],
  ]
}

export function legendRangeFromRamp(colorRamp: ColorRampItem[]): { min: number; max: number } {
  const inner = colorRamp.filter(([v]) => v > -9000 && v < 9000)
  return { min: inner[0][0], max: inner[inner.length - 1][0] }
}

/** 从色带提取图例刻度（支持不规则间隔） */
export function extractLegendTicks(colorRamp: ColorRampItem[]): number[] {
  return colorRamp.filter(([v]) => v > -9000 && v < 9000).map(([v]) => v)
}

/** 数值在图例条上的位置比例 [0,1]（按实际数值线性映射） */
export function valueToLegendPercent(value: number, colorRamp: ColorRampItem[]): number {
  const { min, max } = legendRangeFromRamp(colorRamp)
  const span = Math.max(max - min, 0.01)
  return Math.max(0, Math.min(1, (value - min) / span))
}

/** 刻度序号 → 均匀位置 [0,1] */
export function tickIndexToEvenPercent(index: number, tickCount: number): number {
  if (tickCount <= 1) return 0
  return index / (tickCount - 1)
}

/** 数值 → 均匀图例位置（段内按数值插值，段宽相等） */
export function valueToEvenLegendPercent(value: number, ticks: number[]): number {
  if (ticks.length <= 1) return 0
  if (value <= ticks[0]) return 0
  if (value >= ticks[ticks.length - 1]) return 1
  for (let i = 0; i < ticks.length - 1; i++) {
    const v0 = ticks[i]
    const v1 = ticks[i + 1]
    if (value >= v0 && value <= v1) {
      const t = v1 === v0 ? 0 : (value - v0) / (v1 - v0)
      const p0 = tickIndexToEvenPercent(i, ticks.length)
      const p1 = tickIndexToEvenPercent(i + 1, ticks.length)
      return p0 + t * (p1 - p0)
    }
  }
  return 1
}

/** 均匀图例位置 → 数值 */
export function evenLegendPercentToValue(p: number, ticks: number[]): number {
  if (ticks.length <= 1) return ticks[0] ?? 0
  const clamped = Math.max(0, Math.min(1, p))
  const segCount = ticks.length - 1
  const idx = Math.min(segCount - 1, Math.floor(clamped * segCount))
  const localP = clamped * segCount - idx
  const v0 = ticks[idx]
  const v1 = ticks[idx + 1]
  return v0 + localP * (v1 - v0)
}

/** 均匀分布的 CSS 渐变色带 */
export function rampToEvenCssGradient(colorRamp: ColorRampItem[]): string {
  const inner = getInnerRampStops(colorRamp)
  const n = inner.length
  const stops = inner.map(([_, rgba], i) => {
    const pct = n <= 1 ? 0 : (i / (n - 1)) * 100
    return `${rgbaToCss(rgba)} ${pct}%`
  })
  return `linear-gradient(to right, ${stops.join(", ")})`
}

export type LegendDisplayMode = "gradient" | "blocks"

export function getInnerRampStops(colorRamp: ColorRampItem[]): ColorRampItem[] {
  return colorRamp.filter(([v]) => v > -9000 && v < 9000)
}

export function rgbaToCss(rgba: [number, number, number, number]): string {
  return `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
}

export function rampToCssGradient(colorRamp: ColorRampItem[]): string {
  const inner = colorRamp.filter(([v]) => v > -9000 && v < 9000)
  const min = inner[0][0]
  const max = inner[inner.length - 1][0]
  const stops = inner.map(([v, rgba]) => {
    const pct = ((v - min) / (max - min)) * 100
    return `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255}) ${pct}%`
  })
  return `linear-gradient(to right, ${stops.join(", ")})`
}
