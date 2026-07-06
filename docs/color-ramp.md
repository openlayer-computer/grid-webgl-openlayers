# 色带配置

[← 文档目录](./README.md)

## 类型

```ts
type ColorRampItem = [number, [r, g, b, a]]
```

- 第一项：数值阈值（可不规则间隔）
- 第二项：RGBA，0～255

## 示例

```ts
const colorRamp: ColorRampItem[] = [
  [-9999, [0, 0, 0, 0]],           // nodata 透明（建议保留）
  [0,     [232, 245, 233, 255]],
  [7.5,   [129, 199, 132, 255]],
  [47.6,  [27, 94, 32, 255]],
  [9999,  [0, 0, 0, 0]],           // 上限兜底（建议保留）
]
```

传入方式：

```ts
await GridMapView.create({ map, dataUrl, colorRamp })
overlay.setColorRamp(colorRamp)
```

不传时，库按数据统计 `min/max` 调用 `defaultGridColorRamp` 自动生成。

## 工具函数

从 `grid-webgl-openlayers` 导出：

| 函数 | 说明 |
|------|------|
| `defaultGridColorRamp(min, max)` | 默认绿系色带 |
| `defaultTemperatureRamp(min, max)` | 温度色带 |
| `colorRampWithRange(min, max, ramp)` | 按范围裁剪色带 |
| `legendRangeFromRamp(ramp)` | 从色带取 min/max |
| `extractLegendTicks(ramp)` | 提取刻度数组 |
| `rampToCssGradient(ramp)` | CSS 线性渐变 |
| `rampToEvenCssGradient(ramp)` | 视觉等分 CSS 渐变 |
| `valueToLegendPercent` / `valueToEvenLegendPercent` | 数值 → 图例百分比 |
| `rgbaToCss` | RGBA 数组 → CSS 颜色 |

## 与图例的关系

- **图例刻度**可不规则，由 `colorRamp` 或 `legendTicks` 决定。
- **色块位置**在 UI 上均匀分布（`blocks` 模式），与数值间隔无关。
- **显示过滤**（`setDisplayRange`）只影响地图上可见数值，不改变色带定义。

## 相关文档

- [图例与图层控制](./legend-and-controls.md)
- [命令式 API](./api-grid-map.md)
