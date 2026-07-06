import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { defaults as defaultControls } from "ol/control"
import {
  GridMapView,
  createLegendPanel,
  createLayerControlApi,
  lonLatToMapCoord,
} from "grid-webgl-openlayers"
import type { ColorRampItem } from "grid-webgl-openlayers"
import "ol/ol.css"
import "grid-webgl-openlayers/style.css"

const DATA_URL = "/data/arrayData.json"

function buildColorRamp(): ColorRampItem[] {
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

function buildLayerButtons(overlay: GridMapView, container: HTMLElement): void {
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
  const meta = await fetch(DATA_URL).then((r) => r.json())
  const centerLon = (meta.startLon + meta.endLon) / 2
  const centerLat = (meta.startLat + meta.endLat) / 2
  const projCode = "EPSG:4326"

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

  const overlay = await GridMapView.create({
    map,
    dataUrl: DATA_URL,
    showGrid: false,
    showChoropleth: true,
    showLabels: true,
    colorRamp: buildColorRamp(),
  })

  const controlsSlot = document.createElement("div")
  buildLayerButtons(overlay, controlsSlot)

  const legend = createLegendPanel({
    parent: document.body,
    placement: "bottom-right",
    title: "格点值",
    legendMode: "blocks",
    colorRamp: overlay.getColorRamp(),
    displayMin: overlay.getDisplayRange().min,
    displayMax: overlay.getDisplayRange().max,
    controlsSlot,
    onChange: ({ displayMin, displayMax }) => {
      overlay.setDisplayRange(displayMin, displayMax)
    },
  })
  legend.bindOverlay(overlay)

  const infoEl = document.getElementById("info")!
  const updateInfo = () => {
    const zoom = map.getView().getZoom()?.toFixed(1) ?? "-"
    const lod = overlay.getLodStep()
    const { min, max } = overlay.getDisplayRange()
    infoEl.textContent = `Zoom: ${zoom} | LOD: ${lod}× | 显示: ${min.toFixed(1)}~${max.toFixed(1)}`
  }
  updateInfo()
  map.getView().on("change:resolution", updateInfo)

  overlay.onPointerMove((ev) => {
    if (ev.value != null) {
      infoEl.textContent = `值: ${ev.value.toFixed(1)} | ${ev.lon.toFixed(2)}, ${ev.lat.toFixed(2)} | Zoom: ${ev.zoom.toFixed(1)} | LOD: ${ev.lod}×`
    } else {
      updateInfo()
    }
  })
}

main().catch(console.error)
