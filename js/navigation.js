(function() {
    'use strict';
    // Keep this as a classic-script IIFE for the static site; ES modules can be adopted later if the site needs fuller module boundaries.

    const HISTORY_STATE_KEY = '__mrxiaNavigation';
    const PENDING_FOCUS_KEY = 'mrxia:pending-focus';
    const RESTORE_RETRY_LIMIT = 8;
    const RESTORE_RETRY_DELAY = 80;

    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename || 'index.html';
    }

    const NavigationController = {
        initialized: false,
        restoreTimerId: null,
        restoreAbortHandler: null,
        skipAutoPersist: false,

        init() {
            if (this.initialized) {
                return;
            }

            this.initialized = true;
            this.hideTransitionIndicator();

            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }

            document.addEventListener('click', (event) => this.handleInternalNavigation(event));

            window.addEventListener('pagehide', () => {
                this.persistCurrentPageState();
                this.hideTransitionIndicator();
            });

            window.addEventListener('beforeunload', () => {
                this.persistCurrentPageState();
            });

            window.addEventListener('pageshow', (event) => {
                this.skipAutoPersist = false;

                if (event.persisted && 'scrollRestoration' in history) {
                    history.scrollRestoration = 'manual';
                }

                this.hideTransitionIndicator();
                this.restoreSavedScroll(event.persisted);
            });

            this.applyPendingFocus();
        },

        handleInternalNavigation(event) {
            if (event.defaultPrevented || event.button !== 0) {
                return;
            }

            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            // data-history marks links that should participate in transition + scroll restoration.
            const link = event.target.closest ? event.target.closest('a[data-history="true"]') : null;
            if (!link || link.target === '_blank' || link.hasAttribute('download')) {
                return;
            }

            const targetUrl = this.getResolvedUrl(link.getAttribute('href'));
            if (!targetUrl || targetUrl.origin !== window.location.origin || this.isSameDocumentNavigation(targetUrl)) {
                return;
            }

            this.persistCurrentPageState(true);
            this.skipAutoPersist = true;
            this.markPendingFocus(targetUrl);
            this.showTransitionIndicator();
        },

        getResolvedUrl(url) {
            if (!url || url === '#') {
                return null;
            }

            try {
                return new URL(url, window.location.href);
            } catch (error) {
                return null;
            }
        },

        isSameDocumentNavigation(targetUrl) {
            return targetUrl.pathname === window.location.pathname &&
                targetUrl.search === window.location.search &&
                targetUrl.hash === window.location.hash;
        },

        getPageFromUrl(url) {
            const targetUrl = url instanceof URL ? url : this.getResolvedUrl(url);
            if (!targetUrl) {
                return null;
            }

            const filename = targetUrl.pathname.split('/').pop();
            return filename || 'index.html';
        },

        markPendingFocus(targetUrl) {
            const targetPage = this.getPageFromUrl(targetUrl);
            if (!targetPage) {
                return;
            }

            try {
                sessionStorage.setItem(PENDING_FOCUS_KEY, targetPage);
            } catch (error) {
                console.warn('[Navigation] Unable to persist pending focus target.', error);
            }
        },

        consumePendingFocus(pageId) {
            try {
                const pendingPage = sessionStorage.getItem(PENDING_FOCUS_KEY);
                if (!pendingPage) {
                    return false;
                }

                if (pendingPage !== pageId) {
                    return false;
                }

                sessionStorage.removeItem(PENDING_FOCUS_KEY);
                return true;
            } catch (error) {
                return false;
            }
        },

        getNavigationType() {
            if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
                return 'navigate';
            }

            const [navigationEntry] = performance.getEntriesByType('navigation');
            return navigationEntry && navigationEntry.type ? navigationEntry.type : 'navigate';
        },

        shouldRestoreScroll(forceRestore = false) {
            return forceRestore || this.getNavigationType() === 'back_forward';
        },

        applyPendingFocus() {
            const currentPage = getCurrentPage();
            if (!this.consumePendingFocus(currentPage)) {
                return;
            }

            const main = document.querySelector('main');
            if (!main) {
                return;
            }

            window.requestAnimationFrame(() => {
                try {
                    main.focus({ preventScroll: true });
                } catch (error) {
                    main.focus();
                }
            });
        },

        persistCurrentPageState(force = false) {
            if (!force && this.skipAutoPersist) {
                return;
            }

            const pageId = getCurrentPage();
            const scrollY = Math.max(0, Math.round(window.scrollY || window.pageYOffset || 0));
            const historyState = history.state && typeof history.state === 'object' ? history.state : {};
            const nextHistoryState = {
                ...historyState,
                [HISTORY_STATE_KEY]: {
                    page: pageId,
                    scrollY,
                    updatedAt: Date.now()
                }
            };

            try {
                history.replaceState(nextHistoryState, document.title, window.location.href);
            } catch (error) {
                console.warn('[Navigation] Unable to persist history state.', error);
            }
        },

        getSavedScrollPosition(pageId) {
            const historyState = history.state && history.state[HISTORY_STATE_KEY];
            if (historyState && historyState.page === pageId && Number.isFinite(historyState.scrollY) && historyState.scrollY > 0) {
                return historyState.scrollY;
            }

            return 0;
        },

        restoreSavedScroll(forceRestore = false) {
            const currentPage = getCurrentPage();

            if (!this.shouldRestoreScroll(forceRestore)) {
                return;
            }

            const savedScroll = this.getSavedScrollPosition(currentPage);

            if (savedScroll <= 0) {
                return;
            }

            this.applyScrollRestore(savedScroll);
        },

        cancelScrollRestore() {
            if (this.restoreTimerId !== null) {
                clearTimeout(this.restoreTimerId);
                this.restoreTimerId = null;
            }

            if (this.restoreAbortHandler) {
                window.removeEventListener('wheel', this.restoreAbortHandler);
                window.removeEventListener('touchstart', this.restoreAbortHandler);
                window.removeEventListener('keydown', this.restoreAbortHandler);
                this.restoreAbortHandler = null;
            }
        },

        setupRestoreAbortHandlers() {
            this.cancelScrollRestore();

            this.restoreAbortHandler = () => {
                this.cancelScrollRestore();
            };

            window.addEventListener('wheel', this.restoreAbortHandler, { passive: true });
            window.addEventListener('touchstart', this.restoreAbortHandler, { passive: true });
            window.addEventListener('keydown', this.restoreAbortHandler);
        },

        applyScrollRestore(targetScroll) {
            this.cancelScrollRestore();
            this.setupRestoreAbortHandlers();

            let attemptCount = 0;
            const restore = () => {
                attemptCount += 1;
                window.scrollTo(0, targetScroll);

                const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const canReachTarget = maxScroll >= targetScroll - 2;
                const reachedTarget = Math.abs(window.scrollY - targetScroll) <= 2;
                const finished = (canReachTarget && reachedTarget) || attemptCount >= RESTORE_RETRY_LIMIT;

                if (finished) {
                    this.cancelScrollRestore();
                    this.persistCurrentPageState(true);
                    return;
                }
                
                this.restoreTimerId = window.setTimeout(restore, RESTORE_RETRY_DELAY);
            };

            restore();
        },

        showTransitionIndicator() {
            const indicator = document.getElementById('page-transition-indicator');
            if (!indicator) {
                return;
            }

            indicator.classList.add('active');
            indicator.setAttribute('aria-hidden', 'false');
            indicator.setAttribute('aria-busy', 'true');
        },

        hideTransitionIndicator() {
            const indicator = document.getElementById('page-transition-indicator');
            if (!indicator) {
                return;
            }

            indicator.classList.remove('active');
            indicator.setAttribute('aria-hidden', 'true');
            indicator.setAttribute('aria-busy', 'false');
        },

        goHome() {
            this.showTransitionIndicator();
            window.location.href = 'index.html';
        }
    };

    window.MrXiaApp = window.MrXiaApp || {};
    window.MrXiaApp.NavigationController = NavigationController;
    // Preserve the legacy global for existing inline calls while also exposing a namespaced entry point.
    window.NavigationController = window.MrXiaApp.NavigationController;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NavigationController.init());
    } else {
        NavigationController.init();
    }
})();
