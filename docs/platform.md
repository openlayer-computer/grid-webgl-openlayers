# 平台支持

[← 文档目录](./README.md)

## 支持矩阵

| 平台 | 支持 | 说明 |
|------|------|------|
| 桌面浏览器 | ✅ | Chrome、Firefox、Edge、Safari |
| 移动端浏览器 | ⚠️ | 需 WebGL2；地图操作可用，UI 未专门适配 |
| Vue 3 | ✅ | 官方组件 `grid-webgl-openlayers/vue` |
| React / Angular / Svelte | ✅ | 命令式 API，自行封装组件 |
| Electron / Tauri | ✅ | 内嵌 Chromium |
| Capacitor / Cordova H5 | ✅ | WebView 内 H5 页面 |
| Flutter 原生 | ❌ | 不能 npm install 直接使用 |
| React Native 原生 | ❌ | 需 WebView 或重写渲染 |
| 微信/支付宝小程序 | ❌ | 无标准 DOM / WebGL2 / Worker |

## 技术依赖

运行在浏览器中时需要：

- **WebGL2** — 色斑图渲染（不支持会抛 `WebGL2 not supported`）
- **Canvas2D** — 格点数值标注
- **Web Worker** — LOD 与标注异步计算（失败时降级主线程）
- **ES Module** — 包以 ESM 发布

## 移动端说明

- OpenLayers 自带触摸平移/缩放。
- 图例双滑块使用 Pointer Events，手指可拖动。
- 拾取依赖 `pointermove`，手指滑动时可返回值；无长按/点击拾取专用 API。
- 建议在真机验证 WebGL2 与大数据量性能。

## Flutter 变通方案

若必须在 Flutter 中展示：

1. **`webview_flutter`** 加载已集成 `grid-webgl-openlayers` 的 H5 页面（可行但体验割裂）
2. **用 Flutter 地图生态重写** WebGL 渲染（工作量大，非本库范围）

## 相关文档

- [快速上手 — 使用前提](./getting-started.md)
