function initPlayback(playbackUrl) {
  var video = document.querySelector(".video-player");
  var cover = document.querySelector(".player-cover");
  var button = document.querySelector(".play-trigger");
  var isReady = false;
  var hls = null;

  if (!video || !playbackUrl) {
    return;
  }

  function attachVideo() {
    if (isReady) {
      return;
    }

    isReady = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = playbackUrl;
  }

  function playVideo() {
    attachVideo();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", playVideo);
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
}
