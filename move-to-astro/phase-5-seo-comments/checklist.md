# Phase 5 Code Review Checklist

## RSS Feed
- [x] `/rss.xml` 在 `npm run dev` 下可访问并返回有效 XML
- [x] `npm run build` 后 `dist/rss.xml` 存在且包含所有非草稿文章
- [x] RSS XML 中每篇文章包含 title、link、description、pubDate
- [x] `status: "draft"` 文章不出现在 feed 中
- [x] RSS XML 的 `<link>` 和 `<atom:link>` 使用 canonical domain
- [x] `@astrojs/rss` 已添加为 `package.json` 的 dependency
- [x] `rss.xml.ts` 的 `GET(context)` 使用 `APIContext` 类型标注
- [x] `BaseLayout.astro` `<head>` 包含 RSS auto-discovery `<link rel="alternate">`

## Sitemap
- [x] `npm run build` 后 `dist/sitemap-index.xml` 和 `dist/sitemap-0.xml` 存在
- [x] Sitemap 包含所有公开文章、作品、工具、更新日志页面 URL
- [x] Sitemap 不包含 `/new-post/`、`/404` 页面
- [x] Sitemap URL 使用 canonical domain（`https://calvin-xia.cn`）
- [x] `@astrojs/sitemap` 已添加为 `package.json` 的 dependency
- [x] sitemap filter 使用 `endsWith('/404')` 精确匹配，非 `includes`
- [x] Footer 中 sitemap 链接用 `import.meta.env.PROD` 条件渲染

## giscus 评论区
- [x] 文章详情页正文下方显示 giscus 评论区
- [x] 评论区宽度与正文对齐（`var(--article-content-width)`），移动端有 1rem padding
- [x] 评论区与正文/TOC/页脚之间间距合理，无重叠
- [x] 评论区跟随系统 `prefers-color-scheme` 切换亮/暗主题
- [x] 不同文章路径各自对应独立讨论（pathname mapping）
- [x] 首次访问时 giscus 自动创建 GitHub Discussion（需授权）
- [x] giscus `<script>` 使用 `is:inline` 指令，防止 Astro 构建处理
- [x] JS 禁用时 `<noscript>` 显示降级提示，正文不受影响
- [x] giscus 加载失败时页面无报错、不阻塞其他功能
- [x] 评论区在文章切换（View Transitions）后重新加载
- [x] `data-input-position` 设置为 `top`

## 页脚
- [x] Footer 包含 RSS 和 Sitemap 链接（nav 区域，备案号上方）
- [x] Sitemap 链接在 dev 模式下隐藏，build 模式下可见

## 自动化与构建
- [x] `npm test` 通过（97 tests, 0 failures）
- [x] `npm run build` 通过且无新增警告/错误
- [x] 桌面端和移动端浏览器验证均通过
- [x] Phase 5 文档状态已更新
