import os
import re
import sys

def convert_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    if '<meta name="viewport"' not in content:
        content = re.sub(
            r'(<meta charset="utf-8">)',
            r'\1\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            content
        )
        print(f"  [+] 添加viewport标签")
    
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
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [+] 修改容器样式")
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
