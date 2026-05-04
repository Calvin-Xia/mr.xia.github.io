import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

class FakeAnchor {
    constructor(href) {
        this.href = href;
        this.attributes = new Map([['href', href]]);
        this.target = '';
    }

    closest(selector) {
        return selector === 'a[href]' ? this : null;
    }

    getAttribute(name) {
        return this.attributes.get(name) ?? null;
    }

    setAttribute(name, value = '') {
        this.attributes.set(name, String(value));
    }

    hasAttribute(name) {
        return this.attributes.has(name);
    }

    removeAttribute(name) {
        this.attributes.delete(name);
    }
}

class FakeDocument {
    constructor(anchor) {
        this.anchor = anchor;
        this.documentElement = {};
        this.main = null;
        this.listeners = new Map();
        this.ownerDocument = this;
    }

    addEventListener(type, handler, options) {
        const listeners = this.listeners.get(type) || [];
        listeners.push({ handler, options });
        this.listeners.set(type, listeners);
    }

    querySelectorAll(selector) {
        return selector === 'a[href]' ? [this.anchor] : [];
    }

    querySelector(selector) {
        return selector === '.site-main' ? this.main : null;
    }
}

class FakeMain {
    constructor() {
        this.classNames = new Set();
        this.classList = {
            add: (...names) => names.forEach((name) => this.classNames.add(name)),
            remove: (...names) => names.forEach((name) => this.classNames.delete(name)),
            contains: (name) => this.classNames.has(name),
        };
    }
}

function createWindow({ reducedMotion = false, swapFadeDuration = '260ms' } = {}) {
    const timers = [];

    return {
        document: null,
        location: createLocation('/articles/'),
        timers,
        matchMedia(query) {
            return {
                matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion,
            };
        },
        getComputedStyle() {
            return {
                getPropertyValue(name) {
                    return name === '--swap-fade-duration' ? swapFadeDuration : '';
                },
            };
        },
        setTimeout(callback, delay) {
            const timer = { callback, delay };
            timers.push(timer);
            return timer;
        },
        clearTimeout(timer) {
            const index = timers.indexOf(timer);
            if (index >= 0) {
                timers.splice(index, 1);
            }
        },
    };
}

function createLocation(pathname = '/articles/') {
    return new URL(`https://calvin-xia.cn${pathname}`);
}

describe('article transitions', () => {
    test('binds click boundaries once per document for isolated test documents', async () => {
        const { initArticleTransitions } = await import('../src/scripts/article-transitions.js');
        const firstAnchor = new FakeAnchor('/about/');
        const secondAnchor = new FakeAnchor('/about/');
        const firstDocument = new FakeDocument(firstAnchor);
        const secondDocument = new FakeDocument(secondAnchor);
        const originalDocument = globalThis.document;

        try {
            globalThis.document = firstDocument;

            initArticleTransitions(firstDocument, {
                document: firstDocument,
                location: createLocation('/articles/'),
            });
            initArticleTransitions(secondDocument, {
                document: secondDocument,
                location: createLocation('/articles/'),
            });
        } finally {
            globalThis.document = originalDocument;
        }

        assert.equal(firstDocument.listeners.get('click')?.length, 1);
        assert.equal(secondDocument.listeners.get('click')?.length, 1);
    });

    test('adds and clears the swap fade fallback class after Astro page loads without View Transitions', async () => {
        const { initArticleTransitions } = await import('../src/scripts/article-transitions.js');
        const anchor = new FakeAnchor('/about/');
        const documentRef = new FakeDocument(anchor);
        const windowRef = createWindow({ swapFadeDuration: '340ms' });
        const main = new FakeMain();

        documentRef.main = main;
        windowRef.document = documentRef;

        initArticleTransitions(documentRef, windowRef);
        documentRef.listeners.get('astro:page-load')[0].handler();

        assert.equal(main.classList.contains('is-swap-fade-in'), true);
        assert.equal(windowRef.timers[0].delay, 340);

        windowRef.timers[0].callback();

        assert.equal(main.classList.contains('is-swap-fade-in'), false);
    });

    test('parses swap fade CSS duration seconds and falls back for invalid values', async () => {
        const { getSwapFadeDurationMs } = await import('../src/scripts/article-transitions.js');
        const documentRef = new FakeDocument(new FakeAnchor('/about/'));

        assert.equal(getSwapFadeDurationMs(documentRef, createWindow({ swapFadeDuration: '0.42s' })), 420);
        assert.equal(getSwapFadeDurationMs(documentRef, createWindow({ swapFadeDuration: 'not-a-duration' })), 260);
    });

    test('skips the swap fade fallback when reduced motion is preferred', async () => {
        const { initArticleTransitions } = await import('../src/scripts/article-transitions.js');
        const anchor = new FakeAnchor('/about/');
        const documentRef = new FakeDocument(anchor);
        const windowRef = createWindow({ reducedMotion: true });

        documentRef.main = new FakeMain();
        windowRef.document = documentRef;

        initArticleTransitions(documentRef, windowRef);
        documentRef.listeners.get('astro:page-load')[0].handler();

        assert.equal(documentRef.main.classList.contains('is-swap-fade-in'), false);
        assert.equal(windowRef.timers.length, 0);
    });

    test('skips the swap fade fallback when native View Transitions are available', async () => {
        const { initArticleTransitions } = await import('../src/scripts/article-transitions.js');
        const anchor = new FakeAnchor('/about/');
        const documentRef = new FakeDocument(anchor);
        const windowRef = createWindow();

        documentRef.main = new FakeMain();
        documentRef.startViewTransition = () => {};
        windowRef.document = documentRef;

        initArticleTransitions(documentRef, windowRef);
        documentRef.listeners.get('astro:page-load')[0].handler();

        assert.equal(documentRef.main.classList.contains('is-swap-fade-in'), false);
        assert.equal(windowRef.timers.length, 0);
    });
});
