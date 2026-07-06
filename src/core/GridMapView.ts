import type Map from "ol/Map"
import { ArrayDataLoader } from "../data/ArrayDataLoader"
import { ChoroplethLayer } from "../layers/ChoroplethLayer"
import { GridValueLayer } from "../layers/GridValueLayer"
import { dataBboxToViewExtent, mapCoordToLonLat } from "../utils/projBridge"
import type { GridMapOptions, GridMapPointerEvent, GridMapViewApi, GridLayerVisibility, LegendRange, DisplayRange } from "./types"
import type { ColorRampItem } from "../data/gridDataCore"
import { colorRampWithRange, defaultGridColorRamp } from "../webgl/ColorRamp"
import type { ProjCode } from "../utils/projBridge"

function normalizePadding(padding: number | [number, number, number, number]): [number, number, number, number] {
  if (typeof padding === "number") return [padding, padding, padding, padding]
  return padding
}

/**
 * 网格图层控制器：叠加在外部 ol/Map 上，不创建 Map / 底图。
 */
export class GridMapView implements GridMapViewApi {
  readonly map: Map
  readonly loader: ArrayDataLoader
  readonly choroplethLayer: ChoroplethLayer
  readonly gridValueLayer: GridValueLayer
  readonly stats: { min: number; max: number }

  private pointerHandler: ((ev: GridMapPointerEvent) => void) | null = null
  private pointerUnbind: (() => void) | null = null
  private destroyed = false

  private constructor(
    map: Map,
    loader: ArrayDataLoader,
    choroplethLayer: ChoroplethLayer,
    gridValueLayer: GridValueLayer,
    stats: { min: number; max: number },
    private fitOpts: { padding: [number, number, number, number]; maxZoom: number },
  ) {
    this.map = map
    this.loader = loader
    this.choroplethLayer = choroplethLayer
    this.gridValueLayer = gridValueLayer
    this.stats = stats
  }

  get projection(): ProjCode {
    return this.map.getView().getProjection().getCode() as ProjCode
  }

  static async create(options: GridMapOptions): Promise<GridMapView> {
    if (!options.map) {
      throw new Error("GridMapView: map is required")
    }
    if (!options.dataUrl && !options.data) {
      throw new Error("GridMapView: dataUrl or data is required")
    }

    const loader = new ArrayDataLoader()
    if (options.data) {
      await loader.loadData(options.data)
    } else {
      await loader.load(options.dataUrl!)
    }

    const stats = loader.computeStats()
    const legendMin = options.legendMin ?? stats.min
    const legendMax = options.legendMax ?? stats.max
    const initialRamp = options.colorRamp
      ? options.colorRamp
      : colorRampWithRange(legendMin, legendMax, defaultGridColorRamp(legendMin, legendMax))

    const choroplethLayer = new ChoroplethLayer({
      loader,
      colorRamp: initialRamp,
      opacity: options.choroplethOpacity ?? 0.75,
      showGrid: options.showGrid ?? false,
      zIndex: options.choroplethZIndex ?? 2,
    })
    choroplethLayer.setVisible(options.showChoropleth ?? true)

    const gridValueLayer = new GridValueLayer({
      loader,
      distance: options.labelDistance ?? 80,
      precision: options.labelPrecision ?? 1,
      fontSize: options.labelFontSize ?? 11,
      zIndex: options.labelsZIndex ?? 3,
    })
    gridValueLayer.setVisible(options.showLabels ?? true)

    const map = options.map
    choroplethLayer.attachMap(map)
    gridValueLayer.attachMap(map)
    map.addLayer(choroplethLayer)
    map.addLayer(gridValueLayer)

    const fitPadding = normalizePadding(options.fitPadding ?? 40)
    const fitMaxZoom = options.fitMaxZoom ?? 10

    const view = new GridMapView(map, loader, choroplethLayer, gridValueLayer, stats, {
      padding: fitPadding,
      maxZoom: fitMaxZoom,
    })

    if (options.autoFit !== false) {
      view.fitToData()
    }

    if (options.displayMin != null || options.displayMax != null) {
      const { min: lmin, max: lmax } = view.getLegendRange()
      view.setDisplayRange(options.displayMin ?? lmin, options.displayMax ?? lmax)
    }

    if (options.onPointerMove) {
      view.onPointerMove(options.onPointerMove)
    }

    return view
  }

  /** 拾取 lon/lat 处格点值；超出数据范围或 displayRange 时返回 null */
  getValueAt(lon: number, lat: number): number | null {
    return this.pickValue(lon, lat)
  }

  private pickValue(lon: number, lat: number): number | null {
    const [minLon, minLat, maxLon, maxLat] = this.loader.bbox
    if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) return null

    const raw =
      this.choroplethLayer.getDataValue(lon, lat) ?? this.loader.getNativeValueAt(lon, lat)
    if (raw == null) return null

    if (this.choroplethLayer.getVisible()) {
      const { min, max } = this.getDisplayRange()
      if (raw < min || raw > max) return null
    }

    return raw
  }

  onPointerMove(handler: (ev: GridMapPointerEvent) => void): () => void {
    this.pointerUnbind?.()
    this.pointerHandler = handler

    const listener = (evt: { coordinate: number[]; dragging?: boolean; originalEvent?: MouseEvent }) => {
      if (evt.dragging) return
      const projCode = this.projection
      const [lon, lat] = mapCoordToLonLat(evt.coordinate[0], evt.coordinate[1], projCode)
      const zoom = this.map.getView().getZoom() ?? 6
      const value = this.pickValue(lon, lat)
      handler({
        lon,
        lat,
        value,
        zoom,
        lod: this.loader.getLodStep(zoom),
      })
    }

    this.map.on("pointermove", listener as (e: { coordinate: number[] }) => void)
    this.pointerUnbind = () => {
      this.map.un("pointermove", listener as (e: { coordinate: number[] }) => void)
      if (this.pointerHandler === handler) this.pointerHandler = null
    }

    return this.pointerUnbind
  }

  refreshView(): void {
    if (this.destroyed) return
    this.loader.invalidateCache()
    this.choroplethLayer.reattachView(this.map)
    this.gridValueLayer.reattachView(this.map)
  }

  getLayerVisibility(): GridLayerVisibility {
    return {
      choropleth: this.choroplethLayer.getVisible(),
      grid: this.choroplethLayer.getShowGrid(),
      labels: this.gridValueLayer.getVisible(),
    }
  }

  setLayerVisibility(visibility: Partial<GridLayerVisibility>): void {
    if (visibility.choropleth !== undefined) this.setShowChoropleth(visibility.choropleth)
    if (visibility.grid !== undefined) this.setShowGrid(visibility.grid)
    if (visibility.labels !== undefined) this.setShowLabels(visibility.labels)
  }

  setShowChoropleth(visible: boolean): void {
    this.choroplethLayer.setVisible(visible)
  }

  setShowGrid(visible: boolean): void {
    this.choroplethLayer.setShowGrid(visible)
  }

  setShowLabels(visible: boolean): void {
    this.gridValueLayer.setVisible(visible)
  }

  getLegendRange(): LegendRange {
    return this.choroplethLayer.getLegendRange()
  }

  setLegendRange(min: number, max: number): void {
    this.choroplethLayer.setLegendRange(min, max)
  }

  setColorRamp(colorRamp: ColorRampItem[]): void {
    this.choroplethLayer.setColorRamp(colorRamp)
  }

  getColorRamp(): ColorRampItem[] {
    return this.choroplethLayer.getColorRamp()
  }

  getDisplayRange(): DisplayRange {
    return this.choroplethLayer.getDisplayRange()
  }

  setDisplayRange(min: number, max: number): void {
    this.choroplethLayer.setDisplayRange(min, max)
  }

  fitToData(): void {
    const ext = dataBboxToViewExtent(this.loader.bbox, this.projection)
    this.map.getView().fit(ext, { padding: this.fitOpts.padding, maxZoom: this.fitOpts.maxZoom })
  }

  getLodStep(): number {
    return this.loader.getLodStep(this.map.getView().getZoom() ?? 6)
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.pointerUnbind?.()
    this.pointerUnbind = null
    this.map.removeLayer(this.choroplethLayer)
    this.map.removeLayer(this.gridValueLayer)
    this.choroplethLayer.dispose()
    this.loader.dispose()
  }
}

export async function createGridMap(options: GridMapOptions): Promise<GridMapView> {
  return GridMapView.create(options)
}

export const createGridOverlay = createGridMap
