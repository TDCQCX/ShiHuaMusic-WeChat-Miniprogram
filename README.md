# ShiHuaMusic-WeChat-Miniprogram

<div align="center">

![ShiHua Music](assets/icons/logo.svg)

一个基于微信小程序开发的精美音乐应用

[![微信开发者工具](https://img.shields.io/badge/%E5%BE%AE%E4%BF%A1%E5%BC%80%E5%8F%91%E8%80%85%E5%B7%A5%E5%85%B7-v1.06.0-blue)](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
[![TDesign](https://img.shields.io/badge/TDesign-1.11.0-green)](https://tdesign.tencent.com/miniprogram/overview)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

</div>

## ✨ 项目简介

ShiHua Music 是一个专为微信生态设计的现代化音乐小程序，提供流畅的音乐播放体验和精美的用户界面。项目采用微信原生小程序框架开发，集成了 TDesign 设计语言，为用户带来一致且优雅的交互体验。

## 🎵 主要功能

### 核心音乐功能
- 🎧 **音乐播放** - 完整的音乐播放控制体验
- 🔄 **循环模式** - 支持列表循环、单曲循环、顺序播放
- ⏯️ **播放控制** - 播放、暂停、上一首、下一首
- 📊 **进度控制** - 实时播放进度显示和拖拽控制
- 🔊 **后台播放** - 支持后台音乐播放

### 发现与推荐
- 🖼️ **轮播展示** - 精美的音乐推荐轮播图
- 📋 **推荐歌单** - 个性化歌单推荐
- 🎶 **热门歌曲** - 精选热门音乐推荐

### 用户功能
- 👤 **个人中心** - 完善的用户个人信息管理
- ❤️ **我的收藏** - 收藏喜欢的音乐和歌手
- 📚 **我的歌单** - 创建和管理个人歌单
- 🕒 **最近播放** - 查看播放历史记录

### 界面特色
- 📱 **底部播放器** - 固定底部音乐播放控制栏
- 🎨 **TDesign 设计** - 采用腾讯 TDesign 设计规范
- 🌙 **现代化UI** - 简洁美观的用户界面
- 📲 **响应式布局** - 适配不同屏幕尺寸

## 🛠 技术栈

- **前端框架**: 微信小程序原生框架
- **UI组件库**: [TDesign MiniProgram](https://tdesign.tencent.com/miniprogram/) v1.11.0
- **构建工具**: [miniprogram-ci](https://www.npmjs.com/package/miniprogram-ci) v1.8.16
- **开发语言**: JavaScript (ES6+), WXML, WXSS
- **图标资源**: SVG + PNG 格式

## 📦 项目结构

```
ShiHuaMusic-WeChat-Miniprogram/
├── 📄 README.md                      # 项目说明文档
├── 📄 LICENSE                        # 开源协议
├── 📄 .gitignore                     # Git忽略配置
├── 📄 app.js                         # 小程序入口文件
├── 📄 app.json                       # 小程序全局配置
├── 📄 app.wxss                       # 小程序全局样式
├── 📄 package.json                   # 项目依赖配置
├── 📁 assets/                        # 静态资源目录
│   ├── 📁 icons/                     # 图标资源
│   │   ├── 🎵 find.png               # 发现页图标
│   │   ├── 🎼 music.png              # 音乐页图标
│   │   ├── 👤 mine.png               # 个人页图标
│   │   ├── ⏯️ 播放.png               # 播放控制图标
│   │   └── ...更多图标
│   └── 📁 images/                    # 图片资源
│       └── default-cover.svg         # 默认封面图
├── 📁 components/                    # 小程序组件
│   ├── 📁 player/                    # 🎧 底部播放器组件
│   │   ├── player.js                 # 播放器逻辑
│   │   ├── player.wxml               # 播放器界面
│   │   └── player.wxss               # 播放器样式
│   ├── 📁 copyright/                 # 版权信息组件
│   └── 📁 welcome-modal/             # 欢迎弹窗组件
├── 📁 pages/                         # 小程序页面
│   ├── 📁 index/                     # 🏠 发现页
│   │   ├── index.wxml                # 首页布局
│   │   └── index.js                  # 首页逻辑
│   ├── 📁 library/                   # 📚 全部音乐页
│   ├── 📁 user/                      # 👤 个人中心页
│   ├── 📁 playlistDetail/            # 🎵 歌单详情页
│   ├── 📁 like/                      # ❤️ 喜欢音乐页
│   ├── 📁 login/                     # 🔑 登录页
│   ├── 📁 register/                  # 📝 注册页
│   └── 📁 my-playlists/              # 📋 我的歌单页
└── 📁 utils/                         # 工具函数
    └── audioManager.js               # 音频管理工具
```

## 🚀 快速开始

### 环境要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 最新版本
- Node.js >= 14.0.0
- npm 或 yarn 包管理器

### 安装与运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ShiHuaMusic-WeChat-Miniprogram
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置小程序**
   - 使用微信开发者工具打开项目
   - 在 `project.config.json` 中配置你的小程序 AppID
   - 如需使用上传功能，请配置 `private.key` 文件

4. **开发运行**
   ```bash
   # 使用 npm script
   npm run dev
   
   # 或直接使用微信开发者工具
   # 点击"编译"按钮在模拟器中预览
   ```

5. **生产构建**
   ```bash
   npm run build
   ```

### 上传到小程序平台

```bash
# 开发版本上传
npm run dev

# 生产版本上传  
npm run build
```

> 📝 **注意**: 上传功能需要配置微信小程序的私钥文件 (`private.key`)

## 🎨 设计规范

### 设计理念
- 遵循 [TDesign 设计规范](https://tdesign.tencent.com/design)
- 简洁现代的视觉风格
- 一致的交互体验
- 良好的可用性和无障碍性

### 色彩方案
- 主色调: `#1677FF` (腾讯蓝)
- 强调色: `#d33a31` (音乐红)
- 文字色: `#333333` / `#666666` / `#999999`
- 背景色: `#ffffff` / `#f5f5f5`

### 字体规范
- 标题字体: 16px-20px, 加粗
- 正文字体: 14px, 常规
- 辅助文字: 12px, 常规

## 📱 页面预览

### 发现页 (Home)
- 轮播图推荐
- 推荐歌单展示
- 热门歌曲列表
- 底部播放器集成

### 音乐库 (Library)
- 全部音乐分类浏览
- 搜索功能
- 播放历史记录

### 个人中心 (Profile)
- 用户信息展示
- 我的收藏
- 我的歌单
- 设置选项

## 🔧 开发指南

### 项目配置

#### app.json 配置说明
```json
{
  "pages": [...],                    // 页面路由配置
  "tabBar": {...},                   // 底部导航栏配置
  "requiredBackgroundModes": ["audio"], // 后台音频播放
  "usingComponents": {...}           // 自定义组件引用
}
```

#### 页面结构规范
每个页面包含以下文件：
- `*.wxml` - 页面结构 (必需)
- `*.js` - 页面逻辑 (必需)  
- `*.wxss` - 页面样式 (必需)
- `*.json` - 页面配置 (可选)

### 组件开发

#### 播放器组件 (player)
- 支持播放/暂停/切换歌曲
- 循环模式切换
- 进度控制
- 后台播放支持

#### 版权组件 (copyright)
- 统一的版权信息展示
- 可配置显示内容

### 样式规范

#### 单位使用
- 推荐使用 `rpx` 单位实现响应式布局
- 图标尺寸: 32rpx - 64rpx
- 页面边距: 32rpx

#### 命名规范
- CSS 类名使用 kebab-case
- 组件样式使用 BEM 命名规范
- 颜色变量使用有意义的命名

## 🔒 安全说明

- 所有用户敏感信息都已忽略 (见 `.gitignore`)
- 小程序私钥文件请妥善保管
- 生产环境请启用 HTTPS
- 用户数据请遵循隐私政策

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议，详情请查看许可证文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献流程
1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 遵循 ESLint 代码规范
- 提交信息使用中文，格式清晰
- 新功能请添加相应的测试
- 更新 README 文档

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐ Star！**

Made with ❤️ by TDCQCX

</div>