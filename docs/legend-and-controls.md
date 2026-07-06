# 图例与图层控制

[← 文档目录](./README.md)

## 图例面板（命令式）

```ts
import { createLegendPanel } from "grid-webgl-openlayers"

const panel = createLegendPanel({
  parent: document.body,          // 或 "#map-wrap"
  placement: "bottom-right",
  title: "格点值",
  legendMode: "blocks",           // "gradient" 连续渐变
  colorRamp: overlay.getColorRamp(),
  displayMin: 0,
  displayMax: 50,
  precision: 1,
  onChange: ({ displayMin, displayMax }) => {
    overlay.setDisplayRange(displayMin, displayMax)
  },
  controlsSlot: myButtonContainer, // 可选：图层开关按钮容器
})

panel.bindOverlay(overlay)        // 自动同步色带与显示范围
panel.setLegendMode("gradient")
panel.destroy()
```

### 图例模式

| 模式 | 说明 |
|------|------|
| `blocks`（默认） | 色块均匀分布，刻度标签在色条下方 |
| `gradient` | 连续渐变条 |

色块/渐变按**视觉等分**排列；刻度数值可不规则（如 `0, 3, 7.5, 15, 28, 47.6`）。

### 面板定位 `placement`

`bottom-right` | `bottom-left` | `top-right` | `top-left` | `custom`

自定义样式可通过 `style` 传入 `background`、`width`、`padding`、`borderRadius`、`boxShadow`、`zIndex` 等。

---

## Vue 图例组件

见 [Vue 组件 — GredLegendPanel](./vue-components.md#gredlegendpanel)。

```vue
<GredLegendPanel
  :overlay="overlay"
  legend-mode="blocks"
  placement="bottom-right"
  title="格点值"
/>
```

---

## 图层控制 API

`createLayerControlApi(overlay)` 用于色斑 / 网格线 / 标注的显隐控制：

```ts
interface LayerControlApi {
  getVisibility(): { choropleth, grid, labels } | null
  setLayerVisibility({ choropleth?, grid?, labels? })
  setShowChoropleth(visible: boolean)
  setShowGrid(visible: boolean)
  setShowLabels(visible: boolean)
  toggleChoropleth()
  toggleGrid()
  toggleLabels()
}
```

### 命令式按钮示例

```ts
const layer = createLayerControlApi(overlay)

const btn = document.createElement("button")
btn.textContent = "色斑图"
btn.onclick = () => layer.toggleChoropleth()
```

### Vue 插槽

```vue
<template #controls="{ layer }">
  <button @click="layer.toggleLabels()">格点数值</button>
</template>
```

## 相关文档

- [色带配置](./color-ramp.md)
- [命令式 API — setDisplayRange](./api-grid-map.md)
