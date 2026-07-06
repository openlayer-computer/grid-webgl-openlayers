<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import { LegendRangeSlider } from "../ui/LegendRangeSlider"
import type { GridMapView } from "../core/GridMapView"
import type { ColorRampItem } from "../data/gridDataCore"

const props = withDefaults(
  defineProps<{
    overlay?: GridMapView | null
    /** 外部色带（数值间隔可不规则） */
    colorRamp?: ColorRampItem[]
    /** 图例刻度；不传则从 colorRamp 提取 */
    legendTicks?: number[]
    /** gradient 连续色带 | blocks 离散色块 */
    legendMode?: "gradient" | "blocks"
    displayMin?: number
    displayMax?: number
    precision?: number
    title?: string
  }>(),
  {
    precision: 1,
    legendMode: "blocks",
    title: "格点值",
  },
)

const emit = defineEmits<{
  change: [range: { displayMin: number; displayMax: number }]
}>()

const host = ref<HTMLElement | null>(null)
let slider: LegendRangeSlider | null = null

function getColorRamp(): ColorRampItem[] {
  if (props.colorRamp?.length) return props.colorRamp
  if (props.overlay) return props.overlay.getColorRamp()
  return []
}

function mountSlider() {
  if (!host.value) return
  const colorRamp = getColorRamp()
  if (colorRamp.length === 0) return

  const display = props.overlay?.getDisplayRange()

  slider?.destroy()
  slider = new LegendRangeSlider({
    container: host.value,
    colorRamp,
    legendTicks: props.legendTicks,
    legendMode: props.legendMode,
    displayMin: props.displayMin ?? display?.min,
    displayMax: props.displayMax ?? display?.max,
    precision: props.precision,
    onChange: ({ displayMin, displayMax }) => {
      props.overlay?.setDisplayRange(displayMin, displayMax)
      emit("change", { displayMin, displayMax })
    },
  })

  const titleEl = host.value.querySelector(".gred-legend-slider__title")
  if (titleEl) titleEl.textContent = props.title
}

function syncFromProps() {
  if (!slider) return
  const colorRamp = getColorRamp()
  if (colorRamp.length) slider.setColorRamp(colorRamp, props.legendTicks)
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
  () => [props.colorRamp, props.legendTicks, props.legendMode, props.displayMin, props.displayMax] as const,
  () => {
    if (slider) {
      syncFromProps()
      if (props.legendMode) slider.setLegendMode(props.legendMode)
    } else mountSlider()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  slider?.destroy()
  slider = null
})

defineExpose({
  setDisplayRange: (min: number, max: number) => slider?.setDisplayRange(min, max, true),
  getDisplayRange: () => slider?.getDisplayRange() ?? null,
  getLegendTicks: () => slider?.getLegendTicks() ?? [],
  setLegendMode: (mode: "gradient" | "blocks") => slider?.setLegendMode(mode),
})
</script>

<template>
  <div ref="host" class="gred-legend-slider-host" />
</template>

<style scoped>
.gred-legend-slider-host {
  min-width: 220px;
}
</style>
