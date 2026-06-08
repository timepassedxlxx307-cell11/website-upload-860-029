
import { H as Hls } from "./hls-vendor-dru42stk.js";

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function setupMenu() {
    const button = document.querySelector("[data-menu-button]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
        return;
    }
    button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function setupHero() {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return;
    }
    let active = 0;
    const show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === active);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === active);
        });
    };
    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            show(index);
        });
    });
    show(0);
    window.setInterval(function () {
        show(active + 1);
    }, 5200);
}

function setupSearchRedirect() {
    const form = document.querySelector("[data-search-redirect]");
    if (!form) {
        return;
    }
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = form.querySelector("input");
        const query = input ? input.value.trim() : "";
        const target = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.location.href = target;
    });
}

function setupFilters() {
    const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
        const input = panel.querySelector("[data-filter-input]");
        const buttons = Array.from(panel.querySelectorAll("[data-filter-value]"));
        const scope = document.querySelector(panel.getAttribute("data-filter-panel"));
        const cards = scope ? Array.from(scope.querySelectorAll(".movie-card")) : [];
        let currentFilter = "all";
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (input && q) {
            input.value = q;
        }
        const apply = function () {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();
                const categoryMatch = currentFilter === "all" || card.getAttribute("data-category") === currentFilter;
                const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle("hidden-card", !(categoryMatch && keywordMatch));
            });
        };
        if (input) {
            input.addEventListener("input", apply);
        }
        const actionButton = panel.querySelector(".search-button");
        if (actionButton) {
            actionButton.addEventListener("click", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                currentFilter = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        apply();
    });
}

export function setupPlayer(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);
    const frame = video ? video.closest(".player-frame") : null;
    const overlay = frame ? frame.querySelector(".player-overlay") : null;
    let started = false;
    const start = async function () {
        if (!video || started) {
            return;
        }
        started = true;
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        if (button) {
            button.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.source;
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(options.source);
            hls.attachMedia(video);
        } else {
            video.src = options.source;
        }
        video.controls = true;
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    };
    if (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            start();
        });
    }
    if (frame) {
        frame.addEventListener("click", function (event) {
            if (event.target !== video) {
                start();
            }
        });
    }
}

ready(function () {
    setupMenu();
    setupHero();
    setupSearchRedirect();
    setupFilters();
});
