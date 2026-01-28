# Mr.Xia - 个人网站

> 简约现代的个人网站，展示作品与创意

## 📋 项目简介

这是一个简约现代的个人作品展示网站项目，主要特点：
- 🎨 **现代设计** - 采用渐变色彩和微交互效果
- 📱 **响应式布局** - 适配各种设备屏幕
- 🏗️ **模块化结构** - 代码组织清晰，易于维护
- ⏰ **实用功能** - 包含实时时钟等实用工具
- ✨ **动态效果** - 流畅的页面动画和交互效果

## 📁 项目结构

```
mr.xia/
├── css/
│   └── style.css          # 统一样式表
├── js/
│   ├── main.js            # 主脚本文件
│   └── navigation.js      # 导航系统脚本
├── blog/                  # 博客系统目录
│   ├── README.md          # 博客使用指南
│   ├── blog-files.json    # 博客文件列表
│   ├── blog-metadata.json # 博客元数据
│   └── *.html             # 博客文章HTML文件
├── UpdateLog/             # 更新日志目录
│   └── fingerprint-app-update-log.html  # 指纹验证应用更新日志
├── storage/               # 存储目录
│   └── *.apk              # 应用安装包
├── .well-known/           # 验证文件目录
│   ├── pki-validation/    # PKI验证
│   └── teo-verification/  # TEO验证
├── index.html             # 首页
├── about.html             # 关于页面
├── Works.html             # 作品展示页
├── timetable.html         # 计时器工具页
├── statement.html         # 网站声明页（Markdown渲染）
├── markdown-to-html-tool.html  # Markdown转换工具
├── styleguide.html        # 样式指南
├── 404.html               # 404错误页
├── README.md              # 项目说明
├── QUICKSTART.md          # 快速开始指南
├── REFACTOR.md            # 重构说明
├── SUMMARY.md             # 项目总结
├── project.json           # 项目配置
└── *.md                   # Markdown测试文件
```

## ✨ 核心功能

### 1. 动态渐变背景
- 流畅的渐变色彩动态变化
- 基于时间的主题切换
- 平滑的过渡效果

### 2. 毛玻璃导航栏
- 现代感的半透明效果
- 固定定位，不随页面滚动
- 响应式设计，适配移动端
- 多级导航系统支持

### 3. 卡片悬停效果
- 平滑的提升和阴影变化
- 微交互反馈
- 优雅的动画过渡

### 4. 微交互按钮
- 悬停发光效果
- 点击反馈动画
- 现代化的视觉设计

### 5. 页面元素动画
- 元素依次淡入效果
- 延迟动画控制
- 流畅的用户体验

### 6. 博客系统
- JSON配置管理博客文章
- 支持分类和标签筛选
- 元数据管理（标题、摘要、日期等）
- 易于扩展和维护

### 7. Markdown渲染展示
- 静态Markdown文件渲染
- 可折叠/展开预览功能
- 图片预加载优化
- 数学公式渲染支持
- 代码语法高亮

### 8. Markdown转换工具
- 在线Markdown转HTML
- 实时预览功能
- 支持常用Markdown语法

## 🚀 快速开始

### 1. 克隆或下载项目文件

```bash
# 克隆仓库
git clone https://github.com/Calvin-Xia/mr.xia.git

# 或下载ZIP文件
# 访问 https://github.com/Calvin-Xia/mr.xia/archive/main.zip
```

### 2. 使用本地 Web 服务器

```bash
# 使用Python内置服务器
python -m http.server 8000

# 或使用Node.js
npx serve

# 或使用PHP
php -S localhost:8000
```

### 3. 直接在浏览器中打开

```bash
# 双击 index.html 文件
# 或在浏览器中打开 index.html
```

### 4. 博客系统使用

博客系统采用JSON配置管理，详细使用指南请参考 [blog/README.md](blog/README.md)

- 添加新文章：创建HTML文件并更新JSON配置
- 管理元数据：通过blog-metadata.json管理文章信息
- 分类和标签：支持灵活的分类和标签系统

## 🛠️ 技术栈

- **HTML5** - 语义化标签，结构化内容
- **CSS3** - 现代样式设计，CSS变量，渐变，动画
- **JavaScript (ES6+)** - 模块化开发，异步处理
- **Markdown** - marked.js解析，KaTeX数学公式，highlight.js代码高亮
- **JSON** - 博客系统配置和数据管理
- **原生DOM API** - 无框架依赖，轻量高效

## 📝 更新日志

### v2.0.0 (2025)

- ✨ 重构整体结构
- ✨ 统一视觉风格
- ✨ 优化响应式布局
- ✨ 增加动画效果
- ✨ 模块化 JavaScript 开发

### v1.0.0 (2024)

- ✅ 基础页面搭建
- ✅ 核心功能实现

## 📞 联系方式

- GitHub: [@Calvin-Xia](https://github.com/Calvin-Xia)
- 项目地址: https://github.com/Calvin-Xia/mr.xia

## 📄 开源协议

本项目采用 MIT 开源协议

---

Made with ❤️ by Mr.Xia
