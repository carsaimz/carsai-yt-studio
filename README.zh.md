<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>面向 YouTube 创作者的本地优先平台 — 数据分析、SEO、社区、自动化与 AI</strong>
  </p>

  <p><strong>阅读语言：</strong>
    <a href="README.md">English</a> ·
    <a href="README.pt.md">Português</a> ·
    <a href="README.es.md">Español</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="README.de.md">Deutsch</a> ·
    <a href="README.it.md">Italiano</a> ·
    <a href="README.zh.md">中文</a>
  </p>

  <p>🌐 <strong><a href="https://carsaiytstudio.vercel.app">官方网站 — carsaiytstudio.vercel.app</a></strong></p>
</div>

---

## 这是什么？

**Carsai YT Studio v3** 是一个拥有超强能力的 YouTube Studio 替代品：分析你的频道、优化 SEO、管理社区、自动化重复工作、探索**完整的 YouTube Data API v3**，并使用 AI 智能体——所有功能集于一款应用，可运行于**浏览器（PWA）、Android/iOS（Capacitor）和桌面端（Electron）**。

v3 采用**本地优先（local-first）**架构：你的数据和 API 密钥只保存在你自己的设备上。没有 Firebase，没有强制后端，没有中间服务器。基于 **MIT** 许可证开源。

> **关于网页版**：托管网页版仅用于**测试和演示**（示例数据，无真实连接）。完整体验——真实数据、OAuth 和自动化——在 **Electron（桌面）** 和 **Capacitor（移动）** 应用中运行，可从 [Releases](https://github.com/carsaimz/carsai-yt-studio/releases/latest) 下载。

## 功能特性

| | 功能 | 说明 |
|--|---|---|
| 📊 | **仪表盘与分析** | KPI 迷你图、28/90 天图表、流量来源、留存曲线、最佳时段热力图、CSV 导出 |
| 📈 | **可切换图表** | 任意面板均可切换图表类型：**折线、面积、柱状、环形、雷达和 3D** |
| 🔐 | **Google OAuth** | PKCE OAuth —— 自有播放列表、字幕及**真实的 YouTube Analytics API v2 报告**（每日指标 + 热门视频 + CSV）；Electron 自动回环捕获 |
| 🎬 | **内容库** | 搜索、筛选、实时 SEO 评分的元数据编辑器、章节、缩略图预览 |
| 🛰️ | **YouTube Hub** | 完整的 Data API v3：按地区/类别的热门内容、全局搜索（视频/频道/播放列表）、播放列表、订阅、动态、直播及官方分类体系 |
| 🔍 | **SEO 工作室** | 标题优化清单、通过 API 真实提取标签、关键词研究（公开自动补全）、竞争对手分析 |
| 💬 | **社区** | 带情感分析的收件箱、AI 建议回复、回复模板、审核（通过/隐藏/垃圾） |
| 🤖 | **多提供商 AI 工作室** | 具备频道上下文的聊天、脚本、创意、回复——**Gemini、Groq、OpenRouter、Mistral、Hugging Face、OpenAI、Claude、DeepSeek、Together + 本地（Ollama、LM Studio）+ 无限制自定义提供商** |
| ⚡ | **自动化** | 触发→条件→动作规则引擎：回复、生成创意、应用标签、通知、Webhook。内置模板与运行日志 |
| 🔌 | **集成** | **16 个**公共/免费服务的本地密钥库（YouTube API、Gemini、Groq、OpenRouter、Mistral、DeepSeek、Together、Ollama、LM Studio、Pexels、Unsplash、Pixabay、Webhook 等） |
| 🧰 | **工具** | 真实 YouTube 尺寸的缩略图 A/B 测试、按地区热门趋势、上传计划器、JSON 备份/导出 |
| 🎯 | **目标** | 频道目标（订阅、观看、时长、视频）并在仪表盘显示进度 |
| 🎨 | **主题与强调色** | Obsidian 深色/浅色主题 + **4 种自定义强调色**（Flame、Orchid、Ocean、Volt） |
| 🌍 | **六种语言** | Português · English · Español · Français · Deutsch · Italiano |
| ⌨️ | **命令面板** | `Cmd/Ctrl+K` 导航并执行操作 |
| 📲 | **可安装 PWA** | 作为原生应用安装——首次访问后可离线使用 |
| 📱 | **多平台** | Web · Android/iOS（Capacitor）· Windows/macOS/Linux（Electron） |

## 下载

每个版本都提供所有平台的构建（更新内容见 [CHANGELOG.md](CHANGELOG.md)）：

| 平台 | 文件 |
|---|---|
| 🤖 Android | `carsai-yt-studio-vX.Y.Z-android.apk` · `.aab` |
| 🪟 Windows | `carsai-yt-studio-X.Y.Z-win-x64.exe`（NSIS 安装包） |
| 🍎 macOS | `carsai-yt-studio-X.Y.Z-macos-*.dmg` |
| 🐧 Linux | `carsai-yt-studio-X.Y.Z-linux-x86_64.AppImage` · `.deb` |
| 🌐 Web | `carsai-yt-studio-vX.Y.Z-web.zip`（自托管包） |

👉 [最新版本](https://github.com/carsaimz/carsai-yt-studio/releases/latest)

## 快速开始

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. 打开 `http://localhost:3000`
2. 选择 **以 Demo 模式探索**（示例数据，零配置），或使用免费的 [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) 密钥连接你的频道
3. 可选：在 **设置 → AI 提供商** 中添加免费 AI（Gemini / Groq / OpenRouter / Mistral——或本地 Ollama）

## 安全与隐私

- 🔐 API 密钥仅保存在**你设备的** `localStorage` 中
- 🌐 外部请求直接从你的浏览器发往官方 API
- 🚫 无分析埋点、无遥测、无中间服务器
- 🧹 在**设置**中备份/导出；危险区可重置一切

## 参与贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，加入 [Discussions](https://github.com/carsaimz/carsai-yt-studio/discussions)，并查看[公开路线图](ROADMAP.md)。翻译者：`src/lib/studio/i18n.tsx` 中的 i18n 词典是添加新语言的地方。

## 许可证

MIT —— 见 [LICENSE](LICENSE)。
