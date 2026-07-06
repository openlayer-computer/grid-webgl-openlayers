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

## 构建 Demo（GitHub Pages）

```bash
npm run build:demo     # 输出 dist-demo/
npm run preview:demo   # 本地预览
```

部署到 GitHub Pages 的完整步骤见 [github-pages.md](./github-pages.md)。

## 发布 npm

完整步骤见 **[npm 发布指南](./npm-publish.md)**。

```bash
npm login
npm run build:lib
npm pack --dry-run    # 预览包内容
npm publish
```

`prepublishOnly` 会在 `npm publish` 前自动执行 `build:lib`。

`package.json` 的 `files` 仅包含 `dist`，文档与 Demo 不会打入 npm 包。

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
