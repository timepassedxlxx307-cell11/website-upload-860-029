(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var section = panel.closest("section") || document;
      var scope = section.querySelector("[data-filter-scope]") || document;
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = section.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query && input && !input.value) {
        input.value = query;
      }

      function apply() {
        var q = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var visibleCount = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var byText = !q || text.indexOf(q) !== -1;
          var byYear = !selectedYear || cardYear === selectedYear;
          var byType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var visible = byText && byYear && byType;
          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [input, year, type].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-poster]");
    var launch = document.querySelector("[data-player-launch]");
    var config = document.getElementById("video-config");
    if (!video || !cover || !config) {
      return;
    }
    var streamUrl = "";
    var attached = false;
    try {
      streamUrl = JSON.parse(config.textContent || "{}").url || "";
    } catch (error) {
      streamUrl = "";
    }

    function attach() {
      if (attached || !streamUrl) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = streamUrl;
      attached = true;
    }

    function play() {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    cover.addEventListener("click", play);
    if (launch) {
      launch.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
