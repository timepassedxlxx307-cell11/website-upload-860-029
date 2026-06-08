(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
      });
    });
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === heroIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runFilters(panel) {
    var page = panel.closest('[data-search-page]') || document;
    var grid = page.querySelector('[data-card-grid]');
    var empty = page.querySelector('[data-empty-state]');
    var input = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-region-select]');
    var sort = panel.querySelector('[data-sort-select]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-genre-filter]'));
    var activeGenre = '';

    if (!grid) {
      return;
    }

    function apply() {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = !regionValue || normalize(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
        var matchesGenre = !activeGenre || haystack.indexOf(activeGenre) !== -1;
        var visible = matchesQuery && matchesRegion && matchesGenre;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    function sortCards() {
      var value = sort ? sort.value : 'default';
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      if (value === 'new') {
        cards.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      } else if (value === 'old') {
        cards.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      } else if (value === 'title') {
        cards.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      } else {
        cards.sort(function (a, b) {
          return Array.prototype.indexOf.call(grid.children, a) - Array.prototype.indexOf.call(grid.children, b);
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }

    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    if (region) {
      region.addEventListener('change', apply);
    }

    if (sort) {
      sort.addEventListener('change', sortCards);
      var sortParam = new URLSearchParams(window.location.search).get('sort');
      if (sortParam) {
        sort.value = sortParam;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeGenre = normalize(button.getAttribute('data-genre-filter'));
        apply();
      });
    });

    sortCards();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(runFilters);
})();

function startMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('.player-cover');
  var loaded = false;
  var hls = null;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function attachStream() {
    if (loaded) {
      playVideo();
      return;
    }

    loaded = true;
    video.controls = true;
    cover.classList.add('is-hidden');

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
    } else {
      video.src = streamUrl;
      playVideo();
    }
  }

  cover.addEventListener('click', attachStream);
  video.addEventListener('click', function () {
    if (!loaded) {
      attachStream();
      return;
    }
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
