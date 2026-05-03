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
});
