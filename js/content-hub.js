/**
 * Phase 1 content hub helpers for homepage recent updates and statement page search.
 */
(function() {
    const CONTENT_TYPES = {
        article: {
            label: '文章',
            action: '阅读全文'
        },
        work: {
            label: '作品',
            action: '查看作品'
        },
        tool: {
            label: '工具',
            action: '打开工具'
        },
        'update-log': {
            label: '更新日志',
            action: '查看日志'
        }
    };

    const MANIFEST_PATH = 'content/content-manifest.json';
    const TYPE_PRIORITY = {
        article: 0,
        work: 1,
        'update-log': 2,
        tool: 3
    };
    const HOMEPAGE_PRIORITY_TYPES = new Set(['article', 'work', 'update-log']);
    const SEARCH_EXCLUDED_TYPES = new Set(['update-log']);
    const MAX_FETCH_RETRIES = 2;
    const FETCH_RETRY_BASE_DELAY_MS = 400;
    const FETCH_RETRY_MAX_DELAY_MS = 1500;

    const ContentHub = {
        manifest: [],
        manifestPromise: null,

        async loadManifest() {
            if (this.manifestPromise) {
                return this.manifestPromise;
            }

            const attemptFetch = async (attempt = 0) => {
                try {
                    const response = await fetch(MANIFEST_PATH, { cache: 'no-cache' });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    const payload = await response.json();
                    if (!Array.isArray(payload)) {
                        throw new Error('Manifest payload must be an array');
                    }

                    this.manifest = payload
                        .map(item => this.normalizeItem(item))
                        .filter(Boolean)
                        .sort((left, right) => this.compareByDate(left, right));
                    return this.manifest;
                } catch (error) {
                    if (attempt >= MAX_FETCH_RETRIES) {
                        throw error;
                    }

                    const retryDelay = Math.min(
                        FETCH_RETRY_BASE_DELAY_MS * (2 ** attempt),
                        FETCH_RETRY_MAX_DELAY_MS
                    );
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return attemptFetch(attempt + 1);
                }
            };

            this.manifestPromise = attemptFetch().catch(error => {
                this.manifestPromise = null;
                throw error;
            });
            return this.manifestPromise;
        },

        parseDateValue(value) {
            const normalized = String(value || '').trim();
            const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!match) {
                return Number.NEGATIVE_INFINITY;
            }

            const year = Number(match[1]);
            const month = Number(match[2]);
            const day = Number(match[3]);
            const timestamp = Date.UTC(year, month - 1, day);
            const parsedDate = new Date(timestamp);

            if (
                Number.isNaN(timestamp) ||
                parsedDate.getUTCFullYear() !== year ||
                parsedDate.getUTCMonth() !== month - 1 ||
                parsedDate.getUTCDate() !== day
            ) {
                return Number.NEGATIVE_INFINITY;
            }

            return timestamp;
        },

        normalizeItem(item) {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const type = String(item.type || '').trim();
            if (!CONTENT_TYPES[type]) {
                return null;
            }

            const normalizedTags = Array.isArray(item.tags)
                ? item.tags.map(tag => String(tag || '').trim()).filter(Boolean)
                : [];

            return {
                id: String(item.id || '').trim(),
                type,
                title: String(item.title || '').trim(),
                excerpt: String(item.excerpt || '').trim(),
                date: String(item.date || '').trim(),
                filePath: String(item.filePath || '').trim(),
                tags: normalizedTags,
                source: String(item.source || '').trim(),
                category: String(item.category || '').trim(),
                featured: Boolean(item.featured),
                externalUrl: String(item.externalUrl || '').trim(),
                status: String(item.status || '').trim()
            };
        },

        compareByDate(left, right) {
            const leftDate = this.parseDateValue(left.date);
            const rightDate = this.parseDateValue(right.date);

            if (leftDate !== rightDate) {
                return rightDate - leftDate;
            }

            const leftPriority = TYPE_PRIORITY[left.type] ?? 99;
            const rightPriority = TYPE_PRIORITY[right.type] ?? 99;

            if (leftPriority !== rightPriority) {
                return leftPriority - rightPriority;
            }

            return left.title.localeCompare(right.title, 'zh-CN');
        },

        getTypeLabel(type) {
            return CONTENT_TYPES[type]?.label || '内容';
        },

        getActionLabel(type) {
            return CONTENT_TYPES[type]?.action || '查看详情';
        },

        createTypeBadge(type) {
            const badge = document.createElement('span');
            badge.className = `content-type-badge content-type-badge--${type}`;
            badge.textContent = this.getTypeLabel(type);
            return badge;
        },

        escapeRegExp(value) {
            return String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        },

        createHighlightedFragment(value, query) {
            const fragment = document.createDocumentFragment();
            const source = String(value || '');
            const normalizedQuery = String(query || '').trim();

            if (!normalizedQuery) {
                fragment.appendChild(document.createTextNode(source));
                return fragment;
            }

            const pattern = new RegExp(this.escapeRegExp(normalizedQuery), 'gi');
            let lastIndex = 0;

            for (const match of source.matchAll(pattern)) {
                const matchIndex = match.index ?? 0;
                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(source.slice(lastIndex, matchIndex)));
                }

                const mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.textContent = match[0];
                fragment.appendChild(mark);

                lastIndex = matchIndex + match[0].length;
            }

            if (lastIndex < source.length) {
                fragment.appendChild(document.createTextNode(source.slice(lastIndex)));
            }

            return fragment;
        },

        formatMetaLine(item) {
            const parts = [this.getTypeLabel(item.type)];
            if (item.category) {
                parts.push(item.category);
            }
            if (item.date) {
                parts.push(item.date);
            }
            return parts.join(' · ');
        },

        getHomepageUpdates(limit = 4) {
            const primaryItems = this.manifest.filter(item => HOMEPAGE_PRIORITY_TYPES.has(item.type));
            const fallbackItems = this.manifest.filter(item => item.type === 'tool');
            const selected = primaryItems.slice(0, limit);

            if (selected.length >= limit) {
                return selected;
            }

            return selected.concat(fallbackItems.slice(0, limit - selected.length));
        }
    };

    const HomepageContent = {
        async init() {
            const container = document.getElementById('recent-updates-list');
            if (!container) {
                return;
            }

            try {
                await ContentHub.loadManifest();
                const items = ContentHub.getHomepageUpdates(4);
                this.render(container, items);
            } catch (error) {
                console.error('[ContentHub] Failed to load homepage updates:', error);
                this.renderError(container);
            }
        },

        render(container, items) {
            container.innerHTML = '';

            if (!items.length) {
                const emptyCard = document.createElement('div');
                emptyCard.className = 'card recent-update-card recent-update-card--empty';
                emptyCard.innerHTML = `
                    <p class="recent-update-title">最近更新正在整理中</p>
                    <p class="recent-update-excerpt">内容索引生成后，这里会显示最近的文章、作品和更新日志。</p>
                `;
                container.appendChild(emptyCard);
                return;
            }

            items.forEach(item => {
                container.appendChild(this.createCard(item));
            });
        },

        renderError(container) {
            container.innerHTML = '';

            const errorCard = document.createElement('div');
            errorCard.className = 'card recent-update-card recent-update-card--empty';
            errorCard.innerHTML = `
                <p class="recent-update-title">最近更新暂时不可用</p>
                <p class="recent-update-excerpt">请先运行内容索引生成流程，再刷新页面查看最新内容。</p>
            `;
            container.appendChild(errorCard);
        },

        createCard(item) {
            const card = document.createElement('article');
            card.className = 'card recent-update-card';

            const meta = document.createElement('div');
            meta.className = 'recent-update-meta';
            meta.appendChild(ContentHub.createTypeBadge(item.type));

            const date = document.createElement('span');
            date.className = 'recent-update-date';
            date.textContent = item.date;
            meta.appendChild(date);

            const title = document.createElement('h3');
            title.className = 'recent-update-title';
            title.textContent = item.title;

            const excerpt = document.createElement('p');
            excerpt.className = 'recent-update-excerpt';
            excerpt.textContent = item.excerpt;

            const actions = document.createElement('div');
            actions.className = 'recent-update-actions';

            const link = document.createElement('a');
            link.className = 'btn btn-outline';
            link.href = item.filePath;
            link.textContent = ContentHub.getActionLabel(item.type);
            actions.appendChild(link);

            card.appendChild(meta);
            card.appendChild(title);
            card.appendChild(excerpt);
            card.appendChild(actions);

            return card;
        }
    };

    const StatementPageContent = {
        manifest: [],
        searchableItems: [],
        articles: [],
        searchInput: null,
        searchBtn: null,
        suggestionsContainer: null,
        resultsContainer: null,
        filterNav: null,
        categoryContainer: null,
        tagContainer: null,
        searchStatus: null,
        selectedSuggestionIndex: -1,
        suggestionItems: [],
        debounceTimer: null,
        currentCategory: 'all',
        currentTag: 'all',
        isSearchMode: false,

        async init() {
            this.searchInput = document.getElementById('search-input');
            this.searchBtn = document.getElementById('search-btn');
            this.suggestionsContainer = document.getElementById('search-suggestions');
            this.resultsContainer = document.getElementById('blog-container');
            this.filterNav = document.getElementById('article-filter-nav');
            this.categoryContainer = document.getElementById('category-filters');
            this.tagContainer = document.getElementById('tag-filters');
            this.searchStatus = document.getElementById('content-search-status');

            if (!this.searchInput || !this.searchBtn || !this.suggestionsContainer || !this.resultsContainer) {
                return;
            }

            this.bindEvents();

            try {
                this.manifest = await ContentHub.loadManifest();
                this.searchableItems = this.manifest.filter(item => !SEARCH_EXCLUDED_TYPES.has(item.type));
                this.articles = this.manifest.filter(item => item.type === 'article');
                this.renderFilters();
                this.restoreArticleView();
                this.focusSearchIfNeeded();
            } catch (error) {
                console.error('[ContentHub] Failed to initialize statement page:', error);
                this.renderLoadError();
            }
        },

        bindEvents() {
            this.searchInput.addEventListener('input', event => this.handleInput(event));
            this.searchInput.addEventListener('keydown', event => this.handleKeyDown(event));
            this.searchInput.addEventListener('keypress', event => {
                if (event.key === 'Enter') {
                    this.performSearch();
                }
            });
            this.searchBtn.addEventListener('click', () => this.performSearch());

            document.addEventListener('click', event => {
                if (!this.searchInput.contains(event.target) && !this.suggestionsContainer.contains(event.target)) {
                    this.hideSuggestions();
                }
            });
        },

        focusSearchIfNeeded() {
            if (window.location.hash === '#content-search') {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.searchInput.focus();
                    });
                });
            }
        },

        handleInput(event) {
            clearTimeout(this.debounceTimer);

            const query = event.target.value.trim();
            if (!query) {
                this.hideSuggestions();
                this.restoreArticleView();
                return;
            }

            this.debounceTimer = setTimeout(() => {
                this.showSuggestions(query);
            }, 180);
        },

        handleKeyDown(event) {
            if (!this.suggestionItems.length || !this.suggestionsContainer.classList.contains('active')) {
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, this.suggestionItems.length - 1);
                this.updateSuggestionSelection();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, 0);
                this.updateSuggestionSelection();
            } else if (event.key === 'Enter' && this.selectedSuggestionIndex >= 0) {
                event.preventDefault();
                this.suggestionItems[this.selectedSuggestionIndex].click();
            } else if (event.key === 'Escape') {
                this.hideSuggestions();
            }
        },

        rankItems(items, query) {
            const keywords = query
                .toLowerCase()
                .split(/\s+/)
                .map(keyword => keyword.trim())
                .filter(Boolean);

            return items
                .map(item => ({ item, score: this.calculateScore(item, keywords) }))
                .filter(result => result.score > 0)
                .sort((left, right) => right.score - left.score || ContentHub.compareByDate(left.item, right.item))
                .map(result => result.item);
        },

        calculateScore(item, keywords) {
            const title = item.title.toLowerCase();
            const excerpt = item.excerpt.toLowerCase();
            const category = item.category.toLowerCase();
            const tags = item.tags.join(' ').toLowerCase();
            const typeLabel = ContentHub.getTypeLabel(item.type).toLowerCase();

            let score = 0;

            keywords.forEach(keyword => {
                if (title.includes(keyword)) {
                    score += 6;
                }
                if (tags.includes(keyword)) {
                    score += 4;
                }
                if (excerpt.includes(keyword)) {
                    score += 3;
                }
                if (category.includes(keyword)) {
                    score += 2;
                }
                if (typeLabel.includes(keyword)) {
                    score += 1;
                }
            });

            return score;
        },

        showSuggestions(query) {
            const suggestions = this.rankItems(this.searchableItems, query).slice(0, 6);
            if (!suggestions.length) {
                this.hideSuggestions();
                return;
            }

            this.suggestionsContainer.innerHTML = '';
            this.suggestionItems = suggestions.map((item, index) => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion-item';
                suggestion.id = `suggestion-${item.id}`;
                suggestion.dataset.index = String(index);
                suggestion.setAttribute('role', 'option');

                const title = document.createElement('div');
                title.className = 'suggestion-title';
                title.appendChild(ContentHub.createHighlightedFragment(item.title, query));

                const meta = document.createElement('div');
                meta.className = 'suggestion-meta';
                meta.textContent = ContentHub.formatMetaLine(item);

                suggestion.appendChild(title);
                suggestion.appendChild(meta);
                suggestion.addEventListener('click', () => {
                    window.location.href = item.filePath;
                });
                this.suggestionsContainer.appendChild(suggestion);
                return suggestion;
            });

            this.selectedSuggestionIndex = -1;
            this.suggestionsContainer.classList.add('active');
            this.searchInput.setAttribute('aria-expanded', 'true');
        },

        hideSuggestions() {
            this.suggestionsContainer.classList.remove('active');
            this.suggestionsContainer.innerHTML = '';
            this.suggestionItems = [];
            this.selectedSuggestionIndex = -1;
            this.searchInput.setAttribute('aria-expanded', 'false');
            this.searchInput.removeAttribute('aria-activedescendant');
        },

        updateSuggestionSelection() {
            this.suggestionItems.forEach((item, index) => {
                const selected = index === this.selectedSuggestionIndex;
                item.classList.toggle('is-selected', selected);
                item.setAttribute('aria-selected', String(selected));

                if (selected) {
                    this.searchInput.setAttribute('aria-activedescendant', item.id);
                }
            });
        },

        renderFilters() {
            if (!this.categoryContainer || !this.tagContainer) {
                return;
            }

            const categories = Array.from(new Set(this.articles.map(item => item.category || '未分类')));
            const tags = Array.from(new Set(this.articles.flatMap(item => item.tags)));

            this.renderFilterButtons(this.categoryContainer, categories, 'category');
            this.renderFilterButtons(this.tagContainer, tags, 'tag');
        },

        renderFilterButtons(container, values, type) {
            container.innerHTML = '';
            container.appendChild(this.createFilterButton('全部', 'all', type, true));

            values.forEach(value => {
                container.appendChild(this.createFilterButton(value, value, type, false));
            });
        },

        createFilterButton(label, value, type, isActive) {
            const button = document.createElement('button');
            button.className = `filter-tag${isActive ? ' active' : ''}`;
            button.dataset.filter = value;
            button.dataset.type = type;
            button.setAttribute('aria-pressed', String(isActive));
            button.textContent = label;
            button.addEventListener('click', event => this.handleFilterClick(event));
            return button;
        },

        handleFilterClick(event) {
            if (this.isSearchMode) {
                return;
            }

            const button = event.currentTarget;
            const filterValue = button.dataset.filter;
            const filterType = button.dataset.type;
            const container = filterType === 'category' ? this.categoryContainer : this.tagContainer;
            container.querySelectorAll('.filter-tag').forEach(tag => {
                tag.classList.remove('active');
                tag.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            if (filterType === 'category') {
                this.currentCategory = filterValue;
            } else {
                this.currentTag = filterValue;
            }

            this.renderArticleList();
        },

        getFilteredArticles() {
            let filtered = [...this.articles];

            if (this.currentCategory !== 'all') {
                filtered = filtered.filter(item => (item.category || '未分类') === this.currentCategory);
            }

            if (this.currentTag !== 'all') {
                filtered = filtered.filter(item => item.tags.includes(this.currentTag));
            }

            return filtered;
        },

        restoreArticleView() {
            this.isSearchMode = false;
            this.setFilterVisibility(true);
            this.setSearchStatus('');
            this.renderArticleList();
        },

        renderArticleList() {
            const filteredArticles = this.getFilteredArticles();
            if (!filteredArticles.length) {
                this.renderNoResults({
                    title: '没有找到相关文章',
                    description: '试试其他文章分类或标签。',
                    actions: []
                });
                return;
            }

            this.resultsContainer.innerHTML = '';
            filteredArticles.forEach(article => {
                this.resultsContainer.appendChild(this.createContentCard(article, { mixed: false }));
            });
        },

        performSearch() {
            const query = this.searchInput.value.trim();
            clearTimeout(this.debounceTimer);
            this.hideSuggestions();

            if (!query) {
                this.restoreArticleView();
                return;
            }

            const results = this.rankItems(this.searchableItems, query);
            this.isSearchMode = true;
            this.setFilterVisibility(false);
            this.setSearchStatus(`搜索 “${query}” 共匹配到 ${results.length} 条内容`);

            if (!results.length) {
                this.renderNoResults({
                    title: '没有找到匹配内容',
                    description: '可以尝试缩短关键词、改搜文章标签，或先看看首页最近更新。',
                    actions: [
                        {
                            label: '恢复文章列表',
                            type: 'button',
                            onClick: () => {
                                this.searchInput.value = '';
                                this.restoreArticleView();
                            }
                        },
                        {
                            label: '查看首页最近更新',
                            type: 'link',
                            href: 'index.html#recent-updates'
                        }
                    ]
                });
                return;
            }

            this.resultsContainer.innerHTML = '';
            results.forEach(item => {
                this.resultsContainer.appendChild(this.createContentCard(item, { mixed: true }));
            });
        },

        renderLoadError() {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">⚠️</div>
                    <p>内容索引加载失败</p>
                    <p class="text-small">请先运行内容索引生成流程，再刷新页面重试。</p>
                </div>
            `;
        },

        renderNoResults(config) {
            this.resultsContainer.innerHTML = '';

            const wrapper = document.createElement('div');
            wrapper.className = 'no-results';

            const icon = document.createElement('div');
            icon.className = 'no-results-icon';
            icon.textContent = '🔍';

            const title = document.createElement('p');
            title.textContent = config.title;

            const description = document.createElement('p');
            description.className = 'text-small';
            description.textContent = config.description;

            wrapper.appendChild(icon);
            wrapper.appendChild(title);
            wrapper.appendChild(description);

            if (config.actions && config.actions.length) {
                const actions = document.createElement('div');
                actions.className = 'no-results-actions';

                config.actions.forEach(action => {
                    if (action.type === 'button') {
                        const button = document.createElement('button');
                        button.className = 'btn btn-outline';
                        button.type = 'button';
                        button.textContent = action.label;
                        button.addEventListener('click', action.onClick);
                        actions.appendChild(button);
                    } else {
                        const link = document.createElement('a');
                        link.className = 'btn btn-outline';
                        link.href = action.href;
                        link.textContent = action.label;
                        actions.appendChild(link);
                    }
                });

                wrapper.appendChild(actions);
            }

            this.resultsContainer.appendChild(wrapper);
        },

        setFilterVisibility(isVisible) {
            if (!this.filterNav) {
                return;
            }

            if (!isVisible && this.filterNav.contains(document.activeElement) && this.searchInput) {
                this.searchInput.focus();
            }

            this.filterNav.classList.toggle('is-hidden', !isVisible);
            this.filterNav.setAttribute('aria-hidden', String(!isVisible));
        },

        setSearchStatus(message) {
            if (this.searchStatus) {
                this.searchStatus.textContent = message;
            }
        },

        createContentCard(item, options) {
            const card = document.createElement('article');
            card.className = `blog-card${options.mixed ? ' blog-card--mixed' : ''}`;

            const link = document.createElement('a');
            link.href = item.filePath;
            link.className = 'blog-card-link';

            const title = document.createElement('h2');
            title.className = 'blog-card-title';
            title.textContent = item.title;

            const excerpt = document.createElement('p');
            excerpt.className = 'blog-card-excerpt';
            excerpt.textContent = item.excerpt;

            link.appendChild(title);
            link.appendChild(excerpt);
            card.appendChild(link);

            const meta = document.createElement('div');
            meta.className = 'blog-card-meta';

            if (options.mixed) {
                meta.appendChild(ContentHub.createTypeBadge(item.type));
            }

            if (item.category) {
                const category = document.createElement('span');
                category.className = 'blog-card-category';
                category.textContent = item.category;
                meta.appendChild(category);
            }

            item.tags.slice(0, options.mixed ? 3 : item.tags.length).forEach(tag => {
                const tagNode = document.createElement('span');
                tagNode.className = 'blog-card-tag';
                tagNode.textContent = tag;
                meta.appendChild(tagNode);
            });

            card.appendChild(meta);

            const dateElement = document.createElement('div');
            dateElement.className = 'blog-card-date';
            dateElement.textContent = item.date;
            card.appendChild(dateElement);

            if (options.mixed && item.externalUrl) {
                const note = document.createElement('div');
                note.className = 'blog-card-action-note';
                note.textContent = '该条目另附外部访问地址，可在详情页继续跳转。';
                card.appendChild(note);
            }

            return card;
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        HomepageContent.init();
        StatementPageContent.init();
    });
})();
