/** 纯函数：Worker 与主线程共享的网格数据处理 */

export interface ArrayDataMeta {
  startLat: number
  endLat: number
  startLon: number
  endLon: number
  latStep: number
  lonStep: number
  latCount: number
  lonCount: number
}

export interface GridTile {
  data: Float32Array
  width: number
  height: number
  bbox: [number, number, number, number]
  resolution: [number, number]
  lodLevel: number
  lodStep: number
}

export interface GridLabel {
  lon: number
  lat: number
  text: string
}

export type ColorRampItem = [number, [number, number, number, number]]

/** 与 arrayData.json 一致的网格数据格式 */
export interface ArrayDataJson {
  startLat: number
  endLat: number
  startLon: number
  endLon: number
  latStep: number
  lonStep: number
  latCount: number
  lonCount: number
  ds: number[][]
}

const NODATA = -9999

export function getLodStep(zoom: number): number {
  const level = Math.max(0, Math.min(3, Math.floor((11 - zoom) / 2)))
  return 2 ** level
}

/** LOD 块在屏幕上的宽度（像素），兼容 4326（度/px）与 3857（米/px） */
function lodCellPixelWidth(
  meta: ArrayDataMeta,
  lodStep: number,
  mapResolution: number,
  projCode: string,
): number {
  const latMid = (meta.startLat + meta.endLat) * 0.5
  const lodCellLonDeg = meta.lonStep * lodStep
  if (projCode === "EPSG:3857") {
    const metersPerDegLon = 111320 * Math.cos((latMid * Math.PI) / 180)
    return (lodCellLonDeg * metersPerDegLon) / Math.max(mapResolution, 1e-12)
  }
  return lodCellLonDeg / Math.max(mapResolution, 1e-12)
}

/** 标注步长（原生格索引），与色斑图 LOD 对齐：lodStep × 像素稀疏倍数 */
export function getLabelStep(
  meta: ArrayDataMeta,
  zoom: number,
  mapResolution: number,
  distancePx: number,
  projCode = "EPSG:4326",
): number {
  const lodStep = getLodStep(zoom)
  const lodCellPx = lodCellPixelWidth(meta, lodStep, mapResolution, projCode)
  const blockSkip = Math.max(1, Math.round(distancePx / Math.max(lodCellPx, 1)))
  return lodStep * blockSkip
}

function sampleBlock(
  flat: Float32Array,
  meta: ArrayDataMeta,
  row0: number,
  col0: number,
  step: number,
): number {
  let sum = 0
  let count = 0
  const { latCount, lonCount } = meta
  for (let dr = 0; dr < step; dr++) {
    for (let dc = 0; dc < step; dc++) {
      const r = row0 + dr
      const c = col0 + dc
      if (r >= latCount || c >= lonCount) continue
      const v = flat[r * lonCount + c]
      if (v == null || Number.isNaN(v)) continue
      sum += v
      count++
    }
  }
  return count > 0 ? sum / count : NODATA
}

export function readWindow(
  flat: Float32Array,
  meta: ArrayDataMeta,
  extent4326: number[],
  zoom: number,
): GridTile | null {
  const dataBbox: [number, number, number, number] = [
    meta.startLon,
    meta.startLat,
    meta.endLon,
    meta.endLat,
  ]
  const [vMinLon, vMinLat, vMaxLon, vMaxLat] = extent4326
  const [dMinLon, dMinLat, dMaxLon, dMaxLat] = dataBbox

  const minLon = Math.max(vMinLon, dMinLon)
  const minLat = Math.max(vMinLat, dMinLat)
  const maxLon = Math.min(vMaxLon, dMaxLon)
  const maxLat = Math.min(vMaxLat, dMaxLat)

  if (minLon >= maxLon || minLat >= maxLat) return null

  const { startLon, startLat, lonStep, latStep, lonCount, latCount } = meta
  const lodStep = getLodStep(zoom)

  const col0 = Math.max(0, Math.floor((minLon - startLon) / lonStep / lodStep) * lodStep)
  const col1 = Math.min(lonCount, Math.ceil((maxLon - startLon) / lonStep))
  const row0 = Math.max(0, Math.floor((minLat - startLat) / latStep / lodStep) * lodStep)
  const row1 = Math.min(latCount, Math.ceil((maxLat - startLat) / latStep))

  if (col0 >= col1 || row0 >= row1) return null

  const outCols = Math.ceil((col1 - col0) / lodStep)
  const outRows = Math.ceil((row1 - row0) / lodStep)
  const data = new Float32Array(outCols * outRows)

  let idx = 0
  for (let r = row1 - lodStep; r >= row0; r -= lodStep) {
    for (let c = col0; c < col1; c += lodStep) {
      data[idx++] = sampleBlock(flat, meta, r, c, lodStep)
    }
  }

  return {
    data,
    width: outCols,
    height: outRows,
    bbox: [startLon + col0 * lonStep, startLat + row0 * latStep, startLon + col1 * lonStep, startLat + row1 * latStep],
    resolution: [lonStep * lodStep, latStep * lodStep],
    lodLevel: Math.log2(lodStep),
    lodStep,
  }
}

/**
 * 与 readWindow 相同 LOD 聚合 + 相同格网原点对齐；
 * 位置取 LOD 块中心，数值取 sampleBlock（与色斑图一致）。
 */
export function computeLabels(
  flat: Float32Array,
  meta: ArrayDataMeta,
  extent4326: number[],
  zoom: number,
  resolution: number,
  distancePx: number,
  precision: number,
  projCode = "EPSG:4326",
): GridLabel[] {
  const { startLon, startLat, lonStep, latStep, lonCount, latCount } = meta
  const lodStep = getLodStep(zoom)
  const labelStep = getLabelStep(meta, zoom, resolution, distancePx, projCode)

  const [minLon, minLat, maxLon, maxLat] = extent4326
  const col0 = Math.max(0, Math.floor((minLon - startLon) / lonStep / labelStep) * labelStep)
  const col1 = Math.min(lonCount, Math.ceil((maxLon - startLon) / lonStep))
  const row0 = Math.max(0, Math.floor((minLat - startLat) / latStep / labelStep) * labelStep)
  const row1 = Math.min(latCount, Math.ceil((maxLat - startLat) / latStep))

  if (col0 >= col1 || row0 >= row1) return []

  const labels: GridLabel[] = []
  for (let row = row0; row < row1; row += labelStep) {
    for (let col = col0; col < col1; col += labelStep) {
      const v = sampleBlock(flat, meta, row, col, lodStep)
      if (v === NODATA || Number.isNaN(v)) continue
      const lon = startLon + (col + lodStep * 0.5) * lonStep
      const lat = startLat + (row + lodStep * 0.5) * latStep
      if (lon < startLon || lon >= meta.endLon || lat < startLat || lat >= meta.endLat) continue
      labels.push({ lon, lat, text: v.toFixed(precision) })
    }
  }
  return labels
}

export function flattenGrid(ds: number[][], latCount: number, lonCount: number): Float32Array {
  const flat = new Float32Array(latCount * lonCount)
  for (let r = 0; r < latCount; r++) {
    for (let c = 0; c < lonCount; c++) {
      flat[r * lonCount + c] = ds[r][c]
    }
  }
  return flat
}

export function computeStats(flat: Float32Array): { min: number; max: number } {
  let min = Infinity
  let max = -Infinity
  for (const v of flat) {
    if (v == null || Number.isNaN(v)) continue
    if (v < min) min = v
    if (v > max) max = v
  }
  return { min, max }
}

export function getNativeValue(
  flat: Float32Array,
  meta: ArrayDataMeta,
  lon: number,
  lat: number,
): number | null {
  const { startLon, startLat, lonStep, latStep, lonCount, latCount } = meta
  const col = Math.floor((lon - startLon) / lonStep)
  const row = Math.floor((lat - startLat) / latStep)
  if (col < 0 || row < 0 || col >= lonCount || row >= latCount) return null
  const v = flat[row * lonCount + col]
  if (v == null || Number.isNaN(v)) return null
  return v
}

export { NODATA }
