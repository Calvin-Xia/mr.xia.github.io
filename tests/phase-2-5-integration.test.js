import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const rootDir = path.resolve(import.meta.dirname, '..');

function projectPath(...segments) {
    return path.join(rootDir, ...segments);
}

function readProjectFile(...segments) {
    return readFileSync(projectPath(...segments), 'utf8');
}

describe('Phase 2.5 article experience integration', () => {
    test('Astro markdown renders math through remark-math and rehype-katex', () => {
        const packageJson = JSON.parse(readProjectFile('package.json'));
        const config = readProjectFile('astro.config.mjs');

        assert.ok(packageJson.dependencies['remark-math']);
        assert.ok(packageJson.dependencies['rehype-katex']);
        assert.match(config, /import\s+remarkMath\s+from\s+['"]remark-math['"]/);
        assert.match(config, /import\s+rehypeKatex\s+from\s+['"]rehype-katex['"]/);
        assert.match(config, /remarkPlugins:\s*\[[^\]]*remarkBlockquoteBreaks[^\]]*remarkMath/s);
        assert.match(config, /rehypePlugins:\s*\[[^\]]*rehypeKatex/s);
    });

    test('article pages mount the TOC shell and load KaTeX CSS', () => {
        const articlePage = readProjectFile('src', 'pages', 'articles', '[...slug].astro');

        assert.match(articlePage, /import\s+ArticleToc\s+from\s+['"]\.\.\/\.\.\/components\/ArticleToc\.astro['"]/);
        assert.match(articlePage, /import\s+['"]katex\/dist\/katex\.min\.css['"]/);
        assert.match(articlePage, /<ArticleToc\s*\/>/);
        assert.match(articlePage, /class="article-reading-layout"/);
    });

    test('article reading layout dimensions use shared CSS custom properties', () => {
        const styles = readProjectFile('src', 'styles', 'global.css');

        assert.match(styles, /--article-content-width:\s*920px/);
        assert.match(styles, /--article-toc-min-width:\s*14rem/);
        assert.match(styles, /--article-toc-max-width:\s*17rem/);
        assert.match(styles, /grid-template-columns:\s*minmax\(0,\s*var\(--article-content-width\)\)\s+minmax\(var\(--article-toc-min-width\),\s*var\(--article-toc-max-width\)\)/);
    });

    test('view transition animations respect reduced motion preferences', () => {
        const styles = readProjectFile('src', 'styles', 'global.css');

        assert.match(styles, /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)[\s\S]*::view-transition-new\(site-main\)[\s\S]*::view-transition-old\(site-main\)[\s\S]*animation:\s*none/s);
    });

    test('base layout enables Astro ClientRouter and a single article runtime', () => {
        const layout = readProjectFile('src', 'layouts', 'BaseLayout.astro');

        assert.match(layout, /import\s+\{\s*ClientRouter\s*\}\s+from\s+['"]astro:transitions['"]/);
        assert.match(layout, /article-runtime\.js\?url/);
        assert.match(layout, /<ClientRouter\s+fallback="swap"\s*\/>/);
        assert.match(layout, /transition:name="site-main"/);
        assert.match(layout, /<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"\s*\/>/);
    });

    test('article runtime defers the first enhancement pass until the DOM is ready', () => {
        const runtime = readProjectFile('src', 'scripts', 'article-runtime.js');

        assert.match(runtime, /function\s+startArticleRuntime\(\)/);
        assert.match(runtime, /document\.readyState\s*===\s*['"]loading['"]/);
        assert.match(runtime, /DOMContentLoaded/);
        assert.match(runtime, /once:\s*true/);
        assert.match(runtime, /startArticleRuntime\(\);/);
        assert.match(runtime, /document\.addEventListener\(\s*['"]astro:page-load['"]\s*,\s*initArticleRuntime\s*\)/);
    });
});
