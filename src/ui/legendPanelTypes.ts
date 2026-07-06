import type { LegendDisplayMode } from "../webgl/ColorRamp"

export type LegendPanelPlacement = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "custom"

export interface LegendPanelStyle {
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
}

export const DEFAULT_LEGEND_PANEL_STYLE: Required<
  Pick<LegendPanelStyle, "background" | "width" | "padding" | "borderRadius" | "boxShadow" | "zIndex">
> = {
  background: "rgba(255, 255, 255, 0.92)",
  width: "280px",
  padding: "10px 14px 12px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  zIndex: 10,
}

export const LEGEND_PANEL_PLACEMENT_STYLE: Record<
  Exclude<LegendPanelPlacement, "custom">,
  Pick<LegendPanelStyle, "bottom" | "right" | "left" | "top">
> = {
  "bottom-right": { bottom: 24, right: 12 },
  "bottom-left": { bottom: 24, left: 12 },
  "top-right": { top: 12, right: 12 },
  "top-left": { top: 12, left: 12 },
}

export function resolveLegendPanelStyle(
  placement: LegendPanelPlacement = "bottom-right",
  style: LegendPanelStyle = {},
): Record<string, string | number> {
  const base = { ...DEFAULT_LEGEND_PANEL_STYLE, ...style }
  const pos =
    placement === "custom" ? {} : LEGEND_PANEL_PLACEMENT_STYLE[placement]

  const css: Record<string, string | number> = {
    position: "absolute",
    background: base.background,
    width: typeof base.width === "number" ? `${base.width}px` : base.width,
    padding: base.padding,
    borderRadius: base.borderRadius,
    boxShadow: base.boxShadow,
    zIndex: style.zIndex ?? base.zIndex,
    font: style.font ?? "11px system-ui, sans-serif",
    boxSizing: "border-box",
  }

  const edges = { ...pos, ...style }
  for (const key of ["bottom", "right", "left", "top"] as const) {
    const v = edges[key]
    if (v != null) css[key] = typeof v === "number" ? `${v}px` : v
  }
  return css
}

export interface LegendPanelDisplayMode {
  legendMode: LegendDisplayMode
}
