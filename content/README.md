# Content Hub 维护说明

Phase 1 为站点增加了一层统一内容数据层，用来驱动首页最近更新和文章页的全站搜索。

更完整的站点维护流程见 [site-maintenance-guide.md](../site-maintenance-guide.md)。

## 数据源

- 博客文章
  - `blog/blog-metadata.json`
  - `blog/blog-files.json`
- 作品 metadata
  - `content/works-metadata.json`
- 工具 metadata
  - `content/tools-metadata.json`
- 更新日志 metadata
  - `content/update-logs-metadata.json`
- 统一索引输出
  - `content/content-manifest.json`

## 常用命令

在仓库根目录运行：

```bash
python scripts/content_pipeline.py validate-blog
python scripts/content_pipeline.py generate-manifest
python scripts/content_pipeline.py check
python scripts/content_pipeline.py add
```

- `validate-blog`
  - 校验博客双文件的一致性、路径存在性、必填字段和日期格式。
- `generate-manifest`
  - 读取博客 metadata 和三份侧边 JSON，生成统一索引 `content/content-manifest.json`。
- `check`
  - 先执行博客校验，再生成 manifest，适合在发布前快速检查。
- `add`
  - 通过控制台交互录入新内容，并自动写回对应源 JSON。

## 新增内容的维护流程

### 新增文章

1. 先在 `blog/` 下创建文章 HTML 文件。
2. 运行 `python scripts/content_pipeline.py add`。
3. 选择 `article`，按提示输入标题、摘要、日期、标签、分类和 `filePath`。
4. 脚本会同时更新：
   - `blog/blog-metadata.json`
   - `blog/blog-files.json`
5. 写入后脚本会自动执行一次 `check`。

### 新增作品 / 工具 / 更新日志

1. 先确认站内页面已经存在可跳转入口。
2. 如果内容挂在已有页面下，优先给目标卡片或区域补稳定锚点，再把 `filePath` 指向该锚点。
3. 运行 `python scripts/content_pipeline.py add`。
4. 根据内容类型，脚本会写入：
   - `work` -> `content/works-metadata.json`
   - `tool` -> `content/tools-metadata.json`
   - `update-log` -> `content/update-logs-metadata.json`
5. 写入后脚本会自动执行一次 `check`。

## 什么时候运行校验

- 新增或修改文章后，至少运行一次 `python scripts/content_pipeline.py check`
- 调整作品、工具、更新日志 metadata 后，至少运行一次 `python scripts/content_pipeline.py generate-manifest`
- 正式预览或发布前，建议统一运行一次 `check`

## 首页和搜索依赖关系

- 首页最近更新模块读取 `content/content-manifest.json`
- `statement.html` 的全站搜索入口也读取 `content/content-manifest.json`
- 搜索范围当前仅包含 `article / work / tool`，不会返回 `update-log`
- `update-log` 仍然会进入统一 manifest，因此首页最近更新依然可以展示更新日志
- 因此任何内容源改动后，都需要重新生成 manifest，避免首页和搜索结果不同步

## 维护约定

- `filePath` 应始终使用站点根目录相对路径，必要时可带锚点，如 `Works.html#work-fingerprint-app`
- `externalUrl` 仅作为补充信息保存在 metadata 中；首页最近更新和站内搜索统一优先使用 `filePath`
- `date` 一律使用 `YYYY-MM-DD`
- `tags` 一律使用字符串数组
