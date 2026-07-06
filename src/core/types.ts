import type Map from "ol/Map"
import type { ArrayDataJson, ColorRampItem } from "../data/gridDataCore"
import type { ArrayDataLoader } from "../data/ArrayDataLoader"
import type { ChoroplethLayer } from "../layers/ChoroplethLayer"
import type { GridValueLayer } from "../layers/GridValueLayer"
import type { ProjCode } from "../utils/projBridge"

export interface GridMapStats {
  min: number
  max: number
}

export interface GridMapPointerEvent {
  lon: number
  lat: number
  value: number | null
  zoom: number
  lod: number
}

export interface LegendRange {
  min: number
  max: number
}

export interface GridLayerVisibility {
  choropleth: boolean
  grid: boolean
  labels: boolean
}

export interface DisplayRange {
  min: number
  max: number
}

export interface GridMapOptions {
  /** 外部 OpenLayers Map，色斑图与标注图层叠加其上 */
  map: Map
  /** 网格 JSON 地址（与 data 二选一） */
  dataUrl?: string
  /** 内存中的网格 JSON（与 dataUrl 二选一） */
  data?: ArrayDataJson
  showChoropleth?: boolean
  showGrid?: boolean
  showLabels?: boolean
  choroplethOpacity?: number
  choroplethZIndex?: number
  labelsZIndex?: number
  labelDistance?: number
  labelPrecision?: number
  labelFontSize?: number
  colorRamp?: ColorRampItem[]
  /** 图例刻度数值（不规则间隔）；不传则从 colorRamp 提取 */
  legendTicks?: number[]
  /** 图例 min（默认取数据统计 min） */
  legendMin?: number
  /** 图例 max（默认取数据统计 max） */
  legendMax?: number
  /** 色斑显示区间 min（默认等于 legendMin） */
  displayMin?: number
  /** 色斑显示区间 max（默认等于 legendMax） */
  displayMax?: number
  /** 挂载后自动 fit 到数据范围，默认 true */
  autoFit?: boolean
  fitPadding?: number | [number, number, number, number]
  fitMaxZoom?: number
  /** 鼠标移动拾取回调；传入则在 create 时自动绑定 pointermove */
  onPointerMove?: (event: GridMapPointerEvent) => void
}

export interface GridMapViewApi {
  readonly map: Map
  readonly loader: ArrayDataLoader
  readonly choroplethLayer: ChoroplethLayer
  readonly gridValueLayer: GridValueLayer
  readonly projection: ProjCode
  readonly stats: GridMapStats

  getLayerVisibility(): GridLayerVisibility
  setLayerVisibility(visibility: Partial<GridLayerVisibility>): void
  setShowChoropleth(visible: boolean): void
  setShowGrid(visible: boolean): void
  setShowLabels(visible: boolean): void

  getLegendRange(): LegendRange
  setLegendRange(min: number, max: number): void
  setColorRamp(colorRamp: ColorRampItem[]): void
  getColorRamp(): ColorRampItem[]

  getDisplayRange(): DisplayRange
  setDisplayRange(min: number, max: number): void

  refreshView(): void
  fitToData(): void
  getValueAt(lon: number, lat: number): number | null
  getLodStep(): number
  /** 绑定 map pointermove，返回当前鼠标位置格点值 */
  onPointerMove(handler: (ev: GridMapPointerEvent) => void): () => void
  destroy(): void
}
