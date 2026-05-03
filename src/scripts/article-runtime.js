import { initArticleEnhancements } from '../lib/article-enhancements/article-enhancements.js';
import { initArticleTransitions } from './article-transitions.js';

function initArticleRuntime() {
    initArticleTransitions(document, window);
    initArticleEnhancements(document);
}

function startArticleRuntime() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initArticleRuntime, { once: true });
        return;
    }

    initArticleRuntime();
}

startArticleRuntime();
document.addEventListener('astro:page-load', initArticleRuntime);
