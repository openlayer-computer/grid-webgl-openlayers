import type Map from "ol/Map"
import type { Coordinate } from "ol/coordinate"

/**
 * 地图坐标 → ImageCanvas 设备像素（与色斑图 frameState 变换一致）
 */
export function mapCoordToCanvasPixel(
  map: Map,
  coordinate: Coordinate,
  pixelRatio: number,
): [number, number] | null {
  const css = map.getPixelFromCoordinate(coordinate)
  if (!css) return null
  return [css[0] * pixelRatio, css[1] * pixelRatio]
}

/** @deprecated 线性 extent 映射与 OL 变换不一致，勿用于标注 */
export function mapCoordToFramePixel(
  mapX: number,
  mapY: number,
  frameExtent: number[],
  size: number[],
  pixelRatio: number,
): [number, number] {
  const [minX, minY, maxX, maxY] = frameExtent
  const [w, h] = size
  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1
  const x = ((mapX - minX) / spanX) * w * pixelRatio
  const y = ((maxY - mapY) / spanY) * h * pixelRatio
  return [x, y]
}
