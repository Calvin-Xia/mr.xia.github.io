const VIEW_COUNTER_SELECTOR = '[data-view-counter][data-slug]';

export function formatViewCount(views) {
    const normalizedViews = Number(views);

    if (!Number.isFinite(normalizedViews) || normalizedViews < 0) {
        return '';
    }

    return `${Math.round(normalizedViews).toLocaleString('zh-CN')} 次阅读`;
}

function setCounterText(counter, views) {
    const text = formatViewCount(views);

    if (!text) {
        counter.remove();
        return;
    }

    counter.textContent = text;
    counter.classList.remove('view-count--pending');
    counter.classList.add('view-count--ready');
}

async function loadCounter(counter) {
    if (counter.dataset.loaded === 'true') {
        return;
    }

    counter.dataset.loaded = 'true';
    const slug = counter.dataset.slug;

    if (!slug) {
        counter.remove();
        return;
    }

    try {
        const response = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            counter.remove();
            return;
        }

        const data = await response.json();
        setCounterText(counter, data.views);
    } catch (error) {
        console.warn('View counter failed for slug:', slug, error);
        counter.remove();
    }
}

export function initViewCounters(root = document) {
    root.querySelectorAll?.(VIEW_COUNTER_SELECTOR).forEach((counter) => {
        loadCounter(counter);
    });
}

function startViewCounters() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initViewCounters(document), { once: true });
        return;
    }

    initViewCounters(document);
}

startViewCounters();
document.addEventListener('astro:page-load', () => initViewCounters(document));
