(function() {
    'use strict';

    const CDNLoader = {
        loadedScripts: new Set(),
        loadedStyles: new Set(),
        failedResources: new Set(),

        loadScript(globalName, cdnUrl, localUrl) {
            return new Promise((resolve, reject) => {
                if (window[globalName]) {
                    this.loadedScripts.add(globalName);
                    resolve(window[globalName]);
                    return;
                }

                const script = document.createElement('script');
                script.src = cdnUrl;
                script.async = false;

                const fallbackLoad = () => {
                    if (this.failedResources.has(cdnUrl)) {
                        reject(new Error(`Failed to load ${globalName} from both CDN and local`));
                        return;
                    }
                    
                    this.failedResources.add(cdnUrl);
                    console.warn(`[CDN Fallback] CDN failed for ${globalName}, trying local: ${localUrl}`);
                    
                    const fallbackScript = document.createElement('script');
                    fallbackScript.src = localUrl;
                    fallbackScript.async = false;
                    
                    fallbackScript.onload = () => {
                        this.loadedScripts.add(globalName);
                        console.log(`[CDN Fallback] Successfully loaded ${globalName} from local`);
                        resolve(window[globalName]);
                    };
                    
                    fallbackScript.onerror = () => {
                        reject(new Error(`Failed to load ${globalName} from local: ${localUrl}`));
                    };
                    
                    document.head.appendChild(fallbackScript);
                };

                script.onload = () => {
                    this.loadedScripts.add(globalName);
                    console.log(`[CDN Fallback] Successfully loaded ${globalName} from CDN`);
                    resolve(window[globalName]);
                };

                script.onerror = fallbackLoad;

                document.head.appendChild(script);
            });
        },

        loadStyle(cdnUrl, localUrl) {
            return new Promise((resolve, reject) => {
                const styleId = this.getStyleId(cdnUrl);
                
                if (this.loadedStyles.has(styleId)) {
                    resolve();
                    return;
                }

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cdnUrl;
                link.id = styleId;

                const fallbackLoad = () => {
                    if (this.failedResources.has(cdnUrl)) {
                        reject(new Error(`Failed to load style from both CDN and local`));
                        return;
                    }
                    
                    this.failedResources.add(cdnUrl);
                    console.warn(`[CDN Fallback] CDN failed for style, trying local: ${localUrl}`);
                    
                    const fallbackLink = document.createElement('link');
                    fallbackLink.rel = 'stylesheet';
                    fallbackLink.href = localUrl;
                    fallbackLink.id = styleId + '-local';
                    
                    fallbackLink.onload = () => {
                        this.loadedStyles.add(styleId);
                        console.log(`[CDN Fallback] Successfully loaded style from local`);
                        resolve();
                    };
                    
                    fallbackLink.onerror = () => {
                        reject(new Error(`Failed to load style from local: ${localUrl}`));
                    };
                    
                    document.head.appendChild(fallbackLink);
                };

                link.onload = () => {
                    this.loadedStyles.add(styleId);
                    console.log(`[CDN Fallback] Successfully loaded style from CDN`);
                    resolve();
                };

                link.onerror = fallbackLoad;

                document.head.appendChild(link);
            });
        },

        getStyleId(url) {
            return 'style-' + url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
        },

        async loadMultiple(resources) {
            const promises = resources.map(resource => {
                if (resource.type === 'script') {
                    return this.loadScript(resource.globalName, resource.cdnUrl, resource.localUrl);
                } else if (resource.type === 'style') {
                    return this.loadStyle(resource.cdnUrl, resource.localUrl);
                }
            });
            return Promise.all(promises);
        },

        isLoaded(globalName) {
            return this.loadedScripts.has(globalName) || !!window[globalName];
        }
    };

    window.CDNLoader = CDNLoader;

    window.CDNResources = {
        marked: {
            globalName: 'marked',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/marked/11.1.1/marked.min.js',
            localUrl: 'libs/marked/marked.min.js'
        },
        highlight: {
            globalName: 'hljs',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
            localUrl: 'libs/highlight.js/highlight.min.js'
        },
        highlightStyle: {
            type: 'style',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
            localUrl: 'libs/highlight.js/styles/github-dark.min.css'
        },
        katex: {
            globalName: 'katex',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js',
            localUrl: 'libs/katex/katex.min.js'
        },
        katexAutoRender: {
            globalName: 'renderMathInElement',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js',
            localUrl: 'libs/katex/auto-render.min.js'
        },
        katexStyle: {
            type: 'style',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css',
            localUrl: 'libs/katex/katex.min.css'
        },
        mammoth: {
            globalName: 'mammoth',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.7.0/mammoth.browser.min.js',
            localUrl: 'libs/mammoth/mammoth.browser.min.js'
        }
    };
})();
