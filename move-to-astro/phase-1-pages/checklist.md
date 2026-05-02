# Code Review Checklist

- [x] PageIntro 组件渲染正确的 `<section class="page-intro">` 结构
- [x] PageIntro `center` prop 添加 `page-intro--center` 类
- [x] PageIntro `compact` prop 添加 `page-intro--compact` 类
- [x] about.astro 四个内容区块完整
- [x] about.astro 邮箱保护脚本正确解码并插入 `mailto:` 链接
- [x] about.astro "← 返回首页" 链接正确
- [x] works.astro 4 个作品卡片全部渲染
- [x] works.astro 下载/链接按钮打开外部 URL，`target="_blank"` `rel="noopener"` 属性存在
- [x] works.astro "← 返回首页" 链接正确
- [x] 404.astro 错误码和标题正确
- [x] 404.astro "返回首页" 链接指向 `/`
- [x] 404.astro "返回上一页" 按钮 `onclick="history.back()"` 工作
- [x] 404.astro 管理员邮箱链接正确
- [x] styleguide.astro 色彩色块正确
- [x] styleguide.astro 排版、按钮、卡片、时间、链接、间距展示完整
- [x] `time-display.ts` 导出 `TimeDisplay` 对象，`init()` 启动时钟
- [x] `page-animations.ts` 导出 `PageAnimations` 对象，`init()` 执行动画
- [x] `email-protection.ts` 导出 `EmailProtection` 对象，`init()` 解码邮件
- [x] 首页时间显示每秒更新
- [x] 首页 `prefers-reduced-motion` 时跳过动画
- [x] 所有新 `.astro` 页面中 `aria-current="page"` 正确标记
- [x] `npm run build` 零错误零警告
- [x] 旧 HTML 文件未被修改

验证记录：
- `npm run build`
- Phase 1 静态断言检查
- Playwright 桌面/移动生产预览检查
