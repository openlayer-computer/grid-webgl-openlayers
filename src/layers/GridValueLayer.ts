import ImageLayer from "ol/layer/Image"
import ImageCanvas from "ol/source/ImageCanvas"
import type { Projection } from "ol/proj"
import type Map from "ol/Map"
import type View from "ol/View"
import type { ArrayDataLoader } from "../data/ArrayDataLoader"
import type { GridLabel } from "../data/gridDataCore"
import { lonLatToMapCoord, viewExtentTo4326 } from "../utils/projBridge"
import { mapCoordToCanvasPixel } from "../utils/canvasCoords"

export interface GridValueLayerOptions {
  loader: ArrayDataLoader
  distance?: number
  precision?: number
  fontSize?: number
  color?: string
  zIndex?: number
}

/**
 * Canvas2D 格点数值标注
 * computeLabels → extent 转屏幕像素 → fillText（稳定可读）
 */
export class GridValueLayer extends ImageLayer<ImageCanvas> {
  private loader: ArrayDataLoader
  private mapRef: Map | null = null
  private canvas: HTMLCanvasElement
  private labels: GridLabel[] = []
  private fetchVersion = 0
  private viewUnbind: (() => void) | null = null
  private readonly onMapChange = () => this.scheduleFetch()
  private opts: Required<Pick<GridValueLayerOptions, "distance" | "precision" | "fontSize" | "color">>

  constructor(options: GridValueLayerOptions) {
    const canvas = document.createElement("canvas")
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
      zIndex: options.zIndex ?? 3,
      source: new ImageCanvas({
        canvasFunction: (extent, resolution, pixelRatio, size, projection) =>
          renderHolder.fn!(extent, resolution, pixelRatio, size, projection),
        ratio: 1,
      }),
    })

    this.loader = options.loader
    this.canvas = canvas
    this.opts = {
      distance: options.distance ?? 80,
      precision: options.precision ?? 1,
      fontSize: options.fontSize ?? 11,
      color: options.color ?? "rgba(20, 20, 20, 0.92)",
    }

    renderHolder.fn = this.renderFrame.bind(this)
  }

  attachMap(map: Map): void {
    this.mapRef = map
    map.on("moveend", this.onMapChange)
    this.bindView(map.getView())
    this.scheduleFetch()
  }

  /** 切换投影后重新绑定 View 监听 */
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

  refreshData(): void {
    this.labels = []
    this.scheduleFetch()
  }

  private scheduleFetch(): void {
    const map = this.mapRef
    if (!map || !this.loader.isLoaded) return

    const view = map.getView()
    const projCode = view.getProjection().getCode()
    const size = map.getSize()
    const center = view.getCenter()
    if (!size || !center) return

    const extent4326 = viewExtentTo4326(view.calculateExtent(size), projCode)
    const zoom = view.getZoom() ?? 6
    const resolution = view.getResolution() ?? 1
    const ver = ++this.fetchVersion

    this.labels = this.loader.computeLabelsSync(
      extent4326,
      zoom,
      resolution,
      this.opts.distance,
      this.opts.precision,
      projCode,
    )
    this.getSource()?.changed()

    this.loader
      .computeLabelsAsync(
        extent4326,
        zoom,
        resolution,
        this.opts.distance,
        this.opts.precision,
        projCode,
      )
      .then((labels) => {
        if (ver !== this.fetchVersion) return
        this.labels = labels
        this.getSource()?.changed()
      })
  }

  private renderFrame(
    _extent: number[],
    _resolution: number,
    pixelRatio: number,
    size: number[],
  ): HTMLCanvasElement {
    const [w, h] = size
    const canvasW = Math.max(1, Math.floor(w * pixelRatio))
    const canvasH = Math.max(1, Math.floor(h * pixelRatio))

    this.canvas.width = canvasW
    this.canvas.height = canvasH

    const ctx = this.canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvasW, canvasH)

    const map = this.mapRef
    if (!map || this.labels.length === 0) {
      return this.canvas
    }

    const fontPx = this.opts.fontSize * pixelRatio
    ctx.font = `${fontPx}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.lineWidth = Math.max(2, 2 * pixelRatio)
    ctx.lineJoin = "round"
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillStyle = this.opts.color

    const projCode = map.getView().getProjection().getCode()
    for (const label of this.labels) {
      const coord = lonLatToMapCoord(label.lon, label.lat, projCode)
      const pixel = mapCoordToCanvasPixel(map, coord, pixelRatio)
      if (!pixel) continue
      const [px, py] = pixel
      if (px < -fontPx || px > canvasW + fontPx || py < -fontPx || py > canvasH + fontPx) continue
      ctx.strokeText(label.text, px, py)
      ctx.fillText(label.text, px, py)
    }

    return this.canvas
  }
}
