# Tasks

- [x] Task 4.1: 删除旧页面文件
  - [x] SubTask 4.1.1: 删除根目录 HTML 文件：`index.html`, `about.html`, `Works.html`, `timetable.html`, `statement.html`, `404.html`, `styleguide.html`, `markdown-to-html-tool.html`
  - [x] SubTask 4.1.2: 删除 `blog/` 目录中的旧 HTML 文件（6 篇 `*.html`）
  - [x] SubTask 4.1.3: 删除 `blog/convert.py`
  - [x] SubTask 4.1.4: 删除 `blog/blog-files.json` 和 `blog/blog-metadata.json`
  - [x] SubTask 4.1.5: 保留 `blog/` 目录中的说明文件（`README.md`、`移动端适配说明.md`）和 `blog-files-example.json`、`blog-metadata-example.json`（作为参考）

- [x] Task 4.2: 删除旧资源目录
  - [x] SubTask 4.2.1: 删除 `css/` 目录（`style.css` 已迁移为 `src/styles/global.css`）
  - [x] SubTask 4.2.2: 删除 `js/` 目录（`main.js`, `navigation.js`, `content-hub.js`, `cdn-fallback.js` 已拆分迁移）
  - [x] SubTask 4.2.3: 删除 `content/` 目录（JSON 元数据已迁移为内容集合）
  - [x] SubTask 4.2.4: 删除 `scripts/content_pipeline.py`（已由 Astro 内容集合替代；Node.js 发布脚本保留）
  - [x] SubTask 4.2.5: 删除 `UpdateLog/` 目录（内容已迁移到 `src/content/updates/` 和 `src/pages/updates/[...slug].astro`）
  - [x] SubTask 4.2.6: 清理 `libs/` 目录：删除 `marked/`, `highlight.js/`, `katex/`, `dompurify/`子目录（已改为 npm），保留 `mammoth/` 子目录

- [x] Task 4.3: 创建旧 URL 重定向文件
  - [x] SubTask 4.3.1: 在 `public/` 下创建 `about.html`，内容为 `<meta http-equiv="refresh" content="0;url=/about/">`
  - [x] SubTask 4.3.2: 创建 `public/Works.html` → `/works/`
  - [x] SubTask 4.3.3: 创建 `public/timetable.html` → `/works/tools/`
  - [x] SubTask 4.3.4: 创建 `public/statement.html` → `/articles/`
  - [x] SubTask 4.3.5: 创建 `public/markdown-to-html-tool.html` → `/markdown-tool/`
  - [x] SubTask 4.3.6: 创建 `public/styleguide.html` → `/styleguide/`
  - [x] SubTask 4.3.7: 在 `public/blog/` 下为每篇旧文章创建重定向 HTML（6 个文件）
  - [x] SubTask 4.3.8: 创建 `public/UpdateLog/fingerprint-app-update-log.html` → `/updates/fingerprint-app-update-log/`
  - [x] SubTask 4.3.9: 每个重定向文件包含规范 `<link rel="canonical">` 指向新 URL

- [x] Task 4.4: 更新 CI/CD 并创建部署 Workflow
  - [x] SubTask 4.4.1: 修改 `.github/workflows/content-check.yml`
  - [x] SubTask 4.4.2: 移除 `python scripts/content_pipeline.py check` 步骤
  - [x] SubTask 4.4.3: 添加 `npm ci` 和 `npm run build` 步骤
  - [x] SubTask 4.4.4: 构建失败时 workflow 标记为 failed
  - [x] SubTask 4.4.5: 创建 `.github/workflows/deploy.yml`
  - [x] SubTask 4.4.6: deploy.yml 流程：`checkout` → `setup-node`(22) → `npm ci` → `npm run build` → `upload-pages-artifact`(dist/) → `deploy-pages`
  - [x] SubTask 4.4.7: deploy.yml 仅在 `push` 到 `main` 分支时触发部署
  - [x] SubTask 4.4.8: `astro.config.mjs` 已通过 `process.env.BASE_URL` 配置生产域名，无需额外改动
  - [ ] SubTask 4.4.9: 在 GitHub 仓库 Settings → Pages 中将 Source 切换为 "GitHub Actions"（需手动操作）

- [x] Task 4.5: 更新文档
  - [x] SubTask 4.5.1: 更新 `README.md`：反映 Astro 工作流（`npm run dev` / `npm run build`）
  - [x] SubTask 4.5.2: 更新 `QUICKSTART.md`：移除旧 pipeline 引用
  - [x] SubTask 4.5.3: 更新 `site-maintenance-guide.md`：移除旧 pipeline 引用
  - [x] SubTask 4.5.4: 更新 `AGENTS.md`：移除 legacy 引用，同步当前项目结构
  - [x] SubTask 4.5.5: 修复 `tests/phase-2-content.test.js` 中对已删除 JSON 文件的引用

- [x] Task 4.6: 最终验证
  - [x] SubTask 4.6.1: 执行 `npm run build`，确认零错误零警告
  - [x] SubTask 4.6.2: 检查 `dist/` 目录文件结构完整（17 页 + 重定向文件均已输出）
  - [ ] SubTask 4.6.3: 使用 `npm run preview` 本地遍历所有页面（需浏览器验证）
  - [ ] SubTask 4.6.4: 逐页视觉对比（首页、关于、作品、工具、文章列表、文章详情、404、样式指南、Markdown工具）（需浏览器验证）
  - [ ] SubTask 4.6.5: 验证所有内部链接指向正确的新 URL（需浏览器验证）
  - [ ] SubTask 4.6.6: 检查浏览器控制台无 JS 错误（需浏览器验证）
  - [ ] SubTask 4.6.7: Google Lighthouse 可访问性审计 ≥ 当前分数（需浏览器验证）

# Task Dependencies
- [Task 4.1 ~ 4.3] 可与 [Task 4.6] 并行，但必须先完成 Phase 0-3
- [Task 4.4] depends on [Task 4.1, Task 4.2]
- [Task 4.5] depends on [Task 4.1, Task 4.2]
- [Task 4.6] depends on [Task 4.1 ~ 4.5]
