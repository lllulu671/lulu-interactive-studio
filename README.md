# Lulu 卢倩莹 — 复古互动工作室个人网站 (Deploy Bundle v6)

## 本地一键预览
双击 `start-preview.command`，或在终端运行：
```bash
python3 -m http.server 8080
```
打开浏览器访问：
- 默认（版本 A · 物化直觉器物版，对标 Felix Rieseberg × Taliahhh）：`http://127.0.0.1:8080/web/index.html?edition=a`
- 版本 B（90s 复古系统多窗口版，对标 Poolsuite FM × Mac System 7）：`http://127.0.0.1:8080/web/index.html?edition=b`
- 版本 C（纽约画廊印相墙与瑞士目录版，对标 Cosmos × Standards Manual）：`http://127.0.0.1:8080/web/index.html?edition=c`
（也可直接在页面右上角 `A / B / C` 胶囊实时切换；定版上线时若只想保留某一套，可在 `web/studio-overlays.js` 默认锁定对应 `edition` 并隐藏右上角切换器。）

## 线上部署
整个文件夹为纯静态站点（零后端依赖、内含 11 条本地高清 H.264 `.mp4` 视频流、全套书封/黑胶贴图与 2560×1440 光追场景图），可直接整包拖入 Vercel / Cloudflare Pages / Netlify / GitHub Pages 部署。

## 3D 书架

点击桌面书架、移动端书架入口或顶部 SHELF，即可查看 WebGL 书架特写。渲染器仅在打开书架时加载。使用本地 Three.js r179.1（MIT，许可见 `web/vendor/three/LICENSE`）及 Poly Haven 的 [Wood Table 001](https://polyhaven.com/a/wood_table_001) 木纹贴图（CC0）。
