export const UMAMI_WEBSITE_ID = 'd5b9f90c-e82b-4b57-ade7-ff6a3e5d8062';
export const UMAMI_METRICS_URL = `https://api.umami.is/v1/websites/${UMAMI_WEBSITE_ID}/metrics`;
export const VIEW_COUNTER_CACHE_CONTROL = 'public, max-age=300';
export const SITE_LAUNCH_AT = Date.UTC(2025, 0, 1);

function jsonResponse(data, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', VIEW_COUNTER_CACHE_CONTROL);

    return Response.json(data, {
        ...init,
        headers,
    });
}

function decodeSlug(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return '';
    }
}

export function isValidArticleSlug(value) {
    const slug = decodeSlug(String(value || '').trim());

    return Boolean(slug)
        && !slug.includes('..')
        && !slug.includes('/')
        && !slug.includes('\\');
}

function getSlugFromPath(pathname) {
    const prefix = '/api/views/';

    if (!pathname.startsWith(prefix)) {
        return null;
    }

    return pathname.slice(prefix.length);
}

function createArticlePathVariants(slug) {
    const encodedSlug = encodeURIComponent(slug);

    return new Set([
        normalizeMetricPath(`/articles/${slug}/`),
        normalizeMetricPath(`/articles/${encodedSlug}/`),
    ]);
}

function getMetricPath(metric) {
    return metric?.x || metric?.name || '';
}

function normalizeMetricPath(value) {
    const path = String(value || '').trim().split(/[?#]/)[0];

    if (!path) {
        return '';
    }

    return path.endsWith('/') ? path : `${path}/`;
}

function getMetricViews(metric) {
    const value = metric?.y ?? metric?.pageviews ?? metric?.views;
    const views = Number(value);

    return Number.isFinite(views) && views >= 0 ? views : null;
}

function getArticleViewsFromMetrics(metrics, slug) {
    const pathVariants = createArticlePathVariants(slug);
    let totalViews = 0;
    let hasMatch = false;

    for (const metric of metrics) {
        const metricPath = normalizeMetricPath(getMetricPath(metric));

        if (!pathVariants.has(metricPath)) {
            continue;
        }

        const views = getMetricViews(metric);

        if (views === null) {
            continue;
        }

        totalViews += views;
        hasMatch = true;
    }

    return hasMatch ? totalViews : null;
}

function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}

async function fetchViewsFromUmami(slug, env, options) {
    if (!env?.UMAMI_API_KEY) {
        console.warn('UMAMI_API_KEY is not configured; view counter will be hidden.');
        return null;
    }

    const endpoint = new URL(UMAMI_METRICS_URL);
    endpoint.searchParams.set('type', 'path');
    endpoint.searchParams.set('startAt', String(options.siteLaunchAt ?? SITE_LAUNCH_AT));
    endpoint.searchParams.set('endAt', String(options.now?.() ?? Date.now()));
    endpoint.searchParams.set('limit', '500');

    const fetchFn = options.fetch || fetch;
    const response = await fetchFn(endpoint, {
        headers: {
            'x-umami-api-key': env.UMAMI_API_KEY,
        },
    });

    if (!response.ok) {
        return null;
    }

    const metrics = await response.json();
    if (!Array.isArray(metrics)) {
        return null;
    }

    return getArticleViewsFromMetrics(metrics, slug);
}

export async function handleViewCounterRequest(request, env = {}, options = {}) {
    const url = new URL(request.url);
    const rawSlug = getSlugFromPath(url.pathname);

    if (rawSlug === null) {
        return env?.ASSETS?.fetch
            ? env.ASSETS.fetch(request)
            : new Response('Not Found', { status: 404 });
    }

    if (!isValidArticleSlug(rawSlug)) {
        return jsonResponse({ error: 'invalid slug' }, { status: 400 });
    }

    const slug = decodeSlug(rawSlug);

    try {
        const views = await fetchViewsFromUmami(slug, env, options);
        return jsonResponse({ slug, views });
    } catch (error) {
        console.warn('Unable to load Umami article views.', getErrorMessage(error));
        return jsonResponse({ slug, views: null });
    }
}
