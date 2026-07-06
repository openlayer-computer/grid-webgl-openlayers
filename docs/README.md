# grid-webgl-openlayers 文档

OpenLayers + WebGL 网格色斑图与格点数值标注库的操作手册。

[← 返回项目首页](../README.md)

---

## 目录

### 入门

| 文档 | 内容 |
|------|------|
| [快速上手](./getting-started.md) | 环境要求、架构约定、安装、最小示例、功能一览 |
| [数据格式](./data-format.md) | `ArrayDataJson` 字段说明与示例 |
| [示例合集](./examples.md) | 命令式 / Vue 完整 Demo、本地运行方式 |

### API 参考

| 文档 | 内容 |
|------|------|
| [命令式 API](./api-grid-map.md) | `GridMapView.create` 参数、`GridMapViewApi` 方法 |
| [Vue 组件](./vue-components.md) | `GredGridMap`、`GredLegendPanel`、`GredLegendSlider` |
| [图例与图层控制](./legend-and-controls.md) | `createLegendPanel`、双滑块、`createLayerControlApi` |
| [鼠标拾取](./pointer-pick.md) | `onPointerMove`、`getValueAt` |
| [投影切换](./projection.md) | `refreshView`、坐标转换工具 |
| [色带配置](./color-ramp.md) | `ColorRampItem`、工具函数 |

### 进阶

| 文档 | 内容 |
|------|------|
| [底层图层 API](./low-level-api.md) | 单独使用 `ChoroplethLayer` / `GridValueLayer` |
| [平台支持](./platform.md) | 浏览器、移动端、各框架适配说明 |
| [构建发布](./build.md) | `npm run build:lib`、导出文件、TypeScript 类型 |

### 资源

| 资源 | 说明 |
|------|------|
| [演示 GIF 占位说明](./assets/README.md) | 如何录制并放置 `demo.gif` |
| [示例数据](../data/arrayData.json) | 项目内置网格 JSON |
| [命令式 Demo](../src/main.ts) | 开发环境完整示例 |
| [Vue Demo](../examples/vue-demo/App.vue) | Vue 3 集成示例 |

---

## 推荐阅读顺序

1. [快速上手](./getting-started.md) — 确认环境、跑通最小示例  
2. [数据格式](./data-format.md) — 准备自己的网格数据  
3. [命令式 API](./api-grid-map.md) 或 [Vue 组件](./vue-components.md) — 按技术栈选读  
4. [图例与图层控制](./legend-and-controls.md) + [鼠标拾取](./pointer-pick.md) — 常用交互  
5. 其余按需查阅
