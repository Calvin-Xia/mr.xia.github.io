const ARTICLE_TRANSITION_PATHS = ['/articles/', '/updates/'];
const SWAP_FADE_CLASS = 'is-swap-fade-in';
const DEFAULT_SWAP_FADE_DURATION_MS = 260;

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

function prefersReducedMotion(windowRef) {
    return windowRef.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
}

function parseCssDurationMs(value) {
    const duration = String(value || '').trim();
    const match = duration.match(/^([\d.]+)(ms|s)$/);

    if (!match) {
        return DEFAULT_SWAP_FADE_DURATION_MS;
    }

    const amount = Number.parseFloat(match[1]);
    if (!Number.isFinite(amount)) {
        return DEFAULT_SWAP_FADE_DURATION_MS;
    }

    return match[2] === 's' ? amount * 1000 : amount;
}

export function getSwapFadeDurationMs(documentRef = document, windowRef = window) {
    if (!windowRef.getComputedStyle || !documentRef.documentElement) {
        return DEFAULT_SWAP_FADE_DURATION_MS;
    }

    const cssDuration = windowRef.getComputedStyle(documentRef.documentElement)
        .getPropertyValue('--swap-fade-duration');

    return parseCssDurationMs(cssDuration);
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
const swapFallbackDocuments = new WeakSet();
const swapFadeTimers = new WeakMap();

export function shouldApplySwapFadeFallback(documentRef = document, windowRef = window) {
    return typeof documentRef.startViewTransition !== 'function' && !prefersReducedMotion(windowRef);
}

export function applySwapFadeFallback(documentRef = document, windowRef = window) {
    if (!shouldApplySwapFadeFallback(documentRef, windowRef)) {
        return false;
    }

    const main = documentRef.querySelector?.('.site-main');
    if (!main?.classList) {
        return false;
    }

    const existingTimer = swapFadeTimers.get(main);
    if (existingTimer) {
        windowRef.clearTimeout?.(existingTimer);
    }

    main.classList.remove(SWAP_FADE_CLASS);
    // Force a style recalculation so re-adding the class restarts the animation.
    void main.offsetWidth;
    main.classList.add(SWAP_FADE_CLASS);

    const timer = (windowRef.setTimeout || setTimeout)(() => {
        main.classList.remove(SWAP_FADE_CLASS);
        swapFadeTimers.delete(main);
    }, getSwapFadeDurationMs(documentRef, windowRef));

    swapFadeTimers.set(main, timer);
    return true;
}

export function initSwapFadeFallback(documentRef = document, windowRef = window) {
    if (swapFallbackDocuments.has(documentRef)) {
        return;
    }

    swapFallbackDocuments.add(documentRef);
    if (!documentRef.addEventListener) {
        return;
    }

    documentRef.addEventListener('astro:page-load', () => {
        applySwapFadeFallback(documentRef, windowRef);
    });
}

export function initArticleTransitions(root = document, windowRef = window) {
    markArticleTransitionLinks(root, windowRef.location);
    const documentRef = getDocumentForRoot(root, windowRef);
    initSwapFadeFallback(documentRef, windowRef);

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
