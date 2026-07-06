# 示例合集

[← 文档目录](./README.md)

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 **http://localhost:5173**（命令式 Demo，源码 [src/main.ts](../src/main.ts)）。

### Demo 包含功能

- WebGL 色斑图 + Canvas2D 格点标注
- 不规则色带
- 图例双滑块（`blocks` 模式）过滤显示范围
- 色斑 / 网格线 / 标注 图层开关
- 鼠标悬停拾取格点值
- EPSG:4326 ↔ EPSG:3857 投影切换

---

## 命令式完整示例

见 [命令式 API — 完整示例](./api-grid-map.md#完整示例) 或源码 [src/main.ts](../src/main.ts)。

要点摘要：

```ts
import { GridMapView, createLegendPanel, createLayerControlApi } from "grid-webgl-openlayers"

const overlay = await GridMapView.create({
  map,
  dataUrl: "/data/arrayData.json",
  colorRamp: buildIrregularColorRamp(),
})

const legend = createLegendPanel({
  parent: document.body,
  placement: "bottom-right",
  legendMode: "blocks",
  colorRamp: overlay.getColorRamp(),
})
legend.bindOverlay(overlay)

overlay.onPointerMove(({ value }) => {
  if (value != null) console.log(value)
})
```

---

## Vue 3 完整示例

源码：[examples/vue-demo/App.vue](../examples/vue-demo/App.vue)

```vue
<GredGridMap
  v-if="map"
  :map="map"
  data-url="/data/arrayData.json"
  @ready="overlay = $event"
  @pointermove="onPointerMove"
/>

<GredLegendPanel
  v-if="overlay"
  :overlay="overlay"
  legend-mode="blocks"
  placement="bottom-right"
>
  <template #controls="{ layer }">
    <button @click="layer.toggleChoropleth()">色斑图</button>
    <button @click="layer.toggleGrid()">网格线</button>
    <button @click="layer.toggleLabels()">格点数值</button>
  </template>
</GredLegendPanel>
```

---

## 示例数据

[data/arrayData.json](../data/arrayData.json) — 西南地区规则网格样例（170×229）。

格式说明：[数据格式](./data-format.md)

---

## 演示 GIF

为 GitHub 首页录制演示动画，见 [docs/assets/README.md](./assets/README.md)。
