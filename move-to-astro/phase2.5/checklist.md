# Phase 2.5 Code Review Checklist

## 图片悬浮放大
- [x] 点击文章图片后打开悬浮层
- [x] 悬浮层显示图片和灰色说明文字
- [x] Escape、关闭按钮、点击遮罩均可关闭
- [x] 关闭后焦点回到原图片
- [x] 放大、缩小、重置按钮可用
- [x] 缩放范围限制在 1x–4x
- [x] 图片在桌面和移动端均不溢出视口
- [x] `prefers-reduced-motion: reduce` 下关闭非必要动画

## 文章平滑切换
- [x] `/articles/` 到文章详情页具备平滑切换
- [x] 文章详情页之间具备平滑切换
- [x] 返回文章列表不破坏浏览器历史记录
- [x] 不支持 View Transitions 的浏览器回退为普通链接跳转
- [x] 页面切换后图片 caption、灯箱、标题锚点、侧栏目录重新初始化
- [x] 全局事件监听不会重复注册
- [x] 外链和下载链接不被文章切换逻辑接管

## 标题层级与锚点
- [x] `.markdown-content h1-h4` 层级间距、字号、字重清晰
- [x] 标题字距为非负值，且不随 viewport width 缩放
- [x] 标题 hover/focus 时显示 `#` 锚点
- [x] 锚点可点击并更新 URL hash
- [x] 中文标题、英文标题、带标点标题均生成稳定 id
- [x] 重复标题不会产生重复 id
- [x] 键盘用户可以 focus 到标题锚点

## 侧栏目录与进度
- [x] 长文章桌面端显示侧栏目录
- [x] 短文章（少于 3 个标题）隐藏侧栏目录
- [x] 目录按 `h2/h3/h4` 层级缩进
- [x] 点击目录项平滑滚动到对应标题
- [x] 滚动时当前章节高亮
- [x] 阅读进度准确显示 0–100%
- [x] 移动端目录折叠，不遮挡正文
- [x] 侧栏不与正文、图片、页脚重叠

## 自动化与构建
- [x] `npm test` 覆盖灯箱、标题 id、目录数据、阅读进度核心逻辑
- [x] `npm run test:coverage` 通过
- [x] `npm run build` 通过且无新增警告
- [x] 浏览器验证桌面宽度、平板宽度和手机宽度
- [x] Phase 2.5 文档状态已更新

## 行内 TeX 公式渲染
- [x] `remark-math` 和 `rehype-katex` 已安装为 npm dependencies
- [x] `astro.config.mjs` markdown 配置已注册两个插件
- [x] KaTeX CSS 已在文章页正确引入，不阻塞页面渲染
- [x] 行内公式 `$...$` 在 dev 和 build 下正确渲染为行内数学公式
- [x] 块级公式 `$$...$$` 在 dev 和 build 下正确渲染为居中数学公式
- [x] 公式颜色、字体大小与站点整体主题适配
- [x] KaTeX CSS 加载失败时公式保留可读 MathML/HTML 兜底
- [x] 无 KaTeX 渲染导致的 build 警告或错误
