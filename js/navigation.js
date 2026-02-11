(function() {
    'use strict';

    const NavigationState = {
        states: new Map(),
        currentPage: '',
        previousPage: '',
        scrollPositions: new Map(),
        lastVisited: new Map(),
        
        saveState(pageId, state) {
            if (!pageId || pageId === 'null' || pageId === 'undefined') {
                pageId = 'index.html';
            }
            this.states.set(pageId, state);
            this.lastVisited.set(pageId, Date.now());
        },
        
        getState(pageId) {
            if (!pageId || pageId === 'null' || pageId === 'undefined') {
                pageId = 'index.html';
            }
            return this.states.get(pageId) || {};
        },
        
        saveScrollPosition(pageId, scrollY) {
            if (!pageId || pageId === 'null' || pageId === 'undefined') {
                pageId = 'index.html';
            }
            this.scrollPositions.set(pageId, scrollY);
        },
        
        getScrollPosition(pageId) {
            if (!pageId || pageId === 'null' || pageId === 'undefined') {
                pageId = 'index.html';
            }
            return this.scrollPositions.get(pageId) || 0;
        },
        
        getCurrentPage() {
            const path = window.location.pathname;
            const filename = path.split('/').pop();
            return filename || 'index.html';
        },
        
        setCurrentPage(pageId) {
            this.previousPage = this.currentPage;
            this.currentPage = pageId;
        }
    };

    const NavigationController = {
        initialized: false,
        isNavigating: false,
        
        init() {
            if (this.initialized) return;
            this.initialized = true;
            
            const currentPage = NavigationState.getCurrentPage();
            NavigationState.setCurrentPage(currentPage);
            
            const savedScroll = NavigationState.getScrollPosition(currentPage);
            if (savedScroll > 0 && currentPage !== 'index.html') {
                window.scrollTo(0, savedScroll);
            }
            
            window.addEventListener('popstate', (event) => this.handlePopState(event));
            
            document.addEventListener('click', (event) => this.handleClick(event));
            
            window.addEventListener('beforeunload', () => {
                NavigationState.saveScrollPosition(
                    NavigationState.getCurrentPage(),
                    window.scrollY
                );
            });
            
            console.log('Navigation system initialized for page:', currentPage);
            const navLinks = document.querySelectorAll('a[data-history="true"]');
            console.log('Found navigation links:', navLinks.length);
            
            navLinks.forEach((link, index) => {
                console.log(`  Link ${index + 1}:`, link.getAttribute('href'), '->', link.textContent.trim());
            });
        },
        
        handleClick(event) {
            if (this.isNavigating) {
                return;
            }
            
            let element = event.target;
            
            if (element !== document.documentElement && element !== document.body && element !== document) {
                element = element.closest('a[data-history="true"]');
            }
            
            if (element && element.matches && element.matches('a[data-history="true"]')) {
                event.preventDefault();
                event.stopPropagation();
                
                const targetUrl = element.getAttribute('href');
                const title = element.getAttribute('data-title') || '';
                
                if (targetUrl && targetUrl !== '#' && targetUrl !== '' && targetUrl !== window.location.pathname) {
                    console.log('Navigating to:', targetUrl);
                    
                    NavigationState.saveScrollPosition(
                        NavigationState.getCurrentPage(),
                        window.scrollY
                    );
                    
                    this.isNavigating = true;
                    
                    history.pushState(
                        {
                            page: this.getPageFromUrl(targetUrl),
                            from: NavigationState.previousPage,
                            timestamp: Date.now(),
                            native: true
                        },
                        title || document.title,
                        targetUrl
                    );
                    
                    this.showTransitionIndicator();
                    
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 200);
                } else {
                    console.log('Same page or invalid URL, ignoring');
                }
            }
        },
        
        navigateTo(url, title) {
            if (!url || url === '#' || url === '') {
                return;
            }
            
            const targetPage = this.getPageFromUrl(url);
            if (!targetPage) {
                return;
            }
            
            NavigationState.saveScrollPosition(
                NavigationState.getCurrentPage(),
                window.scrollY
            );
            
            this.isNavigating = true;
            
            history.pushState(
                {
                    page: targetPage,
                    from: NavigationState.previousPage,
                    timestamp: Date.now(),
                    native: true
                },
                title || document.title,
                url
            );
            
            this.showTransitionIndicator();
            
            setTimeout(() => {
                window.location.href = url;
            }, 200);
        },
        
        goHome() {
            const homePage = 'index.html';
            const currentPage = NavigationState.getCurrentPage();
            
            if (currentPage === homePage) {
                window.scrollTo(0, 0);
                return;
            }
            
            NavigationState.saveScrollPosition(currentPage, window.scrollY);
            
            this.isNavigating = true;
            
            history.pushState(
                {
                    page: homePage,
                    from: currentPage,
                    timestamp: Date.now(),
                    native: true
                },
                document.title,
                'index.html'
            );
            
            this.showTransitionIndicator();
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 200);
        },
        
        handlePopState(event) {
            const state = event.state;
            if (!state) {
                return;
            }
            
            const targetPage = state.page;
            if (!targetPage) {
                return;
            }
            
            NavigationState.saveScrollPosition(
                NavigationState.getCurrentPage(),
                window.scrollY
            );
            
            NavigationState.setCurrentPage(targetPage);
            
            if (state.native) {
                window.location.href = targetPage;
            } else {
                this.loadPageContent(targetPage);
            }
        },
        
        getPageFromUrl(url) {
            if (!url) return null;
            
            try {
                const urlObj = new URL(url, window.location.origin);
                const pathname = urlObj.pathname;
                const filename = pathname.split('/').pop();
                return filename || 'index.html';
            } catch (err) {
                const match = url.match(/([^\/]+\.html)$/);
                return match ? match[1] : 'index.html';
            }
        },
        
        loadPageContent(pageId, options = {}) {
            const contentCache = document.getElementById('main-content');
            if (contentCache) {
                contentCache.setAttribute('data-page', pageId);
            }
            
            const scrollY = options.scrollY || NavigationState.getScrollPosition(pageId);
            if (scrollY > 0) {
                window.scrollTo(0, scrollY);
            }
            
            this.showTransitionIndicator();
            
            setTimeout(() => {
                this.hideTransitionIndicator();
            }, 400);
            
            console.log('Loaded page:', pageId, 'scrollY:', scrollY);
        },
        
        savePageState(stateData) {
            const currentPage = NavigationState.getCurrentPage();
            NavigationState.saveState(currentPage, stateData);
        },
        
        showTransitionIndicator() {
            const indicator = document.getElementById('page-transition-indicator');
            if (indicator) {
                indicator.classList.add('active');
            }
        },
        
        hideTransitionIndicator() {
            const indicator = document.getElementById('page-transition-indicator');
            if (indicator) {
                indicator.classList.remove('active');
            }
        }
    };

    window.NavigationState = NavigationState;
    window.NavigationController = NavigationController;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NavigationController.init());
    } else {
        NavigationController.init();
    }
})();
