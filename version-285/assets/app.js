document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function resetSlider() {
    if (timer) {
      window.clearInterval(timer);
    }
    startSlider();
  }

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(activeSlide - 1);
      resetSlider();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(activeSlide + 1);
      resetSlider();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      resetSlider();
    });
  });

  startSlider();

  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var emptyState = document.querySelector(".empty-state");
  var activeFilter = "all";
  var searchValue = "";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-type"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.textContent
    ].join(" "));
  }

  function applyFilter() {
    var visibleCount = 0;
    cards.forEach(function (card) {
      var text = cardText(card);
      var searchMatch = !searchValue || text.indexOf(searchValue) !== -1;
      var filterMatch = activeFilter === "all" || text.indexOf(activeFilter) !== -1;
      var visible = searchMatch && filterMatch;
      card.classList.toggle("is-hidden", !visible);
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", cards.length > 0 && visibleCount === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      searchValue = normalize(input.value);
      searchInputs.forEach(function (otherInput) {
        if (otherInput !== input) {
          otherInput.value = input.value;
        }
      });
      applyFilter();
    });
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (otherChip) {
        otherChip.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      activeFilter = normalize(chip.getAttribute("data-filter") || "all");
      applyFilter();
    });
  });
});
