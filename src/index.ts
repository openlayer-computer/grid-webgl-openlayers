export { ArrayDataLoader } from "./data/ArrayDataLoader"
export type { ArrayDataMeta, ArrayDataJson, GridTile, GridLabel, ColorRampItem } from "./data/gridDataCore"
export { ChoroplethLayer } from "./layers/ChoroplethLayer"
export type { ChoroplethLayerOptions } from "./layers/ChoroplethLayer"
export { GridValueLayer } from "./layers/GridValueLayer"
export type { GridValueLayerOptions } from "./layers/GridValueLayer"
export { GridMapView, createGridMap, createGridOverlay } from "./core/GridMapView"
export type { GridMapOptions, GridMapViewApi, GridMapStats, GridMapPointerEvent, LegendRange, DisplayRange, GridLayerVisibility } from "./core/types"
export { LegendRangeSlider, createLegendRangeSlider } from "./ui/LegendRangeSlider"
export type { LegendRangeSliderOptions, LegendDisplayMode } from "./ui/LegendRangeSlider"
export { LegendPanel, createLegendPanel } from "./ui/LegendPanel"
export type { LegendPanelOptions } from "./ui/LegendPanel"
export { createLayerControlApi } from "./ui/layerControlHelpers"
export type { LayerControlApi } from "./ui/layerControlHelpers"
export {
  resolveLegendPanelStyle,
  DEFAULT_LEGEND_PANEL_STYLE,
  LEGEND_PANEL_PLACEMENT_STYLE,
} from "./ui/legendPanelTypes"
export type { LegendPanelPlacement, LegendPanelStyle } from "./ui/legendPanelTypes"
export { defaultGridColorRamp, defaultTemperatureRamp, buildLegendTexture, rampToCssGradient, rampToEvenCssGradient, colorRampWithRange, legendRangeFromRamp, extractLegendTicks, valueToLegendPercent, valueToEvenLegendPercent, evenLegendPercentToValue, tickIndexToEvenPercent, getInnerRampStops, rgbaToCss } from "./webgl/ColorRamp"
export { lonLatToMapCoord, mapCoordToLonLat, viewExtentTo4326, dataBboxToViewExtent } from "./utils/projBridge"
export type { ProjCode } from "./utils/projBridge"
