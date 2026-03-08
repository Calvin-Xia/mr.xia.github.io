# 🚀 快速开始指南

## 📁 文件说明

### 主要文件
- `index.html` - 网站首页
- `about.html` - 关于本站
- `Works.html` - 作品展示页
- `timetable.html` - 工具页（计时器等）
- `statement.html` - 文章列表页
- `markdown-to-html-tool.html` - Markdown 转 HTML 工具
- `styleguide.html` - 当前主题样式示例
- `404.html` - 404 错误页

### 资源文件
- `css/style.css` - 统一样式表与主题变量
- `js/main.js` - 主脚本文件
- `js/navigation.js` - 页面导航脚本
- `blog/blog-metadata.json` - 文章元数据
- `blog/blog-files.json` - 文章文件索引

### 配置文件
- `README.md` - 项目说明
- `QUICKSTART.md` - 快速开始指南
- `AGENTS.md` - 仓库协作说明
- `project.json` - 项目配置
- `.gitignore` - Git 忽略规则

## 🎯 本地预览

推荐始终使用本地服务器预览。`statement.html` 会通过 `fetch('blog/blog-metadata.json')` 读取文章元数据，在 `file://` 环境下通常无法正常工作。

### 方法一：使用本地服务器（推荐）

#### Python 3
```bash
python -m http.server 8000
```

#### Node.js (需要安装 http-server)
```bash
npx http-server -p 8000
```

#### VS Code Live Server
1. 安装 "Live Server" 扩展
2. 在编辑器中右键点击 `index.html`
3. 选择 "Open with Live Server"

然后在浏览器中访问：`http://localhost:8000`

### 方法二：直接打开（仅限快速查看静态布局）
可以直接双击 `index.html` 检查纯静态内容，但文章页、搜索和依赖 JSON 数据的功能不建议在 `file://` 环境下验证。

## 📄 页面说明

- **首页** - `index.html`
  - 网站介绍
  - 快速导航
  - 实时时间显示

- **关于** - `about.html`
  - 版权声明
  - 隐私政策
  - 联系方式

- **作品** - `Works.html`
  - 个人作品展示
  - 项目介绍

- **工具** - `timetable.html`
  - 在线计时器
  - 其他实用工具

- **文章** - `statement.html`
  - 博客文章列表
  - 分类与标签筛选
  - 搜索与跳转

- **样式指南** - `styleguide.html`
  - 当前主题颜色
  - 组件与间距参考

## 🎨 自定义修改

### 修改颜色主题
编辑 `css/style.css` 中的 CSS 变量：

```css
:root {
    --primary-color: #f97316;      /* 主色 */
    --primary-dark: #ea580c;       /* 主色深色 */
    --primary-light: #fb923c;      /* 主色浅色 */
    --secondary-color: #fb7185;    /* 辅色 */
    --accent-color: #34d399;       /* 强调色 */
    --background-color: #fef7ed;   /* 页面背景色 */
}
```

### 修改网站内容
直接编辑对应 HTML 文件即可。

### 添加新页面
1. 复制 `index.html` 作为模板
2. 修改内容
3. 在导航菜单中添加链接

## 💻 推荐开发工具

- **VS Code** - 代码编辑器
- **Live Server** - 实时预览
- **Chrome DevTools** - 调试工具

## ❓ 常见问题

**Q: 样式没有生效？**
A: 检查 `css/style.css` 文件路径是否正确。

**Q: JavaScript 功能不工作？**
A: 检查浏览器控制台是否有错误，确保 `js/main.js` 正确加载。

**Q: 文章页加载失败？**
A: 请使用本地服务器访问。`statement.html` 依赖 `blog/blog-metadata.json`，直接用 `file://` 打开时通常无法被 `fetch` 正常读取。

**Q: 部署后页面无法访问？**
A: 确保文件上传到正确的目录，根目录或 `public_html` / `www` 目录。

## 🚀 部署选项

### GitHub Pages
1. 推送代码到 GitHub
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支

### Netlify / Vercel
1. 连接 GitHub 仓库
2. 自动构建部署

### 传统主机
直接上传所有文件到 `public_html` 或 `www` 目录。

## 📝 使用建议

1. 所有页面共享同一套 CSS 文件。
2. 开发时建议使用本地服务器。
3. 响应式设计支持移动端。
4. 尽量使用现代浏览器。

---

🎨 愉快使用吧！
