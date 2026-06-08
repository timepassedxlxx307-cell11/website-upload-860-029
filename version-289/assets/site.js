
(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMobileMenu() {
    var button = select(".mobile-toggle");
    var panel = select(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
      button.textContent = expanded ? "☰" : "×";
    });
  }

  function setupSearchForms() {
    selectAll(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = select("input[name='q']", form);
        if (!input) {
          return;
        }
        var keyword = input.value.trim();
        if (!keyword) {
          event.preventDefault();
          input.focus();
        }
      });
    });
  }

  function setupHero() {
    var slides = selectAll("[data-hero-slide]");
    var dots = selectAll(".hero-dot");
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        activate(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    start();
  }

  function setupFilters() {
    selectAll("[data-filter-root]").forEach(function (root) {
      var input = select(".filter-input", root);
      var year = select(".filter-year", root);
      var list = root.parentElement ? select("[data-filter-list]", root.parentElement) : null;
      if (!list) {
        return;
      }
      var cards = selectAll(".movie-card", list);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region")
          ].join(" ").toLowerCase();
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !selectedYear || card.getAttribute("data-year").indexOf(selectedYear) !== -1;
          card.hidden = !(matchesKeyword && matchesYear);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
    });
  }

  function cardHTML(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(" / ");
    return [
      '<article class="movie-card" data-title="' + escapeHTML(movie.title) + '" data-tags="' + escapeHTML((movie.tags || []).join(" ")) + '" data-genre="' + escapeHTML(movie.genre) + '" data-year="' + escapeHTML(movie.year) + '" data-region="' + escapeHTML(movie.region) + '">',
      '  <a class="poster-link" href="' + escapeHTML(movie.url) + '" aria-label="观看' + escapeHTML(movie.title) + '">',
      '    <img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '    <span class="poster-shine"></span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.type) + '</span><span>' + escapeHTML(movie.region) + '</span></div>',
      '    <h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
      '    <p>' + escapeHTML(movie.one_line || movie.summary || "") + '</p>',
      '    <div class="tag-row"><span>' + escapeHTML(movie.category) + '</span><span>' + escapeHTML(tags) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("\n");
  }

  function setupSearchPage() {
    var container = select("#search-results");
    if (!container || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    var input = select("#search-page-input");
    var title = select("#search-title");
    var summary = select("#search-summary");
    if (input) {
      input.value = keyword;
    }
    var results = window.SEARCH_INDEX;
    if (keyword) {
      var lower = keyword.toLowerCase();
      results = window.SEARCH_INDEX.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(" "),
          movie.one_line
        ].join(" ").toLowerCase().indexOf(lower) !== -1;
      });
      if (title) {
        title.textContent = "“" + keyword + "”的搜索结果";
      }
      if (summary) {
        summary.textContent = results.length ? "已匹配到相关影片，点击卡片进入详情页。" : "暂未匹配到相关影片，可以尝试更换关键词。";
      }
    } else {
      results = window.SEARCH_INDEX.slice(0, 60);
      if (title) {
        title.textContent = "热门搜索推荐";
      }
      if (summary) {
        summary.textContent = "输入关键词可搜索全站影片，当前展示部分推荐内容。";
      }
    }
    container.innerHTML = results.length ? results.slice(0, 120).map(cardHTML).join("\n") : '<div class="empty-state">没有找到相关影片</div>';
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = select("[data-player-video]");
    var overlay = select("[data-player-overlay]");
    var button = select("[data-player-button]");
    var hlsInstance = null;
    var sourceReady = false;

    if (!video || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (sourceReady) {
        return;
      }
      sourceReady = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start(event);
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
