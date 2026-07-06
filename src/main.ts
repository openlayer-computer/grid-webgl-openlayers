import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { defaults as defaultControls } from "ol/control"
import { GridMapView } from "./core/GridMapView"
import { createLegendPanel } from "./ui/LegendPanel"
import { createLayerControlApi } from "./ui/layerControlHelpers"
import type { ColorRampItem } from "./data/gridDataCore"
import { FpsMonitor } from "./utils/FpsMonitor"
import { dataBboxToViewExtent, lonLatToMapCoord, mapCoordToLonLat } from "./utils/projBridge"
import type { ProjCode } from "./utils/projBridge"

function buildIrregularColorRamp(): ColorRampItem[] {
  return [
    [-9999, [0, 0, 0, 0]],
    [0, [232, 245, 233, 255]],
    [3, [200, 230, 201, 255]],
    [7.5, [129, 199, 132, 255]],
    [15, [67, 160, 71, 255]],
    [28, [46, 125, 50, 255]],
    [47.6, [27, 94, 32, 255]],
    [9999, [0, 0, 0, 0]],
  ]
}

function buildControlButtons(overlay: GridMapView, container: HTMLElement): void {
  const layer = createLayerControlApi(overlay)
  const items: { label: string; key: "choropleth" | "grid" | "labels" }[] = [
    { label: "色斑图", key: "choropleth" },
    { label: "网格线", key: "grid" },
    { label: "格点数值", key: "labels" },
  ]
  for (const { label, key } of items) {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.textContent = label
    btn.style.cssText =
      "font:11px system-ui;padding:3px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer"
    const sync = () => {
      const v = layer.getVisibility()
      if (!v) return
      const on = v[key]
      btn.style.opacity = on ? "1" : "0.45"
      btn.style.fontWeight = on ? "600" : "400"
    }
    btn.addEventListener("click", () => {
      const v = layer.getVisibility()
      if (!v) return
      layer.setLayerVisibility({ [key]: !v[key] })
      sync()
    })
    sync()
    container.appendChild(btn)
  }
}

async function main() {
  const loaderUrl = "/data/arrayData.json"
  let projCode: ProjCode = "EPSG:4326"

  const bboxRes = await fetch(loaderUrl).then((r) => r.json())
  const centerLon = (bboxRes.startLon + bboxRes.endLon) / 2
  const centerLat = (bboxRes.startLat + bboxRes.endLat) / 2

  const map = new Map({
    target: "map",
    view: new View({
      projection: projCode,
      center: lonLatToMapCoord(centerLon, centerLat, projCode),
      zoom: 6,
      minZoom: 4,
      maxZoom: 14,
    }),
    layers: [new TileLayer({ source: new OSM(), zIndex: 0 })],
    controls: defaultControls({ zoom: true, attribution: true }),
  })

  const gridOverlay = await GridMapView.create({
    map,
    dataUrl: loaderUrl,
    showGrid: false,
    colorRamp: buildIrregularColorRamp(),
  })

  new FpsMonitor(document.getElementById("fps")!).attachMap(map)

  const controlsSlot = document.createElement("div")
  buildControlButtons(gridOverlay, controlsSlot)

  const legendPanel = createLegendPanel({
    parent: document.body,
    placement: "bottom-right",
    title: "格点值",
    colorRamp: gridOverlay.getColorRamp(),
    legendMode: "blocks",
    displayMin: gridOverlay.getDisplayRange().min,
    displayMax: gridOverlay.getDisplayRange().max,
    controlsSlot,
    onChange: ({ displayMin, displayMax }) => {
      gridOverlay.setDisplayRange(displayMin, displayMax)
    },
  })
  legendPanel.bindOverlay(gridOverlay)

  const infoEl = document.getElementById("info")!
  const updateInfo = () => {
    const zoom = map.getView().getZoom()?.toFixed(1) ?? "-"
    const lod = gridOverlay.getLodStep()
    const { min, max } = gridOverlay.getDisplayRange()
    infoEl.textContent = `${projCode} | Zoom: ${zoom} | LOD: ${lod}× | 显示: ${min.toFixed(1)}~${max.toFixed(1)}`
  }
  updateInfo()
  map.getView().on("change:resolution", updateInfo)

  gridOverlay.onPointerMove((ev) => {
    if (ev.value != null) {
      infoEl.textContent = `值: ${ev.value.toFixed(1)} | ${ev.lon.toFixed(2)}, ${ev.lat.toFixed(2)} | ${projCode} | Zoom: ${ev.zoom.toFixed(1)} | LOD: ${ev.lod}×`
    } else {
      updateInfo()
    }
  })

  document.getElementById("proj-4326")!.addEventListener("change", () => switchProjection("EPSG:4326"))
  document.getElementById("proj-3857")!.addEventListener("change", () => switchProjection("EPSG:3857"))

  function switchProjection(next: ProjCode) {
    if (next === projCode) return
    const view = map.getView()
    const center = view.getCenter()
    const zoom = view.getZoom() ?? 6
    const [lon, lat] = center
      ? mapCoordToLonLat(center[0], center[1], projCode)
      : [centerLon, centerLat]

    projCode = next
    ;(document.getElementById("proj-4326") as HTMLInputElement).checked = next === "EPSG:4326"
    ;(document.getElementById("proj-3857") as HTMLInputElement).checked = next === "EPSG:3857"

    map.setView(
      new View({
        projection: projCode,
        center: lonLatToMapCoord(lon, lat, projCode),
        zoom,
        minZoom: 4,
        maxZoom: 14,
      }),
    )

    gridOverlay.refreshView()
    const ext = dataBboxToViewExtent(gridOverlay.loader.bbox, projCode)
    map.getView().fit(ext, { padding: [40, 40, 40, 40], maxZoom: 10 })
    updateInfo()
  }

  void legendPanel
}

main().catch(console.error)
