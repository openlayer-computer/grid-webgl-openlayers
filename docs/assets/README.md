# 演示资源

本目录用于存放 GitHub 首页展示的演示素材。

## demo.gif（推荐）

```
docs/assets/demo.gif
```

首页 [README.md](../../README.md) 会自动引用：

### 建议录制内容（10～15 秒）

1. 地图加载色斑图与格点标注
2. 拖动图例双滑块，过滤显示范围
3. 鼠标悬停，底部/侧栏显示格点值
4. （可选）切换色斑 / 网格线 / 标注开关

### 录制方式

**Windows**

- `Win + G` 打开 Xbox Game Bar 录屏，或用 OBS、ScreenToGif
- 推荐 [ScreenToGif](https://www.screentogif.com/) 直接导出 GIF

**macOS**

- QuickTime 录屏 → 用 [Gifski](https://gif.ski/) 或 FFmpeg 转 GIF

**FFmpeg 示例**（已有 mp4 时）

```bash
ffmpeg -i demo.mp4 -vf "fps=12,scale=800:-1:flags=lanczos" -loop 0 docs/assets/demo.gif
```

### 尺寸建议

| 项   | 建议                                     |
| ---- | ---------------------------------------- |
| 宽度 | 720～960 px                              |
| 时长 | 10～15 秒                                |
| 体积 | 尽量 &lt; 5 MB（GitHub README 加载更快） |

## demo.png（备选）

若暂时无法提供 GIF，可放一张静态截图 `demo.png`，并临时修改 [README.md](../../README.md)：

## 注意事项

- GIF/PNG **需提交到 Git 仓库**，GitHub 才能在外部 README 中显示
- 素材仅用于文档展示，**不会**被打进 `npm publish` 的 `dist` 包（`package.json` 的 `files` 仅含 `dist`）
- 添加 `demo.gif` 后无需改代码，首页图片链接已预留
