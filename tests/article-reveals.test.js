import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

class FakeElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.children = [];
        this.classNames = new Set();
        this.styleValues = new Map();
        this.classList = {
            add: (...names) => names.forEach((name) => this.classNames.add(name)),
            remove: (...names) => names.forEach((name) => this.classNames.delete(name)),
            contains: (name) => this.classNames.has(name),
        };
        this.style = {
            setProperty: (name, value) => this.styleValues.set(name, value),
            removeProperty: (name) => this.styleValues.delete(name),
        };
    }

    append(...children) {
        children.forEach((child) => this.children.push(child));
    }
}

class FakeIntersectionObserver {
    static instances = [];

    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observed = [];
        this.unobserved = [];
        this.disconnected = false;
        FakeIntersectionObserver.instances.push(this);
    }

    observe(element) {
        this.observed.push(element);
    }

    unobserve(element) {
        this.unobserved.push(element);
    }

    disconnect() {
        this.disconnected = true;
    }
}

function createWindow({ reducedMotion = false, withObserver = true } = {}) {
    const windowRef = {
        matchMedia(query) {
            return {
                matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion,
            };
        },
    };

    if (withObserver) {
        FakeIntersectionObserver.instances = [];
        windowRef.IntersectionObserver = FakeIntersectionObserver;
    }

    return windowRef;
}

function createContentRoot() {
    const root = new FakeElement('div');
    const h2 = new FakeElement('h2');
    const paragraph = new FakeElement('p');
    const h3 = new FakeElement('h3');
    const figure = new FakeElement('figure');
    const list = new FakeElement('ul');
    const table = new FakeElement('table');

    root.append(h2, paragraph, h3, figure, list, table);

    return { root, h2, paragraph, h3, figure, list, table };
}

function createLongContentRoot(count = 15) {
    const root = new FakeElement('div');
    const elements = Array.from({ length: count }, () => new FakeElement('h2'));

    root.append(...elements);

    return { root, elements };
}

describe('article section reveals', () => {
    test('selects only direct article section reveal candidates', async () => {
        const { getSectionRevealElements } = await import('../src/lib/article-enhancements/section-reveals.js');
        const { root, h2, h3, figure, table } = createContentRoot();

        assert.deepEqual(getSectionRevealElements(root), [h2, h3, figure, table]);
    });

    test('reveals candidates immediately when reduced motion is preferred', async () => {
        const { initSectionReveals } = await import('../src/lib/article-enhancements/section-reveals.js');
        const { root, h2, h3, figure, table } = createContentRoot();

        initSectionReveals(root, { windowRef: createWindow({ reducedMotion: true }) });

        assert.equal(FakeIntersectionObserver.instances.length, 0);
        [h2, h3, figure, table].forEach((element) => {
            assert.equal(element.classList.contains('is-visible'), true);
            assert.equal(element.classList.contains('article-section-reveal'), false);
        });
    });

    test('reveals candidates immediately without IntersectionObserver support', async () => {
        const { initSectionReveals } = await import('../src/lib/article-enhancements/section-reveals.js');
        const { root, h2, h3, figure, table } = createContentRoot();

        initSectionReveals(root, { windowRef: createWindow({ withObserver: false }) });

        [h2, h3, figure, table].forEach((element) => {
            assert.equal(element.classList.contains('is-visible'), true);
            assert.equal(element.classList.contains('article-section-reveal'), false);
        });
    });

    test('observes reveal candidates and cleans up before repeated initialization', async () => {
        const { initSectionReveals } = await import('../src/lib/article-enhancements/section-reveals.js');
        const { root, h2, h3, figure, table } = createContentRoot();
        const windowRef = createWindow();

        initSectionReveals(root, { windowRef });
        const firstObserver = FakeIntersectionObserver.instances[0];

        assert.deepEqual(firstObserver.observed, [h2, h3, figure, table]);
        assert.equal(firstObserver.options.rootMargin, '0px 0px -80px 0px');
        assert.equal(h2.classList.contains('article-section-reveal'), true);
        assert.equal(h2.styleValues.get('--section-reveal-index'), '0');

        initSectionReveals(root, { windowRef });
        const secondObserver = FakeIntersectionObserver.instances[1];

        assert.equal(firstObserver.disconnected, true);
        assert.notEqual(secondObserver, firstObserver);
        assert.deepEqual(secondObserver.observed, [h2, h3, figure, table]);
    });

    test('marks intersecting candidates visible and unobserves them', async () => {
        const { initSectionReveals } = await import('../src/lib/article-enhancements/section-reveals.js');
        const { root, h2 } = createContentRoot();

        initSectionReveals(root, { windowRef: createWindow() });
        const observer = FakeIntersectionObserver.instances[0];

        observer.callback([{ isIntersecting: true, target: h2 }]);

        assert.equal(h2.classList.contains('is-visible'), true);
        assert.deepEqual(observer.unobserved, [h2]);
    });

    test('caps stagger delays after twelve reveal candidates', async () => {
        const { initSectionReveals } = await import('../src/lib/article-enhancements/section-reveals.js');
        const { root, elements } = createLongContentRoot();

        initSectionReveals(root, { windowRef: createWindow() });

        assert.equal(elements[6].styleValues.get('--section-reveal-index'), '6');
        assert.equal(elements[10].styleValues.get('--section-reveal-index'), '10');
        assert.equal(elements[12].styleValues.get('--section-reveal-index'), '12');
        assert.equal(elements[14].styleValues.get('--section-reveal-index'), '12');
    });
});
