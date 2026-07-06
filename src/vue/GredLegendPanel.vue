<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { LegendRangeSlider } from "../ui/LegendRangeSlider"
import { createLayerControlApi } from "../ui/layerControlHelpers"
import { resolveLegendPanelStyle, type LegendPanelPlacement, type LegendPanelStyle } from "../ui/legendPanelTypes"
import type { GridMapView } from "../core/GridMapView"
import type { ColorRampItem } from "../data/gridDataCore"
import type { LayerControlApi } from "../ui/layerControlHelpers"

const props = withDefaults(
  defineProps<{
    overlay?: GridMapView | null
    colorRamp?: ColorRampItem[]
    legendTicks?: number[]
    /** 直接传入：gradient | blocks，默认 blocks */
    legendMode?: "gradient" | "blocks"
    displayMin?: number
    displayMax?: number
    precision?: number
    title?: string
    showTitle?: boolean
    placement?: LegendPanelPlacement
    background?: string
    width?: string | number
    padding?: string
    borderRadius?: string
    boxShadow?: string
    zIndex?: number
    bottom?: string | number
    right?: string | number
    left?: string | number
    top?: string | number
    font?: string
  }>(),
  {
    legendMode: "blocks",
    precision: 1,
    title: "格点值",
    showTitle: true,
    placement: "bottom-right",
  },
)

const emit = defineEmits<{
  change: [range: { displayMin: number; displayMax: number }]
}>()

const sliderHost = ref<HTMLElement | null>(null)
let slider: LegendRangeSlider | null = null

const panelStyle = computed(() => {
  const style: LegendPanelStyle = {
    background: props.background,
    width: props.width,
    padding: props.padding,
    borderRadius: props.borderRadius,
    boxShadow: props.boxShadow,
    zIndex: props.zIndex,
    bottom: props.bottom,
    right: props.right,
    left: props.left,
    top: props.top,
    font: props.font,
  }
  return resolveLegendPanelStyle(props.placement, style)
})

const layer = computed<LayerControlApi>(() => createLayerControlApi(props.overlay))

function getColorRamp(): ColorRampItem[] {
  if (props.colorRamp?.length) return props.colorRamp
  if (props.overlay) return props.overlay.getColorRamp()
  return []
}

function mountSlider() {
  if (!sliderHost.value) return
  const colorRamp = getColorRamp()
  if (colorRamp.length === 0) return

  const display = props.overlay?.getDisplayRange()

  slider?.destroy()
  slider = new LegendRangeSlider({
    container: sliderHost.value,
    colorRamp,
    legendTicks: props.legendTicks,
    legendMode: props.legendMode,
    displayMin: props.displayMin ?? display?.min,
    displayMax: props.displayMax ?? display?.max,
    precision: props.precision,
    showTitle: false,
    onChange: ({ displayMin, displayMax }) => {
      props.overlay?.setDisplayRange(displayMin, displayMax)
      emit("change", { displayMin, displayMax })
    },
  })
}

function syncSlider() {
  if (!slider) return
  const colorRamp = getColorRamp()
  if (colorRamp.length) slider.setColorRamp(colorRamp, props.legendTicks)
  slider.setLegendMode(props.legendMode)
  if (props.displayMin != null && props.displayMax != null) {
    slider.setDisplayRange(props.displayMin, props.displayMax, true)
  } else if (props.overlay) {
    const d = props.overlay.getDisplayRange()
    slider.setDisplayRange(d.min, d.max, true)
  }
}

onMounted(mountSlider)
watch(() => props.overlay, mountSlider)
watch(
  () =>
    [props.colorRamp, props.legendTicks, props.legendMode, props.displayMin, props.displayMax] as const,
  () => (slider ? syncSlider() : mountSlider()),
  { deep: true },
)
onBeforeUnmount(() => {
  slider?.destroy()
  slider = null
})

defineExpose({
  getSlider: () => slider,
  setDisplayRange: (min: number, max: number) => slider?.setDisplayRange(min, max, true),
  getDisplayRange: () => slider?.getDisplayRange() ?? null,
  setLegendMode: (mode: "gradient" | "blocks") => slider?.setLegendMode(mode),
  layer,
})
</script>

<template>
  <div class="gred-legend-panel" :style="panelStyle">
    <div v-if="showTitle && title" class="gred-legend-panel__title">{{ title }}</div>
    <div ref="sliderHost" class="gred-legend-panel__slider" />
    <div v-if="$slots.controls" class="gred-legend-panel__controls">
      <slot name="controls" :overlay="overlay" :layer="layer" />
    </div>
  </div>
</template>

<style scoped>
.gred-legend-panel__title {
  margin-bottom: 6px;
  color: #333;
  font-size: 12px;
}
.gred-legend-panel__controls {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
