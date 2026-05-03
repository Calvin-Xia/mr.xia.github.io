import { enhanceArticleImageCaptions } from '../article-image-captions.js';
import { buildHeadingIndex } from './heading-index.js';
import { initImageLightbox } from './image-lightbox.js';
import { initReadingProgress } from './reading-progress.js';

let progressCleanup = () => {};

function resolveDocument(root) {
    if (root?.nodeType === 9) {
        return root;
    }

    return root?.ownerDocument || document;
}

export function initArticleEnhancements(root = document) {
    const documentRef = resolveDocument(root);
    const searchRoot = root?.querySelector ? root : documentRef;
    const markdownContent = searchRoot.querySelector?.('.markdown-content');
    const tocRoot = documentRef.querySelector?.('[data-article-toc]');

    progressCleanup();

    if (!markdownContent) {
        if (tocRoot) {
            tocRoot.hidden = true;
        }

        progressCleanup = () => {};
        return { headings: [] };
    }

    enhanceArticleImageCaptions(markdownContent, documentRef);
    const headings = buildHeadingIndex(markdownContent, documentRef);
    initImageLightbox(markdownContent, { documentRef });
    progressCleanup = initReadingProgress({
        tocRoot,
        contentRoot: markdownContent,
        headings,
        documentRef,
        windowRef: documentRef.defaultView || window,
    });

    return { headings };
}
