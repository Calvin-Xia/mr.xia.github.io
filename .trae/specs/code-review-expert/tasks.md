# Tasks

## 代码审查发现的问题

### P0 - Critical (关键问题)
(无发现)

### P1 - High (高优先级问题)

- [x] Task 1: 修复 navigation.js 中的内存泄漏风险
  - **文件**: [js/navigation.js:119-121](file:///c:/Users/Calvin-Xia/mr.xia.github.io/js/navigation.js#L119-L121)
  - **问题**: `setTimeout` 后执行 `window.location.href` 可能导致页面跳转前定时器未清理
  - **修复**: 添加 `navigationTimeoutId` 变量跟踪定时器，在设置新定时器前清除之前的定时器，在 `beforeunload` 事件中清理

- [x] Task 2: 修复 timetable.html 中的全局变量污染
  - **文件**: [timetable.html:362](file:///c:/Users/Calvin-Xia/mr.xia.github.io/timetable.html#L362)
  - **问题**: `let items = []` 定义在全局作用域，可能与其他脚本冲突
  - **修复**: 将随机选择器功能封装在IIFE中，只暴露 `window.RandomSelector` 命名空间

- [x] Task 3: 修复 statement.html 中的全局变量污染
  - **文件**: [statement.html:377-491](file:///c:/Users/Calvin-Xia/mr.xia.github.io/statement.html#L377-L491)
  - **问题**: `Search` 和 `BlogLoader` 对象暴露在全局作用域
  - **修复**: 使用IIFE封装，修复 `onclick` 内联事件依赖

### P2 - Medium (中优先级问题)

- [x] Task 4: 优化 main.js 中的 requestAnimationFrame 使用
  - **文件**: [js/main.js:384-391](file:///c:/Users/Calvin-Xia/mr.xia.github.io/js/main.js#L384-L391)
  - **问题**: `animateFollower` 函数无限递归调用 requestAnimationFrame，无停止条件
  - **修复**: 添加页面可见性检测，页面不可见时暂停动画，可见时恢复

- [x] Task 5: 添加错误边界处理
  - **文件**: [js/main.js](file:///c:/Users/Calvin-Xia/mr.xia.github.io/js/main.js)
  - **问题**: 模块初始化缺少 try-catch 错误处理
  - **修复**: 添加 `safeInit` 包装函数，每个模块独立错误处理

- [x] Task 6: 优化 CSS 动画性能
  - **文件**: [css/style.css:77](file:///c:/Users/Calvin-Xia/mr.xia.github.io/css/style.css#L77)
  - **问题**: body 元素上的 `animation: gradientFlow` 持续运行，消耗GPU资源
  - **修复**: 添加 `will-change` 属性，添加 `prefers-reduced-motion` 媒体查询

- [x] Task 7: 修复重复的 DOM 查询
  - **文件**: [js/main.js:239-247](file:///c:/Users/Calvin-Xia/mr.xia.github.io/js/main.js#L239-L247), [js/main.js:269-277](file:///c:/Users/Calvin-Xia/mr.xia.github.io/js/main.js#L269-L277)
  - **问题**: Timer 模块中多次查询相同的 DOM 元素
  - **修复**: 添加 `cachedElements` 对象缓存 DOM 元素引用

- [x] Task 8: 添加输入验证
  - **文件**: [timetable.html:364-367](file:///c:/Users/Calvin-Xia/mr.xia.github.io/timetable.html#L364-L367)
  - **问题**: `sanitizeInput` 函数仅限制长度，未进行HTML转义
  - **修复**: 增强 `sanitizeInput` 函数，添加 HTML 实体编码

### P3 - Low (低优先级问题)

- [x] Task 9: 统一代码风格
  - **问题**: 部分文件使用分号，部分不使用
  - **建议**: 统一代码风格，考虑添加 ESLint 配置（作为后续改进项）

- [x] Task 10: 添加 ARIA 标签
  - **问题**: 部分交互元素缺少无障碍标签
  - **修复**: 为所有 HTML 文件的按钮、输入框、导航链接添加 `aria-label` 和 `aria-current` 属性

- [x] Task 11: 优化图片加载
  - **文件**: [index.html:100](file:///c:/Users/Calvin-Xia/mr.xia.github.io/index.html#L100)
  - **问题**: 备案图片未使用懒加载
  - **修复**: 为所有备案图片添加 `loading="lazy"` 属性

- [x] Task 12: 添加 CSP 头建议
  - **问题**: 未配置内容安全策略
  - **建议**: 作为后续改进项，建议在服务器配置中添加 CSP 头

## Task Dependencies
- Task 2 和 Task 3 可以并行处理 ✅
- Task 4 依赖于 Task 5（错误处理应先添加）✅
- Task 7 和 Task 8 可以并行处理 ✅
