(function() {
    'use strict';

    const SCROLL_STORAGE_PREFIX = 'mrxia:scroll:';
    const PENDING_NAVIGATION_KEY = 'mrxia:pending-navigation';
    const HISTORY_STATE_KEY = '__mrxiaNavigation';
    const PENDING_NAVIGATION_TTL = 30000;
    const RESTORE_RETRY_LIMIT = 20;
    const RESTORE_RETRY_DELAY = 100;

    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename || 'index.html';
    }

    function getScrollStorageKey(pageId) {
        return `${SCROLL_STORAGE_PREFIX}${pageId}`;
    }

    const NavigationController = {
        initialized: false,
        restoreTimerId: null,
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

            this.restoreSavedScroll();

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
                this.restoreSavedScroll();
            });
        },

        handleInternalNavigation(event) {
            if (event.defaultPrevented || event.button !== 0) {
                return;
            }

            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

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
            this.markPendingNavigation(targetUrl);
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
            const urlObject = url instanceof URL ? url : this.getResolvedUrl(url);
            if (!urlObject) {
                return null;
            }

            const filename = urlObject.pathname.split('/').pop();
            return filename || 'index.html';
        },

        markPendingNavigation(targetUrl) {
            const targetPage = this.getPageFromUrl(targetUrl);
            if (!targetPage) {
                return;
            }

            try {
                sessionStorage.setItem(PENDING_NAVIGATION_KEY, JSON.stringify({
                    page: targetPage,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('[Navigation] Unable to persist pending navigation target.', error);
            }
        },

        getPendingNavigation() {
            try {
                const rawValue = sessionStorage.getItem(PENDING_NAVIGATION_KEY);
                if (!rawValue) {
                    return null;
                }

                const pendingNavigation = JSON.parse(rawValue);
                if (!pendingNavigation || typeof pendingNavigation.page !== 'string') {
                    sessionStorage.removeItem(PENDING_NAVIGATION_KEY);
                    return null;
                }

                if (Date.now() - Number(pendingNavigation.timestamp || 0) > PENDING_NAVIGATION_TTL) {
                    sessionStorage.removeItem(PENDING_NAVIGATION_KEY);
                    return null;
                }

                return pendingNavigation;
            } catch (error) {
                sessionStorage.removeItem(PENDING_NAVIGATION_KEY);
                return null;
            }
        },

        clearPendingNavigation() {
            try {
                sessionStorage.removeItem(PENDING_NAVIGATION_KEY);
            } catch (error) {
                console.warn('[Navigation] Unable to clear pending navigation target.', error);
            }
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

            try {
                sessionStorage.setItem(getScrollStorageKey(pageId), String(scrollY));
            } catch (error) {
                console.warn('[Navigation] Unable to persist scroll position.', error);
            }
        },

        getSavedScrollPosition(pageId) {
            const historyState = history.state && history.state[HISTORY_STATE_KEY];
            if (historyState && historyState.page === pageId && Number.isFinite(historyState.scrollY) && historyState.scrollY > 0) {
                return historyState.scrollY;
            }

            const pendingNavigation = this.getPendingNavigation();
            if (!pendingNavigation || pendingNavigation.page !== pageId) {
                return 0;
            }

            try {
                const storedValue = Number(sessionStorage.getItem(getScrollStorageKey(pageId)));
                return Number.isFinite(storedValue) && storedValue > 0 ? storedValue : 0;
            } catch (error) {
                return 0;
            }
        },

        restoreSavedScroll() {
            const currentPage = getCurrentPage();
            const pendingNavigation = this.getPendingNavigation();
            const savedScroll = this.getSavedScrollPosition(currentPage);

            if (pendingNavigation && pendingNavigation.page === currentPage) {
                this.clearPendingNavigation();
            }

            if (savedScroll <= 0) {
                return;
            }

            this.applyScrollRestore(savedScroll);
        },

        applyScrollRestore(targetScroll) {
            if (this.restoreTimerId !== null) {
                clearInterval(this.restoreTimerId);
                this.restoreTimerId = null;
            }

            let attemptCount = 0;
            const restore = () => {
                attemptCount += 1;
                window.scrollTo(0, targetScroll);

                const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const canReachTarget = maxScroll >= targetScroll - 2;
                const reachedTarget = Math.abs(window.scrollY - targetScroll) <= 2;
                const finished = (canReachTarget && reachedTarget) || attemptCount >= RESTORE_RETRY_LIMIT;

                if (finished) {
                    this.restoreTimerId = null;
                    this.persistCurrentPageState(true);
                }

                return finished;
            };

            if (restore()) {
                return;
            }

            this.restoreTimerId = window.setInterval(() => {
                if (restore() && this.restoreTimerId !== null) {
                    clearInterval(this.restoreTimerId);
                    this.restoreTimerId = null;
                }
            }, RESTORE_RETRY_DELAY);
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
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NavigationController.init());
    } else {
        NavigationController.init();
    }
})();