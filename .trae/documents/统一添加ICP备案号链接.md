# 统一添加ICP备案号链接

## 任务概述

在所有HTML文件的页脚区域添加ICP备案号链接，确保视觉风格统一。

## 实施步骤

### 1. 检查现有HTML文件

查看项目中的所有HTML文件：

* index.html

* Works.html

* timetable.html

* statement.html

* about.html

* 404.html

### 2. 添加ICP备案号链接

为每个文件的页脚区域添加：

```html
<div class="footer">
    <p class="footer-text">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">渝ICP备2026000319号</a>
    </p>
</div>
```

### 3. 样式统一

使用与现有页脚一致的样式：
- 居中对齐
- 适当的字体大小和颜色
- 与其他元素保持协调的间距

### 4. 验证功能

- 链接可点击
- 新标签打开
- 不影响页面布局
- 响应式设计正常

## 预期效果

✅ 所有HTML文件包含ICP备案号链接
✅ 样式统一且协调
✅ 链接功能正常
✅ 响应式设计正常