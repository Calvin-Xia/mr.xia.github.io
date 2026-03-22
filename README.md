# Mr.Xia 个人网站

这是一个静态个人站点仓库，当前用于维护首页、作品页、工具页、文章页，以及一套基于 JSON 的内容索引。

站点不依赖构建工具。页面由 HTML、CSS、原生 JavaScript 组成；内容索引和发布辅助流程由 Python 脚本维护。

如果你是第一次接手这个仓库，建议先看 [QUICKSTART.md](./QUICKSTART.md)，再按需要查看 [site-maintenance-guide.md](./site-maintenance-guide.md)。

## 当前结构

```text
mr.xia.github.io/
├── index.html                    # 首页
├── about.html                    # 关于页
├── Works.html                    # 作品页
├── timetable.html                # 工具页
├── statement.html                # 文章页 / 全站搜索入口
├── markdown-to-html-tool.html    # Markdown 转 HTML 工具
├── 404.html                      # 404 页面
├── css/
│   └── style.css                 # 全站样式
├── js/
│   ├── main.js                   # 通用交互
│   ├── navigation.js             # 页面导航
│   └── content-hub.js            # 最近更新与全站搜索逻辑
├── blog/
│   ├── blog-files.json           # 文章文件索引
│   ├── blog-metadata.json        # 文章元数据
│   └── *.html                    # 文章内容页
├── content/
│   ├── works-metadata.json       # 作品元数据
│   ├── tools-metadata.json       # 工具元数据
│   ├── update-logs-metadata.json # 更新日志元数据
│   ├── content-manifest.json     # 统一内容索引
│   └── README.md                 # 内容层说明
├── scripts/
│   └── content_pipeline.py       # 校验、索引生成、交互式录入
├── UpdateLog/                    # 更新日志页面
├── storage/                      # 图片、下载文件等静态资源
├── QUICKSTART.md                 # 快速开始
├── site-maintenance-guide.md     # 全站维护说明
└── AGENTS.md                     # 仓库协作约定
```

## 本地预览

推荐始终通过本地服务器预览，避免 `fetch` 读取 JSON 时受到 `file://` 限制。

```bash
python -m http.server 3001
```

然后访问：

- `http://localhost:3001/index.html`
- `http://localhost:3001/statement.html`

如果你只想快速检查静态布局，也可以直接打开 HTML 文件，但文章页和内容搜索不建议在 `file://` 环境下验证。

如果你刚修改了 `js/content-hub.js`、`content/content-manifest.json`，但浏览器里还是旧结果，先做一次强制刷新。必要时可以同步调整 `index.html` 和 `statement.html` 中 `js/content-hub.js?v=...` 的版本戳。

## 常用命令

内容维护相关命令都在仓库根目录执行：

```bash
python scripts/content_pipeline.py validate-blog
python scripts/content_pipeline.py generate-manifest
python scripts/content_pipeline.py check
python scripts/content_pipeline.py add
```

- `validate-blog`
  - 校验 `blog/blog-files.json` 与 `blog/blog-metadata.json` 的一致性、字段完整性和文件路径。
- `generate-manifest`
  - 汇总文章、作品、工具、更新日志 metadata，生成 `content/content-manifest.json`。
- `check`
  - 先校验博客，再重新生成 manifest。
- `add`
  - 通过控制台交互新增一条内容，并写回对应 JSON。

## 页面与数据关系

- `index.html`
  - 展示站点首页
  - “最近更新”读取 `content/content-manifest.json`
- `statement.html`
  - 默认展示文章列表
  - 站内搜索会搜索文章、作品、工具
  - 更新日志不会出现在搜索结果里
- `Works.html`
  - 作品卡片内容手动维护
  - 是否能被首页和搜索正确跳转，取决于 `content/works-metadata.json` 中的 `filePath`
- `timetable.html` / `markdown-to-html-tool.html`
  - 工具内容手动维护
  - 是否能被搜索命中，取决于 `content/tools-metadata.json`
- `UpdateLog/*.html`
  - 更新日志页面手动维护
  - 是否进入首页最近更新，取决于 `content/update-logs-metadata.json`

## 日常维护建议

### 新增文章

1. 在 `blog/` 下创建文章 HTML。
2. 运行 `python scripts/content_pipeline.py add`。
3. 选择 `article` 并填写字段。
4. 写入后脚本会自动执行一次 `check`。

### 新增作品或工具

1. 先在对应 HTML 页面补好实际内容。
2. 如果内容挂在现有页面中，优先补稳定锚点。
3. 运行 `python scripts/content_pipeline.py add`。
4. 选择 `work` 或 `tool`，把 `filePath` 指向具体页面或锚点。

### 新增更新日志

1. 在 `UpdateLog/` 下创建或更新日志页面。
2. 运行 `python scripts/content_pipeline.py add`。
3. 选择 `update-log`。

### 修改 metadata 后

如果你是手动修改 JSON，而不是通过 `add` 命令录入，至少再执行一次：

```bash
python scripts/content_pipeline.py generate-manifest
```

## 推荐验证流程

在提交或发布前，建议至少做一轮本地检查：

```bash
python scripts/content_pipeline.py check
python -m http.server 3001
```

重点确认：

- 首页最近更新是否正常
- `statement.html` 默认文章列表是否正常
- 搜索是否能命中文章、作品、工具
- 清空搜索后是否恢复文章视图
- 浏览器控制台没有新增错误
- 如果结果看起来仍是旧内容，先强制刷新再复查

## 相关说明文档

- [QUICKSTART.md](./QUICKSTART.md)
- [content/README.md](./content/README.md)
- [site-maintenance-guide.md](./site-maintenance-guide.md)
- [blog/README.md](./blog/README.md)
- [AGENTS.md](./AGENTS.md)

## 仓库说明

- 这是静态站点仓库，不需要打包构建。
- 修改页面样式时，优先复用 `css/style.css` 中已有变量和结构。
- 修改文章内容时，要注意 `blog/blog-files.json` 和 `blog/blog-metadata.json` 保持一致。
- 修改作品、工具、更新日志相关入口时，要注意同步更新对应 metadata 和 manifest。
- 仓库已配置内容一致性检查，提交或发起 PR 时会运行 `python scripts/content_pipeline.py check` 并校验 `content/content-manifest.json` 是否已同步更新。
