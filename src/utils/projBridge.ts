import { fromLonLat, toLonLat, transformExtent } from "ol/proj"

export type ProjCode = "EPSG:4326" | "EPSG:3857"

export function isMercator(code: string): boolean {
  return code === "EPSG:3857"
}

/** 经纬度 → 地图视图投影坐标 */
export function lonLatToMapCoord(lon: number, lat: number, projCode: string): [number, number] {
  if (projCode === "EPSG:4326") return [lon, lat]
  return fromLonLat([lon, lat]) as [number, number]
}

/** 地图视图投影坐标 → 经纬度 */
export function mapCoordToLonLat(x: number, y: number, projCode: string): [number, number] {
  if (projCode === "EPSG:4326") return [x, y]
  return toLonLat([x, y]) as [number, number]
}

/** 4326 数据 bbox → 视图投影 extent */
export function dataBboxToViewExtent(
  bbox4326: [number, number, number, number],
  projCode: string,
): [number, number, number, number] {
  if (projCode === "EPSG:4326") return bbox4326
  return transformExtent(bbox4326, "EPSG:4326", projCode) as [number, number, number, number]
}

/** 视图 extent → 4326（供 Worker / 数据查询） */
export function viewExtentTo4326(
  extent: number[],
  projCode: string,
): [number, number, number, number] {
  if (projCode === "EPSG:4326") return extent as [number, number, number, number]
  return transformExtent(extent, projCode, "EPSG:4326") as [number, number, number, number]
}
