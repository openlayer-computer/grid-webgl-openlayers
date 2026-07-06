var o = Object.defineProperty;
var d = (t, e, l) => e in t ? o(t, e, { enumerable: !0, configurable: !0, writable: !0, value: l }) : t[e] = l;
var s = (t, e, l) => d(t, typeof e != "symbol" ? e + "" : e, l);
import { r as i, L as c } from "./layerControlHelpers-BSZqa4fP.js";
import { A as u, C, D as T, G as f, a as S, b as x, c as v, d as R, e as w, f as M, g as P, h as _, i as G, j as b, k as N, l as D, m as A, n as O, o as k, p as H, q as V, s as j, t as q, u as B, v as F, w as I, x as W, y as Y } from "./layerControlHelpers-BSZqa4fP.js";
class h {
  constructor(e) {
    s(this, "element");
    s(this, "sliderHost");
    s(this, "controlsSlot");
    s(this, "slider");
    s(this, "titleEl", null);
    s(this, "overlayOnChange");
    const l = g(e.parent);
    if (this.element = document.createElement("div"), this.element.className = "gred-legend-panel", Object.assign(this.element.style, i(e.placement, e.style)), e.showTitle !== !1 && e.title && (this.titleEl = document.createElement("div"), this.titleEl.className = "gred-legend-panel__title", this.titleEl.textContent = e.title, this.titleEl.style.marginBottom = "6px", this.titleEl.style.color = "#333", this.titleEl.style.fontSize = "12px", this.element.appendChild(this.titleEl)), this.sliderHost = document.createElement("div"), this.sliderHost.className = "gred-legend-panel__slider", this.element.appendChild(this.sliderHost), this.controlsSlot = document.createElement("div"), this.controlsSlot.className = "gred-legend-panel__controls", this.controlsSlot.style.marginTop = "8px", this.controlsSlot.style.display = "flex", this.controlsSlot.style.flexWrap = "wrap", this.controlsSlot.style.gap = "6px", e.controlsSlot)
      for (; e.controlsSlot.firstChild; )
        this.controlsSlot.appendChild(e.controlsSlot.firstChild);
    this.element.appendChild(this.controlsSlot), l.appendChild(this.element), this.slider = new c({
      container: this.sliderHost,
      colorRamp: e.colorRamp,
      legendTicks: e.legendTicks,
      legendMode: e.legendMode ?? "blocks",
      displayMin: e.displayMin,
      displayMax: e.displayMax,
      precision: e.precision,
      showTitle: !1,
      onChange: (a) => {
        var n, r;
        (n = this.overlayOnChange) == null || n.call(this, a), (r = e.onChange) == null || r.call(e, a);
      }
    });
  }
  bindOverlay(e) {
    this.overlayOnChange = ({ displayMin: a, displayMax: n }) => {
      e.setDisplayRange(a, n);
    }, this.slider.setColorRamp(e.getColorRamp());
    const l = e.getDisplayRange();
    this.slider.setDisplayRange(l.min, l.max, !0);
  }
  setTitle(e) {
    this.titleEl && (this.titleEl.textContent = e);
  }
  applyStyle(e, l) {
    Object.assign(this.element.style, i(l, e));
  }
  setLegendMode(e) {
    this.slider.setLegendMode(e);
  }
  destroy() {
    this.slider.destroy(), this.element.remove();
  }
}
function y(t) {
  return new h(t);
}
function g(t) {
  if (!t) return document.body;
  if (typeof t == "string") {
    const e = document.querySelector(t);
    if (!e) throw new Error(`LegendPanel: parent "${t}" not found`);
    return e;
  }
  return t;
}
export {
  u as ArrayDataLoader,
  C as ChoroplethLayer,
  T as DEFAULT_LEGEND_PANEL_STYLE,
  f as GridMapView,
  S as GridValueLayer,
  x as LEGEND_PANEL_PLACEMENT_STYLE,
  h as LegendPanel,
  c as LegendRangeSlider,
  v as buildLegendTexture,
  R as colorRampWithRange,
  w as createGridMap,
  M as createGridOverlay,
  P as createLayerControlApi,
  y as createLegendPanel,
  _ as createLegendRangeSlider,
  G as dataBboxToViewExtent,
  b as defaultGridColorRamp,
  N as defaultTemperatureRamp,
  D as evenLegendPercentToValue,
  A as extractLegendTicks,
  O as getInnerRampStops,
  k as legendRangeFromRamp,
  H as lonLatToMapCoord,
  V as mapCoordToLonLat,
  j as rampToCssGradient,
  q as rampToEvenCssGradient,
  i as resolveLegendPanelStyle,
  B as rgbaToCss,
  F as tickIndexToEvenPercent,
  I as valueToEvenLegendPercent,
  W as valueToLegendPercent,
  Y as viewExtentTo4326
};
//# sourceMappingURL=index.js.map
