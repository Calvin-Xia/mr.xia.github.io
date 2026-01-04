# 彻底移除URL中的%22字符

## 问题分析

当前代码使用`url.replace(/%22/g, '').trim()`来清理URL，但用户反馈所有链接文本前仍包含"%22"字符。

### 可能原因

1. **URL编码问题**：Markdown文件中的URL可能已经过编码
2. **清理不彻底**：单次replace可能无法移除所有%22
3. **位置问题**：%22可能出现在URL的任何位置

## 修复方案

### 1. 使用URL解码

```javascript
const cleanedUrl = decodeURIComponent(url).replace(/%22/g, '').trim();
```

**优势**：
- 正确处理URL编码
- 解码后再清理确保彻底
- 支持各种URL格式

### 2. 多次清理确保彻底

```javascript
let cleanedUrl = decodeURIComponent(url);
cleanedUrl = cleanedUrl.replace(/%22/g, '').replace(/%22/g, '').trim();
```

### 3. 添加URL验证

```javascript
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
```

### 4. 测试用例

- 标准URL：`image.jpg`
- 带编码URL：`%22image.jpg`
- 多次编码：`%22%22image.jpg`
- 相对路径：`./image.jpg`
- HTTPS链接：`https://example.com/image.jpg`
- 带参数URL：`https://example.com/image.jpg?param=value`

## 预期效果

✅ 彻底移除所有%22字符
✅ 正确处理URL编码
✅ 支持多种链接格式
✅ 不影响其他有效字符