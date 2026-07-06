import ImageLayer from "ol/layer/Image"
import ImageCanvas from "ol/source/ImageCanvas"
import type { Projection } from "ol/proj"
import type Map from "ol/Map"
import type View from "ol/View"
import type { ColorRampItem, GridTile } from "../data/gridDataCore"
import type { ArrayDataLoader } from "../data/ArrayDataLoader"
import { ChoroplethRenderer, affineToMat3, computeDelta } from "../webgl/ChoroplethRenderer"
import { buildLegendTexture, colorRampWithRange, defaultGridColorRamp, legendRangeFromRamp, type LegendTexture } from "../webgl/ColorRamp"
import { isMercator, viewExtentTo4326 } from "../utils/projBridge"

export interface ChoroplethLayerOptions {
  loader: ArrayDataLoader
  colorRamp?: ColorRampItem[]
  opacity?: number
  showGrid?: boolean
  zIndex?: number
}

export class ChoroplethLayer extends ImageLayer<ImageCanvas> {
  private loader: ArrayDataLoader
  private glCanvas: HTMLCanvasElement
  private displayCanvas: HTMLCanvasElement
  private renderer: ChoroplethRenderer
  private legend: LegendTexture | null = null
  private currentTile: GridTile | null = null
  private showGridLines: boolean
  private colorRamp: ColorRampItem[]
  private displayMin: number
  private displayMax: number
  private mapRef: Map | null = null
  private fetchVersion = 0
  private viewUnbind: (() => void) | null = null
  private readonly onMapChange = () => this.scheduleFetch()

  constructor(options: ChoroplethLayerOptions) {
    const glCanvas = document.createElement("canvas")
    const displayCanvas = document.createElement("canvas")
    const renderer = new ChoroplethRenderer(glCanvas)

    const renderHolder: {
      fn?: (
        extent: number[],
        resolution: number,
        pixelRatio: number,
        size: number[],
        projection: Projection,
      ) => HTMLCanvasElement
    } = {}

    super({
      opacity: options.opacity ?? 0.85,
      zIndex: options.zIndex ?? 2,
      source: new ImageCanvas({
        canvasFunction: (extent, resolution, pixelRatio, size, projection) =>
          renderHolder.fn!(extent, resolution, pixelRatio, size, projection),
        ratio: 1,
      }),
    })

    this.loader = options.loader
    this.glCanvas = glCanvas
    this.displayCanvas = displayCanvas
    this.renderer = renderer
    this.showGridLines = options.showGrid ?? false

    const stats = this.loader.computeStats()
    const ramp = options.colorRamp ?? defaultGridColorRamp(stats.min, stats.max)
    this.colorRamp = ramp
    const { min, max } = legendRangeFromRamp(ramp)
    this.displayMin = min
    this.displayMax = max
    this.legend = buildLegendTexture(renderer.gl, ramp)
    renderer.setLegend(this.legend)

    renderHolder.fn = this.renderFrame.bind(this)
  }

  /** 当前图例数值范围 */
  getLegendRange(): { min: number; max: number } {
    return legendRangeFromRamp(this.colorRamp)
  }

  getColorRamp(): ColorRampItem[] {
    return this.colorRamp
  }

  /** 设置完整色带并刷新渲染 */
  setColorRamp(colorRamp: ColorRampItem[]): void {
    this.colorRamp = colorRamp
    this.rebuildLegend()
  }

  /** 仅调整图例 min/max（保留当前色带样式） */
  setLegendRange(min: number, max: number): void {
    this.setColorRamp(colorRampWithRange(min, max, this.colorRamp))
  }

  /** 色斑图实际显示的数值区间（滑块控制） */
  getDisplayRange(): { min: number; max: number } {
    return { min: this.displayMin, max: this.displayMax }
  }

  setDisplayRange(min: number, max: number): void {
    const { min: lmin, max: lmax } = this.getLegendRange()
    const span = Math.max(lmax - lmin, 0.01)
    const gap = span * 0.001
    let dmin = Math.max(lmin, Math.min(min, lmax))
    let dmax = Math.min(lmax, Math.max(max, lmin))
    if (dmax - dmin < gap) {
      dmax = Math.min(lmax, dmin + gap)
    }
    this.displayMin = dmin
    this.displayMax = dmax
    this.refreshRender()
  }

  private clampDisplayRange(): void {
    const { min: lmin, max: lmax } = this.getLegendRange()
    this.setDisplayRange(
      Math.max(lmin, Math.min(this.displayMin, lmax)),
      Math.min(lmax, Math.max(this.displayMax, lmin)),
    )
  }

  private refreshRender(): void {
    this.getSource()?.changed()
    this.changed()
  }

  getShowGrid(): boolean {
    return this.showGridLines
  }

  private rebuildLegend(): void {
    if (this.legend) {
      this.renderer.gl.deleteTexture(this.legend.texture)
    }
    this.legend = buildLegendTexture(this.renderer.gl, this.colorRamp)
    this.renderer.setLegend(this.legend)
    this.clampDisplayRange()
  }

  setShowGrid(show: boolean): void {
    this.showGridLines = show
    this.refreshRender()
  }

  refreshData(): void {
    this.loader.invalidateCache()
    this.scheduleFetch()
  }

  private scheduleFetch(): void {
    const map = this.mapRef
    if (!map || !this.loader.isLoaded) return

    const view = map.getView()
    const projCode = view.getProjection().getCode()
    const size = map.getSize()
    if (!size) return

    const extent4326 = viewExtentTo4326(view.calculateExtent(size), projCode)
    const zoom = view.getZoom() ?? 6
    const ver = ++this.fetchVersion

    this.loader.readWindowAsync(extent4326, zoom).then((tile) => {
      if (ver !== this.fetchVersion) return
      if (tile) this.currentTile = tile
      this.getSource()?.changed()
    })
  }

  private renderFrame(
    extent: number[],
    resolution: number,
    pixelRatio: number,
    size: number[],
  ): HTMLCanvasElement {
    const [w, h] = size
    const canvasW = Math.floor(w * pixelRatio)
    const canvasH = Math.floor(h * pixelRatio)

    this.displayCanvas.width = canvasW
    this.displayCanvas.height = canvasH
    this.renderer.resize(canvasW, canvasH)

    const map = this.mapRef
    if (!map || !this.loader.isLoaded) {
      return this.displayCanvas
    }

    const view = map.getView()
    const projCode = view.getProjection().getCode()
    const zoom = view.getZoom() ?? 6
    const mapSize = map.getSize()
    const extent4326 = mapSize
      ? viewExtentTo4326(view.calculateExtent(mapSize), projCode)
      : (extent as [number, number, number, number])

    const tile = this.currentTile ?? this.loader.readWindow(extent4326, zoom)

    if (!tile) {
      const ctx = this.displayCanvas.getContext("2d")!
      ctx.clearRect(0, 0, canvasW, canvasH)
      return this.displayCanvas
    }

    this.currentTile = tile
    this.renderer.uploadTile(tile)

    // @ts-expect-error OL 私有 frameState
    const frameState = map.frameState_
    const pixelToCoord = frameState?.pixelToCoordinateTransform as number[] | undefined
    const transform = pixelToCoord
      ? affineToMat3(pixelToCoord)
      : new Float32Array([1, 0, 0, 0, -1, 0, 0, 0, 1])

    const viewExtent = view.calculateExtent(mapSize ?? size) as number[]
    const delta = computeDelta(viewExtent, extent, resolution)

    this.renderer.render(tile, {
      transform: Array.from(transform),
      size: [canvasW, canvasH],
      delta,
      pixelRatio,
      dataBbox: tile.bbox,
      nativeCellSize: this.loader.nativeResolution,
      gridOrigin: this.loader.gridOrigin,
      gridLod: this.loader.getLodStep(zoom),
      opacity: this.getOpacity(),
      showGrid: this.showGridLines,
      projMercator: isMercator(projCode),
      displayRange: [this.displayMin, this.displayMax],
    })

    const ctx = this.displayCanvas.getContext("2d")!
    ctx.clearRect(0, 0, canvasW, canvasH)
    ctx.drawImage(this.glCanvas, 0, 0)

    return this.displayCanvas
  }

  attachMap(map: Map): void {
    this.mapRef = map
    map.on("moveend", this.onMapChange)
    this.bindView(map.getView())
    this.scheduleFetch()
  }

  reattachView(map: Map): void {
    this.mapRef = map
    this.bindView(map.getView())
    this.scheduleFetch()
  }

  private bindView(view: View): void {
    this.viewUnbind?.()
    view.on("change:resolution", this.onMapChange)
    this.viewUnbind = () => view.un("change:resolution", this.onMapChange)
  }

  getDataValue(lon: number, lat: number): number | null {
    return this.loader.getValueAt(lon, lat, this.currentTile)
  }

  dispose(): void {
    this.renderer.dispose()
  }
}
