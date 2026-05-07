# Phase 6：文章统计与归档 Spec

## Why

Phase 2 和 5 已完善内容集合、文章列表/详情、RSS/sitemap 和评论区。当前文章体验仍缺少三个能力：

1. **文章元数据展示**：缺少字数统计和自动阅读时间预估，需要读者自行评估文章长度。
2. **归档浏览**：7 篇文章的列表已经够用，但随着文章累积，缺少按时间线归组的归档视图。
3. **SPA 切换体验**：已启用 `ClientRouter` + View Transitions，但列表页 ↔ 详情页的过渡仍为通用 fade，缺乏内容关联感和状态保持。

本阶段目标：在不引入后端数据库、不破坏静态站点架构的前提下，补上字数/阅读时间、归档页和增强过渡。

## Status

- 状态：未开始
- 依赖：Phase 2（内容集合）、Phase 5（RSS/sitemap/评论区）

## Scope

- 字数统计与阅读时间：构建时从 Markdown body 自动计算，文章列表卡片和详情页 meta 区展示
- 归档页：`/articles/archive/` 按年份归组的文章时间线，入口在文章首页内部
- SPA 增强过渡：列表 ↔ 详情 的方向性动画（前进/后退），详情页滚动位置保存与恢复
- 在线阅读量：先进行可行性评估和方案设计，不直接进入实施

## Non-Goals

- 不引入后端数据库（如 D1、Postgres）
- 不在文章列表首页显示阅读量
- 归档页不做复杂交互（纯静态时间线，不做无限滚动或动态加载）
- 不对工具页或作品页做 SPA 过渡增强

## Feasibility Summary

### 字数统计与阅读时间预估

| 项目 | 可行性 | 方案 |
|---|---|---|
| 字数统计 | 高 | 构建时从 `post.body`（原始 Markdown）计算中文字符数 + 英文单词数 |
| 阅读时间 | 高 | 基于字数自动推算：中文 ~300 字/分钟，英文 ~200 词/分钟 |
| 展示位置 | 高 | 文章列表卡片、详情页 meta 区，替换当前手动 `readTime` 为自动计算值 |

**实现方式**：新增 `src/lib/word-count.js`，导出 `computeReadingStats(body: string)` 函数返回 `{ characters, wordCount, readTimeMinutes, readTimeDisplay }`。在 `blogEntryToItem` 或页面组件中调用。

**兼容现有手动 `readTime`**：若 frontmatter 已有 `readTime`，优先使用手动值；否则自动计算。

### 在线文章阅读量统计

**方案：Cloudflare Workers 入口脚本代理 Umami Cloud API**

站点已集成 Umami Cloud 分析（Website ID: `d5b9f90c-e82b-4b57-ade7-ff6a3e5d8062`），所有页面浏览数据已自动收集。本项目当前为纯 Workers Static Assets（WSA）部署，方案为：新增一个 Worker 入口脚本（`src/worker.ts`），拦截 `/api/views/{slug}` 请求并代理到 Umami API，其余请求透传给内置静态资产引擎。

**架构数据流**：

```
浏览器 → GET /api/views/{slug}
         → src/worker.ts (Worker fetch handler)
           ├─ pathname 匹配 /api/views/* → 拦截处理
           │   → 构造文章完整路径 (如 /articles/{slug}/)
           │   → GET https://cloud.umami.is/api/websites/{websiteId}/metrics
           │     ?type=path&startAt={siteLaunch}&endAt={now}
           │     Headers: x-umami-api-key: env.UMAMI_API_KEY
           │   → 从返回的 [{x: "/articles/slug/", y: pageviews}] 中提取 pageviews
           │   ← { slug, views } JSON (Cache-Control: public, max-age=300)
           └─ 其他请求 → return env.ASSETS.fetch(request)（透传给 WSA 静态服务）
```

**关键设计决策**：

| 项目 | 决策 | 理由 |
|---|---|---|
| 数据来源 | Umami Cloud API（`GET /websites/:id/metrics?type=path`） | 复用现有分析数据，零额外存储成本 |
| 认证方式 | `UMAMI_API_KEY` 通过 `wrangler secret put` 注入 → Worker 中 `env.UMAMI_API_KEY` 读取 | API Key 仅存在于服务端，前端不可见 |
| 路由方式 | Worker `fetch` handler 中 `URL.pathname` 前缀匹配 `/api/views/` | Workers 没有文件系统路由，需手动分发；前缀匹配而非正则，简单可靠 |
| 静态资产透传 | 非 API 请求调用 `env.ASSETS.fetch(request)` | Workers Static Assets 的内置 binding，保留现有 404/headers 行为 |
| 缓存策略 | 响应头 `Cache-Control: public, max-age=300` | 减少 Umami API 调用频率，浏览量非实时数据 |
| 缓存 key 变体 | 建议同时在 `wrangler.jsonc` 中控制 Workers 自身路由不缓存 API 响应 | 若将来启用 Cloudflare 边缘缓存，API 响应不应被 CDN 缓存 |
| 错误降级 | Umami API 不可用时返回 `{ slug, views: null }` | 前端不显示而非报错，保证核心阅读体验不中断 |
| 前端脚本 | `src/scripts/view-counter.js`，`type="module"` 异步加载 | 渐进增强，不影响页面核心渲染 |

**`wrangler.jsonc` 变更**（在现有配置基础上新增）：

```jsonc
{
    "main": "src/worker.ts",       // 新增：Worker 入口
    "assets": { ... },             // 保持不变
    // ...
}
```

**Umami API 参考**：

- 端点：`GET https://cloud.umami.is/api/websites/{websiteId}/metrics`
- 参数：`type=path`，`startAt`/`endAt` 为毫秒时间戳
- 认证 Header：`x-umami-api-key: {key}`
- 返回格式：`[{ x: "/articles/slug/", y: 1234 }, ...]`
- 文档：https://umami.is/docs/api/website-stats

**隐私考量**：浏览量数据来自 Umami 已收集的匿名统计。Worker 不记录访问者 IP、UA 或其他个人信息，仅转发聚合数字。符合 GDPR 隐私要求。

**降级方案**：若 Umami API Key 获取受阻，前端降级为不显示阅读量（不影响其他 Phase 6 功能）。

### 归档页时间线

| 项目 | 可行性 | 方案 |
|---|---|---|
| 页面结构 | 高 | 新增 `src/pages/articles/archive.astro`，纯静态生成 |
| 数据来源 | 高 | `getCollection('blog')` → 按年份分组 → 按日期排序 |
| 视觉风格 | 高 | 垂直时间线 + 年份标题 + 文章条目（日期 + 标题），CSS-only |
| 入口位置 | 高 | 文章首页 `/articles/` 内部放置 "归档" 按钮或导航链接 |

### SPA 增强过渡

| 项目 | 可行性 | 方案 |
|---|---|---|
| 方向性动画 | 高 | 利用 Astro View Transitions `data-astro-transition` 属性区分离开/进入方向 |
| 卡片 ↔ 详情 morph | 中 | 为列表卡片和详情 `h1` 设置相同 `view-transition-name`，实现标题 morph |
| 滚动位置恢复 | 中高 | 利用浏览器原生 `sessionStorage` + Astro `astro:after-swap` 事件恢复滚动位置 |
| 列表状态保持 | 中高 | 搜索/过滤参数通过 `history.state` 或 `URL searchParams` 保持 |

**重要限制**：`view-transition-name` 在 Astro 中必须**全局唯一**。若多张卡片都声明相同的 `view-transition-name`（用于 morph 到详情），会导致 View Transitions API 跳过动画。因此**不能**对多卡片列表使用 morph 过渡。

**推荐方案**：
1. 列表 → 详情：`slide-in-right` 类动画（新页面从右侧滑入），通过 CSS `::view-transition-new` 的 `clip-path` 或 `transform` 实现
2. 详情 → 列表：反向动画（详情从左侧滑出），通过 `data-direction` 判断方向
3. 详情页滚动恢复：`astro:after-swap` 事件中从 `sessionStorage` 读取并恢复
4. 列表页搜索/过滤状态：通过 URL `searchParams` 序列化，导航返回时自动恢复

## Recommended Architecture

### 文件结构

```
src/
├── lib/
│   └── word-count.js              # 字数统计 & 阅读时间计算
├── pages/
│   ├── articles/
│   │   ├── [...slug].astro        # 修改：展示自动 readTime、引入 view-counter
│   │   └── archive.astro          # 新建：归档页
│   └── articles.astro             # 修改：卡片展示 readTime、归档入口
├── styles/
│   └── global.css                 # 修改：归档时间线样式、过渡动画、阅读量徽章样式
├── scripts/
│   ├── article-transitions.js     # 修改：增加滚动恢复逻辑
│   └── view-counter.js            # 新建：前端阅读量展示脚本（fetch /api/views/{slug}）
└── worker.ts                      # 新建：Worker 入口脚本（API 路由 + WSA 透传）
wrangler.jsonc                     # 修改：新增 "main": "src/worker.ts"
tests/
└── phase-6-stats-archive.test.js  # 新建：字数统计 + 归档数据 + Worker API 行为测试
```

### 字数统计算法

```
总阅读时间 = 中文字符数 / 300 + 英文单词数 / 200
显示格式:
  - < 1 分钟 → "< 1 分钟"
  - 1-59 分钟 → "X 分钟"
  - ≥ 60 分钟 → "X 小时 Y 分钟"
字数显示: "约 X,XXX 字"
```

`body` 从 `render(post)` 后的 `post.body` 获取——这是原始的 Markdown 文本（`getCollection` 返回的 entry 有 `body` 属性）。

### 归档页数据流

```
getCollection('blog', non-draft)
  → group by year (data.date.substring(0, 4))
  → sort within year by date desc
  → render timeline HTML
```

### 过渡增强数据流

```
列表页 → 详情页:
  1. 点击文章卡片链接
  2. ClientRouter 拦截，设置 direction=forward
  3. CSS ::view-transition-new 执行 slide-in 动画
  4. 保存列表页滚动位置到 sessionStorage

详情页 → 列表页:
  1. 点击返回或浏览器后退
  2. astro:after-swap 恢复列表页滚动位置
  3. 恢复搜索/过滤状态（从 URL params 读取）
```

## Requirements

### Requirement: 字数统计与阅读时间

#### Scenario: 自动计算字数
- **WHEN** 构建时处理文章
- **THEN** 系统从 Markdown body 自动计算总字数（中文按字符数、英文按单词数）
- **AND** 剔除 frontmatter、HTML 标签、图片链接等非正文内容

#### Scenario: 显示阅读时间
- **WHEN** 用户在文章列表或详情页查看
- **THEN** 每篇文章显示自动计算的预估阅读时间
- **AND** 格式为 "< 1 分钟" / "X 分钟" / "X 小时 Y 分钟"
- **AND** 若 frontmatter 手动指定 `readTime`，优先使用手动值

#### Scenario: 文章列表卡片展示
- **WHEN** 用户在文章列表页浏览
- **THEN** 每张文章卡片在日期旁展示字数（如 "约 3,500 字"）和阅读时间

#### Scenario: 详情页展示
- **WHEN** 用户打开文章详情页
- **THEN** 文章 meta 区域展示字数和阅读时间

### Requirement: 归档页时间线

#### Scenario: 归档入口
- **WHEN** 用户访问文章首页 `/articles/`
- **THEN** 页面上方或侧边有 "文章归档" 入口链接
- **AND** 点击进入 `/articles/archive/`

#### Scenario: 按年份分组
- **WHEN** 用户访问归档页
- **THEN** 文章按年份分组显示
- **AND** 年份从新到旧排列
- **AND** 每组内文章按日期从新到旧排列

#### Scenario: 时间线条目
- **WHEN** 查看文章归档
- **THEN** 每条条目显示日期（MM-DD）、标题、分类
- **AND** 标题可点击进入文章详情页

#### Scenario: 空状态
- **WHEN** 某年没有文章
- **THEN** 该年份不出现在归档中

### Requirement: SPA 增强过渡

#### Scenario: 列表到详情过渡
- **WHEN** 用户从文章列表点击文章卡片
- **THEN** 页面使用方向性过渡动画（左滑/淡入）
- **AND** 过渡时间 ≤ 250ms

#### Scenario: 详情返回到列表
- **WHEN** 用户从详情页返回列表页
- **THEN** 列表页滚动位置恢复到离开前的位置
- **AND** 搜索/过滤状态保持不变（若通过 URL 参数存储）

#### Scenario: 浏览器后退/前进
- **WHEN** 用户使用浏览器后退/前进按钮
- **THEN** 过渡动画和滚动恢复正常工作

#### Scenario: reduced-motion
- **WHEN** 用户启用了 `prefers-reduced-motion: reduce`
- **THEN** 过渡动画禁用，回退为瞬时切换

## Resolved Decisions

- **字数统计时机**：构建时（`blogEntryToItem` 调用时或页面组件中），不运行时计算
- **阅读时间覆盖**：frontmatter 手动 `readTime` > 自动计算值
- **归档页路由**：`/articles/archive/`
- **归档分组粒度**：按年分组，不做月分组（避免空组过多）
- **过渡方向判断**：通过 `history.state.direction` 或 Astro `navigate` 事件的 `direction` 属性
- **滚动恢复方式**：`sessionStorage` + `astro:after-swap` 事件
- **阅读量统计**：通过 Cloudflare Workers 入口脚本代理 Umami Cloud API，服务端持有 `UMAMI_API_KEY`（Secret），前端渐进增强展示
