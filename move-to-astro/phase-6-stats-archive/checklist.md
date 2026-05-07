# Phase 6 Code Review Checklist

## 字数统计与阅读时间
- [x] `src/lib/word-count.js` 导出 `computeReadingStats(body)` 函数
- [x] 中文纯文本：字符数 = 非空白中文字符数（不含标点）
- [x] 英文纯文本：单词数按空格/标点拆分统计
- [x] 中英混合文本：中文字符 + 英文单词分别统计后合计
- [x] `formatReadTime` 返回值："< 1 分钟" / "X 分钟" / "X 小时 Y 分钟" 三种格式
- [x] `formatWordCount` 返回值："约 X,XXX 字"（千位逗号）
- [x] Markdown 语法（`#`、`**`、`[link]()`）在统计前被剔除
- [x] HTML 标签（`<div>`、`&emsp;` 等）在统计前被剔除
- [x] 图片链接（`![](url)`）和代码块被正确过滤
- [x] 空内容返回 `{ characters: 0, wordCount: 0, readTimeMinutes: 0, display: "< 1 分钟" }`
- [x] 文章列表卡片展示字数和阅读时间（在日期旁）
- [x] 详情页 meta 区展示字数和阅读时间
- [x] frontmatter 手动 `readTime` > 自动计算值（优先显示手动值）
- [x] 手动 `readTime` 与自动计算值同时存在时，仅显示手动值
- [x] 不修改已有 `readTime` frontmatter 文件的内容

## 归档页时间线
- [x] `/articles/archive/` 页面可访问，返回 200
- [x] 文章按年份分组，年份从新到旧排列
- [x] 每组内文章按日期从新到旧排列
- [x] 每条条目显示日期（MM-DD）、标题（可点击）、分类标签
- [x] 标题链接指向 `/articles/{slug}/`
- [x] 所有非草稿文章均出现，无遗漏
- [x] 空年份不显示
- [x] `/articles/` 页面有 "文章归档" 入口链接
- [x] 归档入口在移动端可见且可点击
- [x] 时间线在桌面端和移动端均完整显示、不溢出
- [x] 时间线样式与站点整体设计风格一致

## SPA 增强过渡
- [x] 列表 → 详情：有方向性过渡动画（非通用 fade）
- [x] 详情 → 列表：有反向动画
- [x] 列表页滚动位置在返回时恢复（无页面顶部跳动）
- [x] 搜索/过滤状态在返回列表时保持（若通过 URL params 实现）
- [x] 浏览器前进/后退按钮过渡正常
- [x] `prefers-reduced-motion: reduce` 时动画关闭
- [x] 不支持 View Transitions 的浏览器回退为 swap 或无动画
- [x] 过渡时间 ≤ 250ms
- [x] 现有功能（灯箱、标题锚点、TOC、评论区）在过渡后正常重新初始化

## 阅读量统计（Workers 入口脚本代理 Umami Cloud API）
- [x] `UMAMI_API_KEY` 已通过 `wrangler secret put` 注入 Workers
- [x] `wrangler.jsonc` 已新增 `"main": "src/worker.ts"`（`"assets"` 字段保持不变）
- [x] `src/worker.ts` 正确拦截 `/api/views/*` 路径并代理到 Umami `/metrics?type=path`
- [x] `GET /api/views/{slug}` 返回 `{ slug, views }` JSON（正常情况，HTTP 200）
- [x] Umami API 不可用时返回 `{ slug, views: null }`（HTTP 200，非 500）
- [x] 无效 slug（含 `..` 或 `/`）返回 400 `{ error: "invalid slug" }`
- [x] 响应头包含 `Cache-Control: public, max-age=300`
- [x] 非 API 请求（静态页面、CSS、JS 等）正确透传给 `env.ASSETS.fetch(request)`，WSA 行为不受影响
- [x] Umami API Key 不出现在前端代码、HTML 或网络响应中
- [x] 前端 `view-counter.js` 正常渲染浏览量（Worker API 可用时）
- [x] 浏览量加载中显示骨架屏/占位符，加载完成后淡入
- [x] `view-counter.js` 加载失败不影响页面其余功能（渐进增强）
- [x] 隐私合规：Worker 不记录 IP/UA/Referer

## 自动化与构建
- [x] `npm test` 通过（覆盖字数统计、归档数据、过渡逻辑）
- [x] `npm run build` 通过且无新增警告/错误
- [x] 桌面端和移动端浏览器验证均通过
- [x] Phase 6 文档状态已更新
