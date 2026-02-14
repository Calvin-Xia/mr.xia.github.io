# Mr.Xia - 个人网站

> 简约现代的个人网站，展示作品与创意

## 📋 项目简介

这是一个简约现代的个人作品展示网站项目，主要特点：
- 🎨 **现代设计** - 采用渐变色彩和微交互效果
- 📱 **响应式布局** - 适配各种设备屏幕
- 🏗️ **模块化结构** - 代码组织清晰，易于维护
- ⏰ **实用功能** - 包含计时器、随机选择器等工具
- ✨ **动态效果** - 流畅的页面动画和交互效果
- 🔒 **安全优化** - XSS防护、输入验证

## 📁 项目结构

```
mr.xia.github.io/
├── css/
│   └── style.css              # 统一样式表
├── js/
│   ├── main.js                # 主脚本文件
│   └── navigation.js          # 导航系统脚本
├── blog/                      # 博客系统目录
│   ├── README.md              # 博客使用指南
│   ├── blog-files.json        # 博客文件列表
│   ├── blog-metadata.json     # 博客元数据
│   ├── convert.py             # Markdown转换脚本
│   └── *.html                 # 博客文章HTML文件
├── UpdateLog/                 # 更新日志目录
│   └── fingerprint-app-update-log.html
├── storage/                   # 存储目录
│   ├── Beian.png              # 备案图标
│   └── *.apk                  # 应用安装包
├── .well-known/               # 验证文件目录
│   ├── pki-validation/        # PKI验证
│   └── teo-verification/      # TEO验证
├── index.html                 # 首页
├── about.html                 # 关于页面
├── Works.html                 # 作品展示页
├── timetable.html             # 工具集（计时器、随机选择器）
├── statement.html             # 博客文章列表页
├── markdown-to-html-tool.html # Markdown转换工具
├── styleguide.html            # 样式指南
├── 404.html                   # 404错误页
├── README.md                  # 项目说明
├── QUICKSTART.md              # 快速开始指南
├── AGENTS.md                  # AI代理配置
├── project.json               # 项目配置
└── LICENSE                    # 开源协议
```

## ✨ 核心功能

### 1. 动态渐变背景
- 流畅的渐变色彩动态变化
- 漂浮装饰性圆形动画
- 平滑的过渡效果

### 2. 毛玻璃导航栏
- 现代感的半透明效果
- 固定定位，支持历史导航
- 响应式设计，适配移动端

### 3. 卡片悬停效果
- 平滑的提升和阴影变化
- 微交互反馈
- 优雅的动画过渡

### 4. 工具集
- **在线计时器** - 支持自定义时间、暂停/继续、进度显示
- **随机选择器** - 支持手动输入、文件导入（TXT/MD/DOCX）

### 5. 博客系统
- JSON配置管理博客文章
- 支持分类和标签筛选
- 实时搜索功能
- 元数据管理（标题、摘要、日期等）
- 博客文章使用[Dooc社区 WeChat Markdown Editor](https://github.com/doocs/md)进行转换处理

### 6. Markdown渲染
- 静态Markdown文件渲染
- 数学公式渲染（KaTeX）
- 代码语法高亮（highlight.js）

### 7. 性能优化
- DNS预解析和资源预加载
- CSS动画硬件加速
- 图片懒加载支持

### 8. 安全特性
- XSS输入验证和过滤
- 安全的外部链接处理
- 错误边界和重试机制

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Calvin-Xia/mr.xia.github.io.git
cd mr.xia.github.io
```

### 2. 启动本地服务器

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

### 3. 访问网站

打开浏览器访问 `http://localhost:8000`

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 结构 | HTML5 语义化标签 |
| 样式 | CSS3 变量、渐变、动画、毛玻璃效果 |
| 交互 | JavaScript ES6+ 模块化开发 |
| 解析 | marked.js、KaTeX、highlight.js |
| 文档 | mammoth.js（Word解析） |
| 配置 | JSON 数据管理 |

## 📝 更新日志

### v2.1.0 (2026-02)

- ✨ 添加资源预加载优化
- ✨ 实现XSS安全防护
- ✨ 添加错误重试机制
- ✨ 优化计时器和随机选择器
- 🐛 修复CSS动画重复定义
- 🐛 修复内存泄漏问题
- � 修复导航一致性

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
- 项目地址: https://github.com/Calvin-Xia/mr.xia.github.io

## 📄 开源协议

本项目采用 MIT 开源协议

---

Made with ❤️ by Mr.Xia
