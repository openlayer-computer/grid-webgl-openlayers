<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue"
import type Map from "ol/Map"
import { GridMapView } from "../core/GridMapView"
import type { ArrayDataJson, ColorRampItem } from "../data/gridDataCore"
import type { GridMapPointerEvent, GridMapStats, GridLayerVisibility, DisplayRange } from "../core/types"
import type { GridMapView as GridMapViewType } from "../core/GridMapView"

const props = withDefaults(
  defineProps<{
    map: Map | null | undefined
    dataUrl?: string
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
    legendMin?: number
    legendMax?: number
    displayMin?: number
    displayMax?: number
    autoFit?: boolean
    fitPadding?: number | [number, number, number, number]
    fitMaxZoom?: number
    /** 创建时绑定鼠标拾取，等价于 onPointerMove 回调 */
    onPointerMove?: (event: GridMapPointerEvent) => void
  }>(),
  {
    showChoropleth: true,
    showGrid: false,
    showLabels: true,
    choroplethOpacity: 0.75,
    choroplethZIndex: 2,
    labelsZIndex: 3,
    labelDistance: 80,
    labelPrecision: 1,
    labelFontSize: 11,
    autoFit: true,
    fitPadding: 40,
    fitMaxZoom: 10,
  },
)

const emit = defineEmits<{
  ready: [view: GridMapViewType]
  load: [stats: GridMapStats]
  pointermove: [event: GridMapPointerEvent]
  "legend-change": [range: DisplayRange]
  "display-change": [range: DisplayRange]
  error: [message: string]
}>()

let overlay: GridMapViewType | null = null
let unbindPointer: (() => void) | null = null

async function attachToMap(map: Map) {
  if (!props.dataUrl && !props.data) {
    emit("error", "GredGridMap: dataUrl or data is required")
    return
  }

  try {
    teardown()

    overlay = await GridMapView.create({
      map,
      dataUrl: props.dataUrl,
      data: props.data,
      showChoropleth: props.showChoropleth,
      showGrid: props.showGrid,
      showLabels: props.showLabels,
      choroplethOpacity: props.choroplethOpacity,
      choroplethZIndex: props.choroplethZIndex,
      labelsZIndex: props.labelsZIndex,
      labelDistance: props.labelDistance,
      labelPrecision: props.labelPrecision,
      labelFontSize: props.labelFontSize,
      colorRamp: props.colorRamp,
      legendMin: props.legendMin,
      legendMax: props.legendMax,
      displayMin: props.displayMin,
      displayMax: props.displayMax,
      autoFit: props.autoFit,
      fitPadding: props.fitPadding,
      fitMaxZoom: props.fitMaxZoom,
      onPointerMove: (ev) => {
        props.onPointerMove?.(ev)
        emit("pointermove", ev)
      },
    })
    emit("load", overlay.stats)
    emit("legend-change", overlay.getLegendRange())
    emit("ready", overlay)
  } catch (e) {
    emit("error", e instanceof Error ? e.message : String(e))
  }
}

function teardown() {
  unbindPointer?.()
  unbindPointer = null
  overlay?.destroy()
  overlay = null
}

function syncLayerState() {
  if (!overlay) return
  overlay.setLayerVisibility({
    choropleth: props.showChoropleth,
    grid: props.showGrid,
    labels: props.showLabels,
  })
}

function syncLegend() {
  if (!overlay) return
  if (props.colorRamp) {
    overlay.setColorRamp(props.colorRamp)
  } else if (props.legendMin != null && props.legendMax != null) {
    overlay.setLegendRange(props.legendMin, props.legendMax)
  }
  emit("legend-change", overlay.getLegendRange())
}

watch(
  () => props.map,
  (map) => {
    if (map) void attachToMap(map)
    else teardown()
  },
  { immediate: true },
)

watch(
  () => [props.dataUrl, props.data] as const,
  () => {
    if (props.map) void attachToMap(props.map)
  },
)

watch(
  () => [props.showChoropleth, props.showGrid, props.showLabels] as const,
  () => syncLayerState(),
)

watch(
  () => [props.legendMin, props.legendMax, props.colorRamp] as const,
  () => syncLegend(),
)

onBeforeUnmount(teardown)

defineExpose({
  getOverlay: () => overlay,
  fitToData: () => overlay?.fitToData(),
  refreshView: () => overlay?.refreshView(),
  getValueAt: (lon: number, lat: number) => overlay?.getValueAt(lon, lat) ?? null,
  getLayerVisibility: (): GridLayerVisibility | null => overlay?.getLayerVisibility() ?? null,
  setLayerVisibility: (v: Partial<GridLayerVisibility>) => overlay?.setLayerVisibility(v),
  setShowChoropleth: (visible: boolean) => overlay?.setShowChoropleth(visible),
  setShowGrid: (visible: boolean) => overlay?.setShowGrid(visible),
  setShowLabels: (visible: boolean) => overlay?.setShowLabels(visible),
  getLegendRange: () => overlay?.getLegendRange() ?? null,
  setLegendRange: (min: number, max: number) => {
    overlay?.setLegendRange(min, max)
    if (overlay) emit("legend-change", overlay.getLegendRange())
  },
  getDisplayRange: () => overlay?.getDisplayRange() ?? null,
  setDisplayRange: (min: number, max: number) => {
    overlay?.setDisplayRange(min, max)
    if (overlay) emit("display-change", overlay.getDisplayRange())
  },
  setColorRamp: (ramp: ColorRampItem[]) => {
    overlay?.setColorRamp(ramp)
    if (overlay) emit("legend-change", overlay.getLegendRange())
  },
  onPointerMove: (handler: (ev: GridMapPointerEvent) => void) => {
    unbindPointer?.()
    if (!overlay) return () => {}
    unbindPointer = overlay.onPointerMove(handler)
    return unbindPointer
  },
})
</script>

<template>
  <!-- renderless -->
</template>
