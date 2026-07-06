# 快速上手

[← 文档目录](./README.md) · [← 项目首页](../README.md)

## 使用前提

### 环境要求

| 项目 | 要求 |
|------|------|
| 运行环境 | 现代浏览器（需 **WebGL2**、Canvas2D、Web Worker） |
| 地图 | 业务方自行创建 **OpenLayers `Map`**（底图、控件、投影均由外部管理） |
| 依赖 | `ol` ^9 或 ^10（peerDependency，必装） |
| Vue | `vue` ^3.3（可选，仅使用 Vue 组件时需要） |
| 数据 | WGS84 经纬度规则网格 JSON（见 [数据格式](./data-format.md)） |

### 架构约定

```
你的 ol/Map（底图 + View + 控件）
  └── grid-webgl-openlayers 叠加
        ├── ChoroplethLayer   WebGL 色斑图（可显示网格线）
        └── GridValueLayer    Canvas2D 格点数值标注
  └── 可选 LegendPanel / GredLegendPanel  图例 + 显示范围过滤
```

- **Map 必须由外部传入**，库只 `addLayer` 叠加图层。
- 切换投影或替换 `View` 后，必须调用 `overlay.refreshView()`。
- `destroy()` 只移除叠加图层，**不会销毁**外部 Map。

### 不支持的场景

- Flutter / React Native 原生视图（除非 WebView 嵌 H5）
- 微信/支付宝小程序
- 无 WebGL2 的极老浏览器

详见 [平台支持](./platform.md)。

---

## 安装与入口

```bash
npm install grid-webgl-openlayers ol
npm install vue   # 仅 Vue 项目需要
```

```ts
import "ol/ol.css"
import "grid-webgl-openlayers/style.css"   // 图例面板样式（使用图例时建议引入）
```

| 入口 | 用途 |
|------|------|
| `grid-webgl-openlayers` | 命令式 API、图层类、图例、色带工具 |
| `grid-webgl-openlayers/vue` | `GredGridMap`、`GredLegendPanel`、`GredLegendSlider` |
| `grid-webgl-openlayers/style.css` | 图例面板基础样式 |

---

## 最小示例

### 命令式

```ts
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { GridMapView } from "grid-webgl-openlayers"
import "ol/ol.css"

const map = new Map({
  target: "map",
  view: new View({ projection: "EPSG:4326", center: [105, 30], zoom: 6 }),
  layers: [new TileLayer({ source: new OSM() })],
})

const overlay = await GridMapView.create({
  map,
  dataUrl: "/data/arrayData.json",
})

overlay.destroy()   // 销毁时：仅移除图层，不销毁 map
```

### Vue 3

```vue
<script setup lang="ts">
import { onMounted, ref, shallowRef } from "vue"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { GredGridMap } from "grid-webgl-openlayers/vue"
import "ol/ol.css"

const mapEl = ref<HTMLElement>()
const map = shallowRef<Map | null>(null)

onMounted(() => {
  map.value = new Map({
    target: mapEl.value,
    view: new View({ projection: "EPSG:4326", center: [105, 30], zoom: 6 }),
    layers: [new TileLayer({ source: new OSM() })],
  })
})
</script>

<template>
  <div ref="mapEl" style="width:100%;height:500px" />
  <GredGridMap v-if="map" :map="map" data-url="/data/arrayData.json" />
</template>
```

---

## 功能一览

| 功能 | 说明 | API / 组件 |
|------|------|------------|
| 色斑图 | WebGL 渲染，支持 LOD 降采样 | `showChoropleth` / `setShowChoropleth` |
| 网格线 | 色斑格网边框 | `showGrid` / `setShowGrid` |
| 格点数值 | Canvas2D 稀疏标注 | `showLabels` / `setShowLabels` |
| 色带 | 不规则数值-颜色映射 | `colorRamp` / `setColorRamp` |
| 图例范围 | 色带刻度 min/max | `legendMin` / `setLegendRange` |
| 显示过滤 | 双滑块过滤可见数值区间 | `displayMin` / `setDisplayRange` |
| 图例 UI | 色块/渐变 + 刻度标签 | `GredLegendPanel` / `createLegendPanel` |
| 图层开关 | 色斑/网格/标注切换 | `createLayerControlApi` / `#controls` 插槽 |
| 鼠标拾取 | 悬停返回格点值 | `onPointerMove` / `@pointermove` |
| 视图适配 | 自动 fit 到数据范围 | `autoFit` / `fitToData` |
| 投影切换 | 4326 ↔ 3857 等 | `refreshView()` |

---

## 下一步

- 准备数据 → [数据格式](./data-format.md)
- 命令式集成 → [命令式 API](./api-grid-map.md)
- Vue 集成 → [Vue 组件](./vue-components.md)
- 完整 Demo → [示例合集](./examples.md)
