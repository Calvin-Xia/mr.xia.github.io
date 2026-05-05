# Tasks

- [x] Task 5.1: RSS Feed 生成
  - [x] SubTask 5.1.1: 安装 `@astrojs/rss` 为 npm 依赖
  - [x] SubTask 5.1.2: 创建 `src/pages/rss.xml.ts`，从 `blog` 集合生成 RSS 2.0 XML
  - [x] SubTask 5.1.3: 配置 site、title、description，排除 `status: "draft"` 文章
  - [x] SubTask 5.1.4: 验证 `npm run dev` 下 `http://localhost:4321/rss.xml` 可访问且 XML 格式正确
  - [x] SubTask 5.1.5: 验证 `npm run build` 后 `dist/rss.xml` 存在且内容完整

- [x] Task 5.2: Sitemap 自动生成
  - [x] SubTask 5.2.1: 安装 `@astrojs/sitemap` 为 npm 依赖
  - [x] SubTask 5.2.2: 在 `astro.config.mjs` 中注册 `sitemap()` 集成
  - [x] SubTask 5.2.3: 配置 `filter` 排除 `/new-post/`、`/404` 等页面
  - [x] SubTask 5.2.4: 验证 `npm run build` 后 `dist/sitemap-index.xml` 和 `dist/sitemap-0.xml` 存在
  - [x] SubTask 5.2.5: 验证 sitemap 包含所有文章/作品/工具/更新日志页面 URL，且使用正确的 canonical domain

- [x] Task 5.3: giscus 评论区组件
  - [x] SubTask 5.3.1: 创建 `src/components/GiscusComments.astro`，输出 giscus `<div>` + `<script>` 标签
  - [x] SubTask 5.3.2: 配置所有 `data-*` 属性（repo、repo-id、category、mapping、theme、lang 等，`data-input-position="top"`）
  - [x] SubTask 5.3.3: 在 `articles/[...slug].astro` 的 `</article>` 前插入 `<GiscusComments />`
  - [x] SubTask 5.3.4: 添加 CSS 样式（`.giscus-comments`、`.giscus-fallback`），移动端不溢出
  - [x] SubTask 5.3.5: 浏览器验证评论区在桌面端和移动端正确加载，亮/暗主题自动切换
  - [x] SubTask 5.3.6: 验证 JS 禁用时 `<noscript>` 降级提示正常显示

- [x] Task 5.4: 集成、验证与文档
  - [x] SubTask 5.4.1: 运行 `npm test` 确保既有测试全部通过
  - [x] SubTask 5.4.2: 运行 `npm run build` 确保构建无新增警告/错误
  - [x] SubTask 5.4.3: 浏览器验证文章页评论区、RSS XML、sitemap XML 均正常
  - [x] SubTask 5.4.4: 更新 Phase 5 checklist 和迁移 README 状态

- [x] Task 5.5: Code Review 修订（2026-05-04）
  - [x] SubTask 5.5.1: `is:inline` — GiscusComments.astro script 标签添加 `is:inline` 指令
  - [x] SubTask 5.5.2: `<noscript>` — GiscusComments.astro 添加 JS 禁用降级提示 + `.giscus-fallback` CSS
  - [x] SubTask 5.5.3: `APIContext` — rss.xml.ts 的 `GET(context)` 添加类型标注
  - [x] SubTask 5.5.4: `endsWith` — sitemap filter 从 `includes('/404')` 改为 `endsWith('/404')`
  - [x] SubTask 5.5.5: RSS auto-discovery — BaseLayout.astro `<head>` 添加 `<link rel="alternate" type="application/rss+xml">`
  - [x] SubTask 5.5.6: Footer — sitemap 链接用 `import.meta.env.PROD` 条件渲染，dev 模式隐藏
  - [x] SubTask 5.5.7: 评论区间距优化 — `width: min(100%, var(--article-content-width))`，`margin-block: 4rem 2rem`
  - [x] SubTask 5.5.8: 测试覆盖 — 新增 8 个测试覆盖所有 code review 修订项（7→15 tests）
  - [x] SubTask 5.5.9: 全量验证 — `npm test` 97 tests, 0 failures; `npm run build` 通过

# Task Dependencies

- [Task 5.1] 和 [Task 5.2] 独立，可并行实施
- [Task 5.3] 独立于 [Task 5.1] 和 [Task 5.2]
- [Task 5.4] 依赖所有前置任务
- [Task 5.5] 在 5.4 完成后进行，所有子任务均已完成
