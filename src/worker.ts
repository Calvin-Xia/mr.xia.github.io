import { handleViewCounterRequest } from './lib/umami-view-counter.js';

interface Env {
    UMAMI_API_KEY?: string;
    ASSETS?: {
        fetch(request: Request): Response | Promise<Response>;
    };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        return handleViewCounterRequest(request, env);
    },
};
