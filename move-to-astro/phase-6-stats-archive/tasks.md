# Tasks

- [x] Task 6.1: 字数统计与阅读时间自动计算
  - [x] SubTask 6.1.1: 创建 `src/lib/word-count.js`，导出 `computeReadingStats(body)` 函数
  - [x] SubTask 6.1.2: 实现 `countCharacters` / `countWords` —— 中文按字符、英文按单词、过滤 Markdown 语法和 HTML 标签
  - [x] SubTask 6.1.3: 实现 `formatReadTime(minutes)` —— "< 1 分钟" / "X 分钟" / "X 小时 Y 分钟"
  - [x] SubTask 6.1.4: 实现 `formatWordCount(count)` —— "约 X,XXX 字"（千位逗号分隔）
  - [x] SubTask 6.1.5: 在 `blogEntryToItem` 或文章列表组件中调用 `computeReadingStats(post.body)`，将结果汇入 `ContentItem`
  - [x] SubTask 6.1.6: 更新 `articles.astro` 博客卡片，在日期旁展示字数和阅读时间
  - [x] SubTask 6.1.7: 更新 `articles/[...slug].astro` 详情页 meta 区展示字数和阅读时间（自动值优先，手动 `readTime` 覆盖）
  - [x] SubTask 6.1.8: 添加单元测试 —— 纯中文、纯英文、中英混合、空内容、短内容、超长内容、Markdown 语法和 HTML 标签过滤
  - [x] SubTask 6.1.9: 运行 `npm test` 和 `npm run build` 验证

- [x] Task 6.2: 归档页时间线
  - [x] SubTask 6.2.1: 创建 `src/pages/articles/archive.astro` 页面，路由为 `/articles/archive/`
  - [x] SubTask 6.2.2: 从 `getCollection('blog')` 加载非草稿文章，按年份分组（`data.date.substring(0, 4)`），组内按日期 desc 排序
  - [x] SubTask 6.2.3: 渲染垂直时间线 —— CSS 实现左侧年份标记 + 右侧文章条目列表（日期 MM-DD + 标题 + 分类标签）
  - [x] SubTask 6.2.4: 添加 "文章归档" 入口到 `/articles/` 页面（页面上方靠右或 page-intro 下方导航区）
  - [x] SubTask 6.2.5: CSS 样式：`.archive-timeline`、`.archive-year`、`.archive-item` 等，移动端适配
  - [x] SubTask 6.2.6: 添加测试：验证归档页包含所有非草稿文章、按年份分组正确、排序正确、没有空年份
  - [x] SubTask 6.2.7: 运行 `npm test` 和 `npm run build` 验证

- [x] Task 6.3: SPA 增强过渡
  - [x] SubTask 6.3.1: 在 CSS 中新增 `slide-from-right` / `slide-from-left` 的 `::view-transition-new` / `::view-transition-old` 动画 keyframe
  - [x] SubTask 6.3.2: 在 `article-transitions.js` 中增加方向检测逻辑：通过 Astro navigation direction 与 `sessionStorage` 判断前进/后退
  - [x] SubTask 6.3.3: 使用 `html[data-astro-transition]` 控制方向动画
  - [x] SubTask 6.3.4: 实现列表页滚动位置保存与恢复：在离开列表页时将 `window.scrollY` 存入 `sessionStorage`，`astro:after-swap` 事件中恢复
  - [x] SubTask 6.3.5: （可选）将搜索/过滤参数序列化到 URL `searchParams`，返回列表时恢复搜索状态
  - [x] SubTask 6.3.6: 验证 `prefers-reduced-motion: reduce` 时动画关闭
  - [x] SubTask 6.3.7: 验证浏览器后退/前进按钮的过渡和滚动表现
  - [x] SubTask 6.3.8: 添加测试：过渡脚本导出正确、动画 keyframe 在 CSS 中存在、回退逻辑不破坏现有功能
  - [x] SubTask 6.3.9: 运行 `npm test` 和 `npm run build` 验证

- [x] Task 6.4: 阅读量统计（Workers 入口脚本代理 Umami Cloud API）
  - [x] SubTask 6.4.1: 获取 Umami Cloud API Key —— 已获得 key，并已通过 `wrangler secret put UMAMI_API_KEY` 注入 Workers
  - [x] SubTask 6.4.2: 创建 `src/worker.ts` Worker 入口脚本：`export default { async fetch(request, env) { ... } }`，`pathname` 前缀匹配 `/api/views/` 拦截，非匹配请求 `return env.ASSETS.fetch(request)` 透传给 WSA 静态服务
  - [x] SubTask 6.4.3: Worker 中实现 Umami API 代理逻辑：构造文章路径 `/articles/{slug}/`，`fetch` Umami `/metrics?type=path` 端点，Headers 携带 `x-umami-api-key: env.UMAMI_API_KEY`，从返回数组中匹配 `x` 字段提取 `y`（pageviews）；设置 `Cache-Control: public, max-age=300` 响应头
  - [x] SubTask 6.4.4: Worker 错误处理 —— Umami API 超时/4xx/5xx 返回 `{ slug, views: null }, 200`；无效 slug（含 `..` 或 `/`）返回 `{ error: "invalid slug" }, 400`；`env.UMAMI_API_KEY` 未配置时返回 `{ slug, views: null }, 200` + console.warn
  - [x] SubTask 6.4.5: 更新 `wrangler.jsonc`，新增 `"main": "src/worker.ts"` 指向入口脚本，并配置 ASSETS binding / API 优先路由 / required secret
  - [x] SubTask 6.4.6: 创建前端 `src/scripts/view-counter.js`：在文章详情页加载后异步 `fetch(/api/views/{slug})`，将浏览量渲染到详情页 meta 区
  - [x] SubTask 6.4.7: 在 `articles/[...slug].astro` 中引入 `view-counter.js`（`type="module"`、异步加载、渐进增强）；传递 `data-slug` 属性供脚本读取
  - [x] SubTask 6.4.8: CSS 样式：`.view-count` 徽章样式，加载中骨架屏（`pending` → 数字淡入）
  - [x] SubTask 6.4.9: 添加测试：验证 Worker API 正常返回、Umami 不可用时降级、无效 slug 400、WSA 静态资产透传不受影响
  - [x] SubTask 6.4.10: 运行 `npm test` 和 `npm run build` 验证；Worker API 行为由单元测试覆盖，线上 secret 已就绪

- [x] Task 6.5: 集成、验证与文档
  - [x] SubTask 6.5.1: 运行 `npm test` 确保全量测试通过
  - [x] SubTask 6.5.2: 运行 `npm run build` 确保构建无新增警告/错误
  - [x] SubTask 6.5.3: 浏览器验证：字数/阅读时间显示、归档页时间线、列表↔详情过渡
  - [x] SubTask 6.5.4: 移动端验证归档页和过渡在窄屏下的表现
  - [x] SubTask 6.5.5: 更新 Phase 6 checklist 和迁移 README 状态

# Task Dependencies

- [Task 6.1] 和 [Task 6.2] 独立，可并行实施
- [Task 6.3] 依赖 [Task 6.1] 和 [Task 6.2]（需要知道完整的页面结构才能设计过渡）
- [Task 6.4] 完全独立于其他任务，可先行实施或最后实施。依赖 Umami Cloud API Key 的就绪和 `wrangler.jsonc` 中 `main` 字段的配置
- [Task 6.5] 依赖所有前置任务
