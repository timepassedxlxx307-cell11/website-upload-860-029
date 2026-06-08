(function () {
    var body = document.body;
    var toggle = document.querySelector('.menu-toggle');

    if (toggle) {
        toggle.addEventListener('click', function () {
            var open = body.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function nextSlide() {
        showSlide(current + 1);
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(nextSlide, 5000);
        }
    }

    document.querySelectorAll('[data-go-slide]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(Number(button.getAttribute('data-go-slide')) || 0);
            startHero();
        });
    });

    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    startHero();

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[type="search"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            var localGrid = document.querySelector('.searchable-grid');
            if (localGrid) {
                event.preventDefault();
                filterCards(value, getActiveFilter());
                return;
            }
            if (value) {
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(value);
            }
        });
    });

    var searchInput = document.getElementById('movie-search-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function getActiveFilter() {
        var active = document.querySelector('.filter-chip.is-active');
        return active ? active.getAttribute('data-filter') || 'all' : 'all';
    }

    function filterCards(query, activeFilter) {
        var text = normalize(query);
        var filter = activeFilter || 'all';
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-meta')
            ].join(' '));
            var category = card.getAttribute('data-category') || '';
            var matchedText = !text || haystack.indexOf(text) !== -1;
            var matchedFilter = filter === 'all' || category === filter;
            card.classList.toggle('is-hidden', !(matchedText && matchedFilter));
        });
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (item) {
                item.classList.remove('is-active');
            });
            chip.classList.add('is-active');
            filterCards(searchInput ? searchInput.value : '', chip.getAttribute('data-filter') || 'all');
        });
    });

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial) {
            searchInput.value = initial;
        }
        searchInput.addEventListener('input', function () {
            filterCards(searchInput.value, getActiveFilter());
        });
        filterCards(searchInput.value, getActiveFilter());
    }
})();
