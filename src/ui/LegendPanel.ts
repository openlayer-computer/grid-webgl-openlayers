import type { ColorRampItem } from "../data/gridDataCore"
import type { GridMapView } from "../core/GridMapView"
import { LegendRangeSlider, type LegendRangeSliderOptions } from "./LegendRangeSlider"
import {
  resolveLegendPanelStyle,
  type LegendPanelPlacement,
  type LegendPanelStyle,
} from "./legendPanelTypes"
import type { LegendDisplayMode } from "../webgl/ColorRamp"

export interface LegendPanelOptions {
  parent?: HTMLElement | string
  placement?: LegendPanelPlacement
  style?: LegendPanelStyle
  title?: string
  showTitle?: boolean
  colorRamp: ColorRampItem[]
  legendTicks?: number[]
  legendMode?: LegendDisplayMode
  displayMin?: number
  displayMax?: number
  precision?: number
  onChange?: (range: { displayMin: number; displayMax: number }) => void
  controlsSlot?: HTMLElement
}

export class LegendPanel {
  readonly element: HTMLElement
  readonly sliderHost: HTMLElement
  readonly controlsSlot: HTMLElement
  readonly slider: LegendRangeSlider
  private titleEl: HTMLElement | null = null
  private overlayOnChange?: (range: { displayMin: number; displayMax: number }) => void

  constructor(options: LegendPanelOptions) {
    const parent = resolveParent(options.parent)

    this.element = document.createElement("div")
    this.element.className = "gred-legend-panel"
    Object.assign(this.element.style, resolveLegendPanelStyle(options.placement, options.style))

    if (options.showTitle !== false && options.title) {
      this.titleEl = document.createElement("div")
      this.titleEl.className = "gred-legend-panel__title"
      this.titleEl.textContent = options.title
      this.titleEl.style.marginBottom = "6px"
      this.titleEl.style.color = "#333"
      this.titleEl.style.fontSize = "12px"
      this.element.appendChild(this.titleEl)
    }

    this.sliderHost = document.createElement("div")
    this.sliderHost.className = "gred-legend-panel__slider"
    this.element.appendChild(this.sliderHost)

    this.controlsSlot = document.createElement("div")
    this.controlsSlot.className = "gred-legend-panel__controls"
    this.controlsSlot.style.marginTop = "8px"
    this.controlsSlot.style.display = "flex"
    this.controlsSlot.style.flexWrap = "wrap"
    this.controlsSlot.style.gap = "6px"
    if (options.controlsSlot) {
      while (options.controlsSlot.firstChild) {
        this.controlsSlot.appendChild(options.controlsSlot.firstChild)
      }
    }
    this.element.appendChild(this.controlsSlot)

    parent.appendChild(this.element)

    this.slider = new LegendRangeSlider({
      container: this.sliderHost,
      colorRamp: options.colorRamp,
      legendTicks: options.legendTicks,
      legendMode: options.legendMode ?? "blocks",
      displayMin: options.displayMin,
      displayMax: options.displayMax,
      precision: options.precision,
      showTitle: false,
      onChange: (range) => {
        this.overlayOnChange?.(range)
        options.onChange?.(range)
      },
    })
  }

  bindOverlay(overlay: GridMapView): void {
    this.overlayOnChange = ({ displayMin, displayMax }) => {
      overlay.setDisplayRange(displayMin, displayMax)
    }
    this.slider.setColorRamp(overlay.getColorRamp())
    const range = overlay.getDisplayRange()
    this.slider.setDisplayRange(range.min, range.max, true)
  }

  setTitle(title: string): void {
    if (this.titleEl) this.titleEl.textContent = title
  }

  applyStyle(style: LegendPanelStyle, placement?: LegendPanelPlacement): void {
    Object.assign(this.element.style, resolveLegendPanelStyle(placement, style))
  }

  setLegendMode(mode: LegendDisplayMode): void {
    this.slider.setLegendMode(mode)
  }

  destroy(): void {
    this.slider.destroy()
    this.element.remove()
  }
}

export function createLegendPanel(options: LegendPanelOptions): LegendPanel {
  return new LegendPanel(options)
}

function resolveParent(parent?: HTMLElement | string): HTMLElement {
  if (!parent) return document.body
  if (typeof parent === "string") {
    const el = document.querySelector<HTMLElement>(parent)
    if (!el) throw new Error(`LegendPanel: parent "${parent}" not found`)
    return el
  }
  return parent
}
