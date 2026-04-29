// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

function resolveAstroPrerenderEntrypoint() {
    const prerenderEntrypoint = fileURLToPath(import.meta.resolve('astro/entrypoints/prerender'));

    return {
        name: 'resolve-astro-prerender-entrypoint',
        enforce: 'pre',
        resolveId(id) {
            // Vite/Rollup may not resolve this bare Astro build input on Windows.
            if (id === 'astro/entrypoints/prerender') {
                return prerenderEntrypoint;
            }

            return null;
        },
    };
}

export default defineConfig({
    site: 'https://calvin-xia.github.io',
    base: '/',
    outDir: './dist',
    vite: {
        plugins: [resolveAstroPrerenderEntrypoint()],
    },
});
