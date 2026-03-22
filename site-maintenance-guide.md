# 站点维护与界面更新说明

这份文档描述 Phase 1 完成后，站点各个界面应该如何更新，以及哪些内容会自动同步到首页和搜索页。

## 一句话理解现在的结构

- 原始内容源分两组：
  - 博客文章：`blog/blog-metadata.json`、`blog/blog-files.json`
  - 其他内容：`content/works-metadata.json`、`content/tools-metadata.json`、`content/update-logs-metadata.json`
- 统一索引输出：`content/content-manifest.json`
- 前端消费方式：
  - `index.html` 用 manifest 渲染“最近更新”
  - `statement.html` 用 manifest 做搜索，但只搜索 `article / work / tool`

## 先记住这 4 个命令

在仓库根目录运行：

```bash
python scripts/content_pipeline.py validate-blog
python scripts/content_pipeline.py generate-manifest
python scripts/content_pipeline.py check
python scripts/content_pipeline.py add
```

- `validate-blog`
  - 只检查博客双 JSON 是否一致、字段是否完整、文章文件是否存在。
- `generate-manifest`
  - 重新汇总所有内容源，生成 `content/content-manifest.json`。
- `check`
  - 先校验博客，再生成 manifest。
- `add`
  - 通过控制台交互新增一条内容，并自动写回对应 JSON。

## 各页面现在是怎么联动的

- 首页 `index.html`
  - “最近更新”来自 `content/content-manifest.json`
  - 会显示文章、作品、更新日志；不足时才用工具补位
- 文章页 `statement.html`
  - 默认显示文章列表
  - 搜索时会搜索文章、作品、工具
  - 更新日志不会出现在搜索结果里
- 作品页 `Works.html`
  - 作品条目本身仍然手动维护页面内容
  - 但作品是否能被首页/搜索正确跳转，取决于 metadata 里的 `filePath`
- 工具页 `timetable.html`、`markdown-to-html-tool.html`
  - 页面内容仍然手动维护
  - 是否能被搜索命中，取决于 `content/tools-metadata.json`
- 更新日志页 `UpdateLog/*.html`
  - 页面内容仍然手动维护
  - 是否出现在首页最近更新，取决于 `content/update-logs-metadata.json`

## 最常见的 4 种更新方式

### 1. 新增文章

1. 先在 `blog/` 下新建文章 HTML。
2. 运行：

```bash
python scripts/content_pipeline.py add
```

3. 选择 `article`。
4. 按提示填写标题、摘要、日期、标签、分类、`filePath`。
5. 脚本会自动写入：
   - `blog/blog-metadata.json`
   - `blog/blog-files.json`
6. 写入完成后会自动跑一次 `check`。

结果：

- `statement.html` 默认文章列表会出现这篇文章
- 首页最近更新可能会出现这篇文章
- 全站搜索可以搜到这篇文章

### 2. 新增作品

1. 先把作品卡片加到 `Works.html`。
2. 给卡片补一个稳定锚点，例如：

```html
<div id="work-your-project" class="card project-card">
```

3. 运行：

```bash
python scripts/content_pipeline.py add
```

4. 选择 `work`，把 `filePath` 填成类似 `Works.html#work-your-project`。
5. 写入后脚本会自动重新校验和生成 manifest。

结果：

- 首页最近更新可能出现这条作品
- `statement.html` 搜索可以搜到这条作品
- 点击结果会直接跳到 `Works.html` 对应卡片

### 3. 新增工具

1. 先在对应页面补好工具入口。
2. 如果工具挂在已有页面里，优先给目标区域一个稳定锚点。
3. 运行：

```bash
python scripts/content_pipeline.py add
```

4. 选择 `tool`，填写 `filePath`，例如：
   - `timetable.html#timer`
   - `timetable.html#random-selector`
   - `markdown-to-html-tool.html`

结果：

- `statement.html` 搜索可以搜到这条工具
- 首页最近更新只有在主要内容不足时才会用工具补位

### 4. 新增更新日志

1. 先写好 `UpdateLog/` 下的更新日志页面。
2. 运行：

```bash
python scripts/content_pipeline.py add
```

3. 选择 `update-log`。
4. 填写标题、摘要、日期和 `filePath`。

结果：

- 首页最近更新可以显示更新日志
- `statement.html` 搜索不会返回更新日志

## 如果你只是在改现有内容

### 改文章文案

- 只改文章 HTML：改完后建议跑一次 `python scripts/content_pipeline.py validate-blog`
- 如果标题、摘要、日期、标签、分类变了：要同步改 `blog/blog-metadata.json`
- 如果文章文件路径变了：要同步改 `blog/blog-files.json`

### 改作品文案或卡片样式

- 直接改 `Works.html`
- 如果标题、摘要、日期、标签、锚点、跳转路径有变化，也要同步改 `content/works-metadata.json`
- 改完后跑：

```bash
python scripts/content_pipeline.py generate-manifest
```

### 改工具说明或入口

- 直接改 `timetable.html` 或 `markdown-to-html-tool.html`
- 如果标题、摘要、标签、锚点、路径有变化，也要同步改 `content/tools-metadata.json`
- 改完后跑：

```bash
python scripts/content_pipeline.py generate-manifest
```

### 改更新日志页面

- 直接改 `UpdateLog/*.html`
- 如果标题、摘要、日期、路径有变化，也要同步改 `content/update-logs-metadata.json`
- 改完后跑：

```bash
python scripts/content_pipeline.py generate-manifest
```

## 哪些界面是自动更新的

- 自动更新：
  - 首页最近更新
  - 文章页搜索结果
  - 文章页默认文章列表中的 metadata 展示
- 不自动更新：
  - `Works.html` 里的卡片正文
  - `timetable.html`、`markdown-to-html-tool.html` 里的工具内容
  - `UpdateLog/*.html` 的日志正文

换句话说，metadata 负责“被索引、被展示、被跳转”，页面 HTML 负责“具体长什么样、写了什么”。

## 推荐的日常维护流程

### 新增内容时

1. 先改页面 HTML。
2. 再运行 `python scripts/content_pipeline.py add` 写 metadata。
3. 本地检查：

```bash
python scripts/content_pipeline.py check
python -m http.server 3001
```

4. 打开：
   - `http://localhost:3001/index.html`
   - `http://localhost:3001/statement.html`

### 只改 metadata 时

1. 手动改对应 JSON。
2. 运行：

```bash
python scripts/content_pipeline.py generate-manifest
```

3. 刷新首页和文章页确认结果。

## 写 metadata 时的约定

- `date` 必须是 `YYYY-MM-DD`
- `tags` 必须是字符串数组
- `filePath` 使用站内相对路径，必要时带锚点
- `externalUrl` 只是补充信息，不作为站内主跳转入口
- `id` 必须唯一

## 现在最关键的维护认知

- 想让内容出现在首页最近更新或文章页搜索里，核心不是只改页面，而是要让对应 metadata 正确进入 manifest。
- 想让用户点进去的位置准确，核心不是只填页面名，而是要给目标区域一个稳定锚点。
- 更新日志目前保留在首页最近更新里，但不参与搜索。
