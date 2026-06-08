(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".site-nav__toggle");
    var panel = document.querySelector(".site-nav__panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search-form"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });
  }

  function setupFilters() {
    var list = document.querySelector(".filterable-list");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var input = document.querySelector(".page-filter-input");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var empty = document.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var activeFilter = "all";

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function matchCard(card) {
      var query = input ? normalize(input.value) : "";
      var filter = normalize(activeFilter);
      var haystack = normalize(card.getAttribute("data-search"));
      var textMatch = !query || haystack.indexOf(query) !== -1;
      var filterMatch = filter === "all" || haystack.indexOf(filter) !== -1;
      return textMatch && filterMatch;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = matchCard(card);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeFilter = chip.getAttribute("data-filter") || "all";
        apply();
      });
    });

    apply();
  }

  window.bindPlayer = function (source) {
    var video = document.querySelector("[data-player='main']");
    var overlay = document.querySelector(".player-overlay");
    var message = document.querySelector(".player-message");
    if (!video || !overlay || !source) {
      return;
    }

    var loaded = false;
    var hls = null;

    function showMessage() {
      if (message) {
        message.hidden = false;
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      video.controls = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      loadSource();
      overlay.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    video.addEventListener("error", showMessage);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
})();
