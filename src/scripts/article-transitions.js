const ARTICLE_TRANSITION_PATHS = ['/articles/', '/updates/'];

function isHashOnlyUrl(url, locationRef) {
    return url.pathname === locationRef.pathname && url.search === locationRef.search && Boolean(url.hash);
}

function isAllowedArticleTransitionPath(pathname) {
    return ARTICLE_TRANSITION_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function getAnchorFromEvent(event) {
    const target = event.target;
    return target?.closest?.('a[href]') || null;
}

function getDocumentForRoot(root, windowRef) {
    return root?.ownerDocument || windowRef.document || document;
}

export function shouldUseClientRouter(anchor, locationRef = window.location) {
    if (!anchor || anchor.hasAttribute('download') || anchor.target) {
        return false;
    }

    const href = anchor.getAttribute('href') || '';
    if (/^(mailto|tel|javascript):/i.test(href)) {
        return false;
    }

    const url = new URL(href, locationRef.href);
    if (url.origin !== locationRef.origin || isHashOnlyUrl(url, locationRef)) {
        return false;
    }

    return isAllowedArticleTransitionPath(url.pathname);
}

export function markArticleTransitionLinks(root = document, locationRef = window.location) {
    root.querySelectorAll?.('a[href]').forEach((anchor) => {
        if (shouldUseClientRouter(anchor, locationRef)) {
            anchor.removeAttribute('data-astro-reload');
            anchor.setAttribute('data-article-transition', 'true');
        } else if (!anchor.hasAttribute('data-article-transition')) {
            anchor.setAttribute('data-astro-reload', '');
        }
    });
}

const clickBoundaryDocuments = new WeakSet();

export function initArticleTransitions(root = document, windowRef = window) {
    markArticleTransitionLinks(root, windowRef.location);
    const documentRef = getDocumentForRoot(root, windowRef);

    if (clickBoundaryDocuments.has(documentRef)) {
        return;
    }

    clickBoundaryDocuments.add(documentRef);
    documentRef.addEventListener('click', (event) => {
        const anchor = getAnchorFromEvent(event);
        if (!anchor || shouldUseClientRouter(anchor, windowRef.location)) {
            return;
        }

        anchor.setAttribute('data-astro-reload', '');
    }, true);
}
