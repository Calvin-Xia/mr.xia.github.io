const REVEAL_TAG_NAMES = new Set([
    'H2',
    'H3',
    'H4',
    'FIGURE',
    'BLOCKQUOTE',
    'PRE',
    'TABLE',
]);
const REVEAL_CLASS = 'article-section-reveal';
const VISIBLE_CLASS = 'is-visible';
const MAX_REVEAL_STAGGER_INDEX = 12;
const sectionRevealCleanups = new WeakMap();

function prefersReducedMotion(windowRef) {
    return windowRef.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
}

function revealImmediately(elements) {
    elements.forEach((element) => {
        element.classList?.add(VISIBLE_CLASS);
    });
}

function clearRevealClasses(elements) {
    elements.forEach((element) => {
        element.classList?.remove(REVEAL_CLASS, VISIBLE_CLASS);
        element.style?.removeProperty?.('--section-reveal-index');
    });
}

export function getSectionRevealElements(contentRoot) {
    return Array.from(contentRoot?.children || [])
        .filter((element) => REVEAL_TAG_NAMES.has(element.tagName));
}

export function initSectionReveals(contentRoot, { windowRef = window } = {}) {
    if (contentRoot) {
        sectionRevealCleanups.get(contentRoot)?.();
        sectionRevealCleanups.delete(contentRoot);
    }

    const elements = getSectionRevealElements(contentRoot);
    if (!elements.length) {
        return () => {};
    }

    if (prefersReducedMotion(windowRef) || !('IntersectionObserver' in windowRef)) {
        revealImmediately(elements);
        return () => {};
    }

    elements.forEach((element, index) => {
        element.classList?.add(REVEAL_CLASS);
        element.style?.setProperty?.('--section-reveal-index', String(Math.min(index, MAX_REVEAL_STAGGER_INDEX)));
    });

    const observer = new windowRef.IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList?.add(VISIBLE_CLASS);
                observer.unobserve?.(entry.target);
            });
        },
        { rootMargin: '0px 0px -80px 0px', threshold: 0.08 },
    );

    elements.forEach((element) => observer.observe(element));

    const cleanup = () => {
        observer.disconnect?.();
        clearRevealClasses(elements);
        sectionRevealCleanups.delete(contentRoot);
    };

    sectionRevealCleanups.set(contentRoot, cleanup);
    return cleanup;
}
