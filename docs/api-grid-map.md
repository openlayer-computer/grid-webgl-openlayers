# 命令式 API（GridMapView）

[← 文档目录](./README.md)

`GridMapView.create(options)` 与 `createGridMap()` / `createGridOverlay()` 等价。

## 创建参数 `GridMapOptions`

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `map` | `ol/Map` | **必填** | 外部地图实例 |
| `dataUrl` | `string` | — | 网格 JSON 地址（与 `data` 二选一） |
| `data` | `ArrayDataJson` | — | 内存网格数据 |
| `showChoropleth` | `boolean` | `true` | 色斑图显隐 |
| `showGrid` | `boolean` | `false` | 网格线显隐 |
| `showLabels` | `boolean` | `true` | 格点数值显隐 |
| `choroplethOpacity` | `number` | `0.75` | 色斑透明度 |
| `choroplethZIndex` | `number` | `2` | 色斑图层 zIndex |
| `labelsZIndex` | `number` | `3` | 标注图层 zIndex |
| `labelDistance` | `number` | `80` | 标注最小像素间距 |
| `labelPrecision` | `number` | `1` | 标注小数位 |
| `labelFontSize` | `number` | `11` | 标注字号 |
| `colorRamp` | `ColorRampItem[]` | 自动生成 | 色带（见 [色带配置](./color-ramp.md)） |
| `legendMin` / `legendMax` | `number` | 数据统计 min/max | 图例刻度范围 |
| `displayMin` / `displayMax` | `number` | 等于 legend 范围 | 色斑显示过滤区间 |
| `autoFit` | `boolean` | `true` | 创建后自动 fit |
| `fitPadding` | `number \| [t,r,b,l]` | `40` | fit 内边距 |
| `fitMaxZoom` | `number` | `10` | fit 最大缩放 |
| `onPointerMove` | `function` | — | 创建时绑定鼠标拾取（见 [鼠标拾取](./pointer-pick.md)） |

## 实例方法 `GridMapViewApi`

```ts
// 图层
overlay.getLayerVisibility()           // { choropleth, grid, labels }
overlay.setLayerVisibility({ labels: false })
overlay.setShowChoropleth(true)
overlay.setShowGrid(false)
overlay.setShowLabels(true)

// 图例与显示
overlay.getLegendRange()               // { min, max }
overlay.setLegendRange(0, 50)
overlay.getColorRamp()
overlay.setColorRamp(colorRamp)
overlay.getDisplayRange()              // { min, max }
overlay.setDisplayRange(5, 30)         // 超出范围的格点不渲染

// 视图
overlay.fitToData()
overlay.refreshView()                  // 投影/View 变更后必须调用
overlay.getLodStep()                   // 当前 LOD 步长
overlay.projection                     // 当前地图投影代码

// 拾取
overlay.getValueAt(105.2, 30.1)        // number | null
overlay.onPointerMove(handler)         // 返回解绑函数

// 生命周期
overlay.destroy()

// 只读引用
overlay.map
overlay.loader
overlay.choroplethLayer
overlay.gridValueLayer
overlay.stats                          // { min, max }
```

## 完整示例

```ts
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import {
  GridMapView,
  createLegendPanel,
  createLayerControlApi,
} from "grid-webgl-openlayers"
import type { ColorRampItem } from "grid-webgl-openlayers"
import "ol/ol.css"
import "grid-webgl-openlayers/style.css"

const colorRamp: ColorRampItem[] = [
  [-9999, [0, 0, 0, 0]],
  [0, [232, 245, 233, 255]],
  [15, [67, 160, 71, 255]],
  [47.6, [27, 94, 32, 255]],
  [9999, [0, 0, 0, 0]],
]

const map = new Map({
  target: "map",
  view: new View({ projection: "EPSG:4326", center: [105, 30], zoom: 6 }),
  layers: [new TileLayer({ source: new OSM() })],
})

const overlay = await GridMapView.create({
  map,
  dataUrl: "/data/arrayData.json",
  showGrid: false,
  colorRamp,
})

// 图例 + 图层开关
const controlsSlot = document.createElement("div")
const layer = createLayerControlApi(overlay)
;["色斑图", "网格线", "格点数值"].forEach((label, i) => {
  const keys = ["choropleth", "grid", "labels"] as const
  const btn = document.createElement("button")
  btn.textContent = label
  btn.onclick = () => layer.setLayerVisibility({ [keys[i]]: !layer.getVisibility()![keys[i]] })
  controlsSlot.appendChild(btn)
})

const legend = createLegendPanel({
  parent: document.body,
  placement: "bottom-right",
  title: "格点值",
  legendMode: "blocks",
  colorRamp: overlay.getColorRamp(),
  controlsSlot,
})
legend.bindOverlay(overlay)

overlay.onPointerMove(({ lon, lat, value }) => {
  if (value != null) console.log(`值=${value} @ ${lon}, ${lat}`)
})
```

源码参考：[src/main.ts](../src/main.ts)

## 相关文档

- [图例与图层控制](./legend-and-controls.md)
- [鼠标拾取](./pointer-pick.md)
- [投影切换](./projection.md)
