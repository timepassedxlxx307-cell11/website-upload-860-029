(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        if (slides.length > 1) {
            startTimer();
        }
    }

    function bindLocalFilters() {
        var input = document.querySelector('[data-local-filter]');
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));
        var activeTerm = '';

        if (!input && buttons.length === 0) {
            return;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = input ? normalize(input.value) : '';
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.children).filter(function (node) {
                    return node.nodeType === 1 && !node.classList.contains('empty-state');
                });
                var visibleCount = 0;
                var oldEmpty = grid.querySelector('.empty-state');
                if (oldEmpty) {
                    oldEmpty.remove();
                }
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-filter-text'));
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedTerm = !activeTerm || haystack.indexOf(normalize(activeTerm)) !== -1;
                    var visible = matchedQuery && matchedTerm;
                    card.classList.toggle('is-filter-hidden', !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (visibleCount === 0) {
                    var empty = document.createElement('div');
                    empty.className = 'empty-state';
                    empty.textContent = '没有找到匹配的影片';
                    grid.appendChild(empty);
                }
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeTerm = button.getAttribute('data-category-filter') || '';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilter();
            });
        });
    }

    function bindSearchPage() {
        var input = document.getElementById('searchInput');
        var results = document.getElementById('searchResults');
        var summary = document.getElementById('searchSummary');
        var filterWrap = document.getElementById('searchCategoryFilters');
        var data = window.SEARCH_INDEX || [];
        var activeCategory = '';

        if (!input || !results || !summary || !data.length) {
            return;
        }

        function getQueryFromUrl() {
            var params = new URLSearchParams(window.location.search);
            return params.get('q') || '';
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function createCard(item) {
            var tags = item.tags.slice(0, 3).map(function (tag) {
                return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<a class="movie-card" href="' + item.url + '">' +
                '<span class="poster-frame">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="poster-shade"></span><span class="play-chip">▶</span></span>' +
                '<span class="movie-card-body">' +
                '<span class="movie-card-title">' + escapeHtml(item.title) + '</span>' +
                '<span class="movie-card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span>' +
                '<span class="movie-card-desc">' + escapeHtml(item.oneLine) + '</span>' +
                '<span class="tag-row">' + tags + '</span>' +
                '</span></a>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function render() {
            var query = normalize(input.value);
            var filtered = data.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.category,
                    item.tags.join(' '),
                    item.oneLine
                ].join(' '));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedCategory = !activeCategory || item.category === activeCategory;
                return matchedQuery && matchedCategory;
            }).slice(0, 240);

            summary.textContent = filtered.length ? '匹配影片' : '暂无匹配影片';
            results.innerHTML = filtered.length ? filtered.map(createCard).join('') : '<div class="empty-state">没有找到匹配的影片</div>';
        }

        input.value = getQueryFromUrl();
        input.addEventListener('input', render);

        if (filterWrap) {
            filterWrap.addEventListener('click', function (event) {
                var button = event.target.closest('[data-search-category]');
                if (!button) {
                    return;
                }
                activeCategory = button.getAttribute('data-search-category') || '';
                Array.prototype.slice.call(filterWrap.querySelectorAll('[data-search-category]')).forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                render();
            });
        }

        render();
    }

    bindLocalFilters();
    bindSearchPage();
})();
