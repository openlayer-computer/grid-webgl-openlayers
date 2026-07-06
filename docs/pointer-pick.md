# 鼠标拾取

[← 文档目录](./README.md)

鼠标/手指在地图上移动时，返回当前指向格点的数值。

## 事件类型

```ts
interface GridMapPointerEvent {
  lon: number
  lat: number
  value: number | null   // 无数据 / nodata / 超出 displayRange 时为 null
  zoom: number
  lod: number
}
```

## 命令式

```ts
// 绑定（返回解绑函数）
const unbind = overlay.onPointerMove((ev) => {
  if (ev.value != null) {
    console.log(ev.value, ev.lon, ev.lat)
  }
})

// 创建时绑定
await GridMapView.create({
  map,
  dataUrl: "/data/arrayData.json",
  onPointerMove: (ev) => { /* ... */ },
})

// 单点查询（不依赖鼠标事件）
overlay.getValueAt(105.2, 30.1)   // number | null
```

## Vue

```vue
<GredGridMap @pointermove="onHover" />

<script setup>
function onHover(ev: GridMapPointerEvent) {
  if (ev.value != null) console.log(ev.value)
}
</script>
```

或通过 prop：`on-pointer-move`（与 `@pointermove` 等效）。

## 行为说明

| 情况 | `value` |
|------|---------|
| 有效格点且在显示范围内 | 数值 |
| 超出数据 bbox | `null` |
| nodata（`-9999`） | `null` |
| 超出 `displayRange`（色斑可见时） | `null` |
| 拖拽地图中 | 不触发回调 |

移动端通过 `pointermove` 拾取，手指滑动时可返回值。

## 相关文档

- [命令式 API](./api-grid-map.md)
- [Vue 组件](./vue-components.md)
