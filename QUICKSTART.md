# 快速开始

这份文档适合第一次接手这个仓库时使用。目标是尽快把站点跑起来，知道常改哪些文件，以及改完后怎么检查。

## 先做什么

1. 打开仓库根目录。
2. 启动本地服务器：

```bash
python -m http.server 3001
```

3. 在浏览器里打开：
   - `http://localhost:3001/index.html`
   - `http://localhost:3001/statement.html`

推荐使用本地服务器预览。`statement.html` 和首页最近更新都依赖 JSON 数据，直接用 `file://` 打开时可能无法正常工作。

如果你刚修改了 `js/content-hub.js` 或 `content/content-manifest.json`，页面却还显示旧结果，先做一次强制刷新。必要时可以同步调整页面里 `js/content-hub.js?v=...` 的版本戳。

## 你最常会改到的文件

- 页面文件
  - `index.html`
  - `about.html`
  - `Works.html`
  - `timetable.html`
  - `statement.html`
  - `markdown-to-html-tool.html`
- 样式和脚本
  - `css/style.css`
  - `js/main.js`
  - `js/navigation.js`
  - `js/content-hub.js`
- 内容数据
  - `blog/blog-files.json`
  - `blog/blog-metadata.json`
  - `content/works-metadata.json`
  - `content/tools-metadata.json`
  - `content/update-logs-metadata.json`
  - `content/content-manifest.json`
- 维护脚本
  - `scripts/content_pipeline.py`

## 常用命令

在仓库根目录运行：

```bash
python scripts/content_pipeline.py validate-blog
python scripts/content_pipeline.py generate-manifest
python scripts/content_pipeline.py check
python scripts/content_pipeline.py add
```

- `validate-blog`
  - 检查文章 HTML、`blog-files.json`、`blog-metadata.json` 是否一致。
- `generate-manifest`
  - 重新生成统一内容索引 `content/content-manifest.json`。
- `check`
  - 先校验博客，再生成 manifest。
- `add`
  - 通过控制台交互新增文章、作品、工具或更新日志 metadata。

## 最常见的修改场景

### 改页面文案或样式

- 直接改对应 HTML 文件或 `css/style.css`
- 改完后刷新浏览器查看结果

### 新增文章

1. 在 `blog/` 下新建文章 HTML。
2. 运行：

```bash
python scripts/content_pipeline.py add
```

3. 选择 `article`。
4. 按提示填写标题、摘要、日期、标签、分类、`filePath`。
5. 写入后脚本会自动执行一次 `check`。

### 新增作品或工具入口

1. 先把实际内容加到对应页面里。
2. 如果需要深链跳转，给目标区域补稳定锚点。
3. 运行：

```bash
python scripts/content_pipeline.py add
```

4. 选择 `work` 或 `tool`。
5. 把 `filePath` 指向页面或锚点，例如 `Works.html#work-example`。

### 手动改了 metadata

如果你直接编辑了 `blog/` 或 `content/` 下的 JSON，改完后至少运行：

```bash
python scripts/content_pipeline.py generate-manifest
```

## 现在页面是怎么联动的

- 首页 `index.html`
  - 显示站点入口和最近更新
  - 最近更新来自 `content/content-manifest.json`
- 文章页 `statement.html`
  - 默认显示文章列表
  - 搜索范围是文章、作品、工具
  - 更新日志不会出现在搜索结果里
- 作品页、工具页、更新日志页
  - 页面正文还是手动维护
  - 是否能被首页或搜索正确展示，取决于对应 metadata 是否正确

## 改完后至少检查这些

1. 首页能正常打开。
2. `statement.html` 默认文章列表正常。
3. 搜索能搜到文章、作品、工具。
4. 清空搜索后能恢复文章视图。
5. 浏览器控制台没有新增错误。
6. 如果结果像是旧缓存，先强制刷新再判断。

## 常见问题

### 页面能打开，但文章或搜索没内容

通常是因为：

- 没有通过本地服务器访问
- `content/content-manifest.json` 没有重新生成
- metadata 改了，但没有同步到正确的 JSON 文件

先运行：

```bash
python scripts/content_pipeline.py check
```

### 新增的作品或工具点进去位置不对

通常是 `filePath` 只写了页面名，没有写到具体锚点。优先给目标卡片或区域补 `id`，再把 `filePath` 改成带 `#anchor` 的形式。

### 文章新增后首页没变化

首页最近更新读取的是 manifest，不是直接读取 `blog/blog-metadata.json`。如果没有重新生成 manifest，首页不会同步更新。

### 我已经重新生成 manifest，但页面还是旧的

先强制刷新浏览器。如果还是旧内容，再检查 `index.html` 和 `statement.html` 中 `js/content-hub.js?v=...` 的版本戳是否需要更新。

## 接下来该看哪份文档

- 想先快速跑起来：看当前这份 `QUICKSTART.md`
- 想了解完整维护流程：看 [site-maintenance-guide.md](./site-maintenance-guide.md)
- 想看内容层规则：看 [content/README.md](./content/README.md)
- 想看博客维护说明：看 [blog/README.md](./blog/README.md)
