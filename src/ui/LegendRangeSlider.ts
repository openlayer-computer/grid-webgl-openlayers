import type { ColorRampItem } from "../data/gridDataCore"
import {
  evenLegendPercentToValue,
  extractLegendTicks,
  getInnerRampStops,
  legendRangeFromRamp,
  rampToEvenCssGradient,
  rgbaToCss,
  tickIndexToEvenPercent,
  valueToEvenLegendPercent,
  type LegendDisplayMode,
} from "../webgl/ColorRamp"

export type { LegendDisplayMode }

export interface LegendRangeSliderOptions {
  container: HTMLElement
  colorRamp: ColorRampItem[]
  legendTicks?: number[]
  legendMode?: LegendDisplayMode
  displayMin?: number
  displayMax?: number
  precision?: number
  /** 是否显示内置标题（面板模式下由外部控制） */
  showTitle?: boolean
  onChange?: (range: { displayMin: number; displayMax: number }) => void
}

const SLIDER_STYLES = `
.gred-legend-slider { user-select: none; font: 11px/1.4 system-ui, sans-serif; }
.gred-legend-slider__title { margin-bottom: 6px; color: #333; }
.gred-legend-slider__body { overflow: visible; }
.gred-legend-slider__track {
  position: relative; height: 18px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;
}
.gred-legend-slider__bar {
  position: absolute; inset: 0; border-radius: 3px;
}
.gred-legend-slider__blocks {
  position: absolute; inset: 0; border-radius: 3px; overflow: hidden;
}
.gred-legend-slider__block {
  position: absolute; top: 0; bottom: 0;
}
.gred-legend-slider__mask {
  position: absolute; top: 0; bottom: 0; background: rgba(255,255,255,0.72); pointer-events: none;
}
.gred-legend-slider__mask--left { left: 0; }
.gred-legend-slider__mask--right { right: 0; }
.gred-legend-slider__thumb {
  position: absolute; top: 50%; width: 12px; height: 22px; margin-left: -6px;
  transform: translateY(-50%); background: #fff; border: 2px solid #333; border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25); cursor: grab; z-index: 2;
}
.gred-legend-slider__thumb:active { cursor: grabbing; }
.gred-legend-slider__labels {
  position: relative; height: 18px; margin: 3px 0 0; padding: 0;
}
.gred-legend-slider__label {
  position: absolute; top: 0; transform: translateX(-50%);
  color: #333; font-size: 10px; white-space: nowrap; line-height: 1.2;
}
.gred-legend-slider__label--edge-left { transform: translateX(0); }
.gred-legend-slider__label--edge-right { transform: translateX(-100%); }
`

let stylesInjected = false

function injectStyles(): void {
  if (stylesInjected) return
  stylesInjected = true
  const el = document.createElement("style")
  el.textContent = SLIDER_STYLES
  document.head.appendChild(el)
}

/**
 * 图例双滑块：色带/色块均匀分布，数值标注紧贴色带下方。
 */
export class LegendRangeSlider {
  private root: HTMLElement
  private body: HTMLElement
  private track: HTMLElement
  private bar: HTMLElement
  private blocks: HTMLElement
  private labelsRow: HTMLElement
  private maskLeft: HTMLElement
  private maskRight: HTMLElement
  private thumbMin: HTMLElement
  private thumbMax: HTMLElement
  private legendMin: number
  private legendMax: number
  private displayMin: number
  private displayMax: number
  private colorRamp: ColorRampItem[]
  private legendTicks: number[]
  private legendMode: LegendDisplayMode
  private precision: number
  private showTitle: boolean
  private onChange?: (range: { displayMin: number; displayMax: number }) => void
  private dragging: "min" | "max" | null = null

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return
    const rect = this.track.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const value = evenLegendPercentToValue(p, this.legendTicks)
    if (this.dragging === "min") {
      this.displayMin = Math.min(value, this.displayMax)
    } else {
      this.displayMax = Math.max(value, this.displayMin)
    }
    this.applyDisplayRange(this.displayMin, this.displayMax, false)
  }

  private onPointerUp = () => {
    this.dragging = null
  }

  constructor(options: LegendRangeSliderOptions) {
    injectStyles()
    this.colorRamp = options.colorRamp
    this.legendTicks = options.legendTicks ?? extractLegendTicks(options.colorRamp)
    this.legendMode = options.legendMode ?? "blocks"
    const { min, max } = legendRangeFromRamp(this.colorRamp)
    this.legendMin = min
    this.legendMax = max
    this.displayMin = options.displayMin ?? min
    this.displayMax = options.displayMax ?? max
    this.precision = options.precision ?? 1
    this.showTitle = options.showTitle !== false
    this.onChange = options.onChange

    this.root = document.createElement("div")
    this.root.className = "gred-legend-slider"

    if (this.showTitle) {
      const title = document.createElement("div")
      title.className = "gred-legend-slider__title"
      title.textContent = "格点值"
      this.root.appendChild(title)
    }

    this.body = document.createElement("div")
    this.body.className = "gred-legend-slider__body"

    this.track = document.createElement("div")
    this.track.className = "gred-legend-slider__track"

    this.bar = document.createElement("div")
    this.bar.className = "gred-legend-slider__bar"
    this.blocks = document.createElement("div")
    this.blocks.className = "gred-legend-slider__blocks"
    this.track.appendChild(this.bar)
    this.track.appendChild(this.blocks)

    this.maskLeft = document.createElement("div")
    this.maskLeft.className = "gred-legend-slider__mask gred-legend-slider__mask--left"
    this.maskRight = document.createElement("div")
    this.maskRight.className = "gred-legend-slider__mask gred-legend-slider__mask--right"
    this.track.appendChild(this.maskLeft)
    this.track.appendChild(this.maskRight)

    this.thumbMin = this.createThumb("min")
    this.thumbMax = this.createThumb("max")
    this.track.appendChild(this.thumbMin)
    this.track.appendChild(this.thumbMax)

    this.labelsRow = document.createElement("div")
    this.labelsRow.className = "gred-legend-slider__labels"

    this.body.appendChild(this.track)
    this.body.appendChild(this.labelsRow)
    this.root.appendChild(this.body)

    options.container.appendChild(this.root)

    document.addEventListener("pointermove", this.onPointerMove)
    document.addEventListener("pointerup", this.onPointerUp)

    this.updateBar()
    this.rebuildLabels()
    this.applyDisplayRange(this.displayMin, this.displayMax, true)
  }

  private createThumb(which: "min" | "max"): HTMLElement {
    const thumb = document.createElement("div")
    thumb.className = "gred-legend-slider__thumb"
    thumb.addEventListener("pointerdown", (e) => {
      e.preventDefault()
      this.dragging = which
      thumb.setPointerCapture(e.pointerId)
    })
    return thumb
  }

  /** 均匀布局位置 */
  private evenPct(value: number): number {
    return valueToEvenLegendPercent(value, this.legendTicks)
  }

  private evenPctByIndex(index: number): number {
    return tickIndexToEvenPercent(index, this.legendTicks.length)
  }

  private fmt(value: number): string {
    return value.toFixed(this.precision)
  }

  private updateBar(): void {
    const { min, max } = legendRangeFromRamp(this.colorRamp)
    this.legendMin = min
    this.legendMax = max

    if (this.legendMode === "gradient") {
      this.bar.style.display = "block"
      this.blocks.style.display = "none"
      this.bar.style.background = rampToEvenCssGradient(this.colorRamp)
    } else {
      this.bar.style.display = "none"
      this.blocks.style.display = "block"
      this.blocks.replaceChildren()
      const stops = getInnerRampStops(this.colorRamp)
      const segCount = stops.length - 1
      for (let i = 0; i < segCount; i++) {
        const [, c0] = stops[i]
        const left = this.evenPctByIndex(i) * 100
        const width = (this.evenPctByIndex(i + 1) - this.evenPctByIndex(i)) * 100
        const seg = document.createElement("div")
        seg.className = "gred-legend-slider__block"
        seg.style.left = `${left}%`
        seg.style.width = `${width}%`
        seg.style.background = rgbaToCss(c0)
        this.blocks.appendChild(seg)
      }
    }
  }

  private rebuildLabels(): void {
    this.labelsRow.replaceChildren()
    const n = this.legendTicks.length
    this.legendTicks.forEach((tick, i) => {
      const el = document.createElement("span")
      el.className = "gred-legend-slider__label"
      if (i === 0) el.classList.add("gred-legend-slider__label--edge-left")
      if (i === n - 1) el.classList.add("gred-legend-slider__label--edge-right")
      el.textContent = this.fmt(tick)
      el.style.left = `${this.evenPctByIndex(i) * 100}%`
      this.labelsRow.appendChild(el)
    })
  }

  private applyDisplayRange(min: number, max: number, silent: boolean): void {
    const span = Math.max(this.legendMax - this.legendMin, 0.01)
    const gap = span * 0.001
    let dmin = Math.max(this.legendMin, Math.min(min, this.legendMax))
    let dmax = Math.min(this.legendMax, Math.max(max, this.legendMin))
    if (dmax - dmin < gap) dmax = Math.min(this.legendMax, dmin + gap)

    this.displayMin = dmin
    this.displayMax = dmax

    const pMin = this.evenPct(dmin)
    const pMax = this.evenPct(dmax)

    this.thumbMin.style.left = `${pMin * 100}%`
    this.thumbMax.style.left = `${pMax * 100}%`
    this.maskLeft.style.width = `${pMin * 100}%`
    this.maskRight.style.width = `${(1 - pMax) * 100}%`

    if (!silent) {
      this.onChange?.({ displayMin: dmin, displayMax: dmax })
    }
  }

  setLegendMode(mode: LegendDisplayMode): void {
    if (this.legendMode === mode) return
    this.legendMode = mode
    this.updateBar()
  }

  getLegendMode(): LegendDisplayMode {
    return this.legendMode
  }

  setColorRamp(colorRamp: ColorRampItem[], legendTicks?: number[]): void {
    this.colorRamp = colorRamp
    this.legendTicks = legendTicks ?? extractLegendTicks(colorRamp)
    this.updateBar()
    this.rebuildLabels()
    this.applyDisplayRange(this.displayMin, this.displayMax, true)
  }

  setLegendTicks(ticks: number[]): void {
    this.legendTicks = ticks
    this.rebuildLabels()
    this.updateBar()
    this.applyDisplayRange(this.displayMin, this.displayMax, true)
  }

  getLegendTicks(): number[] {
    return [...this.legendTicks]
  }

  setDisplayRange(min: number, max: number, silent = false): void {
    this.applyDisplayRange(min, max, silent)
  }

  getDisplayRange(): { displayMin: number; displayMax: number } {
    return { displayMin: this.displayMin, displayMax: this.displayMax }
  }

  getLegendRange(): { min: number; max: number } {
    return { min: this.legendMin, max: this.legendMax }
  }

  destroy(): void {
    document.removeEventListener("pointermove", this.onPointerMove)
    document.removeEventListener("pointerup", this.onPointerUp)
    this.root.remove()
  }
}

export function createLegendRangeSlider(options: LegendRangeSliderOptions): LegendRangeSlider {
  return new LegendRangeSlider(options)
}
