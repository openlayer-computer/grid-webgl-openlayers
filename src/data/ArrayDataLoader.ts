import {
  type ArrayDataMeta,
  type ArrayDataJson,
  type GridLabel,
  type GridTile,
  type ColorRampItem,
  NODATA,
  computeLabels,
  computeStats,
  flattenGrid,
  getLabelStep,
  getLodStep,
  getNativeValue,
  readWindow as readWindowSync,
} from "./gridDataCore"
import { GridDataWorkerClient } from "./GridDataWorkerClient"

export type { ArrayDataMeta, ArrayDataJson, GridTile, GridLabel, ColorRampItem } from "./gridDataCore"

/**
 * 网格数据加载器：主线程保留 flat 副本供同步拾取，LOD/标注计算走 Worker。
 */
export class ArrayDataLoader {
  private meta!: ArrayDataMeta
  private flat!: Float32Array
  private loaded = false
  private worker = new GridDataWorkerClient()
  private lastExtent: number[] | null = null
  private lastZoom = -1
  private cachedTile: GridTile | null = null
  private tileRequestId = 0

  get bbox(): [number, number, number, number] {
    return [this.meta.startLon, this.meta.startLat, this.meta.endLon, this.meta.endLat]
  }

  get metadata() {
    return { ...this.meta, nodata: NODATA, bbox: this.bbox }
  }

  get isLoaded() {
    return this.loaded
  }

  async load(url: string): Promise<void> {
    const json = (await fetch(url).then((r) => r.json())) as ArrayDataJson
    await this.loadData(json)
  }

  /** 直接加载 JSON 对象（Vue / Node 传入内存数据时使用） */
  async loadData(json: ArrayDataJson): Promise<void> {
    this.meta = {
      startLat: json.startLat,
      endLat: json.endLat,
      startLon: json.startLon,
      endLon: json.endLon,
      latStep: json.latStep,
      lonStep: json.lonStep,
      latCount: json.latCount,
      lonCount: json.lonCount,
    }
    this.flat = flattenGrid(json.ds, this.meta.latCount, this.meta.lonCount)
    await this.worker.init(this.meta, this.flat.slice())
    this.loaded = true
  }

  getLodStep(zoom: number): number {
    return getLodStep(zoom)
  }

  getLabelStep(zoom: number, resolution: number, distancePx: number, projCode = "EPSG:4326"): number {
    return getLabelStep(this.meta, zoom, resolution, distancePx, projCode)
  }

  /** 异步 readWindow（Worker） */
  async readWindowAsync(extent4326: number[], zoom: number): Promise<GridTile | null> {
    if (!this.loaded) return null

    if (
      this.cachedTile &&
      this.lastZoom === zoom &&
      this.lastExtent &&
      extentEqual(this.lastExtent, extent4326)
    ) {
      return this.cachedTile
    }

    const reqId = ++this.tileRequestId
    const tile = await this.worker.readWindow(extent4326, zoom)
    if (reqId !== this.tileRequestId) return this.cachedTile

    if (tile) {
      this.lastExtent = [...extent4326]
      this.lastZoom = zoom
      this.cachedTile = tile
    }
    return tile
  }

  /** 同步 readWindow（Worker 未就绪时 fallback） */
  readWindow(extent4326: number[], zoom: number): GridTile | null {
    if (!this.loaded) return null
    if (
      this.cachedTile &&
      this.lastZoom === zoom &&
      this.lastExtent &&
      extentEqual(this.lastExtent, extent4326)
    ) {
      return this.cachedTile
    }
    const tile = readWindowSync(this.flat, this.meta, extent4326, zoom)
    if (tile) {
      this.lastExtent = [...extent4326]
      this.lastZoom = zoom
      this.cachedTile = tile
    }
    return tile
  }

  async computeLabelsAsync(
    extent4326: number[],
    zoom: number,
    resolution: number,
    distancePx: number,
    precision: number,
    projCode = "EPSG:4326",
  ): Promise<GridLabel[]> {
    if (!this.loaded) return []
    try {
      const labels = await this.worker.computeLabels(
        extent4326,
        zoom,
        resolution,
        distancePx,
        precision,
        projCode,
      )
      if (labels.length > 0) return labels
    } catch {
      /* Worker 失败时降级主线程 */
    }
    return computeLabels(this.flat, this.meta, extent4326, zoom, resolution, distancePx, precision, projCode)
  }

  computeLabelsSync(
    extent4326: number[],
    zoom: number,
    resolution: number,
    distancePx: number,
    precision: number,
    projCode = "EPSG:4326",
  ): GridLabel[] {
    if (!this.loaded) return []
    return computeLabels(this.flat, this.meta, extent4326, zoom, resolution, distancePx, precision, projCode)
  }

  getValueAt(lon: number, lat: number, tile?: GridTile | null): number | null {
    const t = tile ?? this.cachedTile
    if (!t) return null
    const [minLon, minLat, maxLon, maxLat] = t.bbox
    if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) return null
    const [resLon, resLat] = t.resolution
    const col = Math.floor((lon - minLon) / resLon)
    const row = Math.floor((maxLat - lat) / resLat)
    if (col < 0 || row < 0 || col >= t.width || row >= t.height) return null
    const v = t.data[row * t.width + col]
    if (v === NODATA || Number.isNaN(v)) return null
    return v
  }

  getNativeValueAt(lon: number, lat: number): number | null {
    return getNativeValue(this.flat, this.meta, lon, lat)
  }

  computeStats() {
    return computeStats(this.flat)
  }

  get nativeResolution(): [number, number] {
    return [this.meta.lonStep, this.meta.latStep]
  }

  get gridOrigin(): [number, number] {
    return [this.meta.startLon, this.meta.startLat]
  }

  invalidateCache(): void {
    this.cachedTile = null
    this.lastExtent = null
    this.tileRequestId++
  }

  dispose(): void {
    this.worker.terminate()
  }
}

function extentEqual(a: number[], b: number[], eps = 1e-6): boolean {
  return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < eps)
}
