# 修复图片链接提取中的URL编码问题

## 问题分析

根据终端日志显示的错误信息，系统在提取图片链接时错误地添加了"%22"字符。这表明URL提取逻辑存在问题。

### 可能原因

1. **正则表达式匹配问题**：
   - 当前使用的正则：`/src=["']([^"']+)["']/g` 和 `/src=\["']([^"']+)["']/g`
   - 可能无法正确处理包含特殊字符的URL
   - 双引号`"`和`'`的匹配逻辑可能有误

2. **URL编码问题**：
   - Markdown文件中的URL可能已经过编码
   - 提取时再次处理导致双重编码

## 修复方案

### 1. 改进链接提取算法

**方案A：使用更健壮的正则表达式**
```javascript
// 同时匹配单引号和双引号
const singleQuotePattern = /src=['"]([^'"]+)['"]/g;
const doubleQuotePattern = /src=["']([^"']+)["']/g;

// 合并结果
const singleQuoteUrls = this.fullContent.match(singleQuotePattern) || [];
const doubleQuoteUrls = this.fullContent.match(doubleQuotePattern) || [];
const allUrls = [...singleQuoteUrls, ...doubleQuoteUrls];
```

**方案B：使用DOM解析（更可靠）**
```javascript
// 创建临时DOM元素解析HTML
const tempDiv = document.createElement('div');
tempDiv.innerHTML = marked.parse(this.fullContent);
const images = tempDiv.querySelectorAll('img');
const urls = Array.from(images).map(img => img.src);
```

### 2. 添加URL验证和清理

```javascript
function cleanImageUrl(url) {
    // 移除可能的编码问题
    let cleanedUrl = url.replace(/%22/g, '');
    
    // 验证URL格式
    try {
        new URL(cleanedUrl);
        return cleanedUrl;
    } catch {
        console.warn('Invalid URL:', url);
        return null;
    }
}
```

### 3. 多场景测试

测试用例：
- 标准URL：`image.jpg`
- 带空格URL：` image.jpg `
- 带特殊字符URL：`image_测试.jpg`
- 长URL：`https://example.com/path/to/very/long/image/name.jpg`
- SVG格式：`image.svg`

## 预期效果

✅ 正确提取所有图片URL
✅ 不添加额外的"%22"字符
✅ 支持多种URL格式
✅ URL验证和清理
✅ 兼容jpg/svg等格式