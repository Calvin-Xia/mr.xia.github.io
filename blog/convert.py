import os
import re
import sys

LAZYLOAD_SCRIPT = '''
<script>
document.addEventListener('DOMContentLoaded', function() {
    var lazyImages = document.querySelectorAll('img.lazy-img');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {rootMargin: '50px 0px'});
        lazyImages.forEach(function(img) {
            observer.observe(img);
        });
    } else {
        lazyImages.forEach(function(img) {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
});
</script>
'''

def process_lazyload(content):
    img_count = 0
    
    def replace_img(match):
        nonlocal img_count
        img_tag = match.group(0)
        
        if 'data-src=' in img_tag or 'lazy-img' in img_tag:
            return img_tag
        
        src_match = re.search(r'src="([^"]*)"', img_tag)
        if not src_match:
            return img_tag
        
        img_tag = re.sub(r'src="([^"]*)"', r'data-src="\1"', img_tag)
        
        if 'class="' in img_tag:
            img_tag = re.sub(r'class="([^"]*)"', r'class="\1 lazy-img"', img_tag)
        else:
            img_tag = img_tag.replace('<img', '<img class="lazy-img"', 1)
        
        if 'loading=' not in img_tag:
            img_tag = img_tag.replace('<img', '<img loading="lazy"', 1)
        
        img_count += 1
        return img_tag
    
    content = re.sub(r'<img[^>]*>', replace_img, content)
    
    return content, img_count

def inject_lazyload_script(content):
    if 'lazy-img' not in content:
        return content, False
    
    if 'IntersectionObserver' in content and 'lazy-img' in content:
        return content, False
    
    content = re.sub(r'(</body>)', LAZYLOAD_SCRIPT + r'\n\1', content)
    return content, True

def convert_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    changes = []
    
    if '<meta name="viewport"' not in content:
        content = re.sub(
            r'(<meta charset="utf-8">)',
            r'\1\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            content
        )
        changes.append("添加viewport标签")
    
    content = re.sub(
        r'style="(?:max-width:\s*750px;\s*)?(?:width:\s*100%;\s*)?width:\s*750px;\s*margin:\s*auto;\s*padding:\s*20px;"',
        r'style="max-width: 750px; width: 100%; margin: auto; padding: 20px; box-sizing: border-box;"',
        content
    )
    
    if 'box-sizing: border-box' not in content and 'max-width: 750px' in content:
        content = re.sub(
            r'style="max-width:\s*750px;\s*width:\s*100%;\s*margin:\s*auto;\s*padding:\s*20px;"',
            r'style="max-width: 750px; width: 100%; margin: auto; padding: 20px; box-sizing: border-box;"',
            content
        )
    
    if 'box-sizing: border-box' in content and 'max-width: 750px' in content:
        if "修改容器样式" not in changes:
            pass
    
    content, img_count = process_lazyload(content)
    if img_count > 0:
        changes.append(f"处理{img_count}张图片懒加载")
    
    content, script_injected = inject_lazyload_script(content)
    if script_injected:
        changes.append("注入懒加载脚本")
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        for change in changes:
            print(f"  [+] {change}")
        return True
    else:
        print(f"  [=] 无需修改")
        return False

def main():
    if len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        files = [f for f in os.listdir(script_dir) if f.endswith('.html')]
    
    print(f"找到 {len(files)} 个HTML文件\n")
    
    for filename in files:
        if not os.path.isabs(filename):
            filename = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
        
        print(f"处理: {os.path.basename(filename)}")
        convert_html_file(filename)
    
    print("\n转换完成!")

if __name__ == '__main__':
    main()
