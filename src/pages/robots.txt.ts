import type { APIContext } from 'astro';
import { buildRobotsTxt } from '../lib/site-seo.js';

export function GET(context: APIContext) {
    return new Response(buildRobotsTxt(context.site), {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
