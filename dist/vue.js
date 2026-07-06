import { defineComponent as x, watch as c, onBeforeUnmount as L, ref as D, computed as b, onMounted as S, openBlock as M, createElementBlock as R, normalizeStyle as v, toDisplayString as G, createCommentVNode as _, createElementVNode as T, renderSlot as P } from "vue";
import { G as V, r as I, g as Z, L as k } from "./layerControlHelpers-BSZqa4fP.js";
const $ = /* @__PURE__ */ x({
  __name: "GredGridMap",
  props: {
    map: {},
    dataUrl: {},
    data: {},
    showChoropleth: { type: Boolean, default: !0 },
    showGrid: { type: Boolean, default: !1 },
    showLabels: { type: Boolean, default: !0 },
    choroplethOpacity: { default: 0.75 },
    choroplethZIndex: { default: 2 },
    labelsZIndex: { default: 3 },
    labelDistance: { default: 80 },
    labelPrecision: { default: 1 },
    labelFontSize: { default: 11 },
    colorRamp: {},
    legendMin: {},
    legendMax: {},
    displayMin: {},
    displayMax: {},
    autoFit: { type: Boolean, default: !0 },
    fitPadding: { default: 40 },
    fitMaxZoom: { default: 10 },
    onPointerMove: {}
  },
  emits: ["ready", "load", "pointermove", "legend-change", "display-change", "error"],
  setup(d, { expose: p, emit: g }) {
    const e = d, s = g;
    let t = null, n = null;
    async function u(a) {
      if (!e.dataUrl && !e.data) {
        s("error", "GredGridMap: dataUrl or data is required");
        return;
      }
      try {
        r(), t = await V.create({
          map: a,
          dataUrl: e.dataUrl,
          data: e.data,
          showChoropleth: e.showChoropleth,
          showGrid: e.showGrid,
          showLabels: e.showLabels,
          choroplethOpacity: e.choroplethOpacity,
          choroplethZIndex: e.choroplethZIndex,
          labelsZIndex: e.labelsZIndex,
          labelDistance: e.labelDistance,
          labelPrecision: e.labelPrecision,
          labelFontSize: e.labelFontSize,
          colorRamp: e.colorRamp,
          legendMin: e.legendMin,
          legendMax: e.legendMax,
          displayMin: e.displayMin,
          displayMax: e.displayMax,
          autoFit: e.autoFit,
          fitPadding: e.fitPadding,
          fitMaxZoom: e.fitMaxZoom,
          onPointerMove: (l) => {
            var i;
            (i = e.onPointerMove) == null || i.call(e, l), s("pointermove", l);
          }
        }), s("load", t.stats), s("legend-change", t.getLegendRange()), s("ready", t);
      } catch (l) {
        s("error", l instanceof Error ? l.message : String(l));
      }
    }
    function r() {
      n == null || n(), n = null, t == null || t.destroy(), t = null;
    }
    function h() {
      t && t.setLayerVisibility({
        choropleth: e.showChoropleth,
        grid: e.showGrid,
        labels: e.showLabels
      });
    }
    function o() {
      t && (e.colorRamp ? t.setColorRamp(e.colorRamp) : e.legendMin != null && e.legendMax != null && t.setLegendRange(e.legendMin, e.legendMax), s("legend-change", t.getLegendRange()));
    }
    return c(
      () => e.map,
      (a) => {
        a ? u(a) : r();
      },
      { immediate: !0 }
    ), c(
      () => [e.dataUrl, e.data],
      () => {
        e.map && u(e.map);
      }
    ), c(
      () => [e.showChoropleth, e.showGrid, e.showLabels],
      () => h()
    ), c(
      () => [e.legendMin, e.legendMax, e.colorRamp],
      () => o()
    ), L(r), p({
      getOverlay: () => t,
      fitToData: () => t == null ? void 0 : t.fitToData(),
      refreshView: () => t == null ? void 0 : t.refreshView(),
      getValueAt: (a, l) => (t == null ? void 0 : t.getValueAt(a, l)) ?? null,
      getLayerVisibility: () => (t == null ? void 0 : t.getLayerVisibility()) ?? null,
      setLayerVisibility: (a) => t == null ? void 0 : t.setLayerVisibility(a),
      setShowChoropleth: (a) => t == null ? void 0 : t.setShowChoropleth(a),
      setShowGrid: (a) => t == null ? void 0 : t.setShowGrid(a),
      setShowLabels: (a) => t == null ? void 0 : t.setShowLabels(a),
      getLegendRange: () => (t == null ? void 0 : t.getLegendRange()) ?? null,
      setLegendRange: (a, l) => {
        t == null || t.setLegendRange(a, l), t && s("legend-change", t.getLegendRange());
      },
      getDisplayRange: () => (t == null ? void 0 : t.getDisplayRange()) ?? null,
      setDisplayRange: (a, l) => {
        t == null || t.setDisplayRange(a, l), t && s("display-change", t.getDisplayRange());
      },
      setColorRamp: (a) => {
        t == null || t.setColorRamp(a), t && s("legend-change", t.getLegendRange());
      },
      onPointerMove: (a) => (n == null || n(), t ? (n = t.onPointerMove(a), n) : () => {
      })
    }), (a, l) => null;
  }
}), B = {
  key: 0,
  class: "gred-legend-panel__title"
}, z = {
  key: 1,
  class: "gred-legend-panel__controls"
}, F = /* @__PURE__ */ x({
  __name: "GredLegendPanel",
  props: {
    overlay: {},
    colorRamp: {},
    legendTicks: {},
    legendMode: { default: "blocks" },
    displayMin: {},
    displayMax: {},
    precision: { default: 1 },
    title: { default: "格点值" },
    showTitle: { type: Boolean, default: !0 },
    placement: { default: "bottom-right" },
    background: {},
    width: {},
    padding: {},
    borderRadius: {},
    boxShadow: {},
    zIndex: {},
    bottom: {},
    right: {},
    left: {},
    top: {},
    font: {}
  },
  emits: ["change"],
  setup(d, { expose: p, emit: g }) {
    const e = d, s = g, t = D(null);
    let n = null;
    const u = b(() => {
      const l = {
        background: e.background,
        width: e.width,
        padding: e.padding,
        borderRadius: e.borderRadius,
        boxShadow: e.boxShadow,
        zIndex: e.zIndex,
        bottom: e.bottom,
        right: e.right,
        left: e.left,
        top: e.top,
        font: e.font
      };
      return I(e.placement, l);
    }), r = b(() => Z(e.overlay));
    function h() {
      var l;
      return (l = e.colorRamp) != null && l.length ? e.colorRamp : e.overlay ? e.overlay.getColorRamp() : [];
    }
    function o() {
      var f;
      if (!t.value) return;
      const l = h();
      if (l.length === 0) return;
      const i = (f = e.overlay) == null ? void 0 : f.getDisplayRange();
      n == null || n.destroy(), n = new k({
        container: t.value,
        colorRamp: l,
        legendTicks: e.legendTicks,
        legendMode: e.legendMode,
        displayMin: e.displayMin ?? (i == null ? void 0 : i.min),
        displayMax: e.displayMax ?? (i == null ? void 0 : i.max),
        precision: e.precision,
        showTitle: !1,
        onChange: ({ displayMin: y, displayMax: m }) => {
          var w;
          (w = e.overlay) == null || w.setDisplayRange(y, m), s("change", { displayMin: y, displayMax: m });
        }
      });
    }
    function a() {
      if (!n) return;
      const l = h();
      if (l.length && n.setColorRamp(l, e.legendTicks), n.setLegendMode(e.legendMode), e.displayMin != null && e.displayMax != null)
        n.setDisplayRange(e.displayMin, e.displayMax, !0);
      else if (e.overlay) {
        const i = e.overlay.getDisplayRange();
        n.setDisplayRange(i.min, i.max, !0);
      }
    }
    return S(o), c(() => e.overlay, o), c(
      () => [e.colorRamp, e.legendTicks, e.legendMode, e.displayMin, e.displayMax],
      () => n ? a() : o(),
      { deep: !0 }
    ), L(() => {
      n == null || n.destroy(), n = null;
    }), p({
      getSlider: () => n,
      setDisplayRange: (l, i) => n == null ? void 0 : n.setDisplayRange(l, i, !0),
      getDisplayRange: () => (n == null ? void 0 : n.getDisplayRange()) ?? null,
      setLegendMode: (l) => n == null ? void 0 : n.setLegendMode(l),
      layer: r
    }), (l, i) => (M(), R("div", {
      class: "gred-legend-panel",
      style: v(u.value)
    }, [
      d.showTitle && d.title ? (M(), R("div", B, G(d.title), 1)) : _("", !0),
      T("div", {
        ref_key: "sliderHost",
        ref: t,
        class: "gred-legend-panel__slider"
      }, null, 512),
      l.$slots.controls ? (M(), R("div", z, [
        P(l.$slots, "controls", {
          overlay: d.overlay,
          layer: r.value
        }, void 0, !0)
      ])) : _("", !0)
    ], 4));
  }
}), C = (d, p) => {
  const g = d.__vccOpts || d;
  for (const [e, s] of p)
    g[e] = s;
  return g;
}, A = /* @__PURE__ */ C(F, [["__scopeId", "data-v-ce6d21e6"]]), U = /* @__PURE__ */ x({
  __name: "GredLegendSlider",
  props: {
    overlay: {},
    colorRamp: {},
    legendTicks: {},
    legendMode: { default: "blocks" },
    displayMin: {},
    displayMax: {},
    precision: { default: 1 },
    title: { default: "格点值" }
  },
  emits: ["change"],
  setup(d, { expose: p, emit: g }) {
    const e = d, s = g, t = D(null);
    let n = null;
    function u() {
      var o;
      return (o = e.colorRamp) != null && o.length ? e.colorRamp : e.overlay ? e.overlay.getColorRamp() : [];
    }
    function r() {
      var i;
      if (!t.value) return;
      const o = u();
      if (o.length === 0) return;
      const a = (i = e.overlay) == null ? void 0 : i.getDisplayRange();
      n == null || n.destroy(), n = new k({
        container: t.value,
        colorRamp: o,
        legendTicks: e.legendTicks,
        legendMode: e.legendMode,
        displayMin: e.displayMin ?? (a == null ? void 0 : a.min),
        displayMax: e.displayMax ?? (a == null ? void 0 : a.max),
        precision: e.precision,
        onChange: ({ displayMin: f, displayMax: y }) => {
          var m;
          (m = e.overlay) == null || m.setDisplayRange(f, y), s("change", { displayMin: f, displayMax: y });
        }
      });
      const l = t.value.querySelector(".gred-legend-slider__title");
      l && (l.textContent = e.title);
    }
    function h() {
      if (!n) return;
      const o = u();
      if (o.length && n.setColorRamp(o, e.legendTicks), e.displayMin != null && e.displayMax != null)
        n.setDisplayRange(e.displayMin, e.displayMax, !0);
      else if (e.overlay) {
        const a = e.overlay.getDisplayRange();
        n.setDisplayRange(a.min, a.max, !0);
      }
    }
    return S(r), c(() => e.overlay, r), c(
      () => [e.colorRamp, e.legendTicks, e.legendMode, e.displayMin, e.displayMax],
      () => {
        n ? (h(), e.legendMode && n.setLegendMode(e.legendMode)) : r();
      },
      { deep: !0 }
    ), L(() => {
      n == null || n.destroy(), n = null;
    }), p({
      setDisplayRange: (o, a) => n == null ? void 0 : n.setDisplayRange(o, a, !0),
      getDisplayRange: () => (n == null ? void 0 : n.getDisplayRange()) ?? null,
      getLegendTicks: () => (n == null ? void 0 : n.getLegendTicks()) ?? [],
      setLegendMode: (o) => n == null ? void 0 : n.setLegendMode(o)
    }), (o, a) => (M(), R("div", {
      ref_key: "host",
      ref: t,
      class: "gred-legend-slider-host"
    }, null, 512));
  }
}), q = /* @__PURE__ */ C(U, [["__scopeId", "data-v-d893e60a"]]);
export {
  $ as GredGridMap,
  A as GredLegendPanel,
  q as GredLegendSlider
};
//# sourceMappingURL=vue.js.map
