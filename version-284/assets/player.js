function initializeMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-video');
    var layer = document.getElementById('player-layer');
    var button = document.getElementById('player-button');
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }
        video.src = streamUrl;
    }

    function showLayer() {
        if (layer) {
            layer.classList.remove('is-hidden');
        }
    }

    function hideLayer() {
        if (layer) {
            layer.classList.add('is-hidden');
        }
    }

    function startVideo() {
        attachStream();
        hideLayer();
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                showLayer();
            });
        }
    }

    if (layer) {
        layer.addEventListener('click', startVideo);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            startVideo();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    video.addEventListener('play', hideLayer);
    video.addEventListener('pause', showLayer);
    video.addEventListener('ended', showLayer);
}
