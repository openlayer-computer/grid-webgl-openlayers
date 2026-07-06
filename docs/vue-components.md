# Vue 3 组件

[← 文档目录](./README.md)

入口：`import { GredGridMap, GredLegendPanel, GredLegendSlider } from "grid-webgl-openlayers/vue"`

## GredGridMap（renderless）

无 DOM 输出，仅向 `:map` 叠加 `ChoroplethLayer` + `GridValueLayer`。

### Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `map` | `Map` | 必填 | 外部 ol/Map |
| `data-url` / `data` | — | 二选一 | 网格数据 |
| `show-choropleth` | `boolean` | `true` | 色斑 |
| `show-grid` | `boolean` | `false` | 网格线 |
| `show-labels` | `boolean` | `true` | 标注 |
| `choropleth-opacity` | `number` | `0.75` | 透明度 |
| `choropleth-z-index` | `number` | `2` | 色斑 zIndex |
| `labels-z-index` | `number` | `3` | 标注 zIndex |
| `label-distance` | `number` | `80` | 标注间距 |
| `label-precision` | `number` | `1` | 小数位 |
| `label-font-size` | `number` | `11` | 字号 |
| `color-ramp` | `ColorRampItem[]` | — | 色带 |
| `legend-min` / `legend-max` | `number` | — | 图例范围 |
| `display-min` / `display-max` | `number` | — | 显示过滤 |
| `auto-fit` | `boolean` | `true` | 自动 fit |
| `fit-padding` | `number \| array` | `40` | fit 内边距 |
| `fit-max-zoom` | `number` | `10` | fit 最大缩放 |
| `on-pointer-move` | `function` | — | 拾取回调 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `ready` | `GridMapView` | 叠加层就绪 |
| `load` | `{ min, max }` | 数据统计 |
| `pointermove` | `GridMapPointerEvent` | 鼠标移动拾取 |
| `legend-change` | `{ min, max }` | 图例范围变化 |
| `display-change` | `{ min, max }` | 显示范围变化 |
| `error` | `string` | 加载失败 |

### Expose

与 `GridMapViewApi` 对齐：`getOverlay`、`fitToData`、`refreshView`、`getValueAt`、`setDisplayRange`、`onPointerMove` 等。

---

## GredLegendPanel

图例面板：双滑块显示范围过滤 + `#controls` 插槽。

### Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `overlay` | `GridMapView` | — | 绑定的叠加层 |
| `legend-mode` | `"blocks" \| "gradient"` | `"blocks"` | 色块 / 渐变 |
| `title` | `string` | `"格点值"` | 标题 |
| `show-title` | `boolean` | `true` | 显示标题 |
| `placement` | 见下 | `"bottom-right"` | 面板位置 |
| `color-ramp` | `ColorRampItem[]` | 从 overlay 读取 | 色带 |
| `legend-ticks` | `number[]` | 从色带提取 | 不规则刻度 |
| `display-min` / `display-max` | `number` | — | 初始显示范围 |
| `precision` | `number` | `1` | 刻度小数位 |
| `background` / `width` / `padding` / `border-radius` / `box-shadow` / `z-index` | — | — | 面板样式 |
| `bottom` / `right` / `left` / `top` | `string \| number` | — | 定位（`placement: custom` 时） |
| `font` | `string` | — | 字体 |

`placement`：`bottom-right` | `bottom-left` | `top-right` | `top-left` | `custom`

### Events

- `change` → `{ displayMin, displayMax }`

### 插槽 `#controls`

提供 `layer`（`LayerControlApi`）和 `overlay`：

```vue
<template #controls="{ layer }">
  <button @click="layer.toggleChoropleth()">色斑图</button>
  <button @click="layer.toggleGrid()">网格线</button>
  <button @click="layer.toggleLabels()">格点数值</button>
</template>
```

---

## GredLegendSlider

仅双滑块图例，不含面板定位与 `#controls` 插槽。适合自定义布局。

---

## 完整 Vue Demo

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { GredGridMap, GredLegendPanel } from "grid-webgl-openlayers/vue"
import type { GridMapView, GridMapPointerEvent } from "grid-webgl-openlayers"
import "ol/ol.css"
import "grid-webgl-openlayers/style.css"

const mapEl = ref<HTMLElement | null>(null)
const map = shallowRef<Map | null>(null)
const overlay = shallowRef<GridMapView | null>(null)
const info = ref("加载中…")

onMounted(() => {
  if (!mapEl.value) return
  map.value = new Map({
    target: mapEl.value,
    view: new View({ projection: "EPSG:4326", center: [105, 30], zoom: 6 }),
    layers: [new TileLayer({ source: new OSM() })],
  })
})

onBeforeUnmount(() => {
  map.value?.setTarget(undefined)
  map.value = null
})

function onReady(view: GridMapView) {
  overlay.value = view
}

function onPointerMove(ev: GridMapPointerEvent) {
  if (ev.value != null) {
    info.value = `值: ${ev.value.toFixed(1)} | LOD: ${ev.lod}×`
  }
}
</script>

<template>
  <div class="page">
    <aside class="panel">
      <h1>网格叠加</h1>
      <p>{{ info }}</p>
    </aside>
    <div class="map-wrap">
      <div ref="mapEl" class="map" />
      <GredLegendPanel
        v-if="overlay"
        :overlay="overlay"
        legend-mode="blocks"
        title="格点值"
        placement="bottom-right"
      >
        <template #controls="{ layer }">
          <button type="button" @click="layer.toggleChoropleth()">色斑图</button>
          <button type="button" @click="layer.toggleGrid()">网格线</button>
          <button type="button" @click="layer.toggleLabels()">格点数值</button>
        </template>
      </GredLegendPanel>
    </div>
    <GredGridMap
      v-if="map"
      :map="map"
      data-url="/data/arrayData.json"
      :show-grid="false"
      @ready="onReady"
      @pointermove="onPointerMove"
    />
  </div>
</template>

<style scoped>
.page { display: flex; width: 100vw; height: 100vh; }
.panel { width: 280px; padding: 16px; }
.map-wrap { flex: 1; position: relative; }
.map { width: 100%; height: 100%; }
</style>
```

源码参考：[examples/vue-demo/App.vue](../examples/vue-demo/App.vue)

## 相关文档

- [命令式 API](./api-grid-map.md)
- [图例与图层控制](./legend-and-controls.md)
- [鼠标拾取](./pointer-pick.md)
