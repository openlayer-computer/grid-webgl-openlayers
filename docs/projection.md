# 投影切换

[← 文档目录](./README.md)

库支持 `EPSG:4326` 与 `EPSG:3857`，数据本身为 WGS84 经纬度；地图投影由外部 `ol/Map` 管理。

## 切换步骤

```ts
import { lonLatToMapCoord, mapCoordToLonLat, dataBboxToViewExtent } from "grid-webgl-openlayers"
import View from "ol/View"

// 1. 记录当前中心（经纬度）
const center = map.getView().getCenter()!
const zoom = map.getView().getZoom() ?? 6
const [lon, lat] = mapCoordToLonLat(center[0], center[1], oldProjCode)

// 2. 替换 View
map.setView(new View({
  projection: "EPSG:3857",
  center: lonLatToMapCoord(lon, lat, "EPSG:3857"),
  zoom,
}))

// 3. 刷新叠加层（必须）
overlay.refreshView()

// 4. 可选：重新 fit 到数据范围
map.getView().fit(
  dataBboxToViewExtent(overlay.loader.bbox, "EPSG:3857"),
  { padding: 40, maxZoom: 10 },
)
```

## 注意事项

- **`refreshView()` 必须调用**，否则 WebGL 纹理与标注坐标不会随投影更新。
- 标注步长在 3857 下会按「米/px」重新计算，与 4326 的「度/px」行为一致。
- `overlay.projection` 只读，返回当前 `map.getView().getProjection().getCode()`。

## 工具函数

| 函数 | 说明 |
|------|------|
| `lonLatToMapCoord(lon, lat, proj)` | 经纬度 → 地图坐标 |
| `mapCoordToLonLat(x, y, proj)` | 地图坐标 → 经纬度 |
| `dataBboxToViewExtent(bbox, proj)` | 数据 bbox → fit 用 extent |
| `viewExtentTo4326(extent, proj)` | 视口 extent → 4326 |

源码参考：[src/main.ts](../src/main.ts) 中的 `switchProjection`。

## 相关文档

- [命令式 API — refreshView](./api-grid-map.md)
