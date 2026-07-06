# GitHub Pages 在线 Demo 部署

[← 文档目录](./README.md)

将 `src/main.ts` 构建为静态页面，发布到 GitHub Pages，访客可直接在浏览器操作地图 Demo。

## 访问地址

推送 `main` 分支并成功部署后：

```
https://<你的用户名>.github.io/<仓库名>/
```

例如仓库名为 `grid-webgl-openlayers`：

```
https://octocat.github.io/grid-webgl-openlayers/
```

README 中的 Demo 徽章链接格式相同。

## 一次性开启（GitHub 网页操作）

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选择 **GitHub Actions**
3. 将代码 push 到 `main`（或 `master`）分支
4. 打开 **Actions** 标签，确认 **Deploy GitHub Pages Demo** 工作流成功
5. 回到 **Settings → Pages**，查看发布的 URL

## 项目内已配置内容

| 文件 | 作用 |
|------|------|
| `.github/workflows/deploy-pages.yml` | push 后自动构建并部署 |
| `scripts/prepare-demo-data.mjs` | 将 `data/arrayData.json` 复制到 `public/data/` |
| `vite.config.ts` `demo` 模式 | 设置 `base` 路径，适配 `/<仓库名>/` |
| `npm run build:demo` | 输出到 `dist-demo/` |

## 本地验证（模拟 GitHub Pages）

```bash
npm install

# 按仓库名设置 base（与 GitHub 上一致）
# Windows PowerShell:
$env:VITE_BASE_PATH="/grid-webgl-openlayers/"; npm run build:demo

# macOS / Linux:
VITE_BASE_PATH=/grid-webgl-openlayers/ npm run build:demo

npm run preview:demo
```

浏览器打开终端提示的地址（通常为 `http://localhost:4173/grid-webgl-openlayers/`）。

本地开发仍用：

```bash
npm run dev
```

## 手动触发部署

GitHub 仓库 → **Actions** → **Deploy GitHub Pages Demo** → **Run workflow**

## 常见问题

### 出现 404 `/src/main.ts`

说明浏览器加载的是**源码版** `index.html`（开发用），不是 Actions 构建的 `dist-demo`。

**原因 A：访问了错误地址**

项目页 Demo 必须带仓库名：

```
✅ https://openlayer-computer.github.io/grid-webgl-openlayers/
❌ https://openlayer-computer.github.io/
❌ https://openlayer-computer.github.io/src/main.ts
```

**原因 B：Pages 发布源配置错误**

1. 打开 **Settings → Pages**
2. **Source** 必须选 **GitHub Actions**（不要选 *Deploy from a branch* + `/ (root)`）
3. 打开 **Actions**，确认 **Deploy GitHub Pages Demo** 最近一次为绿色 ✓
4. 若之前用过 branch 部署，改回 Actions 后重新 push 或手动 **Run workflow**

**原因 C：Actions 未成功**

构建产物里的 `index.html` 应引用 `/仓库名/assets/index-xxx.js`，而不是 `/src/main.ts`。本地可验证：

```bash
VITE_BASE_PATH=/grid-webgl-openlayers/ npm run build:demo
grep main.ts dist-demo/index.html   # 应无输出
```

### 页面空白或 404

- 确认 **Settings → Pages** 的 Source 为 **GitHub Actions**（不是旧版 `gh-pages` 分支）
- 确认 `VITE_BASE_PATH` 与仓库名一致，格式为 `/仓库名/`（首尾都要有 `/`）
- 若仓库改名为 `xxx`，无需改代码，CI 会自动使用新仓库名

### 数据加载失败

Demo 依赖 `public/data/arrayData.json`，由 `prebuild:demo` 从 `data/arrayData.json` 复制。确保示例数据已提交到仓库。

### 使用 `username.github.io` 根仓库

若仓库名恰好是 `<用户名>.github.io`，Pages 根路径为 `/`，需在 workflow 中改：

```yaml
env:
  VITE_BASE_PATH: /
```

## 相关文档

- [示例合集](./examples.md)
- [录制演示 GIF](./assets/README.md)
