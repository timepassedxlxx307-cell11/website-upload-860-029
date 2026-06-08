(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                play();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', play);
        activate(0);
        play();
    }

    function getUrlQuery() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        if (!scopes.length) {
            return;
        }
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var category = scope.querySelector('[data-filter-category]');
            var type = scope.querySelector('[data-filter-type]');
            var year = scope.querySelector('[data-filter-year]');
            var container = scope.closest('main') || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
            var empty = container.querySelector('[data-empty-state]');
            var initialQuery = getUrlQuery();

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function matches(card) {
                var query = input ? input.value.trim().toLowerCase() : '';
                var selectedCategory = category ? category.value : '';
                var selectedType = type ? type.value : '';
                var selectedYear = year ? year.value : '';
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' ').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!selectedCategory || cardCategory === selectedCategory) &&
                    (!selectedType || cardType === selectedType) &&
                    (!selectedYear || cardYear.indexOf(selectedYear) !== -1);
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, category, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-start');
            if (!video || !button) {
                return;
            }
            var sourceUrl = video.getAttribute('data-hls');
            var started = false;
            var hlsInstance = null;

            function requestPlayback() {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            function attachSource() {
                if (!sourceUrl || started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        requestPlayback();
                    });
                    player.hlsInstance = hlsInstance;
                } else {
                    video.src = sourceUrl;
                }
            }

            function start() {
                attachSource();
                player.classList.add('is-playing');
                requestPlayback();
            }

            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });

            player.addEventListener('click', function (event) {
                if (event.target === player) {
                    start();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
