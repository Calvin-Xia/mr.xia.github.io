# 博客图片懒加载功能 Spec

## Why
博客HTML文件中的图片目前直接加载，影响页面加载性能和用户体验。需要为图片实现懒加载，但要求通过convert.py工具自动处理，而非直接修改HTML文件。

## What Changes
- 在convert.py中添加图片懒加载处理功能
- 将img标签的src属性替换为data-src，并添加loading="lazy"属性
- 添加懒加载JavaScript代码注入功能

## Impact
- Affected specs: convert.py工具功能
- Affected code: blog/convert.py, blog/*.html（通过工具处理后）

## ADDED Requirements

### Requirement: 图片懒加载自动处理
convert.py工具SHALL自动为HTML文件中的img标签添加懒加载支持。

#### Scenario: 处理普通img标签
- **WHEN** HTML文件包含 `<img src="image.jpg">` 标签
- **THEN** 工具将其转换为 `<img data-src="image.jpg" loading="lazy" class="lazy-img">`

#### Scenario: 处理带属性的img标签
- **WHEN** HTML文件包含 `<img src="image.jpg" alt="描述">` 标签
- **THEN** 工具保留原有属性，添加懒加载相关属性

### Requirement: 懒加载JavaScript注入
convert.py工具SHALL在HTML文件中注入必要的懒加载JavaScript代码。

#### Scenario: 注入懒加载脚本
- **WHEN** 处理完所有img标签后
- **THEN** 在</body>标签前注入Intersection Observer懒加载脚本

### Requirement: 保持向后兼容
工具SHALL保持与现有移动端适配功能的兼容性。

#### Scenario: 同时处理移动端适配和懒加载
- **WHEN** 运行convert.py处理HTML文件
- **THEN** 同时完成viewport添加、容器样式修改和图片懒加载处理
