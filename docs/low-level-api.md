# 底层图层 API

[← 文档目录](./README.md)

不经过 `GridMapView`，可单独使用数据加载器与图层类。

## 基本用法

```ts
import { ArrayDataLoader, ChoroplethLayer, GridValueLayer } from "grid-webgl-openlayers"

const loader = new ArrayDataLoader()
await loader.load("/data/arrayData.json")
// 或 await loader.loadData(arrayDataJson)

const choropleth = new ChoroplethLayer({
  loader,
  colorRamp,
  opacity: 0.75,
  showGrid: false,
  zIndex: 2,
})
choropleth.attachMap(map)
map.addLayer(choropleth)

const labels = new GridValueLayer({
  loader,
  distance: 80,
  precision: 1,
  fontSize: 11,
  zIndex: 3,
})
labels.attachMap(map)
map.addLayer(labels)
```

## ArrayDataLoader

| 方法 | 说明 |
|------|------|
| `load(url)` | 从 URL 加载 JSON |
| `loadData(json)` | 加载内存对象 |
| `bbox` | 数据范围 `[minLon, minLat, maxLon, maxLat]` |
| `metadata` | 元数据 + nodata |
| `getLodStep(zoom)` | LOD 步长 |
| `getNativeValueAt(lon, lat)` | 同步拾取 |
| `dispose()` | 释放 Worker |

## ChoroplethLayer

WebGL 色斑渲染，实现为 OpenLayers `ImageLayer` + `ImageCanvas`。

常用方法：`setColorRamp`、`setDisplayRange`、`setLegendRange`、`setShowGrid`、`getDataValue`、`reattachView`、`dispose`。

## GridValueLayer

Canvas2D 格点数值标注。

常用方法：`setVisible`、`reattachView`。

## 何时使用

| 场景 | 建议 |
|------|------|
| 常规业务集成 | 使用 `GridMapView` / `GredGridMap` |
| 自定义图层顺序、与其他 OL 图层深度整合 | 底层 API |
| 只需要色斑、不需要标注 | 单独 `ChoroplethLayer` |

## 相关文档

- [命令式 API](./api-grid-map.md)
- [数据格式](./data-format.md)
