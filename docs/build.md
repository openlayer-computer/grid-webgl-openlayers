# 构建发布

[← 文档目录](./README.md)

## 构建库

```bash
npm run build:lib
```

输出目录 `dist/`：

| 文件 | 说明 |
|------|------|
| `dist/index.js` + `dist/index.d.ts` | 核心 API（`grid-webgl-openlayers`） |
| `dist/vue.js` + `dist/vue.d.ts` | Vue 组件（`grid-webgl-openlayers/vue`） |
| `dist/grid-webgl-openlayers.css` | 图例样式（`grid-webgl-openlayers/style.css`） |
| `dist/assets/gridData.worker-*.js` | Worker 分包 |

## 发布 npm

```bash
npm publish
```

`package.json` 的 `files` 仅包含 `dist`，文档与示例不会打入 npm 包。

## package exports

```json
{
  ".": "./dist/index.js",
  "./vue": "./dist/vue.js",
  "./style.css": "./dist/grid-webgl-openlayers.css"
}
```

## peerDependencies

```json
{
  "ol": "^9.0.0 || ^10.0.0",
  "vue": "^3.3.0"
}
```

`vue` 为 optional peer，仅使用 Vue 组件时需要安装。

## TypeScript 类型导出

```ts
import type {
  ArrayDataJson,
  ColorRampItem,
  GridMapOptions,
  GridMapViewApi,
  GridMapPointerEvent,
  GridLayerVisibility,
  LegendRange,
  DisplayRange,
  LayerControlApi,
  LegendPanelPlacement,
} from "grid-webgl-openlayers"
```

Vue 相关类型也可从 `grid-webgl-openlayers/vue` 导入。

## 其他脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 Demo |
| `npm run build:demo` | 构建 Demo 到 `dist-demo` |
| `npm run preview` | 预览构建结果 |
