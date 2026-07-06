# 数据格式

[← 文档目录](./README.md)

网格数据类型：`ArrayDataJson`（与项目内 `data/arrayData.json` 一致）。

## 类型定义

```ts
interface ArrayDataJson {
  startLat: number   // 南边界纬度
  endLat: number     // 北边界纬度
  startLon: number   // 西边界经度
  endLon: number     // 东边界经度
  latStep: number    // 纬度格距（度）
  lonStep: number    // 经度格距（度）
  latCount: number   // 行数（纬度方向）
  lonCount: number   // 列数（经度方向）
  ds: number[][]     // ds[row][col]，row 从南到北，col 从西到东
}
```

## 示例

```json
{
  "startLat": 26,
  "endLat": 34.45,
  "startLon": 97.25,
  "endLon": 108.65,
  "latStep": 0.05,
  "lonStep": 0.05,
  "latCount": 170,
  "lonCount": 229,
  "ds": [
    [8.37, 9, 9.72, "..."],
    [7.12, 8.01, "..."]
  ]
}
```

完整样例：[data/arrayData.json](../data/arrayData.json)

## 矩阵索引

| 维度 | 含义 |
|------|------|
| `ds[row][col]` | 第 `row` 行、第 `col` 列的格点值 |
| `row` | 从南往北，`0` = `startLat` 那一行 |
| `col` | 从西往东，`0` = `startLon` 那一列 |

格点中心坐标：

```
lon = startLon + (col + 0.5) × lonStep
lat = startLat + (row + 0.5) × latStep
```

## 数值约定

| 值 | 含义 |
|----|------|
| 普通数字 | 有效格点值 |
| `-9999` | 无数据（nodata）：色斑不绘制、标注不显示、拾取返回 `null` |
| `NaN` | 视为无效 |

## 约束

- `ds.length === latCount`
- 每行 `ds[i].length === lonCount`
- 坐标系为 WGS84 经纬度；地图投影由外部 `ol/Map` 决定

## 传入方式

`dataUrl` 与 `data` **二选一**：

```ts
// URL 加载
await GridMapView.create({ map, dataUrl: "/data/arrayData.json" })

// 内存对象
await GridMapView.create({ map, data: arrayDataJson })
```
