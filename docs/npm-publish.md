# 发布到 npm

[← 文档目录](./README.md)

包名：**`grid-webgl-openlayers`**

## 一、首次发布前准备

### 1. 注册 npm 账号

https://www.npmjs.com/signup

### 2. 本地登录

```bash
npm login
```

按提示输入用户名、密码、邮箱。若开启了两步验证（2FA），发布时需用 **Authorization type: Publish** 的 OTP。

验证登录：

```bash
npm whoami
```

### 3. 检查包名是否可用

```bash
npm view grid-webgl-openlayers
```

若提示 `404`，说明名字未被占用，可以发布。  
若已被占用，需在 `package.json` 改名，或使用作用域包：

```json
"name": "@openlayer-computer/grid-webgl-openlayers"
```

作用域包首次发布：

```bash
npm publish --access public
```

### 4. 确认构建产物

```bash
npm run build:lib
npm pack --dry-run
```

应主要包含 `dist/` 下的 js、d.ts、css、worker，**不应**包含 `dist/data/arrayData.json`（示例数据只在 GitHub 仓库里）。

---

## 二、发布命令

```bash
# 1. 构建（prepublishOnly 也会自动执行）
npm run build:lib

# 2. 预览将要上传的文件
npm pack --dry-run

# 3. 发布
npm publish
```

作用域包：

```bash
npm publish --access public
```

---

## 三、发布后验证

```bash
npm view grid-webgl-openlayers
```

在空目录试装：

```bash
mkdir test-install && cd test-install
npm init -y
npm install grid-webgl-openlayers ol
```

```ts
import { GridMapView } from "grid-webgl-openlayers"
import "grid-webgl-openlayers/style.css"
import "ol/ol.css"
```

---

## 四、用户安装方式

```bash
npm install grid-webgl-openlayers ol
npm install vue   # 仅用 Vue 组件时需要
```

```ts
import { GridMapView } from "grid-webgl-openlayers"
import { GredGridMap } from "grid-webgl-openlayers/vue"
import "grid-webgl-openlayers/style.css"
import "ol/ol.css"
```

---

## 五、更新版本再发布

修改代码后 bump 版本号，然后重新发布：

```bash
# 补丁版本 1.0.0 → 1.0.1
npm version patch

# 次版本 1.0.0 → 1.1.0
npm version minor

# 主版本 1.0.0 → 2.0.0
npm version major
```

`npm version` 会自动改 `package.json` 并打 git tag，然后：

```bash
npm publish
git push && git push --tags
```

---

## 六、package.json 关键字段（已配置）

| 字段 | 当前值 | 说明 |
|------|--------|------|
| `name` | `grid-webgl-openlayers` | npm 包名 |
| `files` | `["dist"]` | 只发布 dist，不含 docs/demo |
| `main` / `module` | `dist/index.js` | 入口 |
| `types` | `dist/index.d.ts` | TypeScript 类型 |
| `exports` | `.` / `./vue` / `./style.css` | 子路径导出 |
| `peerDependencies` | `ol`, `vue`(optional) | 使用方需自行安装 |

可选补充（发布前建议加到 `package.json`）：

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/openlayer-computer/grid-webgl-openlayers.git"
  },
  "homepage": "https://openlayer-computer.github.io/grid-webgl-openlayers/",
  "bugs": {
    "url": "https://github.com/openlayer-computer/grid-webgl-openlayers/issues"
  }
}
```

---

## 七、常见问题

### 403 Forbidden

- 未 `npm login` 或 token 过期 → 重新 `npm login`
- 包名被他人占用 → 改名或改用 `@scope/name`
- 2FA 未用 Publish 级别 OTP → 在 npm 网站生成 Publish token

### 402 Payment Required（作用域包）

首次发布私有/作用域包需：

```bash
npm publish --access public
```

### 发布了错误版本

**不要** `npm unpublish` 整个包（npm 有严格限制）。应发布新版本修复：

```bash
npm version patch
npm publish
```

---

## 相关文档

- [构建说明](./build.md)
- [快速上手](./getting-started.md)
