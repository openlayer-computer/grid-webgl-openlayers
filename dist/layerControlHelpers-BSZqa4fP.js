var at = Object.defineProperty;
var rt = (i, t, e) => t in i ? at(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var l = (i, t, e) => rt(i, typeof t != "symbol" ? t + "" : t, e);
import Z from "ol/layer/Image";
import q from "ol/source/ImageCanvas";
import { transformExtent as Y, fromLonLat as st, toLonLat as ot } from "ol/proj";
const D = -9999;
function G(i) {
  return 2 ** Math.max(0, Math.min(3, Math.floor((11 - i) / 2)));
}
function lt(i, t, e, n) {
  const a = (i.startLat + i.endLat) * 0.5, r = i.lonStep * t;
  if (n === "EPSG:3857") {
    const s = 111320 * Math.cos(a * Math.PI / 180);
    return r * s / Math.max(e, 1e-12);
  }
  return r / Math.max(e, 1e-12);
}
function K(i, t, e, n, a = "EPSG:4326") {
  const r = G(t), s = lt(i, r, e, a), o = Math.max(1, Math.round(n / Math.max(s, 1)));
  return r * o;
}
function Q(i, t, e, n, a) {
  let r = 0, s = 0;
  const { latCount: o, lonCount: d } = t;
  for (let h = 0; h < a; h++)
    for (let c = 0; c < a; c++) {
      const g = e + h, u = n + c;
      if (g >= o || u >= d) continue;
      const p = i[g * d + u];
      p == null || Number.isNaN(p) || (r += p, s++);
    }
  return s > 0 ? r / s : D;
}
function dt(i, t, e, n) {
  const a = [
    t.startLon,
    t.startLat,
    t.endLon,
    t.endLat
  ], [r, s, o, d] = e, [h, c, g, u] = a, p = Math.max(r, h), m = Math.max(s, c), x = Math.min(o, g), L = Math.min(d, u);
  if (p >= x || m >= L) return null;
  const { startLon: _, startLat: b, lonStep: M, latStep: y, lonCount: C, latCount: R } = t, f = G(n), E = Math.max(0, Math.floor((p - _) / M / f) * f), w = Math.min(C, Math.ceil((x - _) / M)), T = Math.max(0, Math.floor((m - b) / y / f) * f), v = Math.min(R, Math.ceil((L - b) / y));
  if (E >= w || T >= v) return null;
  const S = Math.ceil((w - E) / f), P = Math.ceil((v - T) / f), X = new Float32Array(S * P);
  let it = 0;
  for (let z = v - f; z >= T; z -= f)
    for (let I = E; I < w; I += f)
      X[it++] = Q(i, t, z, I, f);
  return {
    data: X,
    width: S,
    height: P,
    bbox: [_ + E * M, b + T * y, _ + w * M, b + v * y],
    resolution: [M * f, y * f],
    lodLevel: Math.log2(f),
    lodStep: f
  };
}
function B(i, t, e, n, a, r, s, o = "EPSG:4326") {
  const { startLon: d, startLat: h, lonStep: c, latStep: g, lonCount: u, latCount: p } = t, m = G(n), x = K(t, n, a, r, o), [L, _, b, M] = e, y = Math.max(0, Math.floor((L - d) / c / x) * x), C = Math.min(u, Math.ceil((b - d) / c)), R = Math.max(0, Math.floor((_ - h) / g / x) * x), f = Math.min(p, Math.ceil((M - h) / g));
  if (y >= C || R >= f) return [];
  const E = [];
  for (let w = R; w < f; w += x)
    for (let T = y; T < C; T += x) {
      const v = Q(i, t, w, T, m);
      if (v === D || Number.isNaN(v)) continue;
      const S = d + (T + m * 0.5) * c, P = h + (w + m * 0.5) * g;
      S < d || S >= t.endLon || P < h || P >= t.endLat || E.push({ lon: S, lat: P, text: v.toFixed(s) });
    }
  return E;
}
function ht(i, t, e) {
  const n = new Float32Array(t * e);
  for (let a = 0; a < t; a++)
    for (let r = 0; r < e; r++)
      n[a * e + r] = i[a][r];
  return n;
}
function ct(i) {
  let t = 1 / 0, e = -1 / 0;
  for (const n of i)
    n == null || Number.isNaN(n) || (n < t && (t = n), n > e && (e = n));
  return { min: t, max: e };
}
function ut(i, t, e, n) {
  const { startLon: a, startLat: r, lonStep: s, latStep: o, lonCount: d, latCount: h } = t, c = Math.floor((e - a) / s), g = Math.floor((n - r) / o);
  if (c < 0 || g < 0 || c >= d || g >= h) return null;
  const u = i[g * d + c];
  return u == null || Number.isNaN(u) ? null : u;
}
class gt {
  constructor() {
    l(this, "worker");
    l(this, "seq", 0);
    l(this, "pending", /* @__PURE__ */ new Map());
    this.worker = new Worker(new URL(
      /* @vite-ignore */
      "/assets/gridData.worker-z5TRvtQ2.js",
      import.meta.url
    ), { type: "module" }), this.worker.onmessage = (t) => {
      const e = t.data, n = this.pending.get(e.id);
      if (n) {
        if (this.pending.delete(e.id), !e.ok) {
          n.reject(new Error(e.error));
          return;
        }
        n.resolve(e);
      }
    }, this.worker.onerror = () => {
      this.pending.forEach(({ reject: t }) => t(new Error("worker error"))), this.pending.clear();
    };
  }
  init(t, e) {
    const n = ++this.seq;
    return new Promise((a, r) => {
      this.pending.set(n, { resolve: a, reject: r }), this.worker.postMessage({ type: "init", meta: t, flat: e, id: n }, [e.buffer]);
    }).then(() => {
    });
  }
  call(t) {
    const e = ++this.seq;
    return new Promise((n, a) => {
      this.pending.set(e, { resolve: n, reject: a }), this.worker.postMessage({ ...t, id: e });
    });
  }
  readWindow(t, e) {
    return this.call({
      type: "readWindow",
      extent4326: t,
      zoom: e
    }).then((n) => n.tile).catch(() => null);
  }
  computeLabels(t, e, n, a, r, s = "EPSG:4326") {
    return this.call({
      type: "computeLabels",
      extent4326: t,
      zoom: e,
      resolution: n,
      distancePx: a,
      precision: r,
      projCode: s
    }).then((o) => o.labels).catch(() => []);
  }
  terminate() {
    this.worker.terminate();
  }
}
class pt {
  constructor() {
    l(this, "meta");
    l(this, "flat");
    l(this, "loaded", !1);
    l(this, "worker", new gt());
    l(this, "lastExtent", null);
    l(this, "lastZoom", -1);
    l(this, "cachedTile", null);
    l(this, "tileRequestId", 0);
  }
  get bbox() {
    return [this.meta.startLon, this.meta.startLat, this.meta.endLon, this.meta.endLat];
  }
  get metadata() {
    return { ...this.meta, nodata: D, bbox: this.bbox };
  }
  get isLoaded() {
    return this.loaded;
  }
  async load(t) {
    const e = await fetch(t).then((n) => n.json());
    await this.loadData(e);
  }
  /** 直接加载 JSON 对象（Vue / Node 传入内存数据时使用） */
  async loadData(t) {
    this.meta = {
      startLat: t.startLat,
      endLat: t.endLat,
      startLon: t.startLon,
      endLon: t.endLon,
      latStep: t.latStep,
      lonStep: t.lonStep,
      latCount: t.latCount,
      lonCount: t.lonCount
    }, this.flat = ht(t.ds, this.meta.latCount, this.meta.lonCount), await this.worker.init(this.meta, this.flat.slice()), this.loaded = !0;
  }
  getLodStep(t) {
    return G(t);
  }
  getLabelStep(t, e, n, a = "EPSG:4326") {
    return K(this.meta, t, e, n, a);
  }
  /** 异步 readWindow（Worker） */
  async readWindowAsync(t, e) {
    if (!this.loaded) return null;
    if (this.cachedTile && this.lastZoom === e && this.lastExtent && O(this.lastExtent, t))
      return this.cachedTile;
    const n = ++this.tileRequestId, a = await this.worker.readWindow(t, e);
    return n !== this.tileRequestId ? this.cachedTile : (a && (this.lastExtent = [...t], this.lastZoom = e, this.cachedTile = a), a);
  }
  /** 同步 readWindow（Worker 未就绪时 fallback） */
  readWindow(t, e) {
    if (!this.loaded) return null;
    if (this.cachedTile && this.lastZoom === e && this.lastExtent && O(this.lastExtent, t))
      return this.cachedTile;
    const n = dt(this.flat, this.meta, t, e);
    return n && (this.lastExtent = [...t], this.lastZoom = e, this.cachedTile = n), n;
  }
  async computeLabelsAsync(t, e, n, a, r, s = "EPSG:4326") {
    if (!this.loaded) return [];
    try {
      const o = await this.worker.computeLabels(
        t,
        e,
        n,
        a,
        r,
        s
      );
      if (o.length > 0) return o;
    } catch {
    }
    return B(this.flat, this.meta, t, e, n, a, r, s);
  }
  computeLabelsSync(t, e, n, a, r, s = "EPSG:4326") {
    return this.loaded ? B(this.flat, this.meta, t, e, n, a, r, s) : [];
  }
  getValueAt(t, e, n) {
    const a = n ?? this.cachedTile;
    if (!a) return null;
    const [r, s, o, d] = a.bbox;
    if (t < r || t > o || e < s || e > d) return null;
    const [h, c] = a.resolution, g = Math.floor((t - r) / h), u = Math.floor((d - e) / c);
    if (g < 0 || u < 0 || g >= a.width || u >= a.height) return null;
    const p = a.data[u * a.width + g];
    return p === D || Number.isNaN(p) ? null : p;
  }
  getNativeValueAt(t, e) {
    return ut(this.flat, this.meta, t, e);
  }
  computeStats() {
    return ct(this.flat);
  }
  get nativeResolution() {
    return [this.meta.lonStep, this.meta.latStep];
  }
  get gridOrigin() {
    return [this.meta.startLon, this.meta.startLat];
  }
  invalidateCache() {
    this.cachedTile = null, this.lastExtent = null, this.tileRequestId++;
  }
  dispose() {
    this.worker.terminate();
  }
}
function O(i, t, e = 1e-6) {
  return i.length === t.length && i.every((n, a) => Math.abs(n - t[a]) < e);
}
const mt = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`, ft = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_data;
uniform sampler2D u_legend;
uniform mat3 u_transform;
uniform vec2 u_size;
uniform vec2 u_delta;
uniform float u_pixel_ratio;
uniform vec4 u_data_bbox;   // minLon, minLat, maxLon, maxLat
uniform vec2 u_cell_size;   // LOD lonStep, latStep（数据采样）
uniform vec2 u_native_cell_size; // 原始格距
uniform vec2 u_grid_origin;   // startLon, startLat
uniform vec2 u_data_size;   // cols, rows
uniform vec2 u_legend_meta; // min, max
uniform vec2 u_display_range; // 显示区间 [min, max]，区间外格点隐藏
uniform float u_nodata;
uniform float u_opacity;
uniform float u_show_grid;
uniform float u_grid_lod;
uniform float u_proj_mercator; // 1 = EPSG:3857

vec2 mapCoordToLonLat(vec2 mapCoord) {
  if (u_proj_mercator < 0.5) return mapCoord;
  const float MAX_EXT = 20037508.342789244;
  float lon = mapCoord.x / MAX_EXT * 180.0;
  float lat = atan(exp(mapCoord.y / MAX_EXT * 3.141592653589793)) * 360.0 / 3.141592653589793 - 90.0;
  return vec2(lon, lat);
}

vec2 getLonLat(vec2 uv) {
  vec2 xy = (vec2(uv.x, 1.0 - uv.y) * u_size) / u_pixel_ratio - u_delta;
  float projX = u_transform[0][0] * xy.x + u_transform[1][0] * xy.y + u_transform[2][0];
  float projY = u_transform[0][1] * xy.x + u_transform[1][1] * xy.y + u_transform[2][1];
  return mapCoordToLonLat(vec2(projX, projY));
}

vec4 lookupLegend(float value) {
  float t = clamp((value - u_legend_meta.x) / (u_legend_meta.y - u_legend_meta.x), 0.0, 1.0);
  return texture(u_legend, vec2(t, 0.5));
}

float gridLineFactor(vec2 lonlat, vec2 cellSize, vec4 dataBbox) {
  if (u_show_grid < 0.5) return 0.0;
  float fx = fract((lonlat.x - dataBbox.x) / cellSize.x);
  float fy = fract((lonlat.y - dataBbox.y) / cellSize.y);
  float edge = min(min(fx, 1.0 - fx), min(fy, 1.0 - fy));
  float pxLon = cellSize.x / (u_data_bbox.z - u_data_bbox.x) * u_size.x / u_pixel_ratio;
  float pxLat = cellSize.y / (u_data_bbox.w - u_data_bbox.y) * u_size.y / u_pixel_ratio;
  float threshold = 1.0 / min(pxLon, pxLat);
  return 1.0 - smoothstep(0.0, threshold, edge);
}

void main() {
  vec2 lonlat = getLonLat(v_uv);

  if (lonlat.x < u_data_bbox.x || lonlat.x > u_data_bbox.z ||
      lonlat.y < u_data_bbox.y || lonlat.y > u_data_bbox.w) {
    discard;
  }

  float col = floor((lonlat.x - u_data_bbox.x) / u_cell_size.x);
  float row = floor((u_data_bbox.w - lonlat.y) / u_cell_size.y);
  col = clamp(col, 0.0, u_data_size.x - 1.0);
  row = clamp(row, 0.0, u_data_size.y - 1.0);

  vec2 texCoord = (vec2(col + 0.5, row + 0.5)) / u_data_size;
  float v = texture(u_data, texCoord).r;

  if (isnan(v) || abs(v - u_nodata) < 0.001) {
    discard;
  }

  if (v < u_display_range.x || v > u_display_range.y) {
    discard;
  }

  vec4 color = lookupLegend(v);
  if (color.a < 0.02) {
    discard;
  }

  float grid = gridLineFactor(lonlat, u_cell_size, u_data_bbox);
  vec3 rgb = mix(color.rgb, vec3(0.15, 0.15, 0.15), grid * 0.55);
  fragColor = vec4(rgb, color.a * u_opacity);
}
`;
function $(i, t, e) {
  const n = i.createShader(t);
  if (i.shaderSource(n, e), i.compileShader(n), !i.getShaderParameter(n, i.COMPILE_STATUS))
    throw new Error(i.getShaderInfoLog(n) ?? "shader compile error");
  return n;
}
function xt(i, t, e) {
  const n = i.createProgram();
  if (i.attachShader(n, $(i, i.VERTEX_SHADER, t)), i.attachShader(n, $(i, i.FRAGMENT_SHADER, e)), i.linkProgram(n), !i.getProgramParameter(n, i.LINK_STATUS))
    throw new Error(i.getProgramInfoLog(n) ?? "program link error");
  return n;
}
class _t {
  constructor(t) {
    l(this, "gl");
    l(this, "program");
    l(this, "vao");
    l(this, "dataTexture", null);
    l(this, "legend", null);
    l(this, "lastTileKey", "");
    l(this, "loc", {});
    const e = t.getContext("webgl2", {
      alpha: !0,
      antialias: !1,
      preserveDrawingBuffer: !1
    });
    if (!e) throw new Error("WebGL2 not supported");
    this.gl = e, this.program = xt(e, mt, ft), this.vao = this.initQuad();
    for (const n of [
      "u_data",
      "u_legend",
      "u_transform",
      "u_size",
      "u_delta",
      "u_pixel_ratio",
      "u_data_bbox",
      "u_cell_size",
      "u_native_cell_size",
      "u_grid_origin",
      "u_data_size",
      "u_legend_meta",
      "u_display_range",
      "u_nodata",
      "u_opacity",
      "u_show_grid",
      "u_grid_lod",
      "u_proj_mercator"
    ])
      this.loc[n] = e.getUniformLocation(this.program, n);
  }
  initQuad() {
    const t = this.gl, e = t.createVertexArray();
    t.bindVertexArray(e);
    const n = t.createBuffer();
    t.bindBuffer(t.ARRAY_BUFFER, n), t.bufferData(t.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), t.STATIC_DRAW);
    const a = t.getAttribLocation(this.program, "a_position");
    return t.enableVertexAttribArray(a), t.vertexAttribPointer(a, 2, t.FLOAT, !1, 0, 0), t.bindVertexArray(null), e;
  }
  resize(t, e) {
    const n = this.gl;
    n.canvas.width = Math.max(1, Math.floor(t)), n.canvas.height = Math.max(1, Math.floor(e)), n.viewport(0, 0, n.canvas.width, n.canvas.height);
  }
  setLegend(t) {
    this.legend = t;
  }
  uploadTile(t) {
    const e = `${t.width}x${t.height}-${t.lodStep}-${t.bbox.join(",")}`;
    if (e === this.lastTileKey && this.dataTexture) return;
    const n = this.gl;
    this.dataTexture || (this.dataTexture = n.createTexture()), n.bindTexture(n.TEXTURE_2D, this.dataTexture), n.texImage2D(n.TEXTURE_2D, 0, n.R32F, t.width, t.height, 0, n.RED, n.FLOAT, t.data), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, n.NEAREST), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE), n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE), this.lastTileKey = e;
  }
  render(t, e) {
    if (!this.dataTexture || !this.legend) return;
    const n = this.gl;
    n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.enable(n.BLEND), n.blendFunc(n.SRC_ALPHA, n.ONE_MINUS_SRC_ALPHA), n.useProgram(this.program), n.bindVertexArray(this.vao), n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, this.dataTexture), n.uniform1i(this.loc.u_data, 0), n.activeTexture(n.TEXTURE1), n.bindTexture(n.TEXTURE_2D, this.legend.texture), n.uniform1i(this.loc.u_legend, 1);
    const [a, r, s, o] = t.bbox, [d, h] = t.resolution;
    n.uniformMatrix3fv(this.loc.u_transform, !1, e.transform), n.uniform2f(this.loc.u_size, e.size[0], e.size[1]), n.uniform2f(this.loc.u_delta, e.delta[0], e.delta[1]), n.uniform1f(this.loc.u_pixel_ratio, e.pixelRatio), n.uniform4f(this.loc.u_data_bbox, a, r, s, o), n.uniform2f(this.loc.u_cell_size, d, h), n.uniform2f(this.loc.u_native_cell_size, e.nativeCellSize[0], e.nativeCellSize[1]), n.uniform2f(this.loc.u_grid_origin, e.gridOrigin[0], e.gridOrigin[1]), n.uniform2f(this.loc.u_data_size, t.width, t.height), n.uniform2f(this.loc.u_legend_meta, this.legend.min, this.legend.max), n.uniform2f(this.loc.u_display_range, e.displayRange[0], e.displayRange[1]), n.uniform1f(this.loc.u_nodata, -9999), n.uniform1f(this.loc.u_opacity, e.opacity), n.uniform1f(this.loc.u_show_grid, e.showGrid ? 1 : 0), n.uniform1f(this.loc.u_grid_lod, e.gridLod), n.uniform1f(this.loc.u_proj_mercator, e.projMercator ? 1 : 0), n.drawArrays(n.TRIANGLE_STRIP, 0, 4), n.bindVertexArray(null);
  }
  dispose() {
    const t = this.gl;
    this.dataTexture && t.deleteTexture(this.dataTexture), this.legend && t.deleteTexture(this.legend.texture), t.deleteProgram(this.program), t.deleteVertexArray(this.vao);
  }
}
function bt(i) {
  return new Float32Array([i[0], i[1], 0, i[2], i[3], 0, i[4], i[5], 1]);
}
function Lt(i, t, e) {
  return [
    (i[0] - t[0]) / e,
    (t[3] - i[3]) / e
  ];
}
const k = 256;
function J(i) {
  if (i.length === 9) {
    const e = parseInt(i.slice(1, 7), 16), n = parseInt(i.slice(7, 9), 16);
    return [e >> 16 & 255, e >> 8 & 255, e & 255, n];
  }
  const t = parseInt(i.slice(1), 16);
  return [t >> 16 & 255, t >> 8 & 255, t & 255, 255];
}
function yt(i, t, e) {
  return [
    Math.round(i[0] + (t[0] - i[0]) * e),
    Math.round(i[1] + (t[1] - i[1]) * e),
    Math.round(i[2] + (t[2] - i[2]) * e),
    Math.round(i[3] + (t[3] - i[3]) * e)
  ];
}
function Mt(i, t) {
  if (t <= i[0][0]) return i[0][1];
  if (t >= i[i.length - 1][0]) return i[i.length - 1][1];
  for (let e = 0; e < i.length - 1; e++) {
    const [n, a] = i[e], [r, s] = i[e + 1];
    if (t >= n && t <= r) {
      const o = r === n ? 0 : (t - n) / (r - n);
      return yt(a, s, o);
    }
  }
  return i[i.length - 1][1];
}
function j(i, t) {
  const e = t.filter(([d]) => d > -9e3 && d < 9e3), n = e[0][0], a = e[e.length - 1][0], r = Math.max(a - n, 0.01), s = new Uint8Array(k * 4);
  for (let d = 0; d < k; d++) {
    const h = n + r * d / (k - 1);
    s.set(Mt(e, h), d * 4);
  }
  const o = i.createTexture();
  return i.bindTexture(i.TEXTURE_2D, o), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, k, 1, 0, i.RGBA, i.UNSIGNED_BYTE, s), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.LINEAR), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.LINEAR), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), { texture: o, min: n, max: a, width: k };
}
function A(i, t) {
  const e = Math.max(t - i, 0.01), n = (r) => i + e * r, a = [
    [i, "#e8f5e9"],
    [n(0.08), "#c8e6c9"],
    [n(0.2), "#a5d6a7"],
    [n(0.35), "#66bb6a"],
    [n(0.55), "#43a047"],
    [n(0.75), "#2e7d32"],
    [t, "#1b5e20"]
  ];
  return [
    [-9999, [0, 0, 0, 0]],
    ...a.map(([r, s]) => [r, J(s)]),
    [9999, [0, 0, 0, 0]]
  ];
}
function $t(i, t) {
  const e = [
    [i, "#313695"],
    [i + (t - i) * 0.15, "#4575b4"],
    [i + (t - i) * 0.3, "#74add1"],
    [i + (t - i) * 0.45, "#abd9e9"],
    [i + (t - i) * 0.55, "#fee090"],
    [i + (t - i) * 0.7, "#fdae61"],
    [i + (t - i) * 0.85, "#f46d43"],
    [t, "#a50026"]
  ];
  return [
    [-9999, [0, 0, 0, 0]],
    ...e.map(([n, a]) => [n, J(a)]),
    [9999, [0, 0, 0, 0]]
  ];
}
function tt(i, t, e) {
  const a = (e ?? A(i, t)).filter(([c]) => c > -9e3 && c < 9e3);
  if (a.length < 2) return A(i, t);
  const r = a[0][0], s = a[a.length - 1][0], o = Math.max(s - r, 0.01), d = Math.max(t - i, 0.01), h = a.map(([c, g]) => {
    const u = (c - r) / o;
    return [i + u * d, g];
  });
  return [
    [-9999, [0, 0, 0, 0]],
    ...h,
    [9999, [0, 0, 0, 0]]
  ];
}
function V(i) {
  const t = i.filter(([e]) => e > -9e3 && e < 9e3);
  return { min: t[0][0], max: t[t.length - 1][0] };
}
function W(i) {
  return i.filter(([t]) => t > -9e3 && t < 9e3).map(([t]) => t);
}
function jt(i, t) {
  const { min: e, max: n } = V(t), a = Math.max(n - e, 0.01);
  return Math.max(0, Math.min(1, (i - e) / a));
}
function U(i, t) {
  return t <= 1 ? 0 : i / (t - 1);
}
function wt(i, t) {
  if (t.length <= 1 || i <= t[0]) return 0;
  if (i >= t[t.length - 1]) return 1;
  for (let e = 0; e < t.length - 1; e++) {
    const n = t[e], a = t[e + 1];
    if (i >= n && i <= a) {
      const r = a === n ? 0 : (i - n) / (a - n), s = U(e, t.length), o = U(e + 1, t.length);
      return s + r * (o - s);
    }
  }
  return 1;
}
function Tt(i, t) {
  if (t.length <= 1) return t[0] ?? 0;
  const e = Math.max(0, Math.min(1, i)), n = t.length - 1, a = Math.min(n - 1, Math.floor(e * n)), r = e * n - a, s = t[a], o = t[a + 1];
  return s + r * (o - s);
}
function vt(i) {
  const t = et(i), e = t.length;
  return `linear-gradient(to right, ${t.map(([a, r], s) => {
    const o = e <= 1 ? 0 : s / (e - 1) * 100;
    return `${nt(r)} ${o}%`;
  }).join(", ")})`;
}
function et(i) {
  return i.filter(([t]) => t > -9e3 && t < 9e3);
}
function nt(i) {
  return `rgba(${i[0]},${i[1]},${i[2]},${i[3] / 255})`;
}
function Wt(i) {
  const t = i.filter(([r]) => r > -9e3 && r < 9e3), e = t[0][0], n = t[t.length - 1][0];
  return `linear-gradient(to right, ${t.map(([r, s]) => {
    const o = (r - e) / (n - e) * 100;
    return `rgba(${s[0]},${s[1]},${s[2]},${s[3] / 255}) ${o}%`;
  }).join(", ")})`;
}
function Rt(i) {
  return i === "EPSG:3857";
}
function Et(i, t, e) {
  return e === "EPSG:4326" ? [i, t] : st([i, t]);
}
function Ct(i, t, e) {
  return e === "EPSG:4326" ? [i, t] : ot([i, t]);
}
function St(i, t) {
  return t === "EPSG:4326" ? i : Y(i, "EPSG:4326", t);
}
function N(i, t) {
  return t === "EPSG:4326" ? i : Y(i, t, "EPSG:4326");
}
class Pt extends Z {
  constructor(e) {
    const n = document.createElement("canvas"), a = document.createElement("canvas"), r = new _t(n), s = {};
    super({
      opacity: e.opacity ?? 0.85,
      zIndex: e.zIndex ?? 2,
      source: new q({
        canvasFunction: (g, u, p, m, x) => s.fn(g, u, p, m, x),
        ratio: 1
      })
    });
    l(this, "loader");
    l(this, "glCanvas");
    l(this, "displayCanvas");
    l(this, "renderer");
    l(this, "legend", null);
    l(this, "currentTile", null);
    l(this, "showGridLines");
    l(this, "colorRamp");
    l(this, "displayMin");
    l(this, "displayMax");
    l(this, "mapRef", null);
    l(this, "fetchVersion", 0);
    l(this, "viewUnbind", null);
    l(this, "onMapChange", () => this.scheduleFetch());
    this.loader = e.loader, this.glCanvas = n, this.displayCanvas = a, this.renderer = r, this.showGridLines = e.showGrid ?? !1;
    const o = this.loader.computeStats(), d = e.colorRamp ?? A(o.min, o.max);
    this.colorRamp = d;
    const { min: h, max: c } = V(d);
    this.displayMin = h, this.displayMax = c, this.legend = j(r.gl, d), r.setLegend(this.legend), s.fn = this.renderFrame.bind(this);
  }
  /** 当前图例数值范围 */
  getLegendRange() {
    return V(this.colorRamp);
  }
  getColorRamp() {
    return this.colorRamp;
  }
  /** 设置完整色带并刷新渲染 */
  setColorRamp(e) {
    this.colorRamp = e, this.rebuildLegend();
  }
  /** 仅调整图例 min/max（保留当前色带样式） */
  setLegendRange(e, n) {
    this.setColorRamp(tt(e, n, this.colorRamp));
  }
  /** 色斑图实际显示的数值区间（滑块控制） */
  getDisplayRange() {
    return { min: this.displayMin, max: this.displayMax };
  }
  setDisplayRange(e, n) {
    const { min: a, max: r } = this.getLegendRange(), o = Math.max(r - a, 0.01) * 1e-3;
    let d = Math.max(a, Math.min(e, r)), h = Math.min(r, Math.max(n, a));
    h - d < o && (h = Math.min(r, d + o)), this.displayMin = d, this.displayMax = h, this.refreshRender();
  }
  clampDisplayRange() {
    const { min: e, max: n } = this.getLegendRange();
    this.setDisplayRange(
      Math.max(e, Math.min(this.displayMin, n)),
      Math.min(n, Math.max(this.displayMax, e))
    );
  }
  refreshRender() {
    var e;
    (e = this.getSource()) == null || e.changed(), this.changed();
  }
  getShowGrid() {
    return this.showGridLines;
  }
  rebuildLegend() {
    this.legend && this.renderer.gl.deleteTexture(this.legend.texture), this.legend = j(this.renderer.gl, this.colorRamp), this.renderer.setLegend(this.legend), this.clampDisplayRange();
  }
  setShowGrid(e) {
    this.showGridLines = e, this.refreshRender();
  }
  refreshData() {
    this.loader.invalidateCache(), this.scheduleFetch();
  }
  scheduleFetch() {
    const e = this.mapRef;
    if (!e || !this.loader.isLoaded) return;
    const n = e.getView(), a = n.getProjection().getCode(), r = e.getSize();
    if (!r) return;
    const s = N(n.calculateExtent(r), a), o = n.getZoom() ?? 6, d = ++this.fetchVersion;
    this.loader.readWindowAsync(s, o).then((h) => {
      var c;
      d === this.fetchVersion && (h && (this.currentTile = h), (c = this.getSource()) == null || c.changed());
    });
  }
  renderFrame(e, n, a, r) {
    const [s, o] = r, d = Math.floor(s * a), h = Math.floor(o * a);
    this.displayCanvas.width = d, this.displayCanvas.height = h, this.renderer.resize(d, h);
    const c = this.mapRef;
    if (!c || !this.loader.isLoaded)
      return this.displayCanvas;
    const g = c.getView(), u = g.getProjection().getCode(), p = g.getZoom() ?? 6, m = c.getSize(), x = m ? N(g.calculateExtent(m), u) : e, L = this.currentTile ?? this.loader.readWindow(x, p);
    if (!L)
      return this.displayCanvas.getContext("2d").clearRect(0, 0, d, h), this.displayCanvas;
    this.currentTile = L, this.renderer.uploadTile(L);
    const _ = c.frameState_, b = _ == null ? void 0 : _.pixelToCoordinateTransform, M = b ? bt(b) : new Float32Array([1, 0, 0, 0, -1, 0, 0, 0, 1]), y = g.calculateExtent(m ?? r), C = Lt(y, e, n);
    this.renderer.render(L, {
      transform: Array.from(M),
      size: [d, h],
      delta: C,
      pixelRatio: a,
      dataBbox: L.bbox,
      nativeCellSize: this.loader.nativeResolution,
      gridOrigin: this.loader.gridOrigin,
      gridLod: this.loader.getLodStep(p),
      opacity: this.getOpacity(),
      showGrid: this.showGridLines,
      projMercator: Rt(u),
      displayRange: [this.displayMin, this.displayMax]
    });
    const R = this.displayCanvas.getContext("2d");
    return R.clearRect(0, 0, d, h), R.drawImage(this.glCanvas, 0, 0), this.displayCanvas;
  }
  attachMap(e) {
    this.mapRef = e, e.on("moveend", this.onMapChange), this.bindView(e.getView()), this.scheduleFetch();
  }
  reattachView(e) {
    this.mapRef = e, this.bindView(e.getView()), this.scheduleFetch();
  }
  bindView(e) {
    var n;
    (n = this.viewUnbind) == null || n.call(this), e.on("change:resolution", this.onMapChange), this.viewUnbind = () => e.un("change:resolution", this.onMapChange);
  }
  getDataValue(e, n) {
    return this.loader.getValueAt(e, n, this.currentTile);
  }
  dispose() {
    this.renderer.dispose();
  }
}
function kt(i, t, e) {
  const n = i.getPixelFromCoordinate(t);
  return n ? [n[0] * e, n[1] * e] : null;
}
class Vt extends Z {
  constructor(e) {
    const n = document.createElement("canvas"), a = {};
    super({
      zIndex: e.zIndex ?? 3,
      source: new q({
        canvasFunction: (r, s, o, d, h) => a.fn(r, s, o, d, h),
        ratio: 1
      })
    });
    l(this, "loader");
    l(this, "mapRef", null);
    l(this, "canvas");
    l(this, "labels", []);
    l(this, "fetchVersion", 0);
    l(this, "viewUnbind", null);
    l(this, "onMapChange", () => this.scheduleFetch());
    l(this, "opts");
    this.loader = e.loader, this.canvas = n, this.opts = {
      distance: e.distance ?? 80,
      precision: e.precision ?? 1,
      fontSize: e.fontSize ?? 11,
      color: e.color ?? "rgba(20, 20, 20, 0.92)"
    }, a.fn = this.renderFrame.bind(this);
  }
  attachMap(e) {
    this.mapRef = e, e.on("moveend", this.onMapChange), this.bindView(e.getView()), this.scheduleFetch();
  }
  /** 切换投影后重新绑定 View 监听 */
  reattachView(e) {
    this.mapRef = e, this.bindView(e.getView()), this.scheduleFetch();
  }
  bindView(e) {
    var n;
    (n = this.viewUnbind) == null || n.call(this), e.on("change:resolution", this.onMapChange), this.viewUnbind = () => e.un("change:resolution", this.onMapChange);
  }
  refreshData() {
    this.labels = [], this.scheduleFetch();
  }
  scheduleFetch() {
    var g;
    const e = this.mapRef;
    if (!e || !this.loader.isLoaded) return;
    const n = e.getView(), a = n.getProjection().getCode(), r = e.getSize(), s = n.getCenter();
    if (!r || !s) return;
    const o = N(n.calculateExtent(r), a), d = n.getZoom() ?? 6, h = n.getResolution() ?? 1, c = ++this.fetchVersion;
    this.labels = this.loader.computeLabelsSync(
      o,
      d,
      h,
      this.opts.distance,
      this.opts.precision,
      a
    ), (g = this.getSource()) == null || g.changed(), this.loader.computeLabelsAsync(
      o,
      d,
      h,
      this.opts.distance,
      this.opts.precision,
      a
    ).then((u) => {
      var p;
      c === this.fetchVersion && (this.labels = u, (p = this.getSource()) == null || p.changed());
    });
  }
  renderFrame(e, n, a, r) {
    const [s, o] = r, d = Math.max(1, Math.floor(s * a)), h = Math.max(1, Math.floor(o * a));
    this.canvas.width = d, this.canvas.height = h;
    const c = this.canvas.getContext("2d");
    c.clearRect(0, 0, d, h);
    const g = this.mapRef;
    if (!g || this.labels.length === 0)
      return this.canvas;
    const u = this.opts.fontSize * a;
    c.font = `${u}px system-ui, -apple-system, sans-serif`, c.textAlign = "center", c.textBaseline = "middle", c.lineWidth = Math.max(2, 2 * a), c.lineJoin = "round", c.strokeStyle = "rgba(255, 255, 255, 0.9)", c.fillStyle = this.opts.color;
    const p = g.getView().getProjection().getCode();
    for (const m of this.labels) {
      const x = Et(m.lon, m.lat, p), L = kt(g, x, a);
      if (!L) continue;
      const [_, b] = L;
      _ < -u || _ > d + u || b < -u || b > h + u || (c.strokeText(m.text, _, b), c.fillText(m.text, _, b));
    }
    return this.canvas;
  }
}
function Dt(i) {
  return typeof i == "number" ? [i, i, i, i] : i;
}
class F {
  constructor(t, e, n, a, r, s) {
    l(this, "map");
    l(this, "loader");
    l(this, "choroplethLayer");
    l(this, "gridValueLayer");
    l(this, "stats");
    l(this, "pointerHandler", null);
    l(this, "pointerUnbind", null);
    l(this, "destroyed", !1);
    this.fitOpts = s, this.map = t, this.loader = e, this.choroplethLayer = n, this.gridValueLayer = a, this.stats = r;
  }
  get projection() {
    return this.map.getView().getProjection().getCode();
  }
  static async create(t) {
    if (!t.map)
      throw new Error("GridMapView: map is required");
    if (!t.dataUrl && !t.data)
      throw new Error("GridMapView: dataUrl or data is required");
    const e = new pt();
    t.data ? await e.loadData(t.data) : await e.load(t.dataUrl);
    const n = e.computeStats(), a = t.legendMin ?? n.min, r = t.legendMax ?? n.max, s = t.colorRamp ? t.colorRamp : tt(a, r, A(a, r)), o = new Pt({
      loader: e,
      colorRamp: s,
      opacity: t.choroplethOpacity ?? 0.75,
      showGrid: t.showGrid ?? !1,
      zIndex: t.choroplethZIndex ?? 2
    });
    o.setVisible(t.showChoropleth ?? !0);
    const d = new Vt({
      loader: e,
      distance: t.labelDistance ?? 80,
      precision: t.labelPrecision ?? 1,
      fontSize: t.labelFontSize ?? 11,
      zIndex: t.labelsZIndex ?? 3
    });
    d.setVisible(t.showLabels ?? !0);
    const h = t.map;
    o.attachMap(h), d.attachMap(h), h.addLayer(o), h.addLayer(d);
    const c = Dt(t.fitPadding ?? 40), g = t.fitMaxZoom ?? 10, u = new F(h, e, o, d, n, {
      padding: c,
      maxZoom: g
    });
    if (t.autoFit !== !1 && u.fitToData(), t.displayMin != null || t.displayMax != null) {
      const { min: p, max: m } = u.getLegendRange();
      u.setDisplayRange(t.displayMin ?? p, t.displayMax ?? m);
    }
    return t.onPointerMove && u.onPointerMove(t.onPointerMove), u;
  }
  /** 拾取 lon/lat 处格点值；超出数据范围或 displayRange 时返回 null */
  getValueAt(t, e) {
    return this.pickValue(t, e);
  }
  pickValue(t, e) {
    const [n, a, r, s] = this.loader.bbox;
    if (t < n || t > r || e < a || e > s) return null;
    const o = this.choroplethLayer.getDataValue(t, e) ?? this.loader.getNativeValueAt(t, e);
    if (o == null) return null;
    if (this.choroplethLayer.getVisible()) {
      const { min: d, max: h } = this.getDisplayRange();
      if (o < d || o > h) return null;
    }
    return o;
  }
  onPointerMove(t) {
    var n;
    (n = this.pointerUnbind) == null || n.call(this), this.pointerHandler = t;
    const e = (a) => {
      if (a.dragging) return;
      const r = this.projection, [s, o] = Ct(a.coordinate[0], a.coordinate[1], r), d = this.map.getView().getZoom() ?? 6, h = this.pickValue(s, o);
      t({
        lon: s,
        lat: o,
        value: h,
        zoom: d,
        lod: this.loader.getLodStep(d)
      });
    };
    return this.map.on("pointermove", e), this.pointerUnbind = () => {
      this.map.un("pointermove", e), this.pointerHandler === t && (this.pointerHandler = null);
    }, this.pointerUnbind;
  }
  refreshView() {
    this.destroyed || (this.loader.invalidateCache(), this.choroplethLayer.reattachView(this.map), this.gridValueLayer.reattachView(this.map));
  }
  getLayerVisibility() {
    return {
      choropleth: this.choroplethLayer.getVisible(),
      grid: this.choroplethLayer.getShowGrid(),
      labels: this.gridValueLayer.getVisible()
    };
  }
  setLayerVisibility(t) {
    t.choropleth !== void 0 && this.setShowChoropleth(t.choropleth), t.grid !== void 0 && this.setShowGrid(t.grid), t.labels !== void 0 && this.setShowLabels(t.labels);
  }
  setShowChoropleth(t) {
    this.choroplethLayer.setVisible(t);
  }
  setShowGrid(t) {
    this.choroplethLayer.setShowGrid(t);
  }
  setShowLabels(t) {
    this.gridValueLayer.setVisible(t);
  }
  getLegendRange() {
    return this.choroplethLayer.getLegendRange();
  }
  setLegendRange(t, e) {
    this.choroplethLayer.setLegendRange(t, e);
  }
  setColorRamp(t) {
    this.choroplethLayer.setColorRamp(t);
  }
  getColorRamp() {
    return this.choroplethLayer.getColorRamp();
  }
  getDisplayRange() {
    return this.choroplethLayer.getDisplayRange();
  }
  setDisplayRange(t, e) {
    this.choroplethLayer.setDisplayRange(t, e);
  }
  fitToData() {
    const t = St(this.loader.bbox, this.projection);
    this.map.getView().fit(t, { padding: this.fitOpts.padding, maxZoom: this.fitOpts.maxZoom });
  }
  getLodStep() {
    return this.loader.getLodStep(this.map.getView().getZoom() ?? 6);
  }
  destroy() {
    var t;
    this.destroyed || (this.destroyed = !0, (t = this.pointerUnbind) == null || t.call(this), this.pointerUnbind = null, this.map.removeLayer(this.choroplethLayer), this.map.removeLayer(this.gridValueLayer), this.choroplethLayer.dispose(), this.loader.dispose());
  }
}
async function At(i) {
  return F.create(i);
}
const Ht = At, Gt = `
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
`;
let H = !1;
function zt() {
  if (H) return;
  H = !0;
  const i = document.createElement("style");
  i.textContent = Gt, document.head.appendChild(i);
}
class It {
  constructor(t) {
    l(this, "root");
    l(this, "body");
    l(this, "track");
    l(this, "bar");
    l(this, "blocks");
    l(this, "labelsRow");
    l(this, "maskLeft");
    l(this, "maskRight");
    l(this, "thumbMin");
    l(this, "thumbMax");
    l(this, "legendMin");
    l(this, "legendMax");
    l(this, "displayMin");
    l(this, "displayMax");
    l(this, "colorRamp");
    l(this, "legendTicks");
    l(this, "legendMode");
    l(this, "precision");
    l(this, "showTitle");
    l(this, "onChange");
    l(this, "dragging", null);
    l(this, "onPointerMove", (t) => {
      if (!this.dragging) return;
      const e = this.track.getBoundingClientRect(), n = Math.max(0, Math.min(1, (t.clientX - e.left) / e.width)), a = Tt(n, this.legendTicks);
      this.dragging === "min" ? this.displayMin = Math.min(a, this.displayMax) : this.displayMax = Math.max(a, this.displayMin), this.applyDisplayRange(this.displayMin, this.displayMax, !1);
    });
    l(this, "onPointerUp", () => {
      this.dragging = null;
    });
    zt(), this.colorRamp = t.colorRamp, this.legendTicks = t.legendTicks ?? W(t.colorRamp), this.legendMode = t.legendMode ?? "blocks";
    const { min: e, max: n } = V(this.colorRamp);
    if (this.legendMin = e, this.legendMax = n, this.displayMin = t.displayMin ?? e, this.displayMax = t.displayMax ?? n, this.precision = t.precision ?? 1, this.showTitle = t.showTitle !== !1, this.onChange = t.onChange, this.root = document.createElement("div"), this.root.className = "gred-legend-slider", this.showTitle) {
      const a = document.createElement("div");
      a.className = "gred-legend-slider__title", a.textContent = "格点值", this.root.appendChild(a);
    }
    this.body = document.createElement("div"), this.body.className = "gred-legend-slider__body", this.track = document.createElement("div"), this.track.className = "gred-legend-slider__track", this.bar = document.createElement("div"), this.bar.className = "gred-legend-slider__bar", this.blocks = document.createElement("div"), this.blocks.className = "gred-legend-slider__blocks", this.track.appendChild(this.bar), this.track.appendChild(this.blocks), this.maskLeft = document.createElement("div"), this.maskLeft.className = "gred-legend-slider__mask gred-legend-slider__mask--left", this.maskRight = document.createElement("div"), this.maskRight.className = "gred-legend-slider__mask gred-legend-slider__mask--right", this.track.appendChild(this.maskLeft), this.track.appendChild(this.maskRight), this.thumbMin = this.createThumb("min"), this.thumbMax = this.createThumb("max"), this.track.appendChild(this.thumbMin), this.track.appendChild(this.thumbMax), this.labelsRow = document.createElement("div"), this.labelsRow.className = "gred-legend-slider__labels", this.body.appendChild(this.track), this.body.appendChild(this.labelsRow), this.root.appendChild(this.body), t.container.appendChild(this.root), document.addEventListener("pointermove", this.onPointerMove), document.addEventListener("pointerup", this.onPointerUp), this.updateBar(), this.rebuildLabels(), this.applyDisplayRange(this.displayMin, this.displayMax, !0);
  }
  createThumb(t) {
    const e = document.createElement("div");
    return e.className = "gred-legend-slider__thumb", e.addEventListener("pointerdown", (n) => {
      n.preventDefault(), this.dragging = t, e.setPointerCapture(n.pointerId);
    }), e;
  }
  /** 均匀布局位置 */
  evenPct(t) {
    return wt(t, this.legendTicks);
  }
  evenPctByIndex(t) {
    return U(t, this.legendTicks.length);
  }
  fmt(t) {
    return t.toFixed(this.precision);
  }
  updateBar() {
    const { min: t, max: e } = V(this.colorRamp);
    if (this.legendMin = t, this.legendMax = e, this.legendMode === "gradient")
      this.bar.style.display = "block", this.blocks.style.display = "none", this.bar.style.background = vt(this.colorRamp);
    else {
      this.bar.style.display = "none", this.blocks.style.display = "block", this.blocks.replaceChildren();
      const n = et(this.colorRamp), a = n.length - 1;
      for (let r = 0; r < a; r++) {
        const [, s] = n[r], o = this.evenPctByIndex(r) * 100, d = (this.evenPctByIndex(r + 1) - this.evenPctByIndex(r)) * 100, h = document.createElement("div");
        h.className = "gred-legend-slider__block", h.style.left = `${o}%`, h.style.width = `${d}%`, h.style.background = nt(s), this.blocks.appendChild(h);
      }
    }
  }
  rebuildLabels() {
    this.labelsRow.replaceChildren();
    const t = this.legendTicks.length;
    this.legendTicks.forEach((e, n) => {
      const a = document.createElement("span");
      a.className = "gred-legend-slider__label", n === 0 && a.classList.add("gred-legend-slider__label--edge-left"), n === t - 1 && a.classList.add("gred-legend-slider__label--edge-right"), a.textContent = this.fmt(e), a.style.left = `${this.evenPctByIndex(n) * 100}%`, this.labelsRow.appendChild(a);
    });
  }
  applyDisplayRange(t, e, n) {
    var c;
    const r = Math.max(this.legendMax - this.legendMin, 0.01) * 1e-3;
    let s = Math.max(this.legendMin, Math.min(t, this.legendMax)), o = Math.min(this.legendMax, Math.max(e, this.legendMin));
    o - s < r && (o = Math.min(this.legendMax, s + r)), this.displayMin = s, this.displayMax = o;
    const d = this.evenPct(s), h = this.evenPct(o);
    this.thumbMin.style.left = `${d * 100}%`, this.thumbMax.style.left = `${h * 100}%`, this.maskLeft.style.width = `${d * 100}%`, this.maskRight.style.width = `${(1 - h) * 100}%`, n || (c = this.onChange) == null || c.call(this, { displayMin: s, displayMax: o });
  }
  setLegendMode(t) {
    this.legendMode !== t && (this.legendMode = t, this.updateBar());
  }
  getLegendMode() {
    return this.legendMode;
  }
  setColorRamp(t, e) {
    this.colorRamp = t, this.legendTicks = e ?? W(t), this.updateBar(), this.rebuildLabels(), this.applyDisplayRange(this.displayMin, this.displayMax, !0);
  }
  setLegendTicks(t) {
    this.legendTicks = t, this.rebuildLabels(), this.updateBar(), this.applyDisplayRange(this.displayMin, this.displayMax, !0);
  }
  getLegendTicks() {
    return [...this.legendTicks];
  }
  setDisplayRange(t, e, n = !1) {
    this.applyDisplayRange(t, e, n);
  }
  getDisplayRange() {
    return { displayMin: this.displayMin, displayMax: this.displayMax };
  }
  getLegendRange() {
    return { min: this.legendMin, max: this.legendMax };
  }
  destroy() {
    document.removeEventListener("pointermove", this.onPointerMove), document.removeEventListener("pointerup", this.onPointerUp), this.root.remove();
  }
}
function Zt(i) {
  return new It(i);
}
const Ut = {
  background: "rgba(255, 255, 255, 0.92)",
  width: "280px",
  padding: "10px 14px 12px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  zIndex: 10
}, Nt = {
  "bottom-right": { bottom: 24, right: 12 },
  "bottom-left": { bottom: 24, left: 12 },
  "top-right": { top: 12, right: 12 },
  "top-left": { top: 12, left: 12 }
};
function qt(i = "bottom-right", t = {}) {
  const e = { ...Ut, ...t }, n = i === "custom" ? {} : Nt[i], a = {
    position: "absolute",
    background: e.background,
    width: typeof e.width == "number" ? `${e.width}px` : e.width,
    padding: e.padding,
    borderRadius: e.borderRadius,
    boxShadow: e.boxShadow,
    zIndex: t.zIndex ?? e.zIndex,
    font: t.font ?? "11px system-ui, sans-serif",
    boxSizing: "border-box"
  }, r = { ...n, ...t };
  for (const s of ["bottom", "right", "left", "top"]) {
    const o = r[s];
    o != null && (a[s] = typeof o == "number" ? `${o}px` : o);
  }
  return a;
}
function Yt(i) {
  return {
    getVisibility: () => (i == null ? void 0 : i.getLayerVisibility()) ?? null,
    setLayerVisibility: (t) => i == null ? void 0 : i.setLayerVisibility(t),
    setShowChoropleth: (t) => i == null ? void 0 : i.setShowChoropleth(t),
    setShowGrid: (t) => i == null ? void 0 : i.setShowGrid(t),
    setShowLabels: (t) => i == null ? void 0 : i.setShowLabels(t),
    toggleChoropleth: () => {
      if (!i) return;
      const t = i.getLayerVisibility();
      i.setShowChoropleth(!t.choropleth);
    },
    toggleGrid: () => {
      if (!i) return;
      const t = i.getLayerVisibility();
      i.setShowGrid(!t.grid);
    },
    toggleLabels: () => {
      if (!i) return;
      const t = i.getLayerVisibility();
      i.setShowLabels(!t.labels);
    }
  };
}
export {
  pt as A,
  Pt as C,
  Ut as D,
  F as G,
  It as L,
  Vt as a,
  Nt as b,
  j as c,
  tt as d,
  At as e,
  Ht as f,
  Yt as g,
  Zt as h,
  St as i,
  A as j,
  $t as k,
  Tt as l,
  W as m,
  et as n,
  V as o,
  Et as p,
  Ct as q,
  qt as r,
  Wt as s,
  vt as t,
  nt as u,
  U as v,
  wt as w,
  jt as x,
  N as y
};
//# sourceMappingURL=layerControlHelpers-BSZqa4fP.js.map
